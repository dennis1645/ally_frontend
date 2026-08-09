import { 
  GraduationCap, Calendar, Clock, Award, Search, Edit2, 
  Trash2, Plus, RotateCcw, X, CalendarDays 
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Cell 
} from "recharts";
import Card from "../../components/ui/Card";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  coverage: "Fully Funded" | "Partial / Tuition";
  degree: "Master & PhD" | "Master Only" | "Bachelor & Master";
  deadline: string; // YYYY-MM-DD
  status: "Open" | "Upcoming" | "Closed";
  interestedMentees: number;
  recordStatus: "Active" | "Archived";
}

const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  { id: "SCH-01", name: "LPDP Reguler", provider: "Kemenkeu RI", coverage: "Fully Funded", degree: "Master & PhD", deadline: "2026-09-15", status: "Open", interestedMentees: 840, recordStatus: "Active" },
  { id: "SCH-02", name: "DAAD EPOS", provider: "German Gov", coverage: "Fully Funded", degree: "Master Only", deadline: "2026-08-31", status: "Open", interestedMentees: 612, recordStatus: "Active" },
  { id: "SCH-03", name: "Eiffel Excellence", provider: "French Ministry", coverage: "Fully Funded", degree: "Master & PhD", deadline: "2026-11-10", status: "Upcoming", interestedMentees: 310, recordStatus: "Active" },
  { id: "SCH-04", name: "MEXT Japanese Gov", provider: "Monbukagakusho", coverage: "Fully Funded", degree: "Bachelor & Master", deadline: "2026-05-20", status: "Closed", interestedMentees: 290, recordStatus: "Active" },
  { id: "SCH-05", name: "Erasmus Mundus", provider: "European Union", coverage: "Partial / Tuition", degree: "Master Only", deadline: "2026-10-15", status: "Open", interestedMentees: 450, recordStatus: "Active" },
  { id: "SCH-06", name: "Chevening", provider: "UK Government", coverage: "Fully Funded", degree: "Master Only", deadline: "2026-11-05", status: "Upcoming", interestedMentees: 720, recordStatus: "Active" }
];

