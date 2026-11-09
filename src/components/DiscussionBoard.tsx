import React, { useState } from 'react';
import { Discussion, DiscussionReply, Problem, UserProfile } from '../types';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  ThumbsUp, 
  CheckCircle, 
  Code, 
  Send, 
  Sparkles, 
  HelpCircle,
  X
} from 'lucide-react';

interface DiscussionBoardProps {
  discussions: Discussion[];
  problems: Problem[];
  currentUser: UserProfile;
  onAddDiscussion: (newDisc: Discussion) => void;
  onAddReply: (discussionId: string, reply: DiscussionReply) => void;
  onToggleUpvote: (discussionId: string) => void;
  onMarkAcceptedAnswer: (discussionId: string, replyId: string) => void;
  initialProblemFilterId?: string;
}

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({
  discussions,
  problems,
  currentUser,
  onAddDiscussion,
  onAddReply,
  onToggleUpvote,
  onMarkAcceptedAnswer,
  initialProblemFilterId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<string | null>(
    discussions[0]?.id || null
  );

  // New Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'problem-help' | 'general' | 'posn-olympic' | 'c-tricks' | 'feedback'>('problem-help');
  const [newProblemId, setNewProblemId] = useState(initialProblemFilterId || '');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');

  // Reply Input State
  const [replyText, setReplyText] = useState<{ [discId: string]: string }>({});
  const [replyCode, setReplyCode] = useState<{ [discId: string]: string }>({});
  const [showReplyCodeBox, setShowReplyCodeBox] = useState<{ [discId: string]: boolean }>({});

  const filteredDiscussions = discussions.filter(disc => {
    const matchCat =
      selectedCategory === 'all' || disc.category === selectedCategory;
    const matchSearch =
      disc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (disc.problemTitle && disc.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const matchedProblem = problems.find(p => p.id === newProblemId);

    const newDisc: Discussion = {
      id: `disc-${Date.now()}`,
      problemId: newProblemId || undefined,
      problemTitle: matchedProblem?.title || undefined,
      title: newTitle.trim(),
      content: newContent.trim(),
      codeSnippet: newCodeSnippet.trim() || undefined,
      language: 'cpp',
      category: newCategory,
      author: {
        name: currentUser.name,
        handle: currentUser.handle,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
        school: currentUser.school,
      },
      upvotes: 0,
      userUpvoted: false,
      createdAt: 'เพิ่งโพสต์',
      isSolved: false,
      replies: [],
    };

    onAddDiscussion(newDisc);
    setIsModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewCodeSnippet('');
    setExpandedDiscussionId(newDisc.id);
  };

  const handleSendReply = (discId: string) => {
    const text = replyText[discId]?.trim();
    if (!text) return;

    const newReply: DiscussionReply = {
      id: `rep-${Date.now()}`,
      author: {
        name: currentUser.name,
        handle: currentUser.handle,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
      },
      content: text,
      codeSnippet: replyCode[discId]?.trim() || undefined,
      isAccepted: false,
      upvotes: 0,
      createdAt: 'เพิ่งตอบ',
    };

    onAddReply(discId, newReply);
    setReplyText(prev => ({ ...prev, [discId]: '' }));
    setReplyCode(prev => ({ ...prev, [discId]: '' }));
    setShowReplyCodeBox(prev => ({ ...prev, [discId]: false }));
  };

  const categoryLabels: Record<string, string> = {
    'all': 'ทุกหัวข้อ',
    'problem-help': 'ถามการแก้โจทย์',
    'posn-olympic': 'สอวน. & TOI',
    'c-tricks': 'เทคนิค C / C++',
    'general': 'พูดคุยทั่วไป',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>COMMUNITY Q&amp;A FORUM &bull; กระดานถามตอบสำหรับนักเรียน</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ชุมชนแลกเปลี่ยนและช่วยเหลือการเขียนโค้ด
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            ติดบั๊ก ข้อสงสัยอัลกอริทึม หรือเทคนิค C/C++ โพสต์ถามและแบ่งปันคำตอบกับเพื่อนๆ ได้ที่นี่
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ตั้งคำถามใหม่</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedCategory === key
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาคำถาม, โค้ด หรือโจทย์..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Discussions Threads List */}
      <div className="space-y-4">
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">ยังไม่มีคำถามในหมวดนี้</p>
            <p className="text-xs text-slate-500 mt-1">กดปุ่ม "ตั้งคำถามใหม่" เพื่อเริ่มต้นการสนทนา</p>
          </div>
        ) : (
          filteredDiscussions.map(disc => {
            const isExpanded = expandedDiscussionId === disc.id;

            return (
              <div
                key={disc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all shadow-sm"
              >
                {/* Question Header Card */}
                <div
                  onClick={() => setExpandedDiscussionId(isExpanded ? null : disc.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Upvote button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggleUpvote(disc.id);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer min-w-[42px] ${
                        disc.userUpvoted
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="โหวตว่ามีประโยชน์"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold mt-1">
                        {disc.upvotes}
                      </span>
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {disc.problemTitle && (
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            โจทย์: {disc.problemTitle}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {categoryLabels[disc.category] || disc.category}
                        </span>
                        {disc.isSolved && (
                          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            มีคำตอบที่ยอมรับแล้ว
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors">
                        {disc.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {disc.content}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                        <span>ถามโดย <strong>{disc.author.name}</strong></span>
                        <span aria-hidden="true">&bull;</span>
                        <span>{disc.createdAt}</span>
                        <span aria-hidden="true">&bull;</span>
                        <span className="text-emerald-400 font-mono font-medium">
                          {disc.replies.length} คำตอบ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Thread Body: Question Details + Replies + Reply Input */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-6">
                    
                    {/* Full Question Text */}
                    <div className="space-y-3">
                      <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                        {disc.content}
                      </p>

                      {/* Code Snippet in question */}
                      {disc.codeSnippet && (
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 overflow-x-auto font-mono text-xs text-slate-300">
                          <div className="text-[11px] text-slate-500 uppercase font-sans mb-1 font-semibold flex items-center gap-1">
                            <Code className="w-3 h-3 text-emerald-400" />
                            โค้ด C / C++ ของผู้ถาม:
                          </div>
                          <pre>{disc.codeSnippet}</pre>
                        </div>
                      )}
                    </div>

                    {/* Replies Section */}
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase font-mono">
                        <span>คำตอบทั้งหมด ({disc.replies.length})</span>
                      </div>

                      {disc.replies.length === 0 ? (
                        <div className="text-xs text-slate-500 italic py-3">
                          ยังไม่มีคำตอบ เป็นคนแรกที่ตอบคำถามนี้เพื่อรับ +40 XP!
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {disc.replies.map(reply => (
                            <div
                              key={reply.id}
                              className={`rounded-xl p-4 border transition-all text-xs space-y-2.5 ${
                                reply.isAccepted
                                  ? 'bg-emerald-950/30 border-emerald-500/50'
                                  : 'bg-slate-900 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply.author.avatarUrl}
                                    alt={reply.author.name}
                                    className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                  />
                                  <span className="font-semibold text-white">
                                    {reply.author.name}
                                  </span>
                                  {reply.author.role === 'admin' && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                      Admin Coach
                                    </span>
                                  )}
                                  <span className="text-slate-500">&bull; {reply.createdAt}</span>
                                </div>

                                {reply.isAccepted ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    คำตอบที่ยอมรับ
                                  </span>
                                ) : (
                                  (currentUser.handle === disc.author.handle || currentUser.role === 'admin') && (
                                    <button
                                      onClick={() => onMarkAcceptedAnswer(disc.id, reply.id)}
                                      className="text-slate-400 hover:text-emerald-400 text-[11px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>เลือกเป็นคำตอบที่ถูก</span>
                                    </button>
                                  )
                                )}
                              </div>

                              <p className="text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                                {reply.content}
                              </p>

                              {reply.codeSnippet && (
                                <div className="bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                                  <pre>{reply.codeSnippet}</pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reply input box */}
                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      <div className="text-xs font-semibold text-slate-300">
                        ร่วมตอบคำถามนี้ (เขียนโค้ดและคำอธิบาย)
                      </div>
                      <textarea
                        rows={3}
                        value={replyText[disc.id] || ''}
                        onChange={e =>
                          setReplyText(prev => ({ ...prev, [disc.id]: e.target.value }))
                        }
                        placeholder="พิมพ์คำตอบ คำแนะนำ หรือแนวคิดที่ช่วยเพื่อนแก้บั๊ก..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                      />

                      {showReplyCodeBox[disc.id] && (
                        <textarea
                          rows={4}
                          value={replyCode[disc.id] || ''}
                          onChange={e =>
                            setReplyCode(prev => ({ ...prev, [disc.id]: e.target.value }))
                          }
                          placeholder="#include <iostream> ... โค้ดตัวอย่าง C/C++"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setShowReplyCodeBox(prev => ({
                              ...prev,
                              [disc.id]: !prev[disc.id],
                            }))
                          }
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {showReplyCodeBox[disc.id] ? 'ซ่อนกล่องโค้ด' : '+ แนบโค้ด C/C++'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleSendReply(disc.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ส่งคำตอบ</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ask Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>ตั้งคำถามหรือเปิดประเด็นใหม่</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">หัวข้อคำถาม *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="เช่น ทำไมโค้ดข้อ Kadane ใน C++ ถึงติด TLE ในชุดทดสอบที่ 3?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">หมวดหมู่</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="problem-help">ถามการแก้โจทย์</option>
                    <option value="posn-olympic">สอวน. & TOI</option>
                    <option value="c-tricks">เทคนิค C / C++</option>
                    <option value="general">พูดคุยทั่วไป</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">เชื่อมโยงกับโจทย์ (Optional)</label>
                  <select
                    value={newProblemId}
                    onChange={e => setNewProblemId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- ไม่ระบุ / พูดคุยทั่วไป --</option>
                    {problems.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">รายละเอียดคำถาม *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="อธิบายสิ่งที่สงสัย สิ่งที่ลองทำแล้ว หรือผลลัพธ์ที่ได้รับ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">โค้ด C / C++ ที่เกี่ยวข้อง (Optional)</label>
                <textarea
                  rows={4}
                  value={newCodeSnippet}
                  onChange={e => setNewCodeSnippet(e.target.value)}
                  placeholder="#include <iostream> ... โค้ดที่มีปัญหา"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  โพสต์คำถาม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
