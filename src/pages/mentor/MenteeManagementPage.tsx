import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Search,
  Loader2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Link } from "react-router";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorMenteesApi,
  getMentorDashboardStatsApi,
  getMentorInvoicesApi,
  type MenteeItem,
} from "../../api/mentorApi";

function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

export default function MenteeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mentees, setMentees] = useState<MenteeItem[]>([]);
  const [bookingMap, setBookingMap] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenteesAndBookings() {
      setLoading(true);
      setError(null);
      try {
        const [menteesRes, statsRes, invoicesRes] = await Promise.allSettled([
          getMentorMenteesApi(),
          getMentorDashboardStatsApi(),
          getMentorInvoicesApi(),
        ]);

        if (menteesRes.status === "fulfilled" && menteesRes.value?.data) {
          setMentees(menteesRes.value.data);
        }

        const map: Record<string, number | string> = {};

        if (statsRes.status === "fulfilled" && statsRes.value?.data?.upcoming_schedules) {
          statsRes.value.data.upcoming_schedules.forEach((sch) => {
            if (sch.mentee?.id) {
              map[String(sch.mentee.id)] = sch.id;
            }
            if (sch.mentee?.name) {
              map[sch.mentee.name.toLowerCase().trim()] = sch.id;
            }
          });
        }

        if (invoicesRes.status === "fulfilled" && invoicesRes.value?.data?.history) {
          invoicesRes.value.data.history.forEach((inv) => {
            if (inv.mentee_name) {
              map[inv.mentee_name.toLowerCase().trim()] = inv.booking_id;
            }
          });
        }

        setBookingMap(map);
      } catch (err: unknown) {
        console.error("Failed to load mentees", err);
        setError(
          err instanceof Error ? err.message : "Gagal memuat daftar mentee dari server."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMenteesAndBookings();
  }, []);

  const filteredMentees = mentees.filter((mentee) => {
    const query = searchQuery.toLowerCase();
    return (
      mentee.name.toLowerCase().includes(query) ||
      mentee.email.toLowerCase().includes(query) ||
      (mentee.target_scholarship && mentee.target_scholarship.toLowerCase().includes(query)) ||
      (mentee.target_country && mentee.target_country.toLowerCase().includes(query))
    );
  });

  const totalMentees = mentees.length;
  const totalDocs = mentees.reduce((acc, m) => acc + (m.uploaded_documents_count || 0), 0);
  const avgReadiness =
    totalMentees > 0
      ? Math.round(mentees.reduce((acc, m) => acc + (m.readiness_score || 0), 0) / totalMentees)
      : 0;

  return (
    <UserLayout
      title="Mentees Dashboard"
      subtitle="Mentee Progress Overview"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        {/* Metric Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Assigned Mentees"
            value={String(totalMentees)}
            helper="Daftar mentee bimbingan aktif & matched"
          />
          <MetricCard
            title="Total Uploaded Documents"
            value={String(totalDocs)}
            helper="Berkas mentee siap ditinjau di Vault"
          />
          <MetricCard
            title="Avg. Readiness Score"
            value={`${avgReadiness}%`}
            helper="Rata-rata kesiapan beasiswa mentee"
          />
        </div>

        {/* Main Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Assigned Mentees</h3>
              <p className="mt-1 text-xs text-slate-500">
                Pantau kesiapan dan progres tugas masing-masing mentee.
              </p>
            </div>

            {/* Search */}
            <div className="relative min-w-[260px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari mentee / email / beasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 py-2 pl-9 pr-4 text-xs font-semibold outline-none transition focus:border-ally-primary"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-ally-primary" />
              <span className="ml-3 text-sm font-semibold text-slate-600">
                Memuat daftar mentee...
              </span>
            </div>
          ) : filteredMentees.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Tidak ada mentee yang ditemukan untuk pencarian &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMentees.map((mentee) => {
                const targetBookingId =
                  mentee.booking_id ||
                  (mentee as unknown as Record<string, unknown>).latest_booking_id ||
                  bookingMap[String(mentee.mentee_id)] ||
                  bookingMap[mentee.name.toLowerCase().trim()] ||
                  "1";

                return (
                  <div
                    key={mentee.mentee_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {mentee.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            <BadgeCheck size={14} /> Readiness: {mentee.readiness_score || 0}%
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                            {mentee.total_xp || 0} XP
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          {mentee.email} • {mentee.phone_number || "-"}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                          <span>
                            Target:{" "}
                            <strong className="text-slate-800">
                              {mentee.target_scholarship || "Umum"}
                            </strong>{" "}
                            ({mentee.target_country || "Belum ditentukan"})
                          </span>
                          <span>
                            Dokumen:{" "}
                            <strong className="text-slate-800">
                              {mentee.uploaded_documents_count || 0} file
                            </strong>
                          </span>
                        </div>

                        {/* Progres Tugas Mentee */}
                        {mentee.progress_summary && (
                          <div className="mt-3 flex items-center gap-3 text-xs">
                            <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-ally-primary h-full rounded-full"
                                style={{
                                  width: mentee.progress_summary.progress_percentage || "0%",
                                }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700">
                              {mentee.progress_summary.completed_tasks}/
                              {mentee.progress_summary.total_tasks} Tugas Selesai (
                              {mentee.progress_summary.progress_percentage})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Link
                          to={`/mentor/dossier?bookingId=${targetBookingId}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ally-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-ally-primary/90 shadow-sm"
                        >
                          <FolderOpen size={14} /> Lihat Dossier <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </UserLayout>
  );
}