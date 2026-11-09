import React, { useState, useMemo } from 'react';
import { Problem, Difficulty, ProblemCategory, VerificationStatus } from '../types';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Code,
  Users
} from 'lucide-react';

interface ProblemListProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  userSolvedIds: string[];
  onOpenCreateProblem: () => void;
}

export const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  onSelectProblem,
  userSolvedIds,
  onOpenCreateProblem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, verified, community

  const difficulties: Difficulty[] = ['Beginner', 'Easy', 'Medium', 'Hard', 'POSN / Olympic'];
  const categories: ProblemCategory[] = [
    'Basics & IO',
    'Loop & Array',
    'Math',
    'Dynamic Programming',
    'Graph',
    'String',
    'Data Structures',
  ];

  const filteredProblems = useMemo(() => {
    return problems.filter(prob => {
      // Search
      const matchSearch =
        prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prob.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prob.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Difficulty
      const matchDiff =
        selectedDifficulty === 'all' || prob.difficulty === selectedDifficulty;

      // Category
      const matchCat =
        selectedCategory === 'all' || prob.category === selectedCategory;

      // Verification Status filter
      const matchStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'verified' && prob.verificationStatus === 'verified') ||
        (selectedStatus === 'community' && prob.verificationStatus === 'pending');

      return matchSearch && matchDiff && matchCat && matchStatus;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedCategory, selectedStatus]);

  const difficultyColors: Record<Difficulty, { text: string; bg: string; border: string }> = {
    'Beginner': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'Easy': { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    'Medium': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'Hard': { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    'POSN / Olympic': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาโจทย์ตามชื่อ แท็ก หรือผู้สร้าง (C/C++)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Verification Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start md:self-auto">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทั้งหมด ({problems.length})
            </button>
            <button
              onClick={() => setSelectedStatus('verified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedStatus === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ผ่านการรับรองแล้ว</span>
            </button>
            <button
              onClick={() => setSelectedStatus('community')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedStatus === 'community'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>โจทย์ชุมชน (เข้าทำได้ทันที)</span>
            </button>
          </div>
        </div>

        {/* Secondary filters: Difficulty & Category */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
          <span className="text-slate-400 flex items-center gap-1 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" /> ระดับ:
          </span>
          <button
            onClick={() => setSelectedDifficulty('all')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              selectedDifficulty === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ทุกระดับ
          </button>
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                selectedDifficulty === diff
                  ? `${difficultyColors[diff].bg} ${difficultyColors[diff].text} font-semibold border ${difficultyColors[diff].border}`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}

          <span className="mx-2 text-slate-700 hidden sm:inline">|</span>

          <span className="text-slate-400 font-medium mr-1">หมวดหมู่:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่อัลกอริทึม</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Community Contribution Callout Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">ระบบเปิดกว้างสำหรับทุกคน:</span>{' '}
            คุณสามารถอัพโหลดโจทย์ใหม่เพื่อแบ่งปันเพื่อนๆ ได้ทันที แม้โจทย์จะอยู่ในสถานะ{' '}
            <strong className="text-amber-400">"รอตรวจสอบโดย Admin"</strong> นักเรียนทุกคนก็สามารถเข้าไปเขียนโค้ดและรันตรวจได้เลย!
          </div>
        </div>
        <button
          onClick={onOpenCreateProblem}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700 shrink-0 cursor-pointer"
        >
          + สร้างโจทย์ใหม่ของคุณ
        </button>
      </div>

      {/* Problem Cards List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
            <Code className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-medium text-slate-300">ไม่พบโจทย์ที่ตรงกับเงื่อนไขการค้นหา</p>
            <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองระดับความยาก</p>
          </div>
        ) : (
          filteredProblems.map(problem => {
            const isSolved = userSolvedIds.includes(problem.id);
            const diffStyle = difficultyColors[problem.difficulty];

            return (
              <div
                key={problem.id}
                onClick={() => onSelectProblem(problem)}
                className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: Status icon, Title, Meta info */}
                  <div className="flex items-start gap-3.5">
                    
                    {/* Solved checkmark or circle */}
                    <div className="pt-0.5 shrink-0">
                      {isSolved ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-700 group-hover:border-slate-500 flex items-center justify-center text-slate-600 text-xs font-mono">
                          -
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {problem.title}
                        </h3>

                        {/* Verification Status Banner */}
                        {problem.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" />
                            <span>รับรองโดย Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded" title="โจทย์ชุมชน - กำลังรอการตรวจจาก Admin แต่นักเรียนสามารถเข้าทำและทดสอบโค้ดได้ตามปกติ">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>ชุมชน &bull; รอรับรอง (ทำได้เลย)</span>
                          </span>
                        )}

                        {problem.isWeeklyTask && (
                          <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                            ⭐ Weekly Task
                          </span>
                        )}
                      </div>

                      {/* Clean metadata without pill clutter */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className={`font-medium ${diffStyle.text}`}>
                          {problem.difficulty}
                        </span>
                        <span aria-hidden="true">&bull;</span>
                        <span>{problem.category}</span>
                        <span aria-hidden="true">&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {problem.timeLimitMs}ms
                        </span>
                        <span aria-hidden="true">&bull;</span>
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3 text-slate-500" />
                          {problem.memoryLimitMB}MB
                        </span>
                        <span aria-hidden="true">&bull;</span>
                        <span>ผู้สร้าง: {problem.author.name}</span>
                      </div>
                    </div>

                  </div>

                  {/* Right: Solved count & CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right text-xs">
                      <div className="font-mono font-medium text-slate-200">
                        ผ่านแล้ว {problem.solvedCount.toLocaleString()} คน
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        อัตราผ่าน {Math.round((problem.solvedCount / Math.max(1, problem.totalSubmissions)) * 100)}%
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectProblem(problem);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold"
                    >
                      <span>เขียนโค้ด</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
