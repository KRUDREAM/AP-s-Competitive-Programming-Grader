import React, { useState } from 'react';
import { Problem, Difficulty, ProblemCategory, TestCase } from '../types';
import { X, Plus, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface CreateProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProblem: (newProblem: Problem) => void;
  authorHandle: string;
  authorName: string;
}

export const CreateProblemModal: React.FC<CreateProblemModalProps> = ({
  isOpen,
  onClose,
  onSubmitProblem,
  authorHandle,
  authorName,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [category, setCategory] = useState<ProblemCategory>('Loop & Array');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('1 <= N <= 100,000');
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMB, setMemoryLimitMB] = useState(64);

  // Sample case
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [sampleExplanation, setSampleExplanation] = useState('');

  // Hidden test cases for grader
  const [testCases, setTestCases] = useState<Array<{ input: string; output: string; weight: number }>>([
    { input: '', output: '', weight: 50 },
    { input: '', output: '', weight: 50 },
  ]);

  const handleAddTestCase = () => {
    setTestCases(prev => [...prev, { input: '', output: '', weight: 25 }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTestCase = (index: number, field: 'input' | 'output' | 'weight', val: any) => {
    setTestCases(prev =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: val } : tc))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !sampleInput.trim() || !sampleOutput.trim()) {
      alert('กรุณากรอกข้อมูลชื่อโจทย์, คำอธิบายโจทย์ และตัวอย่างข้อมูลทดสอบให้ครบถ้วน');
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const formattedTestCases: TestCase[] = [
      {
        id: 1,
        input: sampleInput.trim(),
        output: sampleOutput.trim(),
        isHidden: false,
        weight: 20,
        explanation: sampleExplanation,
      },
      ...testCases
        .filter(tc => tc.input.trim() && tc.output.trim())
        .map((tc, idx) => ({
          id: idx + 2,
          input: tc.input.trim(),
          output: tc.output.trim(),
          isHidden: true,
          weight: tc.weight || 25,
        })),
    ];

    const newProblem: Problem = {
      id: `prob-${Date.now()}`,
      title: title.trim(),
      slug: slug || `problem-${Date.now()}`,
      difficulty,
      category,
      statement: {
        description: description.trim(),
        inputFormat: inputFormat.trim() || 'รับข้อมูลตามที่ระบุในโจทย์',
        outputFormat: outputFormat.trim() || 'แสดงผลลัพธ์ตามที่ระบุในโจทย์',
        constraints: constraints.trim() || '1 <= N <= 100,000',
      },
      timeLimitMs: Number(timeLimitMs) || 1000,
      memoryLimitMB: Number(memoryLimitMB) || 64,
      samples: [
        {
          input: sampleInput.trim(),
          output: sampleOutput.trim(),
          explanation: sampleExplanation.trim(),
        },
      ],
      testCases: formattedTestCases,
      author: {
        name: authorName,
        handle: authorHandle,
        isStaff: false,
      },
      verificationStatus: 'pending', // Pending Admin review! But immediately accessible!
      adminFeedback: 'โจทย์ส่งเข้าสู่ระบบแล้ว กำลังรอการตรวจรับรองโดยแอดมิน',
      solvedCount: 0,
      totalSubmissions: 0,
      tags: [category, difficulty, 'Community'],
      createdAt: new Date().toISOString().split('T')[0],
      isWeeklyTask: false,
      starterCode: {
        cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // เขียนโค้ดแก้โจทย์ของคุณที่นี่\n    return 0;\n}`,
        c: `#include <stdio.h>\n\nint main() {\n    // เขียนโค้ดภาษา C ของคุณที่นี่\n    return 0;\n}`,
      },
    };

    onSubmitProblem(newProblem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>สร้างและอัพโหลดโจทย์ใหม่สู่ชุมชน</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-normal border border-emerald-500/20">
                Community Problem
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              เปิดโอกาสให้นักเรียนทุกคนสร้างโจทย์ได้อิสระ โดยเพื่อนๆ สามารถเข้าทำได้ทันที และรอการตรวจรับรองจาก Admin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-200">
          
          {/* Notice banner */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">
              <strong>นโยบายการรับรอง:</strong> โจทย์ที่ส่งจะได้รับสถานะ <em>"รอตรวจสอบโดย Admin"</em> ซึ่งนักเรียนทุกคนสามารถเข้าทำและตรวจโค้ดได้ทันที! เมื่อผ่านการตรวจสอบจากแอดมินจะได้รับตรา <em>"รับรองแล้ว"</em> พร้อมมอบโบนัส XP แก่ผู้สร้างโจทย์
            </div>
          </div>

          {/* Title & Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-medium text-slate-300">ชื่อโจทย์ (Problem Title) *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="เช่น ผลบวกค่ายกกำลัง, Shortest Escape..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">ระดับความยาก</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="POSN / Olympic">POSN / Olympic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">หมวดหมู่อัลกอริทึม</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProblemCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Basics & IO">Basics & IO</option>
                <option value="Loop & Array">Loop & Array</option>
                <option value="Math">Math</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Graph">Graph</option>
                <option value="String">String</option>
                <option value="Data Structures">Data Structures</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Time Limit (ms)</label>
              <input
                type="number"
                value={timeLimitMs}
                onChange={e => setTimeLimitMs(Number(e.target.value))}
                min={100}
                max={5000}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">Memory Limit (MB)</label>
              <input
                type="number"
                value={memoryLimitMB}
                onChange={e => setMemoryLimitMB(Number(e.target.value))}
                min={16}
                max={512}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Statement */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-300">คำอธิบายโจทย์ (Problem Statement) *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="อธิบายเนื้อเรื่อง กฎเกณฑ์ และสิ่งที่โปรแกรมต้องคำนวณ..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">รูปแบบข้อมูลนำเข้า (Input Format)</label>
              <textarea
                rows={2}
                value={inputFormat}
                onChange={e => setInputFormat(e.target.value)}
                placeholder="เช่น บรรทัดแรกประกอบด้วยจำนวนเต็ม N..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-300">รูปแบบข้อมูลส่งออก (Output Format)</label>
              <textarea
                rows={2}
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value)}
                placeholder="เช่น แสดงผลลัพธ์คำตอบเพียงบรรทัดเดียว..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-300">ขอบเขตข้อมูล (Constraints)</label>
            <input
              type="text"
              value={constraints}
              onChange={e => setConstraints(e.target.value)}
              placeholder="เช่น 1 <= N <= 100,000, ค่าแต่ละตัวไม่เกิน 10^9"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sample Cases */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="font-semibold text-slate-200">
              ตัวอย่างข้อมูลสำหรับแสดงในหน้าโจทย์ (Sample Case) *
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400">Sample Input *</label>
                <textarea
                  required
                  rows={2}
                  value={sampleInput}
                  onChange={e => setSampleInput(e.target.value)}
                  placeholder="เช่น 3 5"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Sample Output *</label>
                <textarea
                  required
                  rows={2}
                  value={sampleOutput}
                  onChange={e => setSampleOutput(e.target.value)}
                  placeholder="เช่น 8"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400">คำอธิบายเพิ่มเติมตัวอย่าง (Optional)</label>
              <input
                type="text"
                value={sampleExplanation}
                onChange={e => setSampleExplanation(e.target.value)}
                placeholder="เช่น 3 + 5 = 8"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Hidden Test cases for Grader */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">
                  ชุดทดสอบลับสำหรับ Grader (Hidden Test Cases)
                </span>
                <p className="text-[11px] text-slate-400">
                  ชุดทดสอบที่ใช้ตรวจคะแนนจริงในระบบ Grader (ผู้ทำจะไม่เห็นข้อมูลนี้)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มชุดทดสอบ</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">Hidden Case #{idx + 1}</span>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Input เช่น 10 20"
                      value={tc.input}
                      onChange={e => handleUpdateTestCase(idx, 'input', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Output เช่น 30"
                      value={tc.output}
                      onChange={e => handleUpdateTestCase(idx, 'output', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-400 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all shadow-sm cursor-pointer"
            >
              ส่งโจทย์เข้าสู่ระบบ
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
