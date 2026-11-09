import React, { useState, useEffect } from 'react';
import { Problem, UserProfile, Quest, Discussion, DiscussionReply, Language, Submission } from './types';
import { INITIAL_PROBLEMS } from './data/initialProblems';
import { CURRENT_USER_DEFAULT, LEADERBOARD_USERS, INITIAL_QUESTS, INITIAL_DISCUSSIONS, INITIAL_SUBMISSIONS } from './data/initialData';
import { Navbar, UserTab } from './components/Navbar';
import { WeeklyBanner } from './components/WeeklyBanner';
import { ProblemList } from './components/ProblemList';
import { ProblemWorkspace } from './components/ProblemWorkspace';
import { Leaderboard } from './components/Leaderboard';
import { QuestsView } from './components/QuestsView';
import { DiscussionBoard } from './components/DiscussionBoard';
import { AdminPanel } from './components/AdminPanel';
import { SubmissionsView } from './components/SubmissionsView';
import { CreateProblemModal } from './components/CreateProblemModal';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Info, Shield, KeyRound, X } from 'lucide-react';

export default function App() {
  // Portal View Mode Separation: User Portal vs Admin Portal
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [activeUserTab, setActiveUserTab] = useState<UserTab>('problems');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [discussionProblemFilterId, setDiscussionProblemFilterId] = useState<string | undefined>(undefined);

  // Admin Auth Dialog State
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');

  // Core Data States with localStorage persistence fallback
  const [problems, setProblems] = useState<Problem[]>(() => {
    const saved = localStorage.getItem('cp_grader_problems');
    return saved ? JSON.parse(saved) : INITIAL_PROBLEMS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cp_grader_user');
    return saved ? JSON.parse(saved) : CURRENT_USER_DEFAULT;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cp_grader_leaderboard');
    return saved ? JSON.parse(saved) : LEADERBOARD_USERS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('cp_grader_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('cp_grader_quests');
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });

  const [discussions, setDiscussions] = useState<Discussion[]>(() => {
    const saved = localStorage.getItem('cp_grader_discussions');
    return saved ? JSON.parse(saved) : INITIAL_DISCUSSIONS;
  });

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cp_grader_problems', JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem('cp_grader_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cp_grader_leaderboard', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cp_grader_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('cp_grader_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('cp_grader_discussions', JSON.stringify(discussions));
  }, [discussions]);

  // Keep leaderboard list synced with currentUser
  useEffect(() => {
    setUsers(prev =>
      prev.map(u => (u.handle === currentUser.handle ? { ...currentUser } : u))
    );
  }, [currentUser]);

  // Handle portal switching with authentication check for Admin
  const handleChangeViewMode = (mode: 'user' | 'admin') => {
    if (mode === 'admin' && currentUser.role !== 'admin') {
      // Prompt for Admin Passcode or 1-click Quick Login
      setAdminAuthError('');
      setAdminPasscode('');
      setShowAdminLoginModal(true);
      return;
    }
    setSelectedProblem(null);
    setViewMode(mode);
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasscode === 'admin1234' || adminPasscode === '') {
      setCurrentUser(prev => ({ ...prev, role: 'admin' }));
      setShowAdminLoginModal(false);
      setSelectedProblem(null);
      setViewMode('admin');
      showToast('เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จ', 'success');
    } else {
      setAdminAuthError('รหัสผ่าน Admin ไม่ถูกต้อง (รหัสผ่านทดสอบ: admin1234)');
    }
  };

  // Role toggle inside Admin Panel
  const handleToggleRole = () => {
    const nextRole = currentUser.role === 'admin' ? 'student' : 'admin';
    setCurrentUser(prev => ({ ...prev, role: nextRole }));
    showToast(
      nextRole === 'admin'
        ? 'สิทธิ์ของคุณเปลี่ยนเป็นผู้ดูแลระบบ (Admin) แล้ว'
        : 'สิทธิ์ของคุณเปลี่ยนเป็นนักเรียน (Student)',
      'info'
    );
  };

  // Promote/Demote user role from Admin Panel
  const handlePromoteUserRole = (handle: string, newRole: 'student' | 'admin') => {
    setUsers(prev =>
      prev.map(u => (u.handle === handle ? { ...u, role: newRole } : u))
    );
    if (currentUser.handle === handle) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
    showToast(`อัปเดตสิทธิ์ของ @${handle} เป็น ${newRole.toUpperCase()} แล้ว`, 'success');
  };

  // When student gets AC on a problem
  const handleProblemSolved = (problemId: string, earnedScore: number, language: Language) => {
    const targetProblem = problems.find(p => p.id === problemId);
    const problemTitle = targetProblem?.title || 'Problem';

    // Record submission history
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      problemId,
      problemTitle,
      userHandle: currentUser.handle,
      userName: currentUser.name,
      language,
      code: targetProblem?.starterCode?.[language] || '// Submitted code',
      status: earnedScore === 100 ? 'AC' : 'WA',
      score: earnedScore,
      executionTimeMs: Math.round(10 + Math.random() * 25),
      memoryUsedKB: Math.round(1400 + Math.random() * 500),
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      testResults: [
        { testCaseId: 1, verdict: 'P', timeMs: 12, memoryKB: 1400 },
        { testCaseId: 2, verdict: 'P', timeMs: 14, memoryKB: 1420 },
      ],
    };
    setSubmissions(prev => [newSubmission, ...prev]);

    if (!currentUser.solvedProblemIds.includes(problemId)) {
      const ratingGain = 35;
      const xpGain = 120;

      setCurrentUser(prev => {
        const nextSolved = [...prev.solvedProblemIds, problemId];
        const nextRating = prev.rating + ratingGain;
        const nextTotalXp = prev.totalXp + xpGain;
        const nextWeeklyXp = prev.weeklyXp + xpGain;
        const nextLevel = Math.floor(nextTotalXp / 500) + 1;

        return {
          ...prev,
          solvedProblemIds: nextSolved,
          rating: nextRating,
          totalXp: nextTotalXp,
          weeklyXp: nextWeeklyXp,
          level: nextLevel,
        };
      });

      // Update problem solvedCount
      setProblems(prev =>
        prev.map(p =>
          p.id === problemId
            ? { ...p, solvedCount: p.solvedCount + 1, totalSubmissions: p.totalSubmissions + 1 }
            : p
        )
      );

      // Advance daily quest
      setQuests(prev =>
        prev.map(q => {
          if (q.id === 'q-daily-warmup' && !q.completed) {
            return { ...q, progress: 1, completed: true };
          }
          if (q.id === 'q-daily-cpp') {
            const nextP = Math.min(q.target, q.progress + 1);
            return { ...q, progress: nextP, completed: nextP >= q.target };
          }
          return q;
        })
      );

      showToast(
        `🎉 ยินดีด้วย! ส่งผ่าน 100/100 (Accepted) ได้รับ +${ratingGain} Rating และ +${xpGain} XP!`,
        'success'
      );
    }
  };

  // User submits new problem
  const handleCreateProblem = (newProblem: Problem) => {
    setProblems(prev => [newProblem, ...prev]);

    // Advance quest: Community Creator
    setQuests(prev =>
      prev.map(q => {
        if (q.id === 'q-weekly-community') {
          return { ...q, progress: 1, completed: true };
        }
        return q;
      })
    );

    showToast(
      '✨ โจทย์ของคุณถูกส่งเข้าสู่ระบบแล้ว! เพื่อนๆ ทุกคนสามารถเข้าทำได้ทันที และรอการตรวจรับรองจาก Admin',
      'success'
    );
  };

  // Admin approves & verifies a problem
  const handleApproveProblem = (problemId: string) => {
    setProblems(prev =>
      prev.map(p =>
        p.id === problemId
          ? {
              ...p,
              verificationStatus: 'verified',
              adminFeedback: 'โจทย์ได้รับการตรวจสอบและรับรองความถูกต้องโดย Admin เรียบร้อยแล้ว',
            }
          : p
      )
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#fbbf24'],
    });

    showToast('🛡️ ได้รับรองโจทย์เรียบร้อยแล้ว! โจทย์จะได้รับตราสัญลักษณ์ Verified ทันที', 'success');
  };

  // Admin requests revision
  const handleRejectProblem = (problemId: string, feedback: string) => {
    setProblems(prev =>
      prev.map(p =>
        p.id === problemId
          ? {
              ...p,
              verificationStatus: 'rejected',
              adminFeedback: feedback,
            }
          : p
      )
    );
    showToast('ส่งความคิดเห็นและข้อเสนอแนะในการปรับปรุงให้ผู้สร้างโจทย์แล้ว', 'info');
  };

  // Admin toggles weekly challenge status
  const handleToggleWeeklyTask = (problemId: string) => {
    setProblems(prev =>
      prev.map(p =>
        p.id === problemId ? { ...p, isWeeklyTask: !p.isWeeklyTask } : p
      )
    );
    showToast('อัปเดตสถานะ Weekly Task ประจำสัปดาห์แล้ว', 'info');
  };

  // Quest Claim
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    setCurrentUser(prev => ({
      ...prev,
      totalXp: prev.totalXp + quest.xpReward,
      weeklyXp: prev.weeklyXp + quest.xpReward,
      level: Math.floor((prev.totalXp + quest.xpReward) / 500) + 1,
    }));

    setQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, claimed: true } : q))
    );

    showToast(`🎁 ปลดล็อกรางวัลสำเร็จ! ได้รับ +${quest.xpReward} XP เรียบร้อย`, 'success');
  };

  // Discussion actions
  const handleAddDiscussion = (newDisc: Discussion) => {
    setDiscussions(prev => [newDisc, ...prev]);

    // Update quest
    setQuests(prev =>
      prev.map(q => {
        if (q.id === 'q-daily-qa') {
          return { ...q, progress: 1, completed: true };
        }
        return q;
      })
    );

    showToast('โพสต์คำถามใหม่บนกระดานถาม-ตอบเรียบร้อยแล้ว', 'success');
  };

  const handleAddReply = (discussionId: string, reply: DiscussionReply) => {
    setDiscussions(prev =>
      prev.map(d =>
        d.id === discussionId ? { ...d, replies: [...d.replies, reply] } : d
      )
    );

    // Reward active participation
    setCurrentUser(prev => ({
      ...prev,
      totalXp: prev.totalXp + 40,
      weeklyXp: prev.weeklyXp + 40,
    }));

    showToast('ส่งคำตอบเรียบร้อยแล้ว! ได้รับ +40 XP จากการช่วยเหลือเพื่อน', 'success');
  };

  const handleToggleUpvote = (discussionId: string) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          const nextUpvoted = !d.userUpvoted;
          return {
            ...d,
            userUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? d.upvotes + 1 : Math.max(0, d.upvotes - 1),
          };
        }
        return d;
      })
    );
  };

  const handleMarkAcceptedAnswer = (discussionId: string, replyId: string) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === discussionId) {
          return {
            ...d,
            isSolved: true,
            replies: d.replies.map(r => ({
              ...r,
              isAccepted: r.id === replyId,
            })),
          };
        }
        return d;
      })
    );
    showToast('เลือกคำตอบนี้เป็นคำตอบที่ยอมรับเรียบร้อยแล้ว', 'success');
  };

  // Open problem workspace
  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
  };

  // Open discussion thread specifically for a problem
  const handleOpenProblemDiscussion = (problemId: string) => {
    setDiscussionProblemFilterId(problemId);
    setSelectedProblem(null);
    setViewMode('user');
    setActiveUserTab('discussions');
  };

  const pendingCount = problems.filter(p => p.verificationStatus === 'pending').length;
  const weeklyProblems = problems.filter(p => p.isWeeklyTask);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div className="bg-slate-900 border border-emerald-500/50 shadow-2xl rounded-xl p-3.5 flex items-center gap-3 text-xs text-white max-w-md">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span className="leading-relaxed font-sans">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar with User vs Admin Portal distinction */}
      <Navbar
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        activeUserTab={activeUserTab}
        setActiveUserTab={tab => {
          setSelectedProblem(null);
          setActiveUserTab(tab);
        }}
        currentUser={currentUser}
        onOpenCreateProblem={() => setIsCreateModalOpen(true)}
        pendingProblemsCount={pendingCount}
      />

      {/* Main Viewport */}
      {selectedProblem ? (
        <ProblemWorkspace
          problem={selectedProblem}
          onBack={() => setSelectedProblem(null)}
          onSolved={handleProblemSolved}
          onOpenDiscussion={handleOpenProblemDiscussion}
          isSolvedAlready={currentUser.solvedProblemIds.includes(selectedProblem.id)}
        />
      ) : viewMode === 'admin' ? (
        /* Dedicated Admin Portal View */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <AdminPanel
            problems={problems}
            users={users}
            submissions={submissions}
            onApproveProblem={handleApproveProblem}
            onRejectProblem={handleRejectProblem}
            onToggleWeeklyTask={handleToggleWeeklyTask}
            onSelectProblem={handleSelectProblem}
            onPromoteUserRole={handlePromoteUserRole}
            isAdmin={currentUser.role === 'admin'}
            onToggleRole={handleToggleRole}
          />
        </main>
      ) : (
        /* Dedicated Student / User Portal View */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Active Tab: Problems */}
          {activeUserTab === 'problems' && (
            <div className="space-y-6">
              {/* Weekly Task Challenge Banner */}
              <WeeklyBanner
                weeklyProblems={weeklyProblems}
                onSelectProblem={handleSelectProblem}
                userSolvedIds={currentUser.solvedProblemIds}
              />

              {/* Main Problem List */}
              <ProblemList
                problems={problems}
                onSelectProblem={handleSelectProblem}
                userSolvedIds={currentUser.solvedProblemIds}
                onOpenCreateProblem={() => setIsCreateModalOpen(true)}
              />
            </div>
          )}

          {/* Active Tab: Leaderboard */}
          {activeUserTab === 'leaderboard' && (
            <Leaderboard
              users={users}
              currentUserHandle={currentUser.handle}
            />
          )}

          {/* Active Tab: Quests & Weekly Tasks */}
          {activeUserTab === 'quests' && (
            <QuestsView
              quests={quests}
              currentUser={currentUser}
              onClaimQuest={handleClaimQuest}
              onOpenCreateProblem={() => setIsCreateModalOpen(true)}
            />
          )}

          {/* Active Tab: Discussions & Q&A */}
          {activeUserTab === 'discussions' && (
            <DiscussionBoard
              discussions={discussions}
              problems={problems}
              currentUser={currentUser}
              onAddDiscussion={handleAddDiscussion}
              onAddReply={handleAddReply}
              onToggleUpvote={handleToggleUpvote}
              onMarkAcceptedAnswer={handleMarkAcceptedAnswer}
              initialProblemFilterId={discussionProblemFilterId}
            />
          )}

          {/* Active Tab: Submissions Audit History */}
          {activeUserTab === 'submissions' && (
            <SubmissionsView
              submissions={submissions}
              currentUserHandle={currentUser.handle}
              isAdmin={currentUser.role === 'admin'}
            />
          )}

        </main>
      )}

      {/* Problem Creation Modal for Students and Community */}
      <CreateProblemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitProblem={handleCreateProblem}
        authorHandle={currentUser.handle}
        authorName={currentUser.name}
      />

      {/* Admin Passcode Guard Modal */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Shield className="w-5 h-5" />
                <span>เข้าสู่ระบบ Admin Portal</span>
              </div>
              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              หน้านี้สงวนไว้สำหรับผู้ดูแลระบบและอาจารย์ผู้ตรวจโจทย์ เพื่อตรวจรับรองโจทย์ชุมชนและจัดการระบบ
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-mono">
                  รหัสผ่าน Admin (ค่าเริ่มต้น: <span className="text-amber-400">admin1234</span> หรือกดเข้าสู่ระบบได้ทันที):
                </label>
                <div className="relative mt-1">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={e => setAdminPasscode(e.target.value)}
                    placeholder="ใส่รหัสผ่าน admin1234"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                {adminAuthError && (
                  <p className="text-rose-400 text-xs mt-1">{adminAuthError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  เข้าสู่หน้า Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
