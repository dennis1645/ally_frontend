import { useEffect, useState } from "react";
import {
  Award,
  Sparkles,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  TrendingUp
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import { getBadges, type BadgeItem } from "../../api/adminApi";

export default function BadgeAdmin() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRarity, setFilterRarity] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getBadges();

        if (!mounted) return;
        setBadges(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Gagal mengambil data badge");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter Logic
  const filteredBadges = badges.filter((bdg) => {
    const matchesSearch =
      bdg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bdg.description?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    const matchesRarity = filterRarity === "All" || bdg.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  const totalUnlockedAll = badges.reduce(
    (acc, curr) => acc + (curr.unlockedCount ?? 0),
    0,
  );

  return (
    <UserLayout
      title="Badge & Gamification Management"
      subtitle="Kelola badge, level, dan reward platform"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="p-6 bg-gray-50">
        {/* --- HEADER & CREATE BUTTON --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Badge & Gamification Management</h1>
          <p className="text-sm text-gray-500">
            Kelola penghargaan digital (*badge*), tingkat kelangkaan, dan syarat pencapaian mentee.
          </p>
        </div>

        {/* Trigger POST Create New Badge (Buat Badge Baru) */}
        <button
          title="Buat Badge Baru"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition"
        >
          <Plus size={18} />
          <span>Create New Badge</span>
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
          Memuat badge...
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Badges Catalog */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Active Badges</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {badges.filter((b) => b.status === "Active").length} Badges
            </h3>
            <span className="text-xs text-blue-600 font-medium">Tersedia untuk diraih</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Award size={24} />
          </div>
        </div>

        {/* Card 2: Total Badges Earned */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Badges Unlocked</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalUnlockedAll.toLocaleString("id-ID")} x</h3>
            <span className="text-xs text-emerald-600 font-medium">Diraih oleh mentee</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users size={24} />
          </div>
        </div>

        {/* Card 3: Legendary Badges Count */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Legendary Badges</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {badges.filter((b) => b.rarity === "Legendary").length} Badge
            </h3>
            <span className="text-xs text-amber-600 font-medium">Tingkat kelangkaan tertinggi</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Sparkles size={24} />
          </div>
        </div>

        {/* Card 4: Most Common Badge */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Most Awarded Badge</p>
            <h3 className="text-lg font-bold text-gray-800 mt-1 truncate max-w-[140px]">Early Bird 2026</h3>
            <span className="text-xs text-indigo-600 font-medium">3,100 Mentee</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* --- TABLE CONTROLS (SEARCH & FILTER) --- */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search badge name or requirement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-gray-500">Rarity Tier:</span>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE (GET Get All Badges) --- */}
      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Badge & Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rarity Tier</th>
                <th className="p-4">Mentee Unlocked</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredBadges.map((bdg) => (
                <tr key={bdg.id} className="hover:bg-gray-50 transition text-gray-800">
                  {/* Icon, Name & Description */}
                  <td className="p-4 max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl p-2 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
                        {bdg.iconEmoji}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{bdg.name}</div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{bdg.description ?? "—"}</p>
                        <span className="text-[10px] text-gray-400 font-mono mt-1 block">ID: {bdg.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {bdg.category}
                    </span>
                  </td>

                  {/* Rarity Badge Color Coding */}
                  <td className="p-4">
                    {bdg.rarity === "Common" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Common
                      </span>
                    )}
                    {bdg.rarity === "Rare" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Rare
                      </span>
                    )}
                    {bdg.rarity === "Epic" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        Epic
                      </span>
                    )}
                    {bdg.rarity === "Legendary" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                        <Star size={12} className="fill-amber-500 text-amber-500" /> Legendary
                      </span>
                    )}
                  </td>

                  {/* Mentee Unlocked Count */}
                  <td className="p-4 font-semibold text-gray-700">
                    {(bdg.unlockedCount ?? 0).toLocaleString("id-ID")} Mentee
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {bdg.status === "Active" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </td>

                  {/* Action Buttons mapped to Endpoints */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Trigger GET Get Single Badge Detail */}
                      <button
                        title="Get Single Badge Detail (Lihat Detail 1 Badge)"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Trigger PUT Update Badge (Edit Data Badge) */}
                      <button
                        title="Update Badge (Edit Data Badge)"
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Trigger DEL Delete Badge (Hapus Badge) */}
                      <button
                        title="Delete Badge (Hapus Badge)"
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