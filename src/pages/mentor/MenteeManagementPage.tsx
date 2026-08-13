import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import { getMentorMenteesApi, type MenteeItem } from "../../api/mentorApi";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMentees() {
      setLoading(true);
      setError(null);
      try {
        const response = await getMentorMenteesApi();
        if (response?.data) {
          setMentees(response.data);
        }
      } catch (err: unknown) {
        console.error("Failed to load mentees", err);
        setError(
          err instanceof Error ? err.message : "Gagal memuat daftar mentee dari server."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMentees();
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
  const avgReadiness = totalMentees > 0
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

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {/* Main List Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Explorer Directory</h3>
                <p className="text-sm text-slate-500">
                  Kelola dan pantau seluruh mentee bimbingan Anda
                </p>
              </div>

              {/* Search Control */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari mentee, email, beasiswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-ally-primary"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ally-primary" />
                <span className="ml-3 text-sm font-semibold text-slate-600">
                  Memuat daftar mentee...
                </span>
              </div>
            ) : filteredMentees.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Tidak ada mentee yang ditemukan.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMentees.map((mentee) => (
                  <div
                    key={mentee.mentee_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-slate-900">{mentee.name}</h4>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            Readiness: {mentee.readiness_score || 0}%
                          </span>
                          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                            {mentee.total_xp || 0} XP
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {mentee.email} {mentee.phone_number ? `• ${mentee.phone_number}` : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <BadgeCheck size={14} className="text-ally-primary" />
                            Target: {mentee.target_scholarship || "N/A"} ({mentee.target_country || "Global"})
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} className="text-slate-400" />
                            Dokumen: {mentee.uploaded_documents_count || 0} file
                          </span>
                        </div>

                        {mentee.progress_summary && (
                          <div className="mt-3 flex items-center gap-3 text-xs">
                            <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-ally-primary h-full rounded-full"
                                style={{ width: mentee.progress_summary.progress_percentage || "0%" }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700">
                              {mentee.progress_summary.completed_tasks}/{mentee.progress_summary.total_tasks} Tugas Selesai ({mentee.progress_summary.progress_percentage})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/mentor/dossier?bookingId=${mentee.mentee_id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-ally-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-ally-primary/90"
                        >
                          Lihat Dossier <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}