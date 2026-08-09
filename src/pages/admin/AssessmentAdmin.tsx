import { 
  FileSpreadsheet, Plus, Trash2, Edit2, Search, 
  AlertTriangle, Layers, HelpCircle, Target, X
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Cell 
} from "recharts";
import Card from "../../components/ui/Card";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

// --- MOCK DATA (Biar UI langsung bisa ditest interaktif) ---
interface DiagnosticQuestion {
  id: string;
  questionText: string;
  category: "Academic" | "Language" | "Motivation" | "Leadership";
  questionType: "Multiple Choice" | "Essay" | "Scale";
  optionsCount: number;
  weightScore: number;
  updatedAt: string;
}

const INITIAL_QUESTIONS: DiagnosticQuestion[] = [
  { id: "Q-101", questionText: "Jelaskan alasan utama kamu ingin melanjutkan studi ke luar negeri?", category: "Motivation", questionType: "Essay", optionsCount: 0, weightScore: 15, updatedAt: "2026-08-01" },
  { id: "Q-102", questionText: "Berapa skor IELTS/TOEFL terakhir yang kamu miliki?", category: "Language", questionType: "Multiple Choice", optionsCount: 4, weightScore: 10, updatedAt: "2026-08-02" },
  { id: "Q-103", questionText: "Ceritakan pengalaman saat kamu memimpin sebuah tim dalam situasi krisis.", category: "Leadership", questionType: "Essay", optionsCount: 0, weightScore: 20, updatedAt: "2026-08-05" },
  { id: "Q-104", questionText: "Pilih linieritas jurusan S1 kamu dengan target jurusan S2/S3.", category: "Academic", questionType: "Scale", optionsCount: 5, weightScore: 10, updatedAt: "2026-08-07" },
  { id: "Q-105", questionText: "Berapa IPK terakhir kamu di jenjang pendidikan sebelumnya?", category: "Academic", questionType: "Multiple Choice", optionsCount: 4, weightScore: 10, updatedAt: "2026-08-08" },
];

