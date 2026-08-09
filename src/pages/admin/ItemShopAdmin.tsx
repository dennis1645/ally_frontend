import { useEffect, useState } from "react";
import {
  Store,
  Coins,
  ShoppingBag,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  CreditCard,
  CheckCircle2,
  XCircle
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import { getShopItems, type ShopItem } from "../../api/adminApi";

export default function ItemShopAdmin() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getShopItems();

        if (!mounted) return;
        setItems(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Gagal mengambil data item toko");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <UserLayout
      title="Item Shop Management"
      subtitle="Kelola paket koin dan item toko digital"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="p-6 bg-gray-50">
        {/* --- HEADER & CREATE BUTTONS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Item Shop Management</h1>
          <p className="text-sm text-gray-500">
            Kelola katalog toko, paket Top Up koin, dan item/layanan yang dapat ditukar mentee.
          </p>
        </div>

        {/* Group Action Buttons (Mapped to Endpoints) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Trigger POST Create Shop Item (Top Up Version) */}
          <button
            title="Buat Paket Top Up Koin Baru"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg font-medium text-sm shadow-sm transition"
          >
            <CreditCard size={16} />
            <span>Create Top Up Package</span>
          </button>

          {/* Trigger POST Create Shop Item */}
          <button
            title="Buat Item / Voucher Baru"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-medium text-sm shadow-sm transition"
          >
            <Plus size={16} />
            <span>Create Shop Item</span>
          </button>
        </div>
      </div>

      {/* --- DATA ANALYSIS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Catalog Items */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Active Catalog</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {items.filter((i) => i.status === "Active").length} Items
            </h3>
            <span className="text-xs text-blue-600 font-medium">Tampil di aplikasi</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Store size={24} />
          </div>
        </div>

        {/* Card 2: Top Up Packages */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Up Packages</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {items.filter((i) => i.type === "Top Up").length} Variant
            </h3>
            <span className="text-xs text-amber-600 font-medium">Nominal koin beragam</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Coins size={24} />
          </div>
        </div>

        {/* Card 3: Total Transactions / Redeems */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Purchased / Redeemed</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">2,790 x</h3>
            <span className="text-xs text-emerald-600 font-medium">Transaksi berhasil</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Card 4: Best Seller */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Selling Item</p>
            <h3 className="text-lg font-bold text-gray-800 mt-1 truncate max-w-[140px]">Starter Coin Pack</h3>
            <span className="text-xs text-indigo-600 font-medium">1,240 Transaksi</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp size={24} />
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
          Memuat item toko...
        </div>
      )}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search item or package name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-gray-500">Item Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Top Up">Top Up (Koin)</option>
            <option value="Item">Standard Item / Voucher</option>
          </select>
        </div>
      </div>

      {/* --- DATA TABLE (GET All Shop Items) --- */}
      <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Item Name & ID</th>
                <th className="p-4">Type & Category</th>
                <th className="p-4">Price / Value</th>
                <th className="p-4">Purchased</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition text-gray-800">
                  {/* Name & ID */}
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <span className="text-xs text-gray-400">ID: {item.id}</span>
                  </td>

                  {/* Type & Category */}
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        item.type === "Top Up"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {item.type}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                  </td>

                  {/* Price / Value */}
                  <td className="p-4 font-medium">
                    {item.type === "Top Up" ? (
                      <div>
                        <div className="text-gray-900 font-semibold">
                          Rp {item.priceRupiah?.toLocaleString("id-ID") ?? "0"}
                        </div>
                        <span className="text-xs text-amber-600 font-medium">
                          +{item.coinValue ?? 0} Coins
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Coins size={14} />
                        <span>{item.priceInCoins ?? 0} Coins</span>
                      </div>
                    )}
                  </td>

                  {/* Purchased */}
                  <td className="p-4 font-medium text-gray-700">
                    {item.totalPurchased} Transaksi
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {item.status === "Active" ? (
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
                      {/* Trigger GET Detail Shop Item */}
                      <button
                        title="Detail Item Shop"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Trigger PUT Update Shop Item */}
                      <button
                        title="Update Item Shop"
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Trigger DEL DELETE Shop Item */}
                      <button
                        title="Delete Item Shop"
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