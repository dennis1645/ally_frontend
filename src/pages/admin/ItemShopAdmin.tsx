import { 
  Award, Users, Plus, Edit2, Trash2, Search, 
  Store, Coins, ShoppingBag, TrendingUp, X, Gift, Ticket, Banknote
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList 
} from "recharts";
import Card from "../../components/ui/Card";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

// --- MASTER DATA BADGES ---
interface BadgeItem {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
  category: "Preparation" | "Document" | "Application" | "Milestone";
  unlockCriteria: string;
  unlockedCount: number;
  status: "Active" | "Inactive";
}

const INITIAL_BADGES: BadgeItem[] = [
  { id: "BDG-01", name: "Profile Completed", description: "Menyelesaikan profil dan verifikasi berkas.", iconEmoji: "✅", category: "Preparation", unlockCriteria: "Selesaikan 100% Profil", unlockedCount: 3100, status: "Active" },
  { id: "BDG-02", name: "First Draft Done", description: "Menyelesaikan draft Motivation Letter.", iconEmoji: "✍️", category: "Document", unlockCriteria: "Upload 1x Essay", unlockedCount: 840, status: "Active" },
  { id: "BDG-03", name: "University Applied", description: "Mendaftar secara resmi ke kampus.", iconEmoji: "🎓", category: "Application", unlockCriteria: "Update Target Univ", unlockedCount: 420, status: "Active" },
];

// --- MASTER DATA SHOP (TOKEN PACKAGES & REWARDS) ---
interface ShopItem {
  id: string;
  name: string;
  type: "Token Package" | "Reward Service";
  itemCategory: "General / Top Up" | "Mentoring Session" | "Document Review" | "Digital Perk";
  priceRupiah?: number; 
  tokenGiven?: number;  
  costInTokens?: number; 
  totalTransactions: number; 
  status: "Active" | "Inactive";
}

const INITIAL_SHOP: ShopItem[] = [
  // Paket Beli Token (Pakai Rupiah)
  { id: "PKG-01", name: "Basic Token (1 Token)", type: "Token Package", itemCategory: "General / Top Up", priceRupiah: 5000, tokenGiven: 1, totalTransactions: 1540, status: "Active" },
  { id: "PKG-02", name: "Value Token (3 Tokens)", type: "Token Package", itemCategory: "General / Top Up", priceRupiah: 10000, tokenGiven: 3, totalTransactions: 2100, status: "Active" },
  { id: "PKG-03", name: "Pro Token (20 Tokens)", type: "Token Package", itemCategory: "General / Top Up", priceRupiah: 50000, tokenGiven: 20, totalTransactions: 420, status: "Active" },
  
  // Reward Services (Tukar pakai Token) - Diperbanyak transaksinya biar keliatan efek 'k' nya
  { id: "RWD-01", name: "1x Mentoring Session (Any Topic)", type: "Reward Service", itemCategory: "Mentoring Session", costInTokens: 5, totalTransactions: 850, status: "Active" },
  { id: "RWD-02", name: "Express Document Review", type: "Reward Service", itemCategory: "Document Review", costInTokens: 3, totalTransactions: 430, status: "Active" },
  { id: "RWD-03", name: "Premium IELTS Tryout", type: "Reward Service", itemCategory: "Digital Perk", costInTokens: 10, totalTransactions: 1120, status: "Active" },
];

// --- FORMATTER ANGKA UNTUK CHART (Misal: 12000 -> 12k) ---
const formatCompact = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
};