export default function InitialAssessmentAdmin() {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>(INITIAL_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // STATE UNTUK INTERACTIVE CHART FILTER
  const [activeChartFilter, setActiveChartFilter] = useState<string | null>(null);

  // Modal States
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingQ, setEditingQ] = useState<DiagnosticQuestion | null>(null);
  const [newQ, setNewQ] = useState<Partial<DiagnosticQuestion>>({ category: "Academic", questionType: "Multiple Choice", weightScore: 10, optionsCount: 4 });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // --- PERHITUNGAN KPI (PM Metrics) ---
  const totalQuestions = questions.length;
  const uniqueCategories = new Set(questions.map(q => q.category)).size;
  const maxPossibleScore = questions.reduce((acc, curr) => acc + curr.weightScore, 0);

  // --- FILTER LOGIC ---
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" || q.category === filterCategory;
      const matchesChart = activeChartFilter ? q.category === activeChartFilter : true;
      return matchesSearch && matchesCategory && matchesChart;
    });
  }, [questions, searchQuery, filterCategory, activeChartFilter]);

  // --- DATA CHART DISTRIBUSI SOAL (Untuk melihat keseimbangan tes) ---
  const chartData = useMemo(() => {
    const dist: Record<string, number> = { "Academic": 0, "Language": 0, "Motivation": 0, "Leadership": 0 };
    questions.forEach(q => {
       if (dist[q.category] !== undefined) dist[q.category] += 1;
    });
    return Object.entries(dist).map(([category, count]) => ({ category, count }));
  }, [questions]);

  const toggleChartFilter = (data: any) => {
    if (!data) return;
    setFilterCategory("All"); // Reset dropdown saat klik chart
    setActiveChartFilter(activeChartFilter === data.category ? null : data.category);
  };

  // --- ACTIONS ---
  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToAdd: DiagnosticQuestion = {
      id: `Q-${Math.floor(Math.random() * 900) + 100}`,
      questionText: newQ.questionText || "",
      category: newQ.category as any,
      questionType: newQ.questionType as any,
      optionsCount: newQ.questionType === "Essay" ? 0 : (newQ.optionsCount || 0),
      weightScore: newQ.weightScore || 0,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setQuestions([itemToAdd, ...questions]);
    setIsAddingNew(false);
    setNewQ({ category: "Academic", questionType: "Multiple Choice", weightScore: 10, optionsCount: 4 });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQ) return;
    const updated = { ...editingQ, updatedAt: new Date().toISOString().split('T')[0] };
    setQuestions(prev => prev.map(q => q.id === editingQ.id ? updated : q));
    setEditingQ(null);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      setQuestions(prev => prev.filter(q => q.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const executeClearAll = () => {
    setQuestions([]);
    setShowClearAllConfirm(false);
  };

  return (
    <UserLayout 
      title="Initial Assessment Management" 
      subtitle="KELOLA BANK SOAL DIAGNOSTIK DAN BOBOT KESIAPAN MENTEE"
      sidebarItems={adminSidebarItems} 
      topbarProps={{ showSearch: false }}
    >
      <section className="bg-slate-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* --- HEADER & ACTION BUTTONS --- */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              {activeChartFilter && (
                 <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 mb-2 inline-flex">
                    <span>Filtering Category: {activeChartFilter}</span>
                    <button onClick={() => setActiveChartFilter(null)} className="hover:text-purple-800"><X size={14}/></button>
                 </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setShowClearAllConfirm(true)} className="flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-lg font-medium text-xs transition shadow-sm">
                <AlertTriangle size={15} /><span>Clear All</span>
              </button>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-sm transition">
                <FileSpreadsheet size={15} /><span>Import Excel</span>
              </button>
              <button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-sm transition">
                <Plus size={15} /><span>Create Question</span>
              </button>
            </div>
          </div>

          {/* --- 3 KPI CARDS (Disesuaikan untuk kebutuhan PM) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <Card padding="md" className="border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bank Soal</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{totalQuestions}</div>
                  <span className="text-xs text-blue-600 font-medium mt-1 block">Aktif di sistem</span>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><HelpCircle size={22} /></div>
              </div>
            </Card>

            <Card padding="md" className="border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coverage Categories</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{uniqueCategories} Pilar</div>
                  <span className="text-xs text-indigo-600 font-medium mt-1 block">Tingkat variasi tes</span>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Layers size={22} /></div>
              </div>
            </Card>

            <Card padding="md" className="border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Max Possible Score</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{maxPossibleScore} Pts</div>
                  <span className="text-xs text-emerald-600 font-medium mt-1 block">Total bobot keseluruhan</span>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={22} /></div>
              </div>
            </Card>
          </div>

          {/* --- INTERACTIVE CHART (Distribusi Kategori) --- */}
          <Card padding="md" className="border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Question Distribution (Click to filter)</h3>
              </div>
              <span className="text-xs text-slate-400">Pastikan tes seimbang di setiap pilar</span>
            </div>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="category" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar 
                     dataKey="count" 
                     radius={[4, 4, 0, 0]} 
                     barSize={45}
                     onClick={toggleChartFilter}
                     className="cursor-pointer transition hover:opacity-80"
                  >
                     {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={activeChartFilter === entry.category ? '#4f46e5' : '#3b82f6'} />
                     ))}
                    <LabelList dataKey="count" position="top" fontSize={11} fill="#64748b" fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* --- TABLE CONTROLS & DATA --- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
              <div className="relative w-full sm:max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" placeholder="Search question text or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-semibold text-slate-500">Filter:</span>
                <select
                  value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setActiveChartFilter(null); }}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Academic">Academic</option>
                  <option value="Language">Language</option>
                  <option value="Motivation">Motivation</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4 w-16">ID</th>
                    <th className="p-4 w-1/3">Question Text</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Type & Format</th>
                    <th className="p-4 text-center">Weight</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-xs font-mono font-semibold text-slate-400">{q.id}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900 line-clamp-2 leading-snug">{q.questionText}</div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Last updated: {q.updatedAt}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                          {q.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-700">{q.questionType}</div>
                        {q.questionType !== "Essay" && (
                           <span className="text-[10px] text-slate-500">{q.optionsCount} Options</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">+{q.weightScore} Pts</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditingQ(q)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setDeleteConfirmId(q.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6} className="p-8 text-center text-slate-400">No diagnostic questions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* --- MODAL: ADD NEW QUESTION --- */}
      {isAddingNew && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setIsAddingNew(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Diagnostic Question</h3>
            <form onSubmit={handleAddNewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Question Text</label>
                <textarea rows={3} value={newQ.questionText || ""} onChange={(e) => setNewQ({...newQ, questionText: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" required placeholder="Type the question here..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={newQ.category} onChange={(e) => setNewQ({...newQ, category: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Academic">Academic</option><option value="Language">Language</option><option value="Motivation">Motivation</option><option value="Leadership">Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Weight / Max Score</label>
                  <input type="number" min={1} value={newQ.weightScore || ""} onChange={(e) => setNewQ({...newQ, weightScore: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Format Type</label>
                  <select value={newQ.questionType} onChange={(e) => setNewQ({...newQ, questionType: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Multiple Choice">Multiple Choice</option><option value="Essay">Essay</option><option value="Scale">Scale (1-5)</option>
                  </select>
                </div>
                {newQ.questionType !== "Essay" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Num. of Options</label>
                    <input type="number" min={2} max={10} value={newQ.optionsCount || ""} onChange={(e) => setNewQ({...newQ, optionsCount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <button type="button" onClick={() => setIsAddingNew(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT QUESTION --- */}
      {editingQ && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setEditingQ(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Question <span className="text-sm font-mono text-slate-400 ml-2">({editingQ.id})</span></h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Question Text</label>
                <textarea rows={3} value={editingQ.questionText} onChange={(e) => setEditingQ({...editingQ, questionText: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={editingQ.category} onChange={(e) => setEditingQ({...editingQ, category: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Academic">Academic</option><option value="Language">Language</option><option value="Motivation">Motivation</option><option value="Leadership">Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Weight / Max Score</label>
                  <input type="number" min={1} value={editingQ.weightScore} onChange={(e) => setEditingQ({...editingQ, weightScore: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Format Type</label>
                  <select value={editingQ.questionType} onChange={(e) => setEditingQ({...editingQ, questionType: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Multiple Choice">Multiple Choice</option><option value="Essay">Essay</option><option value="Scale">Scale (1-5)</option>
                  </select>
                </div>
                {editingQ.questionType !== "Essay" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Num. of Options</label>
                    <input type="number" min={2} max={10} value={editingQ.optionsCount} onChange={(e) => setEditingQ({...editingQ, optionsCount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <button type="button" onClick={() => setEditingQ(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">Update Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP DELETE SINGLE QUESTION --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-rose-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Question?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Mentee will no longer see this question.</p>
              <div className="flex justify-center gap-3">
                 <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancel</button>
                 <button onClick={executeDelete} className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-sm shadow-sm">Yes, Delete It</button>
              </div>
           </div>
        </div>
      )}

      {/* --- POPUP KIAMAT: CLEAR ALL QUESTIONS --- */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative text-center border-t-8 border-rose-600">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={32} className="text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">Danger Zone</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                You are about to <strong className="text-rose-600">delete ALL diagnostic questions</strong> in the system. This action is irreversible and will break ongoing mentee tests. Are you absolutely sure?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                 <button onClick={() => setShowClearAllConfirm(false)} className="w-full px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm transition">Cancel, Keep Data</button>
                 <button onClick={executeClearAll} className="w-full px-4 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl text-sm shadow-md transition">Yes, Nuke Everything</button>
              </div>
           </div>
        </div>
      )}

    </UserLayout>
  );
}