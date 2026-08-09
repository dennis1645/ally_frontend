import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Award,
  Archive,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import { getUniversities, type University } from "../../api/adminApi";

export default function UniversityAdmin() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getUniversities();

        if (!mounted) return;

        setUniversities(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Gagal mengambil data universitas");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter Logic
  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch =
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (uni.country?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === "All" || uni.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <UserLayout
      title="University Management"
      subtitle="Kelola universitas dan asosiasi beasiswa"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="p-6 bg-gray-50">
        {/* --- HEADER & CREATE BUTTON --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">University Management</h1>
          <p className="text-sm text-gray-500">
            Kelola basis data universitas tujuan, peringkat, serta asosiasi beasiswa.
          </p>
        </div>
        {/* Trigger POST Create University */}
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition">
          <Plus size={18} />
          <span>Add New University</span>
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
          Memuat data universitas...
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Campus */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Universities</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">142</h3>
            <span className="text-xs text-green-600 font-medium">+8 bulan ini</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 size={24} />
          </div>
        </div>

        {/* Card 2: Countries Covered */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Countries Covered</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">32 Negara</h3>
            <span className="text-xs text-gray-500">Dominan: Eropa & Asia</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Globe size={24} />
          </div>
        </div>

        {/* Card 3: Top Demand Campus */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Most Demanded</p>
            <h3 className="text-lg font-bold text-gray-800 mt-1 truncate max-w-[150px]">TU Munich</h3>
            <span className="text-xs text-blue-600 font-medium">512 Mentee berminat</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Award size={24} />
          </div>
        </div>

        {/* Card 4: Soft Deleted / Archived */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Archived / Soft Deleted</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {universities.filter((u) => u.isDeleted).length}
            </h3>
            <span className="text-xs text-red-500 font-medium">Dapat di-restore</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <Archive size={24} />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTROLS (SEARCH & FILTER) --- */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search university or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-gray-500">Region:</span>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="Americas">Americas</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">University Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">QS Rank</th>
                <th className="p-4">Scholarships</th>
                <th className="p-4">Interested Mentees</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUniversities.map((uni) => (
                <tr
                  key={uni.id}
                  className={`hover:bg-gray-50 transition ${
                    uni.isDeleted ? "bg-gray-50/60 text-gray-400" : "text-gray-800"
                  }`}
                >
                  {/* Name & Web */}
                  <td className="p-4">
                    <div className="font-semibold flex items-center gap-2">
                      <span>{uni.name}</span>
                      <a
                        href={uni.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <span className="text-xs text-gray-400">ID: {uni.id}</span>
                  </td>

                  {/* Location */}
                  <td className="p-4">
                    <div>{uni.country}</div>
                    <span className="text-xs text-gray-400">{uni.region}</span>
                  </td>

                  {/* QS Rank */}
                  <td className="p-4 font-medium">
                    #{uni.qsRanking}
                  </td>

                  {/* Linked Scholarships */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                      <GraduationCap size={16} />
                      <span>{uni.linkedScholarshipsCount} Beasiswa</span>
                    </div>
                  </td>

                  {/* Mentee Demand */}
                  <td className="p-4 font-medium">
                    {uni.totalInterestedMentees} Users
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {uni.isDeleted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        Soft Deleted
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
                      {/* Trigger POST Update University */}
                      {!uni.isDeleted && (
                        <button
                          title="Update University"
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit size={16} />
                        </button>
                      )}

                      {uni.isDeleted ? (
                        /* Trigger POST Restore University */
                        <button
                          title="Restore University"
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <RefreshCw size={16} />
                        </button>
                      ) : (
                        /* Trigger DEL Soft Delete University */
                        <button
                          title="Soft Delete University"
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