import React, { useState } from 'react';
import { Submission, Language, Verdict } from '../types';
import { 
  FileCode, 
  Clock, 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Code2, 
  Search, 
  X,
  Filter
} from 'lucide-react';

interface SubmissionsViewProps {
  submissions: Submission[];
  currentUserHandle: string;
  isAdmin: boolean;
  onSelectProblemById?: (problemId: string) => void;
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({
  submissions,
  currentUserHandle,
  isAdmin,
  onSelectProblemById,
}) => {
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [filterLang, setFilterLang] = useState<string>('all');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<'mine' | 'all'>(isAdmin ? 'all' : 'mine');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = submissions.filter(sub => {
    if (filterScope === 'mine' && sub.userHandle !== currentUserHandle) return false;
    if (filterLang !== 'all' && sub.language !== filterLang) return false;
    if (filterVerdict !== 'all' && sub.status !== filterVerdict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sub.problemTitle.toLowerCase().includes(q) ||
        sub.userName.toLowerCase().includes(q) ||
        sub.userHandle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getVerdictBadge = (status: Verdict, score: number) => {
    switch (status) {
      case 'AC':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AC ({score}/100)
          </span>
        );
      case 'WA':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
            <XCircle className="w-3.5 h-3.5" />
            WA ({score}/100)
          </span>
        );
      case 'TLE':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            <Clock className="w-3.5 h-3.5" />
            TLE
          </span>
        );
      case 'CE':
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3.5 h-3.5" />
            CE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
            RTE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <FileCode className="w-4 h-4" />
            <span>SUBMISSIONS AUDIT LOG &bull; บันทึกผลการตรวจและสถิติโค้ด</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ประวัติการส่งโค้ดทั้งหมด (C &amp; C++)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            ตรวจสอบโค้ดที่ส่งตรวจ, เวลาประมวลผล, หน่วยความจำ และผลการรันแยกตามชุดทดสอบ
          </p>
        </div>

        {/* Scope Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterScope('mine')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterScope === 'mine'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ของฉันเท่านั้น
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมดในระบบ ({submissions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>ภาษา:</span>
          </div>
          <select
            value={filterLang}
            onChange={e => setFilterLang(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="all">ทุกภาษา (C &amp; C++)</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>

          <div className="flex items-center gap-1.5 text-slate-400 font-medium ml-2">
            <span>ผลตรวจ (Verdict):</span>
          </div>
          <select
            value={filterVerdict}
            onChange={e => setFilterVerdict(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="AC">Accepted (AC)</option>
            <option value="WA">Wrong Answer (WA)</option>
            <option value="TLE">Time Limit (TLE)</option>
            <option value="CE">Compile Error (CE)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโจทย์หรือผู้ส่ง..."
            className="w-full bg-slate-950 border border-slate-700 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Submission ID</th>
                <th className="p-3.5 font-sans">โจทย์ที่ส่ง</th>
                <th className="p-3.5 font-sans">ผู้ส่ง (Handle)</th>
                <th className="p-3.5">ภาษา</th>
                <th className="p-3.5 text-center">ผลการตรวจ</th>
                <th className="p-3.5 text-right">เวลา (ms)</th>
                <th className="p-3.5 text-right">หน่วยความจำ</th>
                <th className="p-3.5 text-right font-sans">วันที่ส่ง</th>
                <th className="p-3.5 text-center font-sans">ตรวจสอบโค้ด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 font-sans text-sm">
                    ไม่พบบันทึกการส่งที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-slate-500">{sub.id}</td>
                    <td className="p-3.5 font-sans font-semibold text-white">
                      {sub.problemTitle}
                    </td>
                    <td className="p-3.5 font-sans text-slate-300">
                      {sub.userName} <span className="text-slate-500 font-mono text-[11px]">(@{sub.userHandle})</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[11px] font-bold">
                        {sub.language}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {getVerdictBadge(sub.status, sub.score)}
                    </td>
                    <td className="p-3.5 text-right text-slate-300">
                      {sub.executionTimeMs} ms
                    </td>
                    <td className="p-3.5 text-right text-slate-300">
                      {sub.memoryUsedKB} KB
                    </td>
                    <td className="p-3.5 text-right text-slate-400 font-sans text-[11px]">
                      {sub.submittedAt}
                    </td>
                    <td className="p-3.5 text-center font-sans">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium cursor-pointer"
                      >
                        ดูโค้ด &bull; รายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Inspection Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <span>{selectedSub.problemTitle}</span>
                  {getVerdictBadge(selectedSub.status, selectedSub.score)}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedSub.id} &bull; {selectedSub.language.toUpperCase()} &bull; {selectedSub.executionTimeMs}ms &bull; {selectedSub.memoryUsedKB}KB &bull; ส่งโดย @{selectedSub.userHandle}
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              
              {/* Test results matrix */}
              {selectedSub.testResults && selectedSub.testResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono mb-2">
                    ผลลัพธ์แยกตามชุดทดสอบ (Test Matrix):
                  </h4>
                  <div className="flex flex-wrap gap-2 font-mono text-xs">
                    {selectedSub.testResults.map((tr, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1.5 rounded border ${
                          tr.verdict === 'P'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        Case #{tr.testCaseId}: {tr.verdict === 'P' ? 'PASS (P)' : 'FAIL (-)'} ({tr.timeMs}ms)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source code viewer */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono mb-2">
                  ซอร์สโค้ดภาษา {selectedSub.language.toUpperCase()}:
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                  <pre>{selectedSub.code}</pre>
                </div>
              </div>

              {selectedSub.compileError && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase font-mono mb-2">
                    Compiler Diagnostic:
                  </h4>
                  <div className="bg-slate-950 border border-amber-500/30 rounded-lg p-3 font-mono text-xs text-amber-300 whitespace-pre-wrap">
                    {selectedSub.compileError}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
