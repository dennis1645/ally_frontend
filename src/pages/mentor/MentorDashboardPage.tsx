import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  Star,
  Video,
  Wallet,
  MessageSquareQuote,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorDashboardStatsApi,
  getMentorInvoicesApi,
  type MentorDashboardStats,
  type MentorInvoiceItem,
} from "../../api/mentorApi";

export default function MentorDashboardPage() {
  const navigate = useNavigate();

  // State API Data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<MentorDashboardStats | null>(null);
  const [invoicesHistory, setInvoicesHistory] = useState<MentorInvoiceItem[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);



  // Fetch Dashboard & Invoices Data from Backend
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [statsRes, invoicesRes] = await Promise.allSettled([
          getMentorDashboardStatsApi(),
          getMentorInvoicesApi(),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          setDashboardData(statsRes.value.data);
        }

        if (invoicesRes.status === "fulfilled" && invoicesRes.value?.data) {
          setInvoicesHistory(invoicesRes.value.data.history || []);
          setCurrentBalance(invoicesRes.value.data.current_earning_balance || 0);
        }
      } catch (err: unknown) {
        console.error("Failed to load mentor dashboard data", err);
        setError(
          err instanceof Error ? err.message : "Gagal memuat data dashboard mentor."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = dashboardData?.statistics || {
    total_mentees: 0,
    completed_sessions: 0,
    upcoming_sessions: 0,
    earning_balance: currentBalance || 0,
  };

  const upcomingSchedules = dashboardData?.upcoming_schedules || [];

  return (
    <UserLayout
      title="Mentor Dashboard"
      subtitle="Overview of your performance, schedule, and earnings"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-ally-primary" />
            <span className="ml-3 text-sm font-semibold text-slate-600">
              Memuat data mentor...
            </span>
          </div>
        ) : error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : null}

        {/* ==============================================================
            1. TOP METRICS (EXECUTIVE SUMMARY)
        ============================================================== */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Earning Balance
              </span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Wallet size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              Rp {(stats.earning_balance || currentBalance).toLocaleString("id-ID")}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-xs text-slate-500">Wallet Balance</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={11} /> Active
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Completed Sessions
              </span>
              <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-extrabold text-slate-900">
                {stats.completed_sessions}{" "}
                <span className="text-sm font-medium text-slate-500">sessions</span>
              </p>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-lg">
                Total Done
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
              Successfully completed mentoring sessions
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Mentees
              </span>
              <div className="rounded-xl bg-ally-surface p-2 text-ally-primary">
                <Calendar size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {stats.total_mentees} Mentees
            </p>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
              Assigned via AI matching & bookings
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Upcoming Sessions
              </span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-500">
                <Star size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-slate-900">
                {stats.upcoming_sessions}
              </p>
              <span className="text-xs font-medium text-slate-400">Scheduled</span>
            </div>
            <p className="mt-3 text-xs font-medium text-ally-primary border-t border-slate-100 pt-2.5">
              Ready for consultation
            </p>
          </div>
        </div>

        {/* ==============================================================
            2. MIDDLE ROW: UPCOMING SCHEDULES & ACTIONS
        ============================================================== */}
        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          {/* UPCOMING SCHEDULES */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Upcoming Schedules</h3>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                {upcomingSchedules.length} Sessions
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {upcomingSchedules.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  Tidak ada jadwal sesi mendatang saat ini.
                </div>
              ) : (
                upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 font-bold">
                          <Video size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                            Status: {schedule.session_status}
                          </p>
                          <p className="font-bold text-slate-900">
                            {schedule.mentee?.name || "Mentee"} ({schedule.mentee?.email || "-"})
                          </p>
                          {schedule.meeting_link ? (
                            <a
                              href={schedule.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-ally-primary underline mt-0.5 block truncate max-w-xs"
                            >
                              {schedule.meeting_link}
                            </a>
                          ) : (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Link meeting belum diatur
                            </p>
                          )}
                        </div>
                      </div>

                      {schedule.meeting_link ? (
                        <a
                          href={schedule.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-ally-primary px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-ally-primary/90"
                        >
                          Join
                        </a>
                      ) : (
                        <button
                          onClick={() => navigate(`/mentor/dossier?bookingId=${schedule.id}`)}
                          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          Detail
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                to="/mentor/availability"
                className="inline-flex items-center gap-2 text-sm font-bold text-ally-primary hover:underline"
              >
                Kelola slot ketersediaan & jadwal <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* QUICK LINKS & FEEDBACK OVERVIEW */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500">
                <MessageSquareQuote size={20} />
                <h3 className="text-lg font-bold text-slate-900">Quick Portal Actions</h3>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <Link
                to="/mentor/mentees"
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Direct Mentee Management</p>
                    <p className="text-xs text-slate-500">Lihat progress, tugas, dan readiness score mentee</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-400" />
              </Link>

              <Link
                to="/mentor/action-plans"
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Task Audit Queue</p>
                    <p className="text-xs text-slate-500">Audit submission tugas dan berikan feedback / XP</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-400" />
              </Link>

              <Link
                to="/mentor/documents"
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Shared Documents</p>
                    <p className="text-xs text-slate-500">Kelola dan unggah dokumen referensi mentor</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* ==============================================================
            3. BOTTOM ROW: PAYOUT / INVOICES HISTORY
        ============================================================== */}
        <div className="grid gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Invoices & Pendapatan Mentor</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Daftar transaksi fee konsultasi yang diselesaikan.
                </p>
              </div>
              <span className="text-sm font-extrabold text-emerald-600">
                Saldo: Rp {(currentBalance || stats.earning_balance).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-2">Invoice ID</th>
                    <th className="py-3 px-2">Mentee</th>
                    <th className="py-3 px-2">Tanggal</th>
                    <th className="py-3 px-2">Slot Waktu</th>
                    <th className="py-3 px-2">Earned Fee</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoicesHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                        Belum ada riwayat invoice pendapatan.
                      </td>
                    </tr>
                  ) : (
                    invoicesHistory.map((invoice) => (
                      <tr key={invoice.invoice_id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-2 font-mono text-xs font-bold text-slate-700">
                          {invoice.invoice_id}
                        </td>
                        <td className="py-3.5 px-2 font-bold text-slate-900">
                          {invoice.mentee_name}
                        </td>
                        <td className="py-3.5 px-2 text-slate-600 text-xs">
                          {invoice.consultation_date}
                        </td>
                        <td className="py-3.5 px-2 text-slate-600 text-xs">
                          {invoice.time_slot}
                        </td>
                        <td className="py-3.5 px-2 font-bold text-emerald-600">
                          Rp {(invoice.earned_fee || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={12} />
                            {invoice.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}