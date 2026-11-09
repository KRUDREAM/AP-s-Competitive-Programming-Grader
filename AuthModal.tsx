import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, X, User, Lock, School } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('โรงเรียนสวนกุหลาบวิทยาลัย');

  if (!isOpen) return null;

  const handleQuickLogin = (role: 'student' | 'admin', demoName: string, demoHandle: string) => {
    const user: UserProfile = {
      handle: demoHandle,
      name: demoName,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rating: role === 'admin' ? 2400 : 1540,
      tier: role === 'admin' ? 'Grandmaster' : 'Specialist',
      school: 'โรงเรียนสวนกุหลาบวิทยาลัย',
      role: role,
      solvedProblemIds: ['prob-1'],
      weeklyXp: 450,
      totalXp: 1850,
      level: 5,
      streakDays: 4,
      lastActiveDate: new Date().toISOString().split('T')[0],
      badges: [],
    };
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-sans">
            {isRegister ? 'สมัครสมาชิก CP Grader' : 'เข้าสู่ระบบ CP Grader'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-emerald-400 mb-2">⚡ เข้าสู่ระบบแบบรวดเร็ว (1-Click Demo):</div>
          <button
            onClick={() => handleQuickLogin('student', 'AP (นักเรียน ม.304)', 'ap_student')}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-left text-slate-200 flex items-center justify-between transition-colors cursor-pointer border border-slate-800"
          >
            <span>👨‍🎓 เข้าสู่ระบบเป็นนักเรียน (AP)</span>
            <span className="text-[10px] text-emerald-400 font-mono">Specialist</span>
          </button>
          <button
            onClick={() => handleQuickLogin('admin', 'Admin Master', 'admin_cp')}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-left text-slate-200 flex items-center justify-between transition-colors cursor-pointer border border-slate-800"
          >
            <span>🛡️ เข้าสู่ระบบเป็นผู้ดูแลระบบ (Admin)</span>
            <span className="text-[10px] text-amber-400 font-mono">Grandmaster</span>
          </button>
        </div>
      </div>
    </div>
  );
};
