import React, { useState } from 'react';
import { Problem, UserProfile, Submission } from '../types';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../services/supabase';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye, 
  Database,
  Users,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminPanelProps {
  problems: Problem[];
  users: UserProfile[];
  submissions: Submission[];
  onApproveProblem: (problemId: string) => void;
  onRejectProblem: (problemId: string, feedback: string) => void;
  onToggleWeeklyTask: (problemId: string) => void;
  onSelectProblem: (problem: Problem) => void;
  onPromoteUserRole: (handle: string, newRole: 'student' | 'admin') => void;
  isAdmin: boolean;
  onToggleRole: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  problems,
  users,
  submissions,
  onApproveProblem,
  onRejectProblem,
  onToggleWeeklyTask,
  onSelectProblem,
  onPromoteUserRole,
  isAdmin,
  onToggleRole,
}) => {
  const [adminSection, setAdminSection] = useState<'verification' | 'problems' | 'users' | 'submissions' | 'supabase'>('verification');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'verified' | 'all'>('pending');
  const [rejectModalProblemId, setRejectModalProblemId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const pendingCount = problems.filter(p => p.verificationStatus === 'pending').length;
  const verifiedCount = problems.filter(p => p.verificationStatus === 'verified').length;

  const filteredProblems = problems.filter(p => {
    if (filterStatus === 'pending') return p.verificationStatus === 'pending';
    if (filterStatus === 'verified') return p.verificationStatus === 'verified';
    return true;
  });

  const handleOpenReject = (problemId: string) => {
    setRejectModalProblemId(problemId);
    setRejectFeedback('โจทย์มีความน่าสนใจ แต่ขอให้เพิ่มกรณีทดสอบขอบเขตตัวเลขติดลบและ N สูงสุด');
  };

  const handleConfirmReject = () => {
    if (rejectModalProblemId) {
      onRejectProblem(rejectModalProblemId, rejectFeedback);
      setRejectModalProblemId(null);
      setRejectFeedback('');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cp_grader_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Admin Notice if currently in student mode */}
      {!isAdmin && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white">คุณกำลังอยู่ในโหมดนักเรียน:</strong> กดสลับเป็นโหมด Admin เพื่อเปิดสิทธิ์การอนุมัติโจทย์ การจัดการผู้ใช้ และการเชื่อมต่อ Supabase ได้เต็มรูปแบบ
            </div>
          </div>
          <button
            onClick={onToggleRole}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors shrink-0 cursor-pointer"
          >
            สลับเป็นโหมด Admin ตอนนี้
          </button>
        </div>
      )}

      {/* Admin Header with Section Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>ADMINISTRATION &amp; GRADER CONTROL CENTER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ศูนย์จัดการระบบและตรวจรับรองโจทย์
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบตรวจสอบโจทย์ชุมชน, จัดการผู้เข้าสอบ, มอนิเตอร์ผลการส่งตรวจ และตัวเชื่อมต่อฐานข้อมูล Supabase
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span className="text-slate-300">
                {isSupabaseConfigured ? 'Supabase: Connected' : 'Storage: Local Database Sync'}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation for Admin */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-800 text-xs">
          <button
            onClick={() => setAdminSection('verification')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'verification'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>ตรวจรับรองโจทย์ ({pendingCount})</span>
          </button>

          <button
            onClick={() => setAdminSection('problems')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'problems'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>จัดการโจทย์ทั้งหมด ({problems.length})</span>
          </button>

          <button
            onClick={() => setAdminSection('users')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'users'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>จัดการผู้ใช้ &amp; สิทธิ์ ({users.length})</span>
          </button>

          <button
            onClick={() => setAdminSection('submissions')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'submissions'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-rose-400" />
            <span>บันทึกการส่งโค้ดทั้งหมด ({submissions.length})</span>
          </button>

          <button
            onClick={() => setAdminSection('supabase')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'supabase'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Integration &amp; SQL Schema</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: VERIFICATION QUEUE */}
      {adminSection === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>คิวโจทย์ที่รอการตรวจสอบ (Pending Verification)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              นักเรียนสามารถเข้าทำโจทย์เหล่านี้ได้ทันทีระหว่างรอตรวจ
            </span>
          </div>

          <div className="space-y-4">
            {problems.filter(p => p.verificationStatus === 'pending').length === 0 ? (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-white">ไม่มีโจทย์ค้างการตรวจสอบ</p>
                <p className="text-xs text-slate-500 mt-1">โจทย์ชุมชนทั้งหมดได้รับการตรวจสอบและรับรองเรียบร้อยแล้ว</p>
              </div>
            ) : (
              problems
                .filter(p => p.verificationStatus === 'pending')
                .map(problem => (
                  <div
                    key={problem.id}
                    className="bg-slate-900 border border-amber-500/40 rounded-xl p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                            {problem.category}
                          </span>
                          <span className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            รอการตรวจสอบ &bull; เปิดให้นักเรียนทำได้เลย
                          </span>
                        </div>

                        <h4 className="text-lg font-bold text-white">
                          {problem.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {problem.statement.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                          <span>Time Limit: {problem.timeLimitMs}ms</span>
                          <span>&bull;</span>
                          <span>Memory: {problem.memoryLimitMB}MB</span>
                          <span>&bull;</span>
                          <span>ชุดทดสอบ: {problem.testCases.length} ชุด</span>
                          <span>&bull;</span>
                          <span>สร้างโดย: {problem.author.name} (@{problem.author.handle})</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => onSelectProblem(problem)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ทดสอบใน IDE</span>
                        </button>

                        <button
                          onClick={() => onApproveProblem(problem.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>อนุมัติรับรอง (Verify)</span>
                        </button>

                        <button
                          onClick={() => handleOpenReject(problem.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ขอให้ปรับปรุง</span>
                        </button>
                      </div>
                    </div>

                    {/* Inspect Test cases */}
                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-xs font-mono">
                      <div className="text-slate-400 mb-1 font-sans font-semibold text-[11px]">
                        ตัวอย่างชุดทดสอบลับ ({problem.testCases.length} ชุด):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {problem.testCases.map((tc, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]"
                          >
                            <span className="text-slate-400">#{tc.id}:</span>{' '}
                            <span className="text-slate-300">{tc.input.slice(0, 15)}</span> &rarr;{' '}
                            <span className="text-emerald-400">{tc.output.slice(0, 15)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: PROBLEM MANAGEMENT */}
      {adminSection === 'problems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              คลังโจทย์ทั้งหมดในระบบ ({problems.length} ข้อ)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Verified: {verifiedCount} &bull; Pending: {pendingCount}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5 font-sans">ชื่อโจทย์</th>
                    <th className="p-3.5">ระดับ</th>
                    <th className="p-3.5 font-sans">หมวดหมู่</th>
                    <th className="p-3.5 text-center font-sans">สถานะการรับรอง</th>
                    <th className="p-3.5 text-center font-sans">Weekly Task</th>
                    <th className="p-3.5 text-right font-sans">ผ่านแล้ว</th>
                    <th className="p-3.5 text-center font-sans">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {problems.map(p => (
                    <tr key={p.id} className="hover:bg-slate-850 transition-colors">
                      <td className="p-3.5 text-slate-500">{p.id}</td>
                      <td className="p-3.5 font-sans font-semibold text-white">
                        {p.title}
                      </td>
                      <td className="p-3.5 text-emerald-400 font-bold">{p.difficulty}</td>
                      <td className="p-3.5 font-sans text-slate-300">{p.category}</td>
                      <td className="p-3.5 text-center font-sans">
                        {p.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" /> รับรองแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" /> รอการตรวจ
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-sans">
                        <button
                          onClick={() => onToggleWeeklyTask(p.id)}
                          className={`text-xs px-2 py-0.5 rounded cursor-pointer ${
                            p.isWeeklyTask
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p.isWeeklyTask ? '★ Featured' : '+ ตั้งเป็น Weekly'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right text-slate-300">
                        {p.solvedCount} คน
                      </td>
                      <td className="p-3.5 text-center font-sans">
                        <button
                          onClick={() => onSelectProblem(p)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium"
                        >
                          เปิดดู
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: USER MANAGEMENT */}
      {adminSection === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              รายชื่อผู้ใช้งานและนักเรียนในระบบ ({users.length} คน)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Admin Role Management
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">ผู้ใช้ / Handle</th>
                    <th className="p-3.5">สังกัด / โรงเรียน</th>
                    <th className="p-3.5 text-center font-mono">Rating</th>
                    <th className="p-3.5 text-center">ระดับ (Tier)</th>
                    <th className="p-3.5 text-center">สถานะสิทธิ์</th>
                    <th className="p-3.5 text-center">ปรับเปลี่ยนสิทธิ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.map(u => (
                    <tr key={u.handle} className="hover:bg-slate-850 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              @{u.handle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300">{u.school}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                        {u.rating}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-300">
                        {u.tier}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onPromoteUserRole(u.handle, u.role === 'admin' ? 'student' : 'admin')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                        >
                          {u.role === 'admin' ? 'ลดเป็นนักเรียน' : 'ตั้งเป็น Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SUBMISSIONS AUDIT */}
      {adminSection === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              บันทึกการส่งตรวจทั้งหมดแบบ Real-time ({submissions.length} รายการ)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Audit Submissions Stream
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5 font-sans">โจทย์</th>
                    <th className="p-3.5 font-sans">ผู้ส่ง</th>
                    <th className="p-3.5">ภาษา</th>
                    <th className="p-3.5 text-center">Verdict</th>
                    <th className="p-3.5 text-right">เวลา</th>
                    <th className="p-3.5 text-right">Memory</th>
                    <th className="p-3.5 text-right font-sans">เวลาส่ง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-850">
                      <td className="p-3.5 text-slate-500">{sub.id}</td>
                      <td className="p-3.5 font-sans font-semibold text-white">
                        {sub.problemTitle}
                      </td>
                      <td className="p-3.5 font-sans text-slate-300">
                        {sub.userName} <span className="text-slate-500">(@{sub.userHandle})</span>
                      </td>
                      <td className="p-3.5 uppercase font-bold text-slate-400">
                        {sub.language}
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          sub.status === 'AC' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {sub.status} ({sub.score}/100)
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-slate-300">{sub.executionTimeMs}ms</td>
                      <td className="p-3.5 text-right text-slate-300">{sub.memoryUsedKB}KB</td>
                      <td className="p-3.5 text-right text-slate-500 font-sans">{sub.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: SUPABASE INTEGRATION & SQL SCHEMA HUB */}
      {adminSection === 'supabase' && (
        <div className="space-y-6">
          
          {/* Connection status banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
                  <Database className="w-4 h-4" />
                  <span>SUPABASE POSTGRESQL PRODUCTION BACKEND</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  โครงสร้างฐานข้อมูลและสคริปต์ Migration สำหรับ Supabase
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  คุณสามารถนำโค้ด SQL ด้านล่างนี้ไปวางและรันใน <strong>Supabase SQL Editor</strong> เพื่อสร้างตารางทั้งหมด (profiles, problems, test_cases, submissions, quests, discussions) พร้อมตั้งค่า Row-Level Security (RLS) ได้ในคลิกเดียว!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>คัดลอก SQL สำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก SQL ทั้งหมด</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadSql}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด .sql</span>
                </button>
              </div>
            </div>

            {/* Quick Setup Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400 font-mono">1. รัน SQL ใน Supabase</div>
                <p className="text-slate-400 leading-relaxed">
                  ไปที่โปรเจกต์ Supabase &rarr; SQL Editor &rarr; วางสคริปต์นี้แล้วกด Run
                </p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-amber-400 font-mono">2. คัดลอก API Credentials</div>
                <p className="text-slate-400 leading-relaxed">
                  ไปที่ Project Settings &rarr; API &rarr; นำ Project URL และ Anon Key มาใส่ใน .env
                </p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-indigo-400 font-mono">3. เริ่มต้นใช้งานจริง</div>
                <p className="text-slate-400 leading-relaxed">
                  ระบบจะสลับจาก LocalDB เข้าสู่ Supabase อัตโนมัติ รองรับ Multi-user และ Realtime
                </p>
              </div>
            </div>
          </div>

          {/* SQL Editor Code Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>schema.sql &bull; Ready for Supabase PostgreSQL</span>
              </div>
              <button
                onClick={handleCopySql}
                className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedSql ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}
              </button>
            </div>
            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[450px]">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>

        </div>
      )}

      {/* Reject Modal */}
      {rejectModalProblemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">
              ส่งข้อความขอให้ปรับปรุงโจทย์
            </h3>
            <p className="text-xs text-slate-400">
              ระบุคำแนะนำเพื่อให้ผู้สร้างโจทย์นำไปปรับปรุงแก้ไขก่อนส่งใหม่อีกครั้ง
            </p>
            <textarea
              rows={3}
              value={rejectFeedback}
              onChange={e => setRejectFeedback(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-sans focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalProblemId(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold text-xs"
              >
                ส่งความเห็นให้ผู้สร้าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