export default function GamificationEconomyAdmin() {
  const [activeTab, setActiveTab] = useState<"Badges" | "Shop">("Badges");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const [badges, setBadges] = useState<BadgeItem[]>(INITIAL_BADGES);
  const [shopItems, setShopItems] = useState<ShopItem[]>(INITIAL_SHOP);

  // Modal States
  const [isAddingBadge, setIsAddingBadge] = useState(false);
  const [isAddingShop, setIsAddingShop] = useState(false);
  
  const [newBadge, setNewBadge] = useState<Partial<BadgeItem>>({ category: "Preparation", iconEmoji: "🏆", status: "Active" });
  const [newShop, setNewShop] = useState<Partial<ShopItem>>({ type: "Token Package", itemCategory: "General / Top Up", status: "Active" });
  
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [editingShop, setEditingShop] = useState<ShopItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: "Badge" | "Shop" } | null>(null);

  // --- KPI CALCULATIONS ---
  const mostClaimedReward = useMemo(() => {
    const rewards = shopItems.filter(i => i.type === "Reward Service");
    return [...rewards].sort((a, b) => b.totalTransactions - a.totalTransactions)[0];
  }, [shopItems]);

  const tokenEconomyStats = useMemo(() => {
    return shopItems
      .filter(i => i.type === "Token Package")
      .reduce((acc, curr) => ({
         revenue: acc.revenue + ((curr.priceRupiah || 0) * curr.totalTransactions),
         tokens: acc.tokens + ((curr.tokenGiven || 0) * curr.totalTransactions)
      }), { revenue: 0, tokens: 0 });
  }, [shopItems]);

  const topUnlockedBadge = useMemo(() => {
    return [...badges].sort((a, b) => b.unlockedCount - a.unlockedCount)[0];
  }, [badges]);

  const totalBadgesUnlocked = useMemo(() => {
    return badges.reduce((acc, curr) => acc + curr.unlockedCount, 0);
  }, [badges]);

  // --- CHART DATA ---
  const serviceDemandChartData = useMemo(() => {
    return shopItems
      .filter(i => i.type === "Reward Service")
      .map(item => ({
        service: item.name,
        tokensBurned: (item.costInTokens || 0) * item.totalTransactions
      }))
      .sort((a, b) => b.tokensBurned - a.tokensBurned);
  }, [shopItems]);

  // --- FILTER LOGIC ---
  const filteredBadges = useMemo(() => badges.filter(bdg => {
    const matchSearch = bdg.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "All" || bdg.category === filterCategory;
    return matchSearch && matchCat;
  }), [badges, searchQuery, filterCategory]);

  const filteredShop = useMemo(() => shopItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "All" || item.type === filterType;
    return matchSearch && matchType;
  }), [shopItems, searchQuery, filterType]);

  // --- ACTIONS ---
  const handleAddBadgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToAdd: BadgeItem = {
      id: `BDG-${Date.now()}`,
      name: newBadge.name || "", description: newBadge.description || "",
      iconEmoji: newBadge.iconEmoji || "🏆", category: newBadge.category as any,
      unlockCriteria: newBadge.unlockCriteria || "", unlockedCount: 0, status: "Active"
    };
    setBadges([itemToAdd, ...badges]);
    setIsAddingBadge(false);
    setNewBadge({ category: "Preparation", iconEmoji: "🏆", status: "Active" });
  };

  const handleAddShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToAdd: ShopItem = {
      id: newShop.type === "Token Package" ? `PKG-${Date.now()}` : `RWD-${Date.now()}`,
      name: newShop.name || "",
      type: newShop.type as any,
      itemCategory: newShop.itemCategory as any,
      priceRupiah: newShop.type === "Token Package" ? newShop.priceRupiah : undefined,
      tokenGiven: newShop.type === "Token Package" ? newShop.tokenGiven : undefined,
      costInTokens: newShop.type === "Reward Service" ? newShop.costInTokens : undefined,
      totalTransactions: 0, status: "Active"
    };
    setShopItems([itemToAdd, ...shopItems]);
    setIsAddingShop(false);
    setNewShop({ type: "Token Package", itemCategory: "General / Top Up", status: "Active" });
  };

  const handleSaveBadgeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge) return;
    setBadges(prev => prev.map(b => b.id === editingBadge.id ? editingBadge : b));
    setEditingBadge(null);
  };

  const handleSaveShopEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;
    setShopItems(prev => prev.map(s => s.id === editingShop.id ? editingShop : s));
    setEditingShop(null);
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "Badge") {
      setBadges(prev => prev.filter(b => b.id !== deleteConfirm.id));
    } else {
      setShopItems(prev => prev.filter(s => s.id !== deleteConfirm.id));
    }
    setDeleteConfirm(null);
  };

  return (
    <UserLayout 
      title="Rewards Hub" 
      subtitle="MANAGE MENTEE BADGES, TOKEN ECONOMY, AND SERVICE REWARDS"
      sidebarItems={adminSidebarItems} 
      topbarProps={{ showSearch: false }}
    >
      <section className="bg-slate-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER ACTION BUTTONS */}
          <div className="mb-6 flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3">
            <button onClick={() => setIsAddingShop(true)} className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
              <Ticket size={15} /><span>Add Token/Reward</span>
            </button>
            <button onClick={() => setIsAddingBadge(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
              <Award size={15} /><span>Create Badge</span>
            </button>
          </div>

          {/* 4 IMPACTFUL DECISION-MAKING CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div className="w-[80%]">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Claimed Reward</span>
                  <div className="text-lg font-bold text-slate-900 mt-1 leading-tight line-clamp-2">{mostClaimedReward?.name || "N/A"}</div>
                  <span className="text-xs text-amber-600 font-semibold mt-1 block">{mostClaimedReward?.totalTransactions.toLocaleString("id-ID")} Redemptions</span>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Gift size={20} /></div>
              </div>
            </Card>

            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div className="w-[80%]">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue (IDR)</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {tokenEconomyStats.revenue >= 1000000 ? `Rp ${(tokenEconomyStats.revenue / 1000000).toFixed(1)}M` : `Rp ${tokenEconomyStats.revenue.toLocaleString("id-ID")}`}
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                    {tokenEconomyStats.tokens.toLocaleString("id-ID")} Tokens Generated
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><Banknote size={20} /></div>
              </div>
            </Card>

            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div className="w-[80%]">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Earned Badge</span>
                  <div className="text-lg font-bold text-slate-900 mt-1 leading-tight line-clamp-2">{topUnlockedBadge?.iconEmoji} {topUnlockedBadge?.name}</div>
                  <span className="text-xs text-blue-600 font-semibold mt-1 block">{topUnlockedBadge?.unlockedCount.toLocaleString("id-ID")} Achieved</span>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Award size={20} /></div>
              </div>
            </Card>

            <Card padding="md" className="min-h-[140px] flex flex-col justify-between border border-slate-100 shadow-sm relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Badges Unlocked</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{totalBadgesUnlocked.toLocaleString("id-ID")}</div>
                  <span className="text-xs text-indigo-600 font-medium mt-1 block">Platform-wide engagement</span>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Users size={20} /></div>
              </div>
            </Card>
          </div>

          {/* CHART: DEMAND TOKENS BY MENTOR SERVICE (K, M Formatter Added) */}
          <Card padding="md" className="border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Reward Service Demand (Tokens Burned)</h3>
              </div>
              <span className="text-xs text-slate-400">Services draining the most mentee tokens</span>
            </div>
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceDemandChartData} margin={{ top: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  {/* YAxis formatter added here */}
                  <XAxis dataKey="service" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(val: number) => [`${val.toLocaleString("id-ID")} Tokens Burned`, 'Usage']} />
                  <Bar dataKey="tokensBurned" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40}>
                    {/* LabelList formatter added here */}
                    <LabelList dataKey="tokensBurned" position="top" fontSize={11} fill="#64748b" fontWeight="bold" formatter={formatCompact} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* TABS SWITCHER */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex gap-2">
                <button onClick={() => setActiveTab("Badges")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'Badges' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Award size={14}/> Badges ({badges.length})
                </button>
                <button onClick={() => setActiveTab("Shop")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'Shop' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Store size={14}/> Token Shop ({shopItems.length})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder={`Search ${activeTab.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500" />
                </div>
                
                {activeTab === "Badges" ? (
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer">
                    <option value="All">All Categories</option>
                    <option value="Preparation">Preparation</option>
                    <option value="Document">Document</option>
                    <option value="Application">Application</option>
                    <option value="Milestone">Milestone</option>
                  </select>
                ) : (
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer">
                    <option value="All">All Types</option>
                    <option value="Token Package">Token Packages (Top Up)</option>
                    <option value="Reward Service">Reward Services</option>
                  </select>
                )}
              </div>
            </div>

            {/* TAB CONTENT: BADGES */}
            {activeTab === "Badges" && (
              <div className="overflow-x-auto animate-in fade-in duration-300">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Badge Detail</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Unlock Criteria</th>
                      <th className="p-4 text-center">Mentee Unlocked</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredBadges.map((bdg) => (
                      <tr key={bdg.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl p-2 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">{bdg.iconEmoji}</div>
                            <div>
                              <div className="font-bold text-slate-900">{bdg.name}</div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">{bdg.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                            {bdg.category}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-600">
                          {bdg.unlockCriteria}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-900">{bdg.unlockedCount.toLocaleString("id-ID")}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${bdg.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{bdg.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingBadge(bdg)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                            <button onClick={() => setDeleteConfirm({ id: bdg.id, type: "Badge" })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: TOKENS & SHOP ITEMS */}
            {activeTab === "Shop" && (
              <div className="overflow-x-auto animate-in fade-in duration-300">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Item Type</th>
                      <th className="p-4">Price / Cost</th>
                      <th className="p-4">Value (Tokens)</th>
                      <th className="p-4 text-center">Transactions</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredShop.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide
                            ${item.type === 'Token Package' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4 font-medium">
                          {item.type === "Token Package" ? (
                            <div className="text-slate-900 font-bold">Rp {item.priceRupiah?.toLocaleString("id-ID")}</div>
                          ) : (
                            <div className="flex items-center gap-1 text-indigo-600 font-bold"><Coins size={14}/> {item.costInTokens} Tokens</div>
                          )}
                        </td>
                        <td className="p-4">
                          {item.type === "Token Package" ? (
                             <span className="text-xs text-amber-600 font-bold flex items-center gap-1"><Coins size={12}/> +{item.tokenGiven} Tokens</span>
                          ) : (
                             <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold text-slate-900">{item.totalTransactions.toLocaleString("id-ID")} x</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingShop(item)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 size={16}/></button>
                            <button onClick={() => setDeleteConfirm({ id: item.id, type: "Shop" })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- MODAL: CREATE BADGE --- */}
      {isAddingBadge && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setIsAddingBadge(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Badge</h3>
            <form onSubmit={handleAddBadgeSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emoji Icon</label>
                  <input type="text" value={newBadge.iconEmoji || "🏆"} onChange={(e) => setNewBadge({...newBadge, iconEmoji: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-center text-xl bg-white" required />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Name</label>
                  <input type="text" value={newBadge.name || ""} onChange={(e) => setNewBadge({...newBadge, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="e.g. Profile Completed" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea rows={2} value={newBadge.description || ""} onChange={(e) => setNewBadge({...newBadge, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="Brief description of this achievement..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={newBadge.category} onChange={(e) => setNewBadge({...newBadge, category: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Preparation">Preparation</option><option value="Document">Document</option><option value="Application">Application</option><option value="Milestone">Milestone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={newBadge.status} onChange={(e) => setNewBadge({...newBadge, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unlock Criteria</label>
                <input type="text" value={newBadge.unlockCriteria || ""} onChange={(e) => setNewBadge({...newBadge, unlockCriteria: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="e.g. Selesaikan Profil 100%" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsAddingBadge(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">Save Badge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT BADGE --- */}
      {editingBadge && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setEditingBadge(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Badge</h3>
            <form onSubmit={handleSaveBadgeEdit} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emoji Icon</label>
                  <input type="text" value={editingBadge.iconEmoji} onChange={(e) => setEditingBadge({...editingBadge, iconEmoji: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-center text-xl bg-white" required />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Name</label>
                  <input type="text" value={editingBadge.name} onChange={(e) => setEditingBadge({...editingBadge, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea rows={2} value={editingBadge.description} onChange={(e) => setEditingBadge({...editingBadge, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={editingBadge.category} onChange={(e) => setEditingBadge({...editingBadge, category: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Preparation">Preparation</option><option value="Document">Document</option><option value="Application">Application</option><option value="Milestone">Milestone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={editingBadge.status} onChange={(e) => setEditingBadge({...editingBadge, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unlock Criteria</label>
                <input type="text" value={editingBadge.unlockCriteria} onChange={(e) => setEditingBadge({...editingBadge, unlockCriteria: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setEditingBadge(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">Update Badge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE SHOP / SERVICE TOKEN --- */}
      {isAddingShop && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setIsAddingShop(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Token Package / Reward</h3>
            <form onSubmit={handleAddShopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name</label>
                <input type="text" value={newShop.name || ""} onChange={(e) => setNewShop({...newShop, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="e.g. Basic Token / Essay Review" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Item Type</label>
                  <select value={newShop.type} onChange={(e) => setNewShop({...newShop, type: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Token Package">Token Package (Top Up)</option>
                    <option value="Reward Service">Reward Service (Service)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={newShop.itemCategory} onChange={(e) => setNewShop({...newShop, itemCategory: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="General / Top Up">General / Top Up</option>
                    <option value="Mentoring Session">Mentoring Session</option>
                    <option value="Document Review">Document Review</option>
                    <option value="Digital Perk">Digital Perk</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Price Fields */}
              {newShop.type === "Token Package" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Price (IDR)</label>
                    <input type="number" min={0} value={newShop.priceRupiah || ""} onChange={(e) => setNewShop({...newShop, priceRupiah: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="5000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tokens Granted</label>
                    <input type="number" min={1} value={newShop.tokenGiven || ""} onChange={(e) => setNewShop({...newShop, tokenGiven: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="1" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost (In Tokens)</label>
                  <input type="number" min={1} value={newShop.costInTokens || ""} onChange={(e) => setNewShop({...newShop, costInTokens: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="2" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsAddingShop(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT SHOP ITEM --- */}
      {editingShop && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setEditingShop(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Token Package / Reward</h3>
            <form onSubmit={handleSaveShopEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name</label>
                <input type="text" value={editingShop.name} onChange={(e) => setEditingShop({...editingShop, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Item Type</label>
                  <select value={editingShop.type} onChange={(e) => setEditingShop({...editingShop, type: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Token Package">Token Package (Top Up)</option>
                    <option value="Reward Service">Reward Service (Service)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={editingShop.itemCategory} onChange={(e) => setEditingShop({...editingShop, itemCategory: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="General / Top Up">General / Top Up</option>
                    <option value="Mentoring Session">Mentoring Session</option>
                    <option value="Document Review">Document Review</option>
                    <option value="Digital Perk">Digital Perk</option>
                  </select>
                </div>
              </div>

              {editingShop.type === "Token Package" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Price (IDR)</label>
                    <input type="number" min={0} value={editingShop.priceRupiah || 0} onChange={(e) => setEditingShop({...editingShop, priceRupiah: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tokens Granted</label>
                    <input type="number" min={1} value={editingShop.tokenGiven || 0} onChange={(e) => setEditingShop({...editingShop, tokenGiven: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost (In Tokens)</label>
                  <input type="number" min={1} value={editingShop.costInTokens || 0} onChange={(e) => setEditingShop({...editingShop, costInTokens: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={() => setEditingShop(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm">Update Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP DELETE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-rose-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Data?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently delete this {deleteConfirm.type.toLowerCase()}? This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                 <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancel</button>
                 <button onClick={executeDelete} className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg text-sm shadow-sm">Yes, Delete</button>
              </div>
           </div>
        </div>
      )}

    </UserLayout>
  );
}