export default function ScholarshipManagement() {
  const [scholarships, setScholarships] = useState<Scholarship[]>(INITIAL_SCHOLARSHIPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoverage, setSelectedCoverage] = useState("All Coverage");
  const [activeTab, setActiveTab] = useState<"All" | "Archived">("All");

  // STATE UNTUK INTERACTIVE FILTERS
  const [activeCardFilter, setActiveCardFilter] = useState<"None" | "Active" | "Open" | "ClosingSoon">("None");
  const [activeChartFilter, setActiveChartFilter] = useState<string | null>(null);

  // Modals
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSch, setNewSch] = useState<Partial<Scholarship>>({ coverage: "Fully Funded", degree: "Master & PhD", status: "Open" });
  const [editingSch, setEditingSch] = useState<Scholarship | null>(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null); // State Popup Restore

  const todayDate = new Date("2026-08-09").getTime();

  // FIX LOGIC: "Active Programs" = Recordnya Active DAN Statusnya bukan Closed (Hanya Open/Upcoming)
  const totalActive = scholarships.filter(s => s.recordStatus === "Active" && s.status !== "Closed").length;
  
  const openCount = scholarships.filter(s => s.recordStatus === "Active" && s.status === "Open").length;
  
  const closingSoonCount = useMemo(() => {
    return scholarships.filter(s => {
      if (s.recordStatus !== "Active" || s.status !== "Open") return false;
      const diffDays = (new Date(s.deadline).getTime() - todayDate) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;
  }, [scholarships, todayDate]);

  // FIX UI: TOP 3 MOST TRACKED
  const top3Tracked = useMemo(() => {
    return [...scholarships.filter(s => s.recordStatus === "Active")]
      .sort((a, b) => b.interestedMentees - a.interestedMentees)
      .slice(0, 3);
  }, [scholarships]);

  // FILTER LOGIC UTAMA (Tabel Reaktif terhadap Card, Chart, Tab, Search)
  const filteredScholarships = useMemo(() => {
    return scholarships.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCoverage = selectedCoverage === "All Coverage" || s.coverage === selectedCoverage;
      const matchesTab = activeTab === "Archived" ? s.recordStatus === "Archived" : s.recordStatus === "Active";
      
      // Card Filter Logic
      let cardMatch = true;
      if (activeCardFilter === "Active") cardMatch = s.recordStatus === "Active" && s.status !== "Closed";
      if (activeCardFilter === "Open") cardMatch = s.status === "Open" && s.recordStatus === "Active";
      if (activeCardFilter === "ClosingSoon") {
        const diff = (new Date(s.deadline).getTime() - todayDate) / (1000*3600*24);
        cardMatch = diff >= 0 && diff <= 30 && s.status === "Open" && s.recordStatus === "Active";
      }

      // Chart Filter Logic (Filter by Deadline Month Group)
      let chartMatch = true;
      if (activeChartFilter) {
        const m = new Date(s.deadline).getMonth();
        const index = Math.floor(m / 2);
        const groups = ["Jan-Feb", "Mar-Apr", "May-Jun", "Jul-Aug", "Sep-Oct", "Nov-Dec"];
        chartMatch = groups[index] === activeChartFilter;
      }

      return matchesSearch && matchesCoverage && matchesTab && cardMatch && chartMatch;
    });
  }, [scholarships, searchQuery, selectedCoverage, activeTab, activeCardFilter, activeChartFilter, todayDate]);

  // DATA UNTUK CHART (Dihitung dari data yg difilter Card/Tab, BUKAN dari Chart filter sendiri)
  const chartData = useMemo(() => {
    const groups = [
      { month: "Jan-Feb", count: 0 }, { month: "Mar-Apr", count: 0 },
      { month: "May-Jun", count: 0 }, { month: "Jul-Aug", count: 0 },
      { month: "Sep-Oct", count: 0 }, { month: "Nov-Dec", count: 0 }
    ];
    
    scholarships.forEach(s => {
       // Abaikan data Archived. 
       // Juga, kalau ada Card Filter aktif, hitung chart berdasar Card Filter tsb.
       let include = s.recordStatus === "Active";
       if (activeCardFilter === "Active") include = include && s.status !== "Closed";
       if (activeCardFilter === "Open") include = include && s.status === "Open";
       if (activeCardFilter === "ClosingSoon") {
          const diff = (new Date(s.deadline).getTime() - todayDate) / (1000*3600*24);
          include = include && diff >= 0 && diff <= 30 && s.status === "Open";
       }

       if (include) {
         const m = new Date(s.deadline).getMonth(); 
         groups[Math.floor(m / 2)].count += 1;
       }
    });
    return groups;
  }, [scholarships, activeCardFilter, todayDate]);

  // Actions Toggle
  const toggleCardFilter = (filter: typeof activeCardFilter) => {
    setActiveTab("All");
    setActiveCardFilter(activeCardFilter === filter ? "None" : filter);
  };

  const toggleChartFilter = (data: any) => {
    if (!data) return;
    setActiveTab("All");
    setActiveChartFilter(activeChartFilter === data.month ? null : data.month);
  };

  const handleTabSwitch = (tab: "All" | "Archived") => {
    setActiveTab(tab);
    if (tab === "Archived") {
       setActiveCardFilter("None");
       setActiveChartFilter(null);
    }
  };

  // CRUD Actions
  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToAdd: Scholarship = {
      id: `SCH-NEW-${Date.now()}`,
      name: newSch.name || "", provider: newSch.provider || "",
      coverage: newSch.coverage as any, degree: newSch.degree as any,
      deadline: newSch.deadline || "2026-12-31", status: newSch.status as any,
      interestedMentees: 0, recordStatus: "Active"
    };
    setScholarships([itemToAdd, ...scholarships]);
    setIsAddingNew(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSch) return;
    setScholarships(prev => prev.map(s => s.id === editingSch.id ? editingSch : s));
    setEditingSch(null);
  };

  const executeSoftDelete = () => {
    if (deleteConfirmId) {
      setScholarships(prev => prev.map(s => s.id === deleteConfirmId ? { ...s, recordStatus: "Archived" } : s));
      setDeleteConfirmId(null);
    }
  };

  const executeRestore = () => {
    if (restoreConfirmId) {
      setScholarships(prev => prev.map(s => s.id === restoreConfirmId ? { ...s, recordStatus: "Active" } : s));
      setRestoreConfirmId(null);
    }
  };

  return (
    <UserLayout title="Scholarship Management" subtitle="MANAGE SCHOLARSHIP CATALOG, APPLICATION DEADLINES, AND FUNDING COVERAGE" sidebarItems={adminSidebarItems} topbarProps={{ showSearch: false }}>
      <section className="bg-slate-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-6 flex items-center justify-between">
             <div className="flex gap-2">
                {activeCardFilter !== "None" && (
                   <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <span>Card Filter: {activeCardFilter}</span>
                      <button onClick={() => setActiveCardFilter("None")} className="hover:text-blue-800"><X size={14}/></button>
                   </div>
                )}
                {activeChartFilter && (
                   <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                      <span>Deadline in: {activeChartFilter}</span>
                      <button onClick={() => setActiveChartFilter(null)} className="hover:text-purple-800"><X size={14}/></button>
                   </div>
                )}
             </div>
             <button onClick={() => setIsAddingNew(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
               <Plus size={15} /><span>Add New Scholarship</span>
             </button>
          </div>

          {/* 4 INTERACTIVE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            <div onClick={() => toggleCardFilter("Active")} className="cursor-pointer transition-transform hover:-translate-y-1">
              <Card padding="md" className={`min-h-[140px] flex flex-col justify-between border shadow-sm relative transition ${activeCardFilter === "Active" ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/20" : "border-slate-100"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active & Upcoming</span>
                    <div className="text-3xl font-bold text-slate-900 mt-2">{totalActive}</div>
                  </div>
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><GraduationCap size={20} /></div>
                </div>
              </Card>
            </div>

            <div onClick={() => toggleCardFilter("Open")} className="cursor-pointer transition-transform hover:-translate-y-1">
              <Card padding="md" className={`min-h-[140px] flex flex-col justify-between border shadow-sm relative transition ${activeCardFilter === "Open" ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20" : "border-slate-100"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Applications</span>
                    <div className="text-3xl font-bold text-slate-900 mt-2">{openCount}</div>
                    <span className="text-xs text-emerald-600 font-medium mt-1 block">Ready for mentees</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Calendar size={20} /></div>
                </div>
              </Card>
            </div>

            <div onClick={() => toggleCardFilter("ClosingSoon")} className="cursor-pointer transition-transform hover:-translate-y-1">
              <Card padding="md" className={`min-h-[140px] flex flex-col justify-between border shadow-sm relative transition ${activeCardFilter === "ClosingSoon" ? "border-rose-500 ring-1 ring-rose-500 bg-rose-50/20" : "border-slate-100"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closing Soon (&lt; 30d)</span>
                    <div className="text-3xl font-bold text-rose-600 mt-2">{closingSoonCount}</div>
                    <span className="text-xs text-rose-500 font-medium mt-1 block">Requires push</span>
                  </div>
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><Clock size={20} /></div>
                </div>
              </Card>
            </div>

            {/* CARD 4: TOP 3 MOST TRACKED (UI Diperbesar & dirapikan) */}
            <Card padding="md" className="min-h-[140px] flex flex-col border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top 3 Tracked</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg absolute right-4 top-4 opacity-70"><Award size={16} /></div>
              </div>
              <div className="flex flex-col gap-2 mt-1 z-10 w-full pr-2">
                 {top3Tracked.map((sch, i) => (
                    <div key={sch.id} className="flex justify-between items-center text-xs">
                       <span className="truncate w-[85%] text-slate-700 font-semibold">{i+1}. {sch.name}</span>
                       <span className="text-indigo-600 font-bold">{sch.interestedMentees}</span>
                    </div>
                 ))}
              </div>
            </Card>

          </div>

          {/* INTERACTIVE CHART: BISA DI KLIK */}
          <Card padding="md" className="border border-slate-100 shadow-sm mb-6 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Deadline Seasonality (Click a bar to filter table)</h3>
              </div>
              {activeChartFilter && (
                 <button onClick={() => setActiveChartFilter(null)} className="text-xs font-semibold text-blue-600 hover:underline">
                    Clear Chart Filter
                 </button>
              )}
            </div>
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar 
                     dataKey="count" 
                     radius={[4, 4, 0, 0]} 
                     barSize={40}
                     onClick={toggleChartFilter}
                     className="cursor-pointer transition hover:opacity-80"
                  >
                     {/* Logic untuk highlight warna bar yang lagi dipilih */}
                     {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={activeChartFilter === entry.month ? '#4f46e5' : '#3b82f6'} />
                     ))}
                    <LabelList dataKey="count" position="top" fontSize={11} fill="#64748b" fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex gap-2">
                <button onClick={() => handleTabSwitch("All")} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  Active Table View
                </button>
                <button onClick={() => handleTabSwitch("Archived")} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'Archived' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  Archived / Trash
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search scholarship..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500" />
                </div>
                <select value={selectedCoverage} onChange={(e) => setSelectedCoverage(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer">
                  <option value="All Coverage">All Coverage</option>
                  <option value="Fully Funded">Fully Funded</option>
                  <option value="Partial / Tuition">Partial / Tuition</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">Scholarship Name</th><th className="p-4">Coverage & Degree</th><th className="p-4">Deadline</th><th className="p-4 text-center">App Status</th><th className="p-4 text-center">Interested Mentees</th><th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredScholarships.length > 0 ? filteredScholarships.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4"><div className="font-semibold text-slate-900">{sch.name}</div><span className="text-xs text-slate-400">{sch.provider}</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md mr-1.5 ${sch.coverage === 'Fully Funded' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {sch.coverage}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1">{sch.degree}</span>
                      </td>
                      <td className="p-4 font-mono text-xs font-medium text-slate-800">{sch.deadline}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sch.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : sch.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                          {sch.status}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-900">{sch.interestedMentees}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {sch.recordStatus === 'Active' ? (
                            <><button onClick={() => setEditingSch(sch)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => setDeleteConfirmId(sch.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button></>
                          ) : (
                            <button onClick={() => setRestoreConfirmId(sch.id)} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"><RotateCcw size={13} /><span>Restore</span></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6} className="p-8 text-center text-slate-400">No scholarships found matching criteria.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL: ADD NEW SCHOLARSHIP (Tetap sama) */}
      {isAddingNew && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setIsAddingNew(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Scholarship</h3>
            <form onSubmit={handleAddNewSubmit} className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Scholarship Name</label><input type="text" value={newSch.name || ""} onChange={(e) => setNewSch({...newSch, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Provider / Sponsor</label><input type="text" value={newSch.provider || ""} onChange={(e) => setNewSch({...newSch, provider: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Coverage</label>
                  <select value={newSch.coverage} onChange={(e) => setNewSch({...newSch, coverage: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Fully Funded">Fully Funded</option><option value="Partial / Tuition">Partial / Tuition</option>
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Degree Level</label>
                  <select value={newSch.degree} onChange={(e) => setNewSch({...newSch, degree: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Master & PhD">Master & PhD</option><option value="Master Only">Master Only</option><option value="Bachelor & Master">Bachelor & Master</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Application Deadline</label><input type="date" value={newSch.deadline || ""} onChange={(e) => setNewSch({...newSch, deadline: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={newSch.status} onChange={(e) => setNewSch({...newSch, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Open">Open</option><option value="Upcoming">Upcoming</option><option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsAddingNew(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm">Add Scholarship</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SCHOLARSHIP (Tetap sama) */}
      {editingSch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setEditingSch(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Scholarship Data</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Scholarship Name</label><input type="text" value={editingSch.name} onChange={(e) => setEditingSch({...editingSch, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Provider / Sponsor</label><input type="text" value={editingSch.provider} onChange={(e) => setEditingSch({...editingSch, provider: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Coverage</label>
                  <select value={editingSch.coverage} onChange={(e) => setEditingSch({...editingSch, coverage: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Fully Funded">Fully Funded</option><option value="Partial / Tuition">Partial / Tuition</option>
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Degree Level</label>
                  <select value={editingSch.degree} onChange={(e) => setEditingSch({...editingSch, degree: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Master & PhD">Master & PhD</option><option value="Master Only">Master Only</option><option value="Bachelor & Master">Bachelor & Master</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Application Deadline</label><input type="date" value={editingSch.deadline} onChange={(e) => setEditingSch({...editingSch, deadline: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={editingSch.status} onChange={(e) => setEditingSch({...editingSch, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Open">Open</option><option value="Upcoming">Upcoming</option><option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setEditingSch(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP SOFT DELETE */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-rose-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Scholarship?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to archive this scholarship program?</p>
              <div className="flex justify-center gap-3">
                 <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancel</button>
                 <button onClick={executeSoftDelete} className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-sm shadow-sm">Yes, Archive It</button>
              </div>
           </div>
        </div>
      )}

      {/* POPUP RESTORE (FITUR BARU) */}
      {restoreConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4"><RotateCcw size={24} className="text-emerald-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Restore Scholarship?</h3>
              <p className="text-sm text-slate-500 mb-6">This scholarship will be returned to the active catalog.</p>
              <div className="flex justify-center gap-3">
                 <button onClick={() => setRestoreConfirmId(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancel</button>
                 <button onClick={executeRestore} className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm shadow-sm">Yes, Restore It</button>
              </div>
           </div>
        </div>
      )}

    </UserLayout>
  );
}