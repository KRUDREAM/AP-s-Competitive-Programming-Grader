import React from 'react';
import { Quest, UserProfile } from '../types';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Flame, 
  Award, 
  CheckCircle, 
  Clock, 
  Zap, 
  Star, 
  ShieldCheck,
  Trophy
} from 'lucide-react';

interface QuestsViewProps {
  quests: Quest[];
  currentUser: UserProfile;
  onClaimQuest: (questId: string) => void;
  onOpenCreateProblem: () => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  quests,
  currentUser,
  onClaimQuest,
  onOpenCreateProblem,
}) => {
  const dailyQuests = quests.filter(q => q.type === 'daily');
  const weeklyQuests = quests.filter(q => q.type === 'weekly');
  const achievements = quests.filter(q => q.type === 'achievement');

  const handleClaim = (quest: Quest) => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });
    onClaimQuest(quest.id);
  };

  const nextLevelXp = currentUser.level * 500;
  const currentLevelProgress = (currentUser.totalXp % 500) / 500;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Student Profile & Gamification Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* User info & Level */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-bold font-mono text-[11px] px-2 py-0.5 rounded-full shadow-xs">
                Lv.{currentUser.level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 font-semibold">
                  {currentUser.tier} ({currentUser.rating})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.school} &bull; แก้โจทย์ผ่านแล้ว {currentUser.solvedProblemIds.length} ข้อ
              </p>

              {/* XP Progress bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="w-48 sm:w-64 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(currentLevelProgress * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {currentUser.totalXp} XP (อีก {500 - (currentUser.totalXp % 500)} XP สู่ Lv.{currentUser.level + 1})
                </span>
              </div>
            </div>
          </div>

          {/* Streak & Weekly XP cards */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span className="text-xs font-semibold">Streak</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {currentUser.streakDays} วัน
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">ไฟไม่มอด!</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold">Weekly XP</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                +{currentUser.weeklyXp}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">อันดับลีกสัปดาห์นี้</div>
            </div>
          </div>

        </div>
      </div>

      {/* Daily Quests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              ภารกิจประจำวัน (Daily Quests)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              &bull; รีเซ็ตทุกเที่ยงคืน
            </span>
          </div>
          <span className="text-xs text-slate-400">
            สำเร็จ {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyQuests.map(quest => {
            const isFinished = quest.progress >= quest.target;
            return (
              <div
                key={quest.id}
                className={`rounded-xl border p-4.5 flex flex-col justify-between transition-all ${
                  quest.claimed
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : isFinished
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{quest.icon}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +{quest.xpReward} XP
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-1">
                    {quest.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span>ความคืบหน้า</span>
                    <span>
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                      }}
                    />
                  </div>

                  {quest.claimed ? (
                    <div className="w-full py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold text-center flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>รับรางวัลแล้ว</span>
                    </div>
                  ) : isFinished ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      กดรับ +{quest.xpReward} XP!
                    </button>
                  ) : (
                    <div className="w-full py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 text-xs text-center font-mono">
                      ยังไม่สำเร็จ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Challenges & Community Setter Quests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              ภารกิจประจำสัปดาห์ &amp; การสร้างโจทย์ (Weekly Quests)
            </h3>
          </div>
          <button
            onClick={onOpenCreateProblem}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            + สร้างโจทย์ใหม่รับ +250 XP
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyQuests.map(quest => {
            const isFinished = quest.progress >= quest.target;
            return (
              <div
                key={quest.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                      {quest.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {quest.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 shrink-0">
                    +{quest.xpReward} XP
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
                      <span>เป้าหมายประจำสัปดาห์</span>
                      <span>
                        {quest.progress}/{quest.target}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {quest.claimed ? (
                    <span className="text-xs text-emerald-400 font-semibold shrink-0">
                      ✓ รับแล้ว
                    </span>
                  ) : isFinished ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      รับรางวัล
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono shrink-0">
                      กำลังสะสม
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements & Badges Showcase */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-400" />
          <h3 className="text-base font-bold text-white">
            ตู้โชว์เข็มกลัด &amp; ความสำเร็จ (Badges Collection)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.badges.map(badge => (
            <div
              key={badge.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl shrink-0">
                {badge.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {badge.name}
                </div>
                <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {badge.description}
                </div>
                <div className="text-[10px] text-purple-400 font-mono mt-1">
                  ปลดล็อกเมื่อ {badge.unlockedAt}
                </div>
              </div>
            </div>
          ))}

          {/* Locked Badge Preview */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3.5 opacity-60">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0 grayscale">
              👑
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-400">
                Grandmaster Coder
              </div>
              <div className="text-xs text-slate-500">
                ทำ Rating เกิน 2,400+ ในระบบ
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1">
                ยังไม่ปลดล็อก
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
