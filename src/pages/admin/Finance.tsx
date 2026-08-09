import { 
  Calendar, ArrowDownRight, ArrowUpRight, DollarSign, 
  TrendingDown, TrendingUp, Wallet, FileText, Layers,
  Building2, Receipt
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, LabelList 
} from "recharts";
import Card from "../../components/ui/Card";
import PrimaryButton from "../../components/ui/PrimaryButton";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

// --- DYNAMIC MOCK DATA ---
const mockDataMap = {
  MTD: [
    { period: "Week 1", revenue: 400000 },
    { period: "Week 2", revenue: 750000 },
    { period: "Week 3", revenue: 600000 },
    { period: "Week 4", revenue: 1200000 },
  ],
  YTD: [
    { period: "Jan", revenue: 4500000 },
    { period: "Feb", revenue: 5200000 },
    { period: "Mar", revenue: 4800000 },
    { period: "Apr", revenue: 6100000 },
    { period: "May", revenue: 5900000 },
    { period: "Jun", revenue: 7200000 },
    { period: "Jul", revenue: 8000000 },
    { period: "Aug", revenue: 2950000 },
  ],
  LAST_MONTH: [
    { period: "Week 1", revenue: 550000 },
    { period: "Week 2", revenue: 600000 },
    { period: "Week 3", revenue: 800000 },
    { period: "Week 4", revenue: 950000 },
  ]
};

const compositionData = [
  { name: "Medium", value: 650000 },
  { name: "Premium", value: 1200000 },
  { name: "Token", value: 450000 },
];

