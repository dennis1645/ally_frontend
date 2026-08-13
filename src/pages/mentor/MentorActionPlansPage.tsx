import { useEffect, useState } from "react";
import {
  CheckCircle,
  FileText,
  Plus,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorSubmissionsApi,
  reviewSubmissionApi,
  createActionPlanApi,
  type MenteeSubmission,
} from "../../api/mentorApi";

export function MentorActionPlansPage() {
  const [submissions, setSubmissions] = useState<MenteeSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [reviewStatusFilter, setReviewStatusFilter] = useState<
    "pending" | "approved" | "revision_requested" | undefined
  >("pending");

  // Review Form Modal / Expanded state
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    status: "approved" | "revision_requested";
    feedback: string;
    rating: number;
  }>({
    status: "approved",
    feedback: "",
    rating: 5,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Form State Action Plan Baru
  const [actionPlanForm, setActionPlanForm] = useState({
    bookingId: "1",
    parent_milestone_id: 12,
    task_title: "",
    task_description: "",
    mentor_note: "",
    deadline: "",
  });
  const [isCreatingPlan, setIsCreatingPlan] = useState<boolean>(false);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);
    try {
      const response = await getMentorSubmissionsApi(reviewStatusFilter);
      if (response?.data) {
        setSubmissions(response.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load mentee submissions", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat antrean pengiriman tugas mentee."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, [reviewStatusFilter]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubId) return;
    if (!reviewForm.feedback.trim()) {
      setError("Silakan sertakan feedback evaluasi tugas mentee.");
      return;
    }

    setIsSubmittingReview(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await reviewSubmissionApi(selectedSubId, {
        status: reviewForm.status,
        feedback: reviewForm.feedback,
        rating: reviewForm.rating,
      });

      setSuccessMsg(res.message || "Review tugas mentee berhasil dikirim!");
      setSelectedSubId(null);
      setReviewForm({ status: "approved", feedback: "", rating: 5 });
      fetchSubmissions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan ulasan tugas.");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleCreateActionPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!actionPlanForm.task_title || !actionPlanForm.deadline) {
      setError("Judul tugas dan deadline wajib diisi.");
      return;
    }

    setIsCreatingPlan(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await createActionPlanApi(actionPlanForm.bookingId, {
        parent_milestone_id: Number(actionPlanForm.parent_milestone_id) || undefined,
        action_plans: [
          {
            task_title: actionPlanForm.task_title,
            task_description: actionPlanForm.task_description,
            mentor_note: actionPlanForm.mentor_note,
            deadline: actionPlanForm.deadline,
          },
        ],
      });

      setSuccessMsg(res.message || "1 Action Plan berhasil dibuat untuk mentee.");
      setActionPlanForm({
        bookingId: "1",
        parent_milestone_id: 12,
        task_title: "",
        task_description: "",
        mentor_note: "",
        deadline: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat Action Plan.");
    } finally {
      setIsCreatingPlan(false);
    }
  }

  return (
    <UserLayout
      title="Task & Action Plan Audit"
      subtitle="Audit Tugas Mentee & Berikan Penugasan Tambahan"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-3">
            <CheckCircle size={20} />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Antrean Audit Tugas Mentee */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Antrean Audit Tugas Mentee</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review dokumen & jawaban esai mentee pasca-konsultasi.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-1.5">
                {(["pending", "approved", "revision_requested"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setReviewStatusFilter(status)}
                    className={`px-3 py-1 text-xs font-bold rounded-full capitalize transition ${
                      reviewStatusFilter === status
                        ? "bg-ally-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ally-primary" />
                <span className="ml-3 text-sm font-semibold text-slate-600">
                  Memuat pengiriman tugas...
                </span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Tidak ada tugas mentee dengan status &ldquo;{reviewStatusFilter}&rdquo;.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.submission_id}
                    className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{sub.task_name}</h4>
                        <p className="text-xs text-slate-500">
                          Mentee: <strong>{sub.mentee?.name}</strong> ({sub.mentee?.email}) •{" "}
                          {sub.submitted_at}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                          sub.review_status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : sub.review_status === "revision_requested"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {sub.review_status}
                      </span>
                    </div>

                    {sub.text_response && (
                      <div className="my-2 rounded-xl bg-white p-3 border border-slate-100 text-xs text-slate-700 italic">
                        &ldquo;{sub.text_response}&rdquo;
                      </div>
                    )}

                    {sub.file_url && (
                      <div className="my-2 flex items-center gap-2 text-xs">
                        <FileText size={14} className="text-ally-primary" />
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-ally-primary hover:underline flex items-center gap-1"
                        >
                          {sub.file_name || "Download File Tugas"} <ExternalLink size={12} />
                        </a>
                      </div>
                    )}

                    {selectedSubId === sub.submission_id ? (
                      <form
                        onSubmit={handleReviewSubmit}
                        className="mt-4 pt-3 border-t border-slate-200 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-slate-700">Hasil Penilaian:</label>
                          <select
                            value={reviewForm.status}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                status: e.target.value as "approved" | "revision_requested",
                              })
                            }
                            className="rounded-xl border border-slate-200 p-1.5 text-xs font-bold"
                          >
                            <option value="approved">Disetujui (Approved)</option>
                            <option value="revision_requested">Minta Revisi (Revision Requested)</option>
                          </select>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Tuliskan feedback dan masukan untuk mentee..."
                          value={reviewForm.feedback}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, feedback: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                        />

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="rounded-full bg-ally-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-ally-primary/90 disabled:opacity-50"
                          >
                            {isSubmittingReview ? "Menyimpan..." : "Kirim Review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSubId(null)}
                            className="rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700"
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-3 text-right">
                        <button
                          onClick={() => setSelectedSubId(sub.submission_id)}
                          className="rounded-full bg-ally-primary px-4 py-1.5 text-xs font-bold text-white transition hover:bg-ally-primary/90"
                        >
                          Review & Beri Feedback
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Buat Action Plan Baru untuk Mentee */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="text-ally-primary" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Buat Action Plan Mentee</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Tambah tugas baru ke timeline mentee pasca-sesi konsultasi.
            </p>

            <form onSubmit={handleCreateActionPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Booking ID Mentee
                </label>
                <input
                  type="text"
                  value={actionPlanForm.bookingId}
                  onChange={(e) =>
                    setActionPlanForm({ ...actionPlanForm, bookingId: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  placeholder="Misal: Revisi Paragraf Kontribusi Esai"
                  value={actionPlanForm.task_title}
                  onChange={(e) =>
                    setActionPlanForm({ ...actionPlanForm, task_title: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Deskripsi Tugas
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail yang harus dikerjakan mentee..."
                  value={actionPlanForm.task_description}
                  onChange={(e) =>
                    setActionPlanForm({ ...actionPlanForm, task_description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan Mentor (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Catatan khusus dari mentor..."
                  value={actionPlanForm.mentor_note}
                  onChange={(e) =>
                    setActionPlanForm({ ...actionPlanForm, mentor_note: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={actionPlanForm.deadline}
                  onChange={(e) =>
                    setActionPlanForm({ ...actionPlanForm, deadline: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingPlan}
                className="w-full rounded-full bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isCreatingPlan ? "Membuat Plan..." : "Simpan & Autonotifikasi Mentee"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export default MentorActionPlansPage;