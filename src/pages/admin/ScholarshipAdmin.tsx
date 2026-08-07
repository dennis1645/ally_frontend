import { useEffect, useState } from "react";
import {
  GraduationCap,
  CalendarCheck,
  Award,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import { getScholarships, type Scholarship } from "../../api/adminApi";

export default function ScholarshipAdmin() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCoverage, setFilterCoverage] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getScholarships();

        if (!mounted) return;
        setScholarships(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Gagal mengambil data beasiswa");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter Logic
  const filteredScholarships = scholarships.filter((sch) => {
    const matchesSearch =
      sch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sch.provider?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    const matchesCoverage = filterCoverage === "All" || sch.coverageType === filterCoverage;
    return matchesSearch && matchesCoverage;
  });

  return (
    <UserLayout
      title="Scholarship Management"
      subtitle="Kelola katalog beasiswa dan tenggat waktu pendaftaran"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="p-6 bg-gray-50">
        {/* --- HEADER & CREATE BUTTON --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Scholarship Management</h1>
          <p className="text-sm text-gray-500">
            Kelola katalog beasiswa, tenggat waktu pendaftaran, dan tipe cakupan pendanaan.
          </p>
        </div>
        {/* Trigger POST CREATE Beasiswa */}
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition">
          <Plus size={18} />
          <span>Add New Scholarship</span>
        </button>
      </div>

      {/* --- DATA ANALYSIS CARDS --- */}
      {error && (
        <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Memuat data beasiswa...
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Beasiswa Active */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Active Programs</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {scholarships.filter((s) => !s.isDeleted).length} Program
            </h3>
            <span className="text-xs text-blue-600 font-medium">Tersedia di katalog</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <GraduationCap size={24} />
          </div>
        </div>

        {/* Card 2: Open / Active Application Windows */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Applications</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {scholarships.filter((s) => s.status === "Open").length} Open Now
            </h3>
            <span className="text-xs text-emerald-600 font-medium">Siap untuk diajukan</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CalendarCheck size={24} />
          </div>
        </div>

        {/* Card 3: Fully Funded Ratio */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fully Funded Ratio</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">100% Full</h3>
            <span className="text-xs text-amber-600 font-medium">Mayoritas diincar mentee</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card 4: Top Targeted Scholarship */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Most Tracked</p>
            <h3 className="text-lg font-bold text-gray-800 mt-1 truncate max-w-[140px]">FIPDes</h3>
            <span className="text-xs text-indigo-600 font-medium">420 Mentee berminat</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTROLS (SEARCH & FILTER) --- */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search scholarship or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-gray-500">Coverage:</span>
          <select
            value={filterCoverage}
            onChange={(e) => setFilterCoverage(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Coverage</option>
            <option value="Full">Fully Funded</option>
            <option value="Partial">Partial Funded</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Scholarship Name</th>
                <th className="p-4">Coverage & Degree</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">App Status</th>
                <th className="p-4">Interested Mentees</th>
                <th className="p-4">Record Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredScholarships.map((sch) => (
                <tr
                  key={sch.id}
                  className={`hover:bg-gray-50 transition ${
                    sch.isDeleted ? "bg-gray-50/60 text-gray-400" : "text-gray-800"
                  }`}
                >
                  {/* Name & Provider */}
                  <td className="p-4">
                    <div className="font-semibold flex items-center gap-2">
                      <span>{sch.name}</span>
                      <a
                        href={sch.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <span className="text-xs text-gray-400">{sch.provider}</span>
                  </td>

                  {/* Coverage & Degree */}
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {sch.coverageType} Funded
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{sch.targetDegree}</div>
                  </td>

                  {/* Deadline */}
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Clock size={15} className="text-gray-400" />
                      <span>{sch.deadline}</span>
                    </div>
                  </td>

                  {/* Application Status Badge */}
                  <td className="p-4">
                    {sch.status === "Open" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={12} /> Open
                      </span>
                    )}
                    {sch.status === "Upcoming" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock size={12} /> Upcoming
                      </span>
                    )}
                    {sch.status === "Closed" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <AlertCircle size={12} /> Closed
                      </span>
                    )}
                  </td>

                  {/* Mentee Interest */}
                  <td className="p-4 font-medium">
                    {sch.totalApplicants} Mentees
                  </td>

                  {/* Record Status */}
                  <td className="p-4">
                    {sch.isDeleted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        Deleted
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Action Buttons mapped to Endpoints */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Trigger POST UPDATE Beasiswa */}
                      {!sch.isDeleted && (
                        <button
                          title="Update Beasiswa"
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit size={16} />
                        </button>
                      )}

                      {sch.isDeleted ? (
                        /* Trigger POST RESTORE Beasiswa */
                        <button
                          title="Restore Beasiswa"
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <RefreshCw size={16} />
                        </button>
                      ) : (
                        /* Trigger DEL DELETE Beasiswa */
                        <button
                          title="Delete Beasiswa"
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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