export default function FinancePage() {
  // Filter & Toggle States
  const [period, setPeriod] = useState<"MTD" | "YTD" | "LAST_MONTH">("MTD"); 
  const [showBalance, setShowBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<"Inflows" | "Debits">("Inflows");

  const currentTrendData = useMemo(() => mockDataMap[period], [period]);

  // --- LOGIKA ANGKA ---
  const grossRevenue = 2300000;
  const grossGrowth = 5.2; 
  
  const totalPayoutLiability = 3300000; 
  
  const netProfit = grossRevenue - totalPayoutLiability; 
  const netProfitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const netGrowth = -12.4; 

  // --- FORMATTER ---
  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;
  
  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <UserLayout 
      title="Finance Overview" 
      subtitle="TRACK CASH FLOW, REVENUE STREAMS, AND MENTOR PAYOUTS"
      sidebarItems={adminSidebarItems} 
      topbarProps={{ showSearch: false }}
    >
      <section className="bg-slate-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER ACTION BUTTONS & FILTER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                  <Calendar size={16} className="text-slate-500" />
                  <select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="MTD">Month-to-Date (MTD)</option>
                    <option value="YTD">Year-to-Date (YTD)</option>
                    <option value="LAST_MONTH">Last Month</option>
                  </select>
               </div>
               <PrimaryButton size="md">Export Report</PrimaryButton>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card padding="md" className="flex flex-col border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
                <div className="p-1.5 bg-emerald-50 rounded-md"><DollarSign size={16} className="text-emerald-600"/></div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatIDR(grossRevenue)}</div>
              <div className="mt-2 flex items-center text-xs font-medium text-emerald-600">
                 <ArrowUpRight size={14} className="mr-1"/> {grossGrowth}% vs prev period
              </div>
            </Card>

            <Card padding="md" className="flex flex-col border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Profit</span>
                <div className={`p-1.5 rounded-md ${netProfit < 0 ? 'bg-rose-50' : 'bg-blue-50'}`}>
                  <Wallet size={16} className={netProfit < 0 ? 'text-rose-600' : 'text-blue-600'}/>
                </div>
              </div>
              <div className={`text-2xl font-bold ${netProfit < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatIDR(netProfit)}
              </div>
              <div className={`mt-2 flex items-center text-xs font-medium ${netGrowth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {netGrowth > 0 ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>} 
                 {Math.abs(netGrowth)}% vs prev period
              </div>
            </Card>

            <Card padding="md" className="flex flex-col border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Margin</span>
                <div className={`p-1.5 rounded-md ${netProfitMargin < 0 ? 'bg-rose-50' : 'bg-purple-50'}`}>
                  {netProfitMargin < 0 ? <TrendingDown size={16} className="text-rose-600"/> : <TrendingUp size={16} className="text-purple-600"/>}
                </div>
              </div>
              <div className={`text-2xl font-bold ${netProfitMargin < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {netProfitMargin.toFixed(1)}%
              </div>
              <div className="mt-2 text-xs text-slate-400">Target &gt; 40%</div>
            </Card>

            <Card padding="md" className="flex flex-col border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Next Payout</span>
                <div className="p-1.5 bg-amber-50 rounded-md"><FileText size={16} className="text-amber-600"/></div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatIDR(totalPayoutLiability)}</div>
              <div className="mt-2 text-xs text-slate-400">Due on 25th this month</div>
            </Card>
          </div>

          {/* BALANCE SHEET TOGGLE */}
          <div className="mb-6 flex justify-end">
             <button 
                onClick={() => setShowBalance(!showBalance)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition"
             >
                <Layers size={16} className="text-slate-500" />
                {showBalance ? "Hide Balance Sheet" : "View Balance Sheet"}
             </button>
          </div>

          {/* WORKING CAPITAL */}
          {showBalance && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
               <Card padding="md" className="border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Building2 size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-800">Current Assets</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Cash on Hand</span>
                       <span className="font-semibold text-slate-700">Rp 5.000.000</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">AR (Payment Gateway)</span>
                       <span className="font-semibold text-slate-700">Rp 500.000</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-bold text-emerald-600 border-t border-slate-100 mt-4 pt-3">
                     <span>Total Assets</span>
                     <span>Rp 5.500.000</span>
                  </div>
               </Card>

               <Card padding="md" className="border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Receipt size={18} className="text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-800">Current Liabilities</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Mentor Payouts</span>
                       <span className="font-semibold text-slate-700">Rp 3.300.000</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">Taxes Payable</span>
                       <span className="font-semibold text-slate-700">Rp 50.000</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-bold text-rose-600 border-t border-slate-100 mt-4 pt-3">
                     <span>Total Liabilities</span>
                     <span>Rp 3.350.000</span>
                  </div>
               </Card>
             </div>
          )}

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card title={`Revenue Trend (${period})`} padding="md">
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart key={period} data={currentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="period" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis fontSize={11} tickFormatter={formatCompact} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(val: any) => formatIDR(Number(val))} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Product Composition" padding="md">
              <div className="h-56 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compositionData} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis fontSize={11} tickFormatter={formatCompact} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(val: any) => formatIDR(Number(val))} cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} barSize={40}>
                       <LabelList dataKey="value" position="top" formatter={formatCompact} fontSize={11} fill="#64748b" fontWeight="bold" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* TABLE: LEDGER */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                <button onClick={() => setActiveTab("Inflows")} className={`text-sm font-bold pb-1 ${activeTab === 'Inflows' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400'}`}>Credit Inflows</button>
                <button onClick={() => setActiveTab("Debits")} className={`text-sm font-bold pb-1 ${activeTab === 'Debits' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400'}`}>Debit Outflows</button>
             </div>
             
             {activeTab === "Inflows" ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-white text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100">
                     <tr>
                        <th className="p-4 font-semibold">Date & Time</th>
                        <th className="p-4 font-semibold">User / Email</th>
                        <th className="p-4 font-semibold">Product Purchased</th>
                        <th className="p-4 font-semibold">Payment Method</th>
                        <th className="p-4 font-semibold text-right">Net Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 text-slate-700">
                     <tr className="hover:bg-slate-50">
                        <td className="p-4"><div className="font-medium">Aug 09, 2026</div><div className="text-xs text-slate-400">14:32 WIB</div></td>
                        <td className="p-4"><div className="font-medium text-slate-900">Sarah Jenkins</div><div className="text-xs text-slate-400">sarah@email.com</div></td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">Premium (1yr)</span></td>
                        <td className="p-4 text-slate-500 text-xs">Credit Card (Stripe)</td>
                        <td className="p-4 font-bold text-slate-900 text-right">{formatIDR(1200000)}</td>
                     </tr>
                     <tr className="hover:bg-slate-50">
                        <td className="p-4"><div className="font-medium">Aug 08, 2026</div><div className="text-xs text-slate-400">09:15 WIB</div></td>
                        <td className="p-4"><div className="font-medium text-slate-900">Dimas Anggara</div><div className="text-xs text-slate-400">dimas@email.com</div></td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">Token Add-on</span></td>
                        <td className="p-4 text-slate-500 text-xs">OVO (Midtrans)</td>
                        <td className="p-4 font-bold text-slate-900 text-right">{formatIDR(150000)}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="overflow-x-auto animate-in fade-in duration-300">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-white text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100">
                     <tr>
                        <th className="p-4 font-semibold">Transfer Date</th>
                        <th className="p-4 font-semibold">Recipient (Mentor)</th>
                        <th className="p-4 font-semibold">Bank Detail</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Amount Payout</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 text-slate-700">
                     <tr className="hover:bg-slate-50">
                        <td className="p-4"><div className="font-medium">Jul 25, 2026</div><div className="text-xs text-slate-400">Batch Transfer</div></td>
                        <td className="p-4"><div className="font-medium text-slate-900">Dr. Ahmad Fauzi</div><div className="text-xs text-slate-400">15 Active Mentees</div></td>
                        <td className="p-4 text-slate-500 text-xs font-mono">BCA - 12345678</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-100">Success</span></td>
                        <td className="p-4 font-bold text-slate-900 text-right">{formatIDR(1500000)}</td>
                     </tr>
                     <tr className="hover:bg-slate-50">
                        <td className="p-4"><div className="font-medium">Jul 25, 2026</div><div className="text-xs text-slate-400">Batch Transfer</div></td>
                        <td className="p-4"><div className="font-medium text-slate-900">Prof. Maria Wijaya</div><div className="text-xs text-slate-400">10 Active Mentees</div></td>
                        <td className="p-4 text-slate-500 text-xs font-mono">Mandiri - 87654321</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium border border-amber-100">Pending</span></td>
                        <td className="p-4 font-bold text-slate-900 text-right">{formatIDR(1000000)}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             )}
          </div>

        </div>
      </section>
    </UserLayout>
  );
}