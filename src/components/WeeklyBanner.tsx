import React, { useState, useEffect } from 'react';
import { Problem } from '../types';
import { Sparkles, Clock, ArrowRight, Zap, Award } from 'lucide-react';

interface WeeklyBannerProps {
  weeklyProblems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  userSolvedIds: string[];
}

export const WeeklyBanner: React.FC<WeeklyBannerProps> = ({
  weeklyProblems,
  onSelectProblem,
  userSolvedIds,
}) => {
  // Simple countdown to Sunday midnight
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, mins: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59 };
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const solvedCount = weeklyProblems.filter(p => userSolvedIds.includes(p.id)).length;

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-5 sm:p-6 mb-8 shadow-lg">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Info & Theme */}
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              Weekly Challenge &bull; Week 45
            </span>
            <span className="text-slate-500">/</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              เหลือเวลา {timeLeft.days} วัน {timeLeft.hours} ชม.
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            พิชิตโจทย์ประจำสัปดาห์: Dynamic Programming &amp; BFS Graph
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            ฝึกทักษะการออกแบบอัลกอริทึมเตรียมสอบ สอวน. / TOI ประจำสัปดาห์ สะสมคะแนนโบนัสพิเศษ{' '}
            <span className="text-emerald-400 font-semibold">+500 XP</span> และปลดล็อกเข็มกลัดประจำลีก
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ความคืบหน้าของคุณ: <strong className="text-white">{solvedCount}/{weeklyProblems.length}</strong> ข้อ</span>
            </div>
            <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${weeklyProblems.length > 0 ? (solvedCount / weeklyProblems.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Featured Problems list */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {weeklyProblems.map(problem => {
            const isSolved = userSolvedIds.includes(problem.id);
            return (
              <button
                key={problem.id}
                onClick={() => onSelectProblem(problem)}
                className={`flex flex-col justify-between p-3.5 rounded-lg border text-left transition-all group min-w-[200px] cursor-pointer ${
                  isSolved
                    ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-slate-800/80 border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-mono text-slate-400">{problem.category}</span>
                  {isSolved ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      ✓ ผ่านแล้ว
                    </span>
                  ) : (
                    <span className="text-xs text-amber-400 font-semibold">+300 XP</span>
                  )}
                </div>

                <div className="font-medium text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {problem.title}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700/50">
                  <span className="capitalize">{problem.difficulty}</span>
                  <span className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    ทำโจทย์ <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
