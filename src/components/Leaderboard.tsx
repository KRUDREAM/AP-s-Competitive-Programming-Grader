import React, { useState, useMemo } from 'react';
import { UserProfile, RatingTier } from '../types';
import { Trophy, Medal, Flame, Search, Award, TrendingUp, School } from 'lucide-react';

interface LeaderboardProps {
  users: UserProfile[];
  currentUserHandle: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, currentUserHandle }) => {
  const [filterMode, setFilterMode] = useState<'rating' | 'weekly'>('rating');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedUsers = useMemo(() => {
    let list = [...users];
    if (filterMode === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => b.weeklyXp - a.weeklyXp);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.handle.toLowerCase().includes(q) ||
          u.school.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, filterMode, searchQuery]);

  const tierColors: Record<RatingTier, { badge: string; text: string }> = {
    'Grandmaster': { badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400', text: 'text-rose-400' },
    'Master': { badge: 'bg-orange-500/10 border-orange-500/30 text-orange-400', text: 'text-orange-400' },
    'Expert': { badge: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', text: 'text-indigo-400' },
    'Specialist': { badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', text: 'text-cyan-400' },
    'Pupil': { badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', text: 'text-emerald-400' },
    'Newbie': { badge: 'bg-slate-500/10 border-slate-500/30 text-slate-400', text: 'text-slate-400' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span>REAL-TIME LEADERBOARD &bull; อัปเดตทันทีเมื่อส่งโค้ด</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ทำเนียบยอดฝีมือ Competitive Programming
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            จัดอันดับนักเรียนจากทั่วประเทศตาม Rating และคะแนนสะสมประจำสัปดาห์
          </p>
        </div>

        {/* View Switcher: Rating vs Weekly */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilterMode('rating')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterMode === 'rating'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              อันดับ Rating ตลอดกาล
            </button>
            <button
              onClick={() => setFilterMode('weekly')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filterMode === 'weekly'
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Weekly League</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อนักเรียน, Handle หรือชื่อโรงเรียน..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Top 3 Podium Highlights */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {sortedUsers.slice(0, 3).map((user, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            const podiumColors = isFirst
              ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-900'
              : isSecond
              ? 'border-slate-400/40 bg-gradient-to-b from-slate-800/40 to-slate-900'
              : 'border-amber-700/40 bg-gradient-to-b from-amber-950/10 to-slate-900';

            return (
              <div
                key={user.handle}
                className={`rounded-xl border ${podiumColors} p-5 text-center relative flex flex-col items-center justify-between shadow-sm`}
              >
                <div className="absolute top-3 right-3 text-lg">
                  {isFirst ? '🥇' : isSecond ? '🥈' : '🥉'}
                </div>

                <div className="relative mb-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover"
                  />
                  <div className="absolute -bottom-2 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono font-bold text-amber-400">
                    Rank #{idx + 1}
                  </div>
                </div>

                <div className="space-y-1 my-1">
                  <div className="font-semibold text-white text-base">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    @{user.handle}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <School className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[200px]">{user.school}</span>
                  </div>
                </div>

                <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around text-xs">
                  <div>
                    <div className="text-slate-500 text-[10px]">Rating</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      {user.rating}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">ผ่านแล้ว</div>
                    <div className="font-mono font-bold text-slate-200 text-sm">
                      {user.solvedProblemIds.length} ข้อ
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Weekly XP</div>
                    <div className="font-mono font-bold text-amber-400 text-sm">
                      +{user.weeklyXp}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">อันดับ</th>
                <th className="py-3.5 px-4">นักเรียน / Handle</th>
                <th className="py-3.5 px-4 hidden md:table-cell">สังกัด / โรงเรียน</th>
                <th className="py-3.5 px-4 text-center">ระดับ (Tier)</th>
                <th className="py-3.5 px-4 text-center">แก้ผ่าน</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
                <th className="py-3.5 px-4 text-right">
                  {filterMode === 'rating' ? 'คะแนน Rating' : 'Weekly XP'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-sans">
              {sortedUsers.map((user, idx) => {
                const isCurrent = user.handle === currentUserHandle;
                const tier = tierColors[user.tier];

                return (
                  <tr
                    key={user.handle}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-emerald-950/20 border-l-2 border-emerald-500'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {idx === 0 ? (
                        <span className="text-amber-400">🥇 #1</span>
                      ) : idx === 1 ? (
                        <span className="text-slate-300">🥈 #2</span>
                      ) : idx === 2 ? (
                        <span className="text-amber-600">🥉 #3</span>
                      ) : (
                        <span>#{idx + 1}</span>
                      )}
                    </td>

                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                                คุณ
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            @{user.handle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* School */}
                    <td className="py-3.5 px-4 text-xs text-slate-300 hidden md:table-cell">
                      {user.school}
                    </td>

                    {/* Tier badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${tier.badge}`}>
                        {user.tier}
                      </span>
                    </td>

                    {/* Solved Count */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {user.solvedProblemIds.length} ข้อ
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-orange-400">
                        <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        {user.streakDays}d
                      </span>
                    </td>

                    {/* Rating or Weekly XP */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {filterMode === 'rating' ? (
                        <span className="text-emerald-400 text-base">
                          {user.rating}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-base">
                          +{user.weeklyXp} XP
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
