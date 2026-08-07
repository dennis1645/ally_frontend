import { Fragment, useEffect, useState } from "react";
import {
  FileSpreadsheet,
  AlertTriangle,
  Trash2,
  Edit,
  Eye,
  HelpCircle,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  BarChart2,
  BookOpen
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import { getPracticeExams, type PracticeExam } from "../../api/adminApi";

// Tipe Data Soal dalam Ujian
export interface QuizQuestion {
  id: string | number;
  questionText: string;
  questionType: "Multiple Choice" | "True/False" | "Short Answer";
  points: number;
}

export default function QuizAdmin() {
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [expandedExamId, setExpandedExamId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getPracticeExams();

        if (!mounted) return;
        setExams(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Gagal mengambil data ujian latihan");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Toggle Accordion untuk melihat detail soal kuis
  const toggleExpand = (id: string | number) => {
    setExpandedExamId(expandedExamId === id ? null : id);
  };

  // Filter Logic
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || exam.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalQuestionsAll = exams.reduce(
    (acc, curr) => acc + (curr.totalQuestions ?? 0),
    0,
  );

  return (
    <UserLayout
      title="Practice Exam & Quiz Management"
      subtitle="Kelola kuis, bank soal, dan ujian latihan"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="p-6 bg-gray-50">
        {/* --- HEADER & DANGER ZONE / BULK ACTIONS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Practice Exam & Quiz Management</h1>
          <p className="text-sm text-gray-500">
            Kelola simulasi ujian latihan, impor bank soal via Excel, serta sunting kuis individual mentee.
          </p>
        </div>

        {/* Group Action Buttons (Mapped to Endpoints) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Trigger DEL Clear All (Danger Zone) */}
          <button
            title="Hapus Semua Ujian & Bank Soal (Danger Zone)"
            className="flex items-center gap-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 rounded-lg font-medium text-sm transition"
          >
            <AlertTriangle size={16} />
            <span>Clear All (Danger Zone)</span>
          </button>

          {/* Trigger POST Import Questions via Excel (Bulk Create) */}
          <button
            title="Upload File Excel Soal Ujian"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-medium text-sm shadow-sm transition"
          >
            <FileSpreadsheet size={16} />
            <span>Import Questions (Excel)</span>
          </button>
        </div>
      </div>

      {/* --- DATA ANALYSIS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Practice Exams */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Practice Exams</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{exams.length} Ujian</h3>
            <span className="text-xs text-blue-600 font-medium">Modul simulasi aktif</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Card 2: Total Question Bank */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Question Bank Size</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalQuestionsAll} Soal</h3>
            <span className="text-xs text-indigo-600 font-medium">Tersebar di seluruh ujian</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <HelpCircle size={24} />
          </div>
        </div>

        {/* Card 3: Total Exam Attempts */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Test Attempts</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">2,920 x</h3>
            <span className="text-xs text-emerald-600 font-medium">Dikerjakan oleh mentee</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Card 4: Average Mentee Score */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Passing Score</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">77.9%</h3>
            <span className="text-xs text-amber-600 font-medium">Tingkat kelulusan rerata</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <BarChart2 size={24} />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTROLS (SEARCH & FILTER) --- */}
      {error && (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Memuat ujian latihan...
        </div>
      )}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search practice exam title..."
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
            <option value="TOEFL iBT">TOEFL iBT</option>
            <option value="IELTS">IELTS</option>
            <option value="General Scholarship">General Scholarship</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE (GET All Practice Exams) --- */}
      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4">Exam Title & ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Questions</th>
                <th className="p-4">Attempts & Avg</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredExams.map((exam) => {
                const isExpanded = expandedExamId === exam.id;
                return (
                  <Fragment key={exam.id}>
                    {/* EXAM ROW */}
                    <tr className="hover:bg-gray-50 transition text-gray-800">
                      {/* Expand Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleExpand(exam.id)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          title="GET Get Single Exam Detail"
                        >
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>

                      {/* Title & ID */}
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{exam.title}</div>
                        <span className="text-xs text-gray-400">ID: {exam.id}</span>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {exam.category}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          <span>{exam.durationMinutes} Mins</span>
                        </div>
                      </td>

                      {/* Total Questions */}
                      <td className="p-4 font-medium text-gray-700">
                        {exam.totalQuestions} Soal
                      </td>

                      {/* Attempts & Avg Score */}
                      <td className="p-4">
                        <div className="text-xs font-medium text-gray-800">{exam.totalAttempts} x Dikerjakan</div>
                        <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                          Avg: {exam.avgScore}%
                        </div>
                      </td>

                      {/* Action Buttons mapped to Endpoints */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Trigger GET Get Single Exam Detail */}
                          <button
                            onClick={() => toggleExpand(exam.id)}
                            title="Get Single Exam Detail"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Trigger DEL Delete Single Exam (Beserta isinya) */}
                          <button
                            title="Delete Single Exam (Beserta isinya)"
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED NESTED QUESTIONS TABLE (GET Single Exam Detail View) */}
                    {isExpanded && (
                      <tr className="bg-gray-50/70">
                        <td colSpan={7} className="p-4 pl-12 border-b border-gray-100">
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                Question List in "{exam.title}"
                              </h4>
                              <span className="text-xs text-gray-400">
                                Sub-items linked to Endpoint: Single Question Controls
                              </span>
                            </div>

                            {Array.isArray(exam.questions) && exam.questions.length > 0 ? (
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-gray-100 text-gray-400 uppercase">
                                    <th className="py-2">Question ID</th>
                                    <th className="py-2">Question Text</th>
                                    <th className="py-2">Type</th>
                                    <th className="py-2">Points</th>
                                    <th className="py-2 text-center">Question Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {exam.questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50">
                                      <td className="py-2 font-mono text-gray-400">{q.id}</td>
                                      <td className="py-2 font-medium text-gray-800">{q.questionText}</td>
                                      <td className="py-2 text-gray-500">{q.questionType}</td>
                                      <td className="py-2 font-semibold text-indigo-600">+{q.points} Pts</td>
                                      <td className="py-2">
                                        <div className="flex items-center justify-center gap-2">
                                          {/* Trigger PUT Update Single Question */}
                                          <button
                                            title="Update Single Question"
                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                                          >
                                            <Edit size={14} />
                                          </button>

                                          {/* Trigger DEL Delete Single Question */}
                                          <button
                                            title="Delete Single Question"
                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-xs text-gray-400 italic py-2">
                                Belum ada soal yang diimpor ke dalam kuis ini.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
     </UserLayout>
  );
}