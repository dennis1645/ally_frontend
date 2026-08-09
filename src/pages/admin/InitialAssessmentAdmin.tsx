import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit,
  Search,
  AlertTriangle,
  Layers,
  CheckCircle,
  HelpCircle,
  UploadCloud,
  ArrowUpRight
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import { getDiagnosticQuestions, type DiagnosticQuestion } from "../../api/adminApi";

export default function InitialAssessmentAdmin() {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getDiagnosticQuestions();

        if (!mounted) return;
        setQuestions(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Gagal mengambil data soal diagnostik");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter Logic
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <UserLayout
      title="Initial Assessment Management"
      subtitle="Kelola pertanyaan diagnostik dan kesiapan mentee"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="p-6 bg-gray-50">
        {/* --- HEADER & ACTION BUTTONS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Initial Assessment Management</h1>
          <p className="text-sm text-gray-500">
            Kelola pertanyaan tes diagnostik awal untuk mengukur persentase kesiapan (*Current Score*) mentee.
          </p>
        </div>

        {/* Group Action Buttons (Mapped to Endpoints) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Trigger DEL Clear All Questions */}
          <button
            title="Hapus Seluruh Soal Diagnostik"
            className="flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-lg font-medium text-sm transition"
          >
            <AlertTriangle size={16} />
            <span>Clear All Questions</span>
          </button>

          {/* Trigger POST Import Excel (Bulk Upload) */}
          <button
            title="Upload File Excel Soal"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-medium text-sm shadow-sm transition"
          >
            <FileSpreadsheet size={16} />
            <span>Import Excel</span>
          </button>

          {/* Trigger POST Create Question Manually */}
          <button
            title="Tambah Soal Manual"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-medium text-sm shadow-sm transition"
          >
            <Plus size={16} />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* --- DATA ANALYSIS CARDS --- */}
      {error && (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Memuat data soal diagnostik...
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Bank Soal */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Diagnostic Questions</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{questions.length} Soal</h3>
            <span className="text-xs text-blue-600 font-medium">Aktif di sistem tes</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <HelpCircle size={24} />
          </div>
        </div>

        {/* Card 2: Assessment Categories */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coverage Categories</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">5 Pilar</h3>
            <span className="text-xs text-gray-500">Academic, Lang, Motivation, etc.</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers size={24} />
          </div>
        </div>

        {/* Card 3: Mentee Assessment Completion */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Completion Rate</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">94.2%</h3>
            <span className="text-xs text-emerald-600 font-medium font-medium inline-flex items-center gap-0.5">
              <ArrowUpRight size={12} /> +2.1% minggu ini
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Card 4: Last Excel Sync */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Bulk Import</p>
            <h3 className="text-lg font-bold text-gray-800 mt-1">2 Hari Lalu</h3>
            <span className="text-xs text-gray-500">Via Excel (.xlsx)</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <UploadCloud size={24} />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTROLS (SEARCH & FILTER) --- */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search diagnostic question text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-gray-500">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Language">Language</option>
            <option value="Motivation">Motivation</option>
            <option value="Leadership">Leadership</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE (GET All Diagnostic Questions) --- */}
      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Question ID & Text</th>
                <th className="p-4">Category</th>
                <th className="p-4">Type</th>
                <th className="p-4">Weight Score</th>
                <th className="p-4">Updated At</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition text-gray-800">
                  {/* ID & Question Text */}
                  <td className="p-4 max-w-md">
                    <span className="text-xs font-semibold text-gray-400 block mb-0.5">{q.id}</span>
                    <div className="font-medium text-gray-900 line-clamp-2">{q.questionText}</div>
                  </td>

                  {/* Category Badge */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {q.category}
                    </span>
                  </td>

                  {/* Question Type */}
                  <td className="p-4">
                    <span className="text-gray-600 font-medium text-xs bg-gray-100 px-2 py-1 rounded">
                      {q.questionType} ({q.optionsCount} Pilihan)
                    </span>
                  </td>

                  {/* Weight Score */}
                  <td className="p-4 font-semibold text-indigo-600">
                    +{q.weightScore} Pts
                  </td>

                  {/* Updated At */}
                  <td className="p-4 text-xs text-gray-500">
                    {q.updatedAt}
                  </td>

                  {/* Action Buttons mapped to Endpoints */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Trigger PUT Update Question */}
                      <button
                        title="Mengedit Soal"
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Trigger DEL Delete Question */}
                      <button
                        title="Delete Question"
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
     </UserLayout>
  );
}