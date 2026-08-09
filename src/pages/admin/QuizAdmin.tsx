import { 
  Database, Target, Activity, AlertTriangle, Search, 
  Plus, Edit2, Trash2, X, FileSpreadsheet, RotateCcw
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Cell 
} from "recharts";
import Card from "../../components/ui/Card";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

// --- MASTER DATA BANK SOAL (Multiple Choice Structure) ---
interface QuestionItem {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctAnswer: string;
  category: "Reading" | "Listening" | "Grammar" | "Vocabulary";
  examType: "IELTS" | "TOEFL";
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Active" | "Archived";
}

const INITIAL_QUESTIONS: QuestionItem[] = [
  { 
    id: "Q-101", 
    text: "The committee _____ reached a decision regarding the new policy.", 
    options: ["has", "have", "having", "to have"],
    correctAnswer: "has",
    category: "Grammar", 
    examType: "TOEFL", 
    difficulty: "Medium", 
    status: "Active" 
  },
  { 
    id: "Q-102", 
    text: "What is the writer's main argument in the second paragraph?", 
    options: ["To persuade the readers", "To provide statistical data", "To criticize the government", "To entertain the audience"],
    correctAnswer: "To criticize the government",
    category: "Reading", 
    examType: "IELTS", 
    difficulty: "Hard", 
    status: "Active" 
  },
  { 
    id: "Q-103", 
    text: "(Audio) Where does this conversation most likely take place?", 
    options: ["In a library", "At a restaurant", "In a classroom", "At a hospital"],
    correctAnswer: "In a classroom",
    category: "Listening", 
    examType: "TOEFL", 
    difficulty: "Easy", 
    status: "Active" 
  },
];

// --- FORMATTER ANGKA COMPACT (Misal: 12500 -> 12.5k) ---
const formatCompact = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
};

export default function DailyQuizAdmin() {
  const [activeTab, setActiveTab] = useState<"Active" | "Archived">("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExam, setFilterExam] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS);

  // Modal States
  const [isAddingQ, setIsAddingQ] = useState(false);
  const [editingQ, setEditingQ] = useState<QuestionItem | null>(null);
  
  // Base state for new question
  const [newQ, setNewQ] = useState<Partial<QuestionItem>>({ 
    category: "Grammar", 
    examType: "IELTS", 
    difficulty: "Medium", 
    options: ["", "", "", ""],
    correctAnswer: "",
    status: "Active" 
  });
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);

  // --- KPI CALCULATIONS ---
  const totalActiveQuestions = questions.filter(q => q.status === "Active").length;
  const totalAttempts = 2450; 
  
  // Mentee Participation Logic
  const totalActiveMentees = 2500;
  const menteesParticipatingToday = 1850;
  const dailyParticipationRate = Math.round((menteesParticipatingToday / totalActiveMentees) * 100);
  
  // DATA CHART DIPERBARUI DENGAN KONTEKS VOLUME
  const performanceData = [
    { skill: "Reading", avgScore: 78, totalAttempts: 1240, uniqueMentees: 850 },
    { skill: "Listening", avgScore: 82, totalAttempts: 1100, uniqueMentees: 820 },
    { skill: "Vocabulary", avgScore: 65, totalAttempts: 980, uniqueMentees: 710 },
    { skill: "Grammar", avgScore: 48, totalAttempts: 1450, uniqueMentees: 920 }, // Weakest, High Volume!
  ];

  const weakestSkill = useMemo(() => {
    return [...performanceData].sort((a, b) => a.avgScore - b.avgScore)[0];
  }, []);

  // --- CUSTOM TOOLTIP UNTUK CHART ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg z-50 min-w-[150px]">
          <p className="text-xs font-bold text-slate-900 mb-2 border-b pb-1">{label} Performance</p>
          <div className="text-[11px] space-y-1.5">
            <p className="text-slate-700 flex justify-between gap-4">
              <span>Avg. Score:</span> <span className="font-bold text-blue-600">{data.avgScore}%</span>
            </p>
            <p className="text-slate-500 flex justify-between gap-4">
              <span>Total Attempts:</span> <span className="font-semibold text-slate-700">{data.totalAttempts.toLocaleString()}x</span>
            </p>
            <p className="text-slate-500 flex justify-between gap-4">
              <span>Mentees Tested:</span> <span className="font-semibold text-slate-700">{data.uniqueMentees.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // --- FILTER LOGIC ---
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchExam = filterExam === "All" || q.examType === filterExam;
      const matchDiff = filterDifficulty === "All" || q.difficulty === filterDifficulty;
      const matchTab = activeTab === "Archived" ? q.status === "Archived" : q.status === "Active";
      return matchSearch && matchExam && matchDiff && matchTab;
    });
  }, [questions, searchQuery, filterExam, filterDifficulty, activeTab]);

  // --- ACTIONS ---
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToAdd: QuestionItem = {
      id: `Q-${Math.floor(Math.random() * 9000) + 1000}`,
      text: newQ.text || "",
      options: (newQ.options as [string, string, string, string]) || ["", "", "", ""],
      correctAnswer: newQ.correctAnswer || "",
      category: newQ.category as any,
      examType: newQ.examType as any,
      difficulty: newQ.difficulty as any,
      status: "Active"
    };
    setQuestions([itemToAdd, ...questions]);
    setIsAddingQ(false);
    setNewQ({ category: "Grammar", examType: "IELTS", difficulty: "Medium", options: ["", "", "", ""], correctAnswer: "", status: "Active" });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQ) return;
    setQuestions(prev => prev.map(q => q.id === editingQ.id ? editingQ : q));
    setEditingQ(null);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      setQuestions(prev => prev.map(q => q.id === deleteConfirmId ? { ...q, status: "Archived" } : q));
      setDeleteConfirmId(null);
    }
  };

  const executeRestore = () => {
    if (restoreConfirmId) {
      setQuestions(prev => prev.map(q => q.id === restoreConfirmId ? { ...q, status: "Active" } : q));
      setRestoreConfirmId(null);
    }
  };

  const executeClearAll = () => {
    setQuestions(prev => prev.map(q => ({ ...q, status: "Archived" })));
    setShowClearAll(false);
  };

  const updateOption = (index: number, value: string, isEditing: boolean) => {
    if (isEditing && editingQ) {
      const newOptions = [...editingQ.options] as [string, string, string, string];
      newOptions[index] = value;
      setEditingQ({ ...editingQ, options: newOptions });
    } else {
      const newOptions = [...(newQ.options || ["", "", "", ""])] as [string, string, string, string];
      newOptions[index] = value;
      setNewQ({ ...newQ, options: newOptions });
    }
  };

  return (
    <UserLayout 
      title="Practice Exam & Quiz Management" 
      subtitle="MANAGE DAILY IELTS & TOEFL QUESTIONS AND MENTEE PERFORMANCE"
      sidebarItems={adminSidebarItems} 
      topbarProps={{ showSearch: false }}
    >
      <section className="bg-slate-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* ACTION BUTTONS */}
          <div className="mb-6 flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3">
            <button onClick={() => setShowClearAll(true)} className="flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition">
              <AlertTriangle size={16} /><span>Clear All</span>
            </button>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition">
              <FileSpreadsheet size={16} /><span>Import Excel</span>
            </button>
            <button onClick={() => setIsAddingQ(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition">
              <Plus size={16} /><span>Add Question</span>
            </button>
          </div>

          {/* 4 IMPACTFUL DECISION-MAKING CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Bank Size</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{totalActiveQuestions}</div>
                  <span className="text-sm text-blue-600 font-semibold mt-1 block">Active ready questions</span>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Database size={20} /></div>
              </div>
            </Card>

            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div className="w-[80%]">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weakest Skill Area</span>
                  <div className="text-xl font-bold text-rose-600 mt-1 leading-tight line-clamp-1">{weakestSkill.skill}</div>
                  <span className="text-sm text-rose-500 font-semibold mt-1 block">Only {weakestSkill.avgScore}% Avg. Score</span>
                </div>
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0"><AlertTriangle size={20} /></div>
              </div>
            </Card>

            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Participation</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{dailyParticipationRate}%</div>
                  <span className="text-xs text-emerald-600 font-medium mt-1 block">
                    <strong className="font-bold">{menteesParticipatingToday.toLocaleString()}</strong> out of {totalActiveMentees.toLocaleString()} active mentees
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><Activity size={20} /></div>
              </div>
            </Card>

            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quiz Attempts</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{formatCompact(totalAttempts)}</div>
                  <span className="text-sm text-indigo-600 font-medium mt-1 block">Accumulated sessions</span>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Target size={20} /></div>
              </div>
            </Card>
          </div>

          {/* CHART: PERFORMANCE BY SKILL WITH CUSTOM TOOLTIP */}
          <Card padding="md" className="border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Mentee Performance by Skill Category</h3>
              </div>
              <span className="text-sm text-slate-400">Hover for detailed insights</span>
            </div>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="skill" fontSize={12} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} fontSize={12} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  
                  {/* Tooltip Pintar terpasang di sini */}
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                  
                  <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} barSize={48}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avgScore < 60 ? '#f43f5e' : '#3b82f6'} />
                    ))}
                    <LabelList dataKey="avgScore" position="top" fontSize={12} fill="#64748b" fontWeight="bold" formatter={(val:number) => `${val}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex gap-2">
                <button onClick={() => setActiveTab("Active")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'Active' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  Active ({questions.filter(q => q.status === 'Active').length})
                </button>
                <button onClick={() => setActiveTab("Archived")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'Archived' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  Archived
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search question..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                
                <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none cursor-pointer">
                  <option value="All">All Exams</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                </select>

                <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none cursor-pointer hidden sm:block">
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 w-20">ID</th>
                    <th className="p-4 w-2/5">Question Snippet</th>
                    <th className="p-4">Correct Answer</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Level</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-semibold text-slate-400">{q.id}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900 line-clamp-2 leading-relaxed">{q.text}</div>
                        <span className="text-xs text-slate-400 block mt-1">4 Options Available</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded line-clamp-1">{q.correctAnswer || "Not Set"}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border block w-max mb-1 ${q.examType === 'IELTS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {q.examType}
                        </span>
                        <span className="text-xs font-medium text-slate-500 block">{q.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wide
                          ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {q.status === 'Active' ? (
                            <>
                              <button onClick={() => setEditingQ(q)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit2 size={16}/></button>
                              <button onClick={() => setDeleteConfirmId(q.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Archive"><Trash2 size={16}/></button>
                            </>
                          ) : (
                            <button onClick={() => setRestoreConfirmId(q.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-semibold transition"><RotateCcw size={14}/><span>Restore</span></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-400">No questions found matching criteria.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CREATE MODAL */}
      {isAddingQ && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
            <button onClick={() => setIsAddingQ(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Add Question to Bank</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Question Text</label>
                <textarea rows={3} value={newQ.text || ""} onChange={(e) => setNewQ({...newQ, text: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500" required placeholder="Type your question here..." />
              </div>

              {/* Options Setup */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Multiple Choice Options</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {(newQ.options || ["", "", "", ""]).map((opt, idx) => (
                    <input key={idx} type="text" value={opt} onChange={(e) => updateOption(idx, e.target.value, false)} placeholder={`Option ${String.fromCharCode(65 + idx)}`} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500" required />
                  ))}
                </div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Correct Answer</label>
                <select value={newQ.correctAnswer || ""} onChange={(e) => setNewQ({...newQ, correctAnswer: e.target.value})} className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-emerald-50 text-emerald-800 font-semibold focus:outline-none focus:border-emerald-500" required>
                  <option value="" disabled>Select correct option...</option>
                  {(newQ.options || ["", "", "", ""]).filter(o => o !== "").map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Exam Type</label>
                  <select value={newQ.examType} onChange={(e) => setNewQ({...newQ, examType: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="IELTS">IELTS</option><option value="TOEFL">TOEFL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Skill Category</label>
                  <select value={newQ.category} onChange={(e) => setNewQ({...newQ, category: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="Reading">Reading</option><option value="Listening">Listening</option><option value="Grammar">Grammar</option><option value="Vocabulary">Vocabulary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Difficulty</label>
                  <select value={newQ.difficulty} onChange={(e) => setNewQ({...newQ, difficulty: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsAddingQ(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingQ && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
            <button onClick={() => setEditingQ(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Edit Question <span className="text-sm font-mono text-slate-400 ml-2">({editingQ.id})</span></h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Question Text</label>
                <textarea rows={3} value={editingQ.text} onChange={(e) => setEditingQ({...editingQ, text: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500" required />
              </div>

              {/* Options Setup */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Multiple Choice Options</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {editingQ.options.map((opt, idx) => (
                    <input key={idx} type="text" value={opt} onChange={(e) => updateOption(idx, e.target.value, true)} placeholder={`Option ${String.fromCharCode(65 + idx)}`} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500" required />
                  ))}
                </div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Correct Answer</label>
                <select value={editingQ.correctAnswer} onChange={(e) => setEditingQ({...editingQ, correctAnswer: e.target.value})} className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-emerald-50 text-emerald-800 font-semibold focus:outline-none focus:border-emerald-500" required>
                  <option value="" disabled>Select correct option...</option>
                  {editingQ.options.filter(o => o !== "").map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Exam Type</label>
                  <select value={editingQ.examType} onChange={(e) => setEditingQ({...editingQ, examType: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="IELTS">IELTS</option><option value="TOEFL">TOEFL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Skill Category</label>
                  <select value={editingQ.category} onChange={(e) => setEditingQ({...editingQ, category: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="Reading">Reading</option><option value="Listening">Listening</option><option value="Grammar">Grammar</option><option value="Vocabulary">Vocabulary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Difficulty</label>
                  <select value={editingQ.difficulty} onChange={(e) => setEditingQ({...editingQ, difficulty: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setEditingQ(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition">Update Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE/ARCHIVE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-rose-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Question?</h3>
              <p className="text-sm text-slate-500 mb-6">This question will be removed from the active bank and won't appear in future quizzes.</p>
              <div className="flex justify-center gap-3">
                 <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition">Cancel</button>
                 <button onClick={executeDelete} className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-sm shadow-sm transition">Yes, Archive</button>
              </div>
           </div>
        </div>
      )}

      {/* RESTORE CONFIRMATION */}
      {restoreConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4"><RotateCcw size={24} className="text-emerald-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Restore Question?</h3>
              <p className="text-sm text-slate-500 mb-6">This question will become active again and may appear in mentee daily quizzes.</p>
              <div className="flex justify-center gap-3">
                 <button onClick={() => setRestoreConfirmId(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition">Cancel</button>
                 <button onClick={executeRestore} className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm shadow-sm transition">Yes, Restore</button>
              </div>
           </div>
        </div>
      )}

      {/* CLEAR ALL CONFIRMATION */}
      {showClearAll && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative text-center border-t-8 border-rose-600">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={32} className="text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">Clear Active Bank?</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                You are about to <strong className="text-rose-600">archive ALL active questions</strong>. Daily quizzes will stop until new questions are added.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                 <button onClick={() => setShowClearAll(false)} className="w-full px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm transition">Cancel</button>
                 <button onClick={executeClearAll} className="w-full px-4 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl text-sm shadow-md transition">Yes, Clear All</button>
              </div>
           </div>
        </div>
      )}
    </UserLayout>
  );
}