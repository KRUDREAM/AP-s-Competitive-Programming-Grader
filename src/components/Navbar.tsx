import React from 'react';
import { UserProfile } from '../types';
import { 
  Code2, 
  Trophy, 
  CheckSquare, 
  MessageSquare, 
  ShieldCheck, 
  PlusCircle, 
  Flame, 
  FileCode,
  Shield,
  ArrowRight,
  LogOut,
  Sparkles
} from 'lucide-react';

export type UserTab = 'problems' | 'leaderboard' | 'quests' | 'discussions' | 'submissions';

interface NavbarProps {
  viewMode: 'user' | 'admin';
  onChangeViewMode: (mode: 'user' | 'admin') => void;
  activeUserTab: UserTab;
  setActiveUserTab: (tab: UserTab) => void;
  currentUser: UserProfile;
  onOpenCreateProblem: () => void;
  pendingProblemsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onChangeViewMode,
  activeUserTab,
  setActiveUserTab,
  currentUser,
  onOpenCreateProblem,
  pendingProblemsCount,
}) => {
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      viewMode === 'admin'
        ? 'bg-slate-900/95 border-amber-500/30'
        : 'bg-slate-900/90 border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => {
              if (viewMode === 'admin') onChangeViewMode('user');
              setActiveUserTab('problems');
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-mono font-bold text-lg transition-all ${
              viewMode === 'admin'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400'
            }`}>
              {viewMode === 'admin' ? <Shield className="w-5 h-5" /> : '&lt;/&gt;'}
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                CP Grader
                {viewMode === 'admin' ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/40">
                    ADMIN PORTAL
                  </span>
                ) : (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-normal border border-emerald-500/20">
                    C / C++
                  </span>
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Different for User vs Admin) */}
        {viewMode === 'user' ? (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveUserTab('problems')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeUserTab === 'problems'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>คลังโจทย์ (Problems)</span>
            </button>

            <button
              onClick={() => setActiveUserTab('leaderboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeUserTab === 'leaderboard'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>จัดอันดับสด (Leaderboard)</span>
            </button>

            <button
              onClick={() => setActiveUserTab('quests')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeUserTab === 'quests'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>เควส &amp; กิจกรรม (Quests)</span>
            </button>

            <button
              onClick={() => setActiveUserTab('discussions')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeUserTab === 'discussions'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>ถาม-ตอบ (Q&amp;A)</span>
            </button>

            <button
              onClick={() => setActiveUserTab('submissions')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeUserTab === 'submissions'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>ประวัติการส่ง (Submissions)</span>
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-amber-300/80 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>หน้าต่างควบคุมระบบและการตรวจรับรองโจทย์สำหรับผู้ดูแลระบบ</span>
          </div>
        )}

        {/* Zone 3: Actions & Portal Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {viewMode === 'user' ? (
            <>
              {/* Quick Problem Creation CTA */}
              <button
                onClick={onOpenCreateProblem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all whitespace-nowrap font-sans cursor-pointer"
                title="ทุกคนสามารถอัพโจทย์ได้อิสระ"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">อัพโจทย์ใหม่</span>
                <span className="sm:hidden">ส่งโจทย์</span>
              </button>

              {/* Student Stats */}
              <div className="hidden lg:flex items-center gap-1 text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span className="font-mono font-semibold">{currentUser.streakDays}d</span>
              </div>

              {/* User Handle & Rating */}
              <div className="hidden sm:flex flex-col text-right pl-1">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 leading-tight">
                  {currentUser.rating} ({currentUser.tier})
                </span>
              </div>

              {/* Switch to Admin Portal Button */}
              <button
                onClick={() => onChangeViewMode('admin')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer relative"
                title="เข้าสู่หน้าผู้ดูแลระบบสำหรับตรวจรับรองโจทย์และจัดการระบบ"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin Portal</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
                {pendingProblemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                )}
              </button>
            </>
          ) : (
            <>
              {/* Back to Student Portal Button */}
              <button
                onClick={() => onChangeViewMode('user')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all cursor-pointer border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าผู้ใช้งาน (Student View)</span>
              </button>
            </>
          )}

        </div>

      </div>

      {/* Mobile Navigation bar for User Portal */}
      {viewMode === 'user' && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-900 text-xs">
          <button
            onClick={() => setActiveUserTab('problems')}
            className={`flex flex-col items-center py-1 px-2 ${activeUserTab === 'problems' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            <Code2 className="w-4 h-4" />
            <span>โจทย์</span>
          </button>
          <button
            onClick={() => setActiveUserTab('leaderboard')}
            className={`flex flex-col items-center py-1 px-2 ${activeUserTab === 'leaderboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            <Trophy className="w-4 h-4" />
            <span>อันดับ</span>
          </button>
          <button
            onClick={() => setActiveUserTab('quests')}
            className={`flex flex-col items-center py-1 px-2 ${activeUserTab === 'quests' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>เควส</span>
          </button>
          <button
            onClick={() => setActiveUserTab('discussions')}
            className={`flex flex-col items-center py-1 px-2 ${activeUserTab === 'discussions' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>ถาม-ตอบ</span>
          </button>
          <button
            onClick={() => setActiveUserTab('submissions')}
            className={`flex flex-col items-center py-1 px-2 ${activeUserTab === 'submissions' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            <FileCode className="w-4 h-4" />
            <span>ส่งตรวจ</span>
          </button>
        </div>
      )}
    </header>
  );
};
