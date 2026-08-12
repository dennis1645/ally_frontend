import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  Star,
  TrendingUp,
  Video,
  Wallet,
  MessageSquareQuote
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

// ============================================================================
// MOCK DATA
// ============================================================================

// Data Mentee (Dibutuhkan untuk menghitung Active Mentees & Stage)
const allExplorersData = [
  { id: "e1", name: "Ari Chen", stage: "Interview Prep", status: "Active" },
  { id: "e2", name: "Jordan Lee", stage: "University Selection", status: "Active" },
  { id: "e3", name: "Mina Alvarez", stage: "Essay Drafting", status: "Active" },
  { id: "h1", name: "Devon Vance", stage: "Completed", status: "Inactive" },
];

const recentPayouts = [
  { id: "po-1", period: "July 2026 (Batch 2)", amount: "Rp 2.250.000", status: "Paid", date: "01 Aug 2026" },
  { id: "po-2", period: "August 2026 (Batch 1)", amount: "Rp 2.250.000", status: "Processing", date: "Est. 15 Aug 2026" },
];

const menteeReviews = [
  { id: "r1", mentee: "Mina Alvarez", rating: 5, comment: "Kakaknya sangat membantu! Feedback essay-nya detail banget.", date: "10 Aug 2026" },
  { id: "r2", mentee: "Ari Chen", rating: 5, comment: "Sesi interview prep-nya bikin aku makin pede. Thank you!", date: "08 Aug 2026" },
  { id: "r3", mentee: "Jordan Lee", rating: 4, comment: "Bagus, tapi kadang jadwalnya agak susah match sama aku.", date: "02 Aug 2026" },
  { id: "r4", mentee: "Siti Rahma", rating: 5, comment: "Sangat sabar membimbing dari nol buat milih kampus.", date: "25 Jul 2026" },
  { id: "r5", mentee: "Devon Vance", rating: 3, comment: "Sesi berjalan lancar, tapi suaranya agak putus-putus kemarin.", date: "15 Jul 2026" },
];

