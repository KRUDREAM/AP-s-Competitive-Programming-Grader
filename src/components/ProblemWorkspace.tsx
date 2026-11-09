import React, { useState, useEffect, useRef } from 'react';
import { Problem, Language, Verdict, TestResult } from '../types';
import { executeCode, gradeSubmission, GradeResult, RunResult } from '../utils/grader';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  Copy,
  Check,
  Clock,
  Database,
  ShieldCheck,
  AlertCircle,
  FileCode,
  Terminal,
  Sparkles,
  Maximize2,
  Minimize2,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface ProblemWorkspaceProps {
  problem: Problem;
  onBack: () => void;
  onSolved: (problemId: string, earnedScore: number, language: Language) => void;
  onOpenDiscussion: (problemId: string) => void;
  isSolvedAlready: boolean;
}

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({
  problem,
  onBack,
  onSolved,
  onOpenDiscussion,
  isSolvedAlready,
}) => {
  const [language, setLanguage] = useState<Language>('cpp');
  const [code, setCode] = useState<string>(
    problem.starterCode?.cpp || `#include <iostream>\nusing namespace std;\n\nint main() {\n    // เขียนโค้ดของคุณที่นี่\n    return 0;\n}`
  );

  const [fontSize, setFontSize] = useState<number>(14);
  const [copiedSample, setCopiedSample] = useState<number | null>(null);

  // Bottom drawer states
  const [activeTab, setActiveTab] = useState<'run' | 'grade' | 'ai-hint'>('run');
  const [customInput, setCustomInput] = useState<string>(problem.samples[0]?.input || '');
  const [customRunResult, setCustomRunResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Grading states
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  // AI Hint state
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isGeneratingHint, setIsGeneratingHint] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update starter code when language changes
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (problem.starterCode) {
      setCode(problem.starterCode[newLang]);
    } else {
      setCode(
        newLang === 'cpp'
          ? `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`
          : `#include <stdio.h>\n\nint main() {\n    return 0;\n}`
      );
    }
  };

  const handleResetCode = () => {
    if (window.confirm('คุณต้องการรีเซ็ตโค้ดกลับไปเป็นโค้ดเริ่มต้นหรือไม่?')) {
      if (problem.starterCode) {
        setCode(problem.starterCode[language]);
      }
    }
  };

  // Keyboard navigation & indentation handling in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Copy sample input helper
  const handleCopyInput = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSample(idx);
    setTimeout(() => setCopiedSample(null), 1500);
  };

  // Run custom input
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('run');
    try {
      const res = await executeCode(code, customInput, language, problem.timeLimitMs);
      setCustomRunResult(res);
    } catch (err: any) {
      setCustomRunResult({
        status: 'RTE',
        output: '',
        executionTimeMs: 0,
        memoryUsedKB: 0,
        error: err.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Grade full testcases
  const handleGrade = async () => {
    setIsGrading(true);
    setActiveTab('grade');
    try {
      const res = await gradeSubmission(code, problem.testCases, language, problem.timeLimitMs);
      setGradeResult(res);

      if (res.status === 'AC') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
        onSolved(problem.id, res.score, language);
      }
    } catch (err: any) {
      setGradeResult({
        status: 'CE',
        score: 0,
        totalScore: 100,
        executionTimeMs: 0,
        memoryUsedKB: 0,
        testResults: [],
        compileError: err.message,
      });
    } finally {
      setIsGrading(false);
    }
  };

  // Generate smart AI hint for students without giving the full code away
  const handleRequestHint = () => {
    setIsGeneratingHint(true);
    setActiveTab('ai-hint');

    setTimeout(() => {
      let hintMsg = '';
      if (problem.category === 'Dynamic Programming') {
        hintMsg = `💡 คำใบ้จาก Coach:\n- ลองวิเคราะห์สถานะ (State): dp[i] แทนคำตอบที่ดีที่สุดจนถึงตำแหน่งที่ i\n- สำหรับข้อนี้ มีทางเลือกในการเปลี่ยนผ่าน (Transition) กี่แบบ? เปรียบเทียบผลลัพธ์ระหว่างทางเลือกเหล่านั้น\n- สังเกตค่าเริ่มต้น (Base cases): ตรวจสอบกรณี N=1 หรือ N=2 ให้รอบคอบ\n- ระวังจำนวนเต็มล้น (Integer Overflow): หากผลรวมมีโอกาสเกิน 2x10^9 ควรใช้ 'long long' ใน C/C++ เสมอ`;
      } else if (problem.category === 'Loop & Array') {
        hintMsg = `💡 คำใบ้จาก Coach:\n- ข้อนี้สามารถใช้ลูปเดียว O(N) ในการประมวลผลคำตอบได้โดยไม่ต้องเก็บข้อมูลทั้งหมดลง Array\n- ตรวจสอบค่าเริ่มต้นของตัวแปร Min และ Max: อย่าเริ่มด้วย 0 หากตัวเลขในอินพุตมีโอกาสเป็นค่าติดลบทั้งหมด! ควรเริ่มด้วยตัวเลขแรกที่อ่านได้ หรือค่าขอบเขตสุด เช่น 2e18`;
      } else if (problem.category === 'Graph') {
        hintMsg = `💡 คำใบ้จาก Coach:\n- สำหรับการหาเส้นทางสั้นที่สุด (Shortest Path) บนกริดที่แต่ละก้าวมีค่าน้ำหนักเท่ากัน (Unweighted Grid) ให้ใช้ Breadth-First Search (BFS) ด้วย Queue\n- อย่าลืมทำเครื่องหมาย visited ทันทีที่ push ลงใน queue เพื่อป้องกันลูปและประหยัดเวลา/หน่วยความจำ`;
      } else if (problem.category === 'Data Structures') {
        hintMsg = `💡 คำใบ้จาก Coach:\n- ปัญหาการจับคู่วงเล็บเป็นโจทย์คลาสสิกของ Stack โครงสร้างข้อมูลแบบ LIFO (Last-In First-Out)\n- เมื่อเจอวงเล็บเปิดให้ push ลง stack เมื่อเจอวงเล็บปิดให้ตรวจสอบตัวบนสุด (top) ว่าจับคู่ตรงกันหรือไม่ หาก stack ว่างหรือจับคู่ไม่ตรงแปลว่าผิดทันที!\n- อย่าลืมว่าเมื่ออ่านหมดข้อความ stack ต้องว่างเปล่าจึงจะถือว่าสมดุล`;
      } else {
        hintMsg = `💡 คำใบ้จาก Coach:\n- ตรวจสอบชนิดข้อมูล (Data Types): ตรวจสอบว่าผลลัพธ์ต้องการ 64-bit (long long) หรือไม่\n- ตรวจสอบกรณีมุม (Corner Cases): ขอบเขตต่ำสุด (เช่น N=0, N=1) หรือค่าติดลบ\n- ใน C++ อย่าลืมปิดการซิงค์ I/O ด้วย 'ios_base::sync_with_stdio(false); cin.tie(NULL);' เมื่อข้อมูลเข้ามีขนาดใหญ่`;
      }
      setAiHint(hintMsg);
      setIsGeneratingHint(false);
    }, 600);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 18) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      
      {/* Top Bar inside Workspace */}
      <div className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between gap-4 shrink-0">
        
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">กลับหน้ารวม</span>
          </button>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 truncate">
            <h1 className="text-sm font-semibold text-white truncate font-sans">
              {problem.title}
            </h1>
            {isSolvedAlready && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-medium shrink-0">
                ✓ ผ่านแล้ว
              </span>
            )}
          </div>
        </div>

        {/* Right: Language selector & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => handleLanguageChange('cpp')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                language === 'cpp'
                  ? 'bg-slate-800 text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C++ (C++17)
            </button>
            <button
              onClick={() => handleLanguageChange('c')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                language === 'c'
                  ? 'bg-slate-800 text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C (C11)
            </button>
          </div>

          {/* AI Coach Hint button */}
          <button
            onClick={handleRequestHint}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
            title="ขอคำใบ้จาก AI Coach โดยไม่เฉลยคำตอบทั้งหมด"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>คำใบ้โค้ช</span>
          </button>

          {/* Run Code (Custom input) */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isGrading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-slate-300" />
            <span className="hidden sm:inline">ทดสอบโค้ด</span>
          </button>

          {/* Grade / Submit button */}
          <button
            onClick={handleGrade}
            disabled={isRunning || isGrading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all cursor-pointer disabled:opacity-50 font-sans"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ส่งตรวจ (Grade)</span>
          </button>
        </div>

      </div>

      {/* Main Split Layout: Left Problem Statement / Right Code Editor & Console */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Pane: Problem Description */}
        <div className="lg:w-1/2 w-full h-full overflow-y-auto border-r border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-6">
          
          {/* Header & Badges */}
          <div className="space-y-3 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {problem.difficulty}
              </span>
              <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                {problem.category}
              </span>

              {problem.verificationStatus === 'verified' ? (
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ผ่านการรับรองโดย Admin
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  โจทย์ชุมชน (รอ Admin ตรวจสอบ &bull; ทำได้ตามปกติ)
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {problem.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time Limit: <strong>{problem.timeLimitMs} ms</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Memory Limit: <strong>{problem.memoryLimitMB} MB</strong></span>
              </div>
              <div className="text-slate-500 font-sans">
                สร้างโดย: {problem.author.name}
              </div>
            </div>
          </div>

          {/* Problem Statement Body */}
          <div className="space-y-5 text-sm text-slate-200 leading-relaxed font-sans">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                คำอธิบายโจทย์ (Problem Description)
              </h3>
              <p className="whitespace-pre-line text-slate-200 bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
                {problem.statement.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                รูปแบบข้อมูลนำเข้า (Input Format)
              </h3>
              <div className="whitespace-pre-line bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300">
                {problem.statement.inputFormat}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                รูปแบบข้อมูลส่งออก (Output Format)
              </h3>
              <div className="whitespace-pre-line bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300">
                {problem.statement.outputFormat}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                ข้อจำกัด (Constraints)
              </h3>
              <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/80 text-xs font-mono text-emerald-400">
                {problem.statement.constraints}
              </div>
            </div>

            {/* Samples */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                ตัวอย่างข้อมูล (Sample Cases)
              </h3>
              {problem.samples.map((sample, idx) => (
                <div key={idx} className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-xs">
                  <div className="bg-slate-800/70 px-3 py-1.5 flex items-center justify-between border-b border-slate-800">
                    <span className="font-semibold text-slate-300">ตัวอย่างที่ {idx + 1}</span>
                    <button
                      onClick={() => handleCopyInput(sample.input, idx)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedSample === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>คัดลอก Input</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 font-mono">
                    <div className="p-3">
                      <div className="text-[10px] text-slate-500 uppercase font-sans mb-1 font-semibold">
                        Input
                      </div>
                      <pre className="text-slate-200 whitespace-pre">{sample.input}</pre>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] text-slate-500 uppercase font-sans mb-1 font-semibold">
                        Output
                      </div>
                      <pre className="text-emerald-400 whitespace-pre">{sample.output}</pre>
                    </div>
                  </div>

                  {sample.explanation && (
                    <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800 text-[11px] text-slate-400">
                      <strong>คำอธิบาย:</strong> {sample.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Q&A Navigation link */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">ติดปัญหาหรือมีข้อสงสัย?</span>
              <button
                onClick={() => onOpenDiscussion(problem.id)}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>เปิดกระดานถาม-ตอบของโจทย์ข้อนี้</span>
              </button>
            </div>

          </div>

        </div>

        {/* Right Pane: Code Editor & Console Drawer */}
        <div className="lg:w-1/2 w-full h-full flex flex-col bg-slate-950">
          
          {/* Editor Header Bar */}
          <div className="h-10 bg-slate-900/80 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2 font-mono">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>solution.{language === 'cpp' ? 'cpp' : 'c'}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Font size picker */}
              <div className="flex items-center gap-1 text-[11px]">
                <span>ขนาด:</span>
                <button
                  onClick={() => setFontSize(s => Math.max(12, s - 1))}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  -
                </button>
                <span className="font-mono text-slate-200">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(s => Math.min(18, s + 1))}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="รีเซ็ตโค้ดกลับเป็นโค้ดเริ่มต้น"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ต</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor with line numbers */}
          <div className="flex-1 relative flex overflow-hidden font-mono bg-slate-950">
            {/* Line Numbers */}
            <div className="w-12 py-3 bg-slate-900/40 select-none text-right pr-3 text-slate-600 font-mono text-xs border-r border-slate-800/80 overflow-hidden shrink-0">
              {lineNumbers.map(n => (
                <div key={n} style={{ lineHeight: '1.6rem' }}>
                  {n}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.6rem' }}
              className="flex-1 h-full w-full p-3 bg-transparent text-slate-100 font-mono resize-none focus:outline-none selection:bg-emerald-500/30 selection:text-emerald-200"
            />
          </div>

          {/* Bottom Console Drawer: Tabs (Run / Grade / Hint) */}
          <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col shrink-0">
            
            {/* Drawer Tabs */}
            <div className="h-9 px-3 border-b border-slate-800/80 flex items-center justify-between text-xs bg-slate-900">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('run')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'run'
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom Test Input
                </button>

                <button
                  onClick={() => setActiveTab('grade')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'grade'
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>ผลการตรวจ (Grading Verdict)</span>
                  {gradeResult && (
                    <span className={`text-[10px] font-mono px-1 rounded ${gradeResult.status === 'AC' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {gradeResult.score}/100
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('ai-hint')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'ai-hint'
                      ? 'bg-slate-800 text-amber-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>คำใบ้โค้ช AI</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                {isRunning ? 'กำลังประมวลผล...' : isGrading ? 'กำลังตรวจทุกชุดทดสอบ...' : ''}
              </div>
            </div>

            {/* Drawer Tab Content */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950">
              
              {/* Tab 1: Custom Run Input & Output */}
              {activeTab === 'run' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                  <div className="flex flex-col h-full">
                    <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-sans">
                      <span>Standard Input (ข้อมูลนำเข้าสำหรับทดสอบ):</span>
                      <button
                        onClick={() => setCustomInput(problem.samples[0]?.input || '')}
                        className="text-emerald-400 hover:underline"
                      >
                        ใส่ตัวอย่างที่ 1
                      </button>
                    </div>
                    <textarea
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder="ป้อนข้อมูลที่ต้องการทดสอบกับ cin/scanf..."
                      className="flex-1 w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-100 font-mono resize-none focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-sans">
                      <span>Program Output (ผลลัพธ์จาก stdout):</span>
                      {customRunResult && (
                        <span className="font-mono text-slate-400">
                          {customRunResult.executionTimeMs}ms &bull; {customRunResult.memoryUsedKB}KB
                        </span>
                      )}
                    </div>
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded p-2.5 overflow-auto">
                      {isRunning ? (
                        <div className="text-slate-500 italic">กำลังรันโปรแกรม C/C++...</div>
                      ) : customRunResult ? (
                        customRunResult.error ? (
                          <div className="text-rose-400 whitespace-pre-wrap">
                            {customRunResult.error}
                          </div>
                        ) : (
                          <pre className="text-emerald-300 whitespace-pre-wrap">
                            {customRunResult.output || '(ไม่มีผลลัพธ์แสดงผล)'}
                          </pre>
                        )
                      ) : (
                        <div className="text-slate-600 italic">
                          กดปุ่ม "ทดสอบโค้ด" เพื่อรันโปรแกรมกับ Input ทางด้านซ้าย
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Grader Multi-TestCase Evaluation */}
              {activeTab === 'grade' && (
                <div className="space-y-3">
                  {isGrading ? (
                    <div className="py-8 text-center space-y-2">
                      <div className="inline-block animate-spin w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
                      <p className="text-sm font-sans text-slate-300">ระบบ Grader กำลังรันตรวจโค้ด C/C++ กับชุดทดสอบทั้งหมด...</p>
                    </div>
                  ) : gradeResult ? (
                    <div className="space-y-3">
                      
                      {/* Overall Verdict Card */}
                      <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        gradeResult.status === 'AC'
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                          : gradeResult.status === 'CE'
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                          : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-xl font-bold font-mono px-3 py-1 rounded ${
                            gradeResult.status === 'AC' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                          }`}>
                            {gradeResult.status}
                          </span>
                          <div>
                            <div className="text-sm font-semibold font-sans">
                              {gradeResult.status === 'AC'
                                ? '🎉 ผ่านทุกชุดทดสอบ (Accepted) 100/100 คะแนน'
                                : gradeResult.status === 'CE'
                                ? '⚠️ ข้อผิดพลาดในการคอมไพล์ (Compilation Error)'
                                : gradeResult.status === 'TLE'
                                ? '⏱️ เวลาเกินกำหนด (Time Limit Exceeded)'
                                : `คำตอบยังไม่ถูกต้อง (Score: ${gradeResult.score}/100)`}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              เวลารวมสูงสุด: {gradeResult.executionTimeMs}ms &bull; หน่วยความจำ: {gradeResult.memoryUsedKB}KB
                            </div>
                          </div>
                        </div>

                        {/* Test matrix indicators */}
                        {gradeResult.testResults.length > 0 && (
                          <div className="flex items-center gap-1.5 font-mono">
                            {gradeResult.testResults.map((tr, i) => (
                              <span
                                key={i}
                                className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                                  tr.verdict === 'P'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : tr.verdict === 'T'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                }`}
                                title={`Testcase #${tr.testCaseId}: ${tr.verdict === 'P' ? 'Pass' : tr.verdict} (${tr.timeMs}ms)`}
                              >
                                {tr.verdict}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Compiler Diagnostic Output if CE */}
                      {gradeResult.compileError && (
                        <div className="bg-slate-900 border border-amber-500/30 rounded p-3 text-xs text-amber-300 font-mono whitespace-pre-wrap">
                          <div className="text-[11px] font-semibold text-amber-400 uppercase mb-1 font-sans">
                            GCC / Clang Compiler Diagnostic Log:
                          </div>
                          {gradeResult.compileError}
                        </div>
                      )}

                      {/* Test case breakdown table */}
                      {gradeResult.testResults.length > 0 && (
                        <div className="border border-slate-800 rounded overflow-hidden">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                              <tr>
                                <th className="p-2">ชุดทดสอบ</th>
                                <th className="p-2">ผลลัพธ์</th>
                                <th className="p-2">เวลา (Time)</th>
                                <th className="p-2">หน่วยความจำ</th>
                                <th className="p-2 hidden sm:table-cell">ผลลัพธ์ที่ได้</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {gradeResult.testResults.map(tr => (
                                <tr key={tr.testCaseId} className="hover:bg-slate-900/50">
                                  <td className="p-2 font-semibold">Test Case #{tr.testCaseId}</td>
                                  <td className="p-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                      tr.verdict === 'P' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                    }`}>
                                      {tr.verdict === 'P' ? 'PASS (P)' : tr.verdict === 'T' ? 'TLE (T)' : 'FAIL (-)'}
                                    </span>
                                  </td>
                                  <td className="p-2 text-slate-400">{tr.timeMs} ms</td>
                                  <td className="p-2 text-slate-400">{tr.memoryKB} KB</td>
                                  <td className="p-2 text-slate-400 hidden sm:table-cell truncate max-w-xs">
                                    {tr.actualSnippet || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 font-sans">
                      กดปุ่ม "ส่งตรวจ (Grade)" ด้านบนขวาเพื่อส่งโค้ด C/C++ เข้าสู่ระบบ Grader
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: AI Code Coach Hint */}
              {activeTab === 'ai-hint' && (
                <div className="space-y-3 font-sans">
                  {isGeneratingHint ? (
                    <div className="py-6 text-center text-slate-400 text-sm">
                      <Sparkles className="w-5 h-5 animate-spin mx-auto text-amber-400 mb-2" />
                      กำลังวิเคราะห์โจทย์และสร้างแนวคิดคำใบ้...
                    </div>
                  ) : aiHint ? (
                    <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs font-mono uppercase">
                        <Lightbulb className="w-4 h-4" />
                        AI Coach Algorithmic Hint
                      </div>
                      <div className="text-slate-200 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                        {aiHint}
                      </div>
                      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                        *หมายเหตุ: โค้ช AI ให้เฉพาะคำใบ้ทางตรรกะและแนวทางหลีกเลี่ยงข้อผิดพลาด (Edge Cases) เพื่อให้นักเรียนได้ฝึกคิดและเขียนโค้ดด้วยตนเอง
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <button
                        onClick={handleRequestHint}
                        className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-pointer"
                      >
                        คลิกเพื่อขอคำใบ้จาก AI Coach
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