// Data chart (Jam & Mentee) berdasarkan tahun
const chartDataByYear: Record<string, { month: string; hours: number; mentees: number }[]> = {
  "2026": [
    { month: "Jan", hours: 10, mentees: 2 },
    { month: "Feb", hours: 15, mentees: 3 },
    { month: "Mar", hours: 12, mentees: 2 },
    { month: "Apr", hours: 20, mentees: 4 },
    { month: "May", hours: 18, mentees: 3 },
    { month: "Jun", hours: 25, mentees: 5 },
    { month: "Jul", hours: 30, mentees: 5 },
    { month: "Aug", hours: 14, mentees: 3 }, // Bulan berjalan (Agustus)
  ],
  "2025": [
    { month: "Jan", hours: 5, mentees: 1 },
    { month: "Feb", hours: 8, mentees: 1 },
    { month: "Mar", hours: 10, mentees: 2 },
    { month: "Apr", hours: 15, mentees: 3 },
    { month: "May", hours: 12, mentees: 2 },
    { month: "Jun", hours: 18, mentees: 3 },
    { month: "Jul", hours: 22, mentees: 4 },
    { month: "Aug", hours: 25, mentees: 4 },
    { month: "Sep", hours: 10, mentees: 2 },
    { month: "Oct", hours: 14, mentees: 2 },
    { month: "Nov", hours: 18, mentees: 3 },
    { month: "Dec", hours: 20, mentees: 3 },
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getMentorBadgeText(rating: number): string {
  if (rating >= 4.8) return "Top 10% of Mentors! 🎉";
  if (rating >= 4.5) return "Top Tier Mentor 🌟";
  if (rating >= 4.0) return "Great Performance 👍";
  return "Keep up the good work! 💪";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function MentorDashboardPage() {
  const navigate = useNavigate();

  // State
  const [chartYear, setChartYear] = useState("2026");
  const [filterStar, setFilterStar] = useState<number | null>(null);

  // --- COMPUTED PROPERTIES (LOGIKA DINAMIS) ---

  // 1. Logika Mentee (Menghitung jumlah dan stage)
  const activeMentees = allExplorersData.filter((e) => e.status === "Active");
  const essayCount = activeMentees.filter((e) => e.stage.toLowerCase().includes("essay")).length;
  const interviewCount = activeMentees.filter((e) => e.stage.toLowerCase().includes("interview")).length;
  
  let menteeHelperText = "New explorers assigned";
  if (essayCount > 0 && interviewCount > 0) {
    menteeHelperText = `${essayCount} essay phase, ${interviewCount} interview prep`;
  } else if (essayCount > 0) {
    menteeHelperText = `${essayCount} explorers in essay phase`;
  } else if (interviewCount > 0) {
    menteeHelperText = `${interviewCount} explorers in interview prep`;
  }

  // 2. Logika Rating & Review
  const totalRatingSum = menteeReviews.reduce((sum, r) => sum + r.rating, 0);
  const calculatedAvgRating = menteeReviews.length > 0 ? (totalRatingSum / menteeReviews.length) : 0;
  const ratingBadgeText = getMentorBadgeText(calculatedAvgRating);

  // 3. Logika Jam Mentoring (MTD & YTD)
  const currentYearData = chartDataByYear["2026"];
  const currentMonthData = currentYearData[currentYearData.length - 1]; 
  
  const mtdHours = currentMonthData.hours; // Jam bulan ini
  const ytdHours = currentYearData.reduce((sum, data) => sum + data.hours, 0); // Total jam tahun ini

  // Data Filter
  const currentChartData = chartDataByYear[chartYear];
  const filteredReviews = filterStar 
    ? menteeReviews.filter(r => r.rating === filterStar)
    : menteeReviews;

  return (
    <UserLayout
      title="Mentor Dashboard"
      subtitle="Overview of your performance, schedule, and earnings"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        
        {/* ==============================================================
            1. TOP METRICS (EXECUTIVE SUMMARY)
        ============================================================== */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Aug Earnings</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><Wallet size={18} /></div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">Rp {(mtdHours * 150000).toLocaleString('id-ID')}</p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-xs text-slate-500">Payout Status:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                <Clock size={11} /> Admin Review
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mentoring Hours</span>
              <div className="rounded-xl bg-sky-50 p-2 text-sky-600"><Clock size={18} /></div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-extrabold text-slate-900">{mtdHours} <span className="text-sm font-medium text-slate-500">hrs</span></p>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-lg">This Month (MTD)</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
              Total <strong className="text-slate-800">{ytdHours} h/year</strong> completed (YTD)
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Mentees</span>
              <div className="rounded-xl bg-ally-surface p-2 text-ally-primary"><Calendar size={18} /></div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{activeMentees.length} Explorers</p>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
              {menteeHelperText}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Rating</span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-500"><Star size={18} /></div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-slate-900">{calculatedAvgRating.toFixed(1)}</p>
              <span className="text-xs font-medium text-slate-400">/ 5.0 ({menteeReviews.length} reviews)</span>
            </div>
            <p className="mt-3 text-xs font-medium text-ally-primary border-t border-slate-100 pt-2.5">
              {ratingBadgeText}
            </p>
          </div>
        </div>

        {/* ==============================================================
            2. MIDDLE ROW: URGENT ACTIONS & REVIEWS
        ============================================================== */}
        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          
          {/* URGENT ACTION CENTER */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Action Needed</h3>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">2 Urgent</span>
            </div>

            <div className="space-y-3 flex-1">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 font-bold">
                      <Video size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">Today's Session</p>
                      <p className="font-bold text-slate-900">Mina Alvarez — Career Clarity</p>
                      <p className="text-xs text-slate-500 mt-0.5">11:00 AM WIB (in 2 hours)</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/mentor/availability")} className="rounded-full bg-ally-primary px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-ally-primary/90">Join</button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold">
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Task Pending Approval</p>
                      <p className="font-bold text-slate-900">Mina Alvarez submitted Essay</p>
                      <p className="text-xs text-slate-500 mt-0.5">Awaiting your approval to unlock next milestone</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/mentor/action-plans")} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100">Review</button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link to="/mentor/availability" className="inline-flex items-center gap-2 text-sm font-bold text-ally-primary hover:underline">
                See more schedule & actions <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* MENTEE REVIEWS & RATING */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500">
                <MessageSquareQuote size={20} />
                <h3 className="text-lg font-bold text-slate-900">Mentee Feedback</h3>
              </div>
            </div>

            {/* Star Filter */}
            <div className="mb-4 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500 px-2">Filter:</span>
              <button 
                onClick={() => setFilterStar(null)} 
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${filterStar === null ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map(star => (
                <button 
                  key={star} 
                  onClick={() => setFilterStar(star)}
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors ${filterStar === star ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-amber-50'}`}
                >
                  {star} <Star size={12} className={filterStar === star ? 'fill-amber-500 text-amber-500' : 'fill-slate-400 text-slate-400'} />
                </button>
              ))}
            </div>

            {/* Comments List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
              {filteredReviews.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No reviews found for this rating.</p>
              ) : (
                filteredReviews.map(review => (
                  <div key={review.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{review.mentee}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{review.date}</span>
                    </div>
                    <div className="flex text-amber-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-amber-400" : "fill-slate-200 text-slate-200"} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ==============================================================
            3. BOTTOM ROW: CHART & PAYOUTS
        ============================================================== */}
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1.4fr]">
          
          {/* MENTORING HOURS & MENTEES CHART */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-ally-primary" />
                <h3 className="text-lg font-bold text-slate-900">Mentoring Analytics</h3>
              </div>
              
              {/* Year Filter */}
              <select 
                value={chartYear} 
                onChange={(e) => setChartYear(e.target.value)}
                className="appearance-none rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-bold text-slate-700 outline-none transition focus:border-ally-primary cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
            
            <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-4">
              Overview of total mentoring hours and mentees handled per month.
            </p>

            {/* Custom CSS Bar Chart */}
            <div className="flex h-48 items-end justify-between gap-2 px-2 mt-4">
              {currentChartData.map((data, idx) => {
                const maxHoursHeight = 140; // px
                const hourHeight = (data.hours / 35) * maxHoursHeight; // Scale relative to 35 max hours
                
                return (
                  <div key={idx} className="flex flex-1 flex-col items-center justify-end gap-2 group relative">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {data.hours} hrs | {data.mentees} mentees
                    </div>

                    <div className="flex items-end gap-1 w-full justify-center">
                      {/* Hours Bar (Blue) */}
                      <div
                        style={{ height: `${hourHeight}px` }}
                        className="w-1/2 max-w-[16px] rounded-t-md bg-ally-primary/80 transition-all group-hover:bg-ally-primary"
                      />
                      {/* Mentees Indicator Bar (Green) */}
                      <div
                        style={{ height: `${data.mentees * 8}px` }} // scale mentees indicator
                        className="w-1/3 max-w-[8px] rounded-t-md bg-emerald-400 transition-all"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{data.month}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ally-primary block"></span> Mentoring Hours</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 block"></span> Total Mentees</span>
            </div>
          </div>

          {/* ADMIN DISBURSEMENT HISTORY */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Payout History</h3>
              <p className="text-xs text-slate-500 mt-1">Track disbursements from admin.</p>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-2">Period</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-2">
                        <p className="font-bold text-slate-900">{payout.period}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{payout.date}</p>
                      </td>
                      <td className="py-3.5 px-2 font-bold text-slate-900">{payout.amount}</td>
                      <td className="py-3.5 px-2 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            payout.status === "Paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {payout.status === "Paid" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button className="text-sm font-bold text-ally-primary hover:underline w-full text-center">
                Download Invoice Statement
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* CSS untuk Scrollbar Custom di Reviews */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </UserLayout>
  );
}