import { useEffect, useState } from "react";
import {
  CheckCircle,
  FileText,
  Plus,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2,
  UserCheck,
  Compass,
  Award,
  Layers,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorSubmissionsApi,
  reviewSubmissionApi,
  createActionPlanApi,
  getMentorMenteesApi,
  type MenteeSubmission,
  type MenteeItem,
  type ActionPlanItemInput,
} from "../../api/mentorApi";

// Predefined milestones for selection context
const MILESTONE_OPTIONS = [
  { id: 1, label: "Milestone 1: Profiling & Readiness Assessment" },
  { id: 2, label: "Milestone 2: Persiapan Berkas & Legalisir" },
  { id: 3, label: "Milestone 3: Draft Esai & Proposal Riset" },
  { id: 4, label: "Milestone 4: Surat Rekomendasi & Interview Mock" },
  { id: 5, label: "Milestone 5: Final Submission & Submisi Portofolio" },
];

export function MentorActionPlansPage() {
  // Submission Audit State
  const [submissions, setSubmissions] = useState<MenteeSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [reviewStatusFilter, setReviewStatusFilter] = useState<
    "pending" | "approved" | "revision_requested" | undefined
  >("pending");

  // Review Submission Modal / Form state
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

  // Mentees Data State
  const [mentees, setMentees] = useState<MenteeItem[]>([]);
  const [loadingMentees, setLoadingMentees] = useState<boolean>(true);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>("");

  // Action Plan Creation State
  const [parentMilestoneId, setParentMilestoneId] = useState<number>(3);
  const [customMilestoneId, setCustomMilestoneId] = useState<string>("");

  // Multi-task Action Plan List
  const [actionPlanTasks, setActionPlanTasks] = useState<ActionPlanItemInput[]>([
    {
      task_title: "Revisi Paragraf Kontribusi Esai",
      task_description: "Perjelas dampak nyata dari proyek kepemimpinan yang telah Anda pimpin.",
      mentor_note: "Fokus pada kuantifikasi data seperti jumlah peserta dan dampak sosialnya.",
      deadline: "2026-08-20",
    },
    {
      task_title: "Minta 2 Surat Rekomendasi Resmi",
      task_description: "Hubungi dosen pembimbing skripsi dan atasan kerja langsung.",
      mentor_note: "Gunakan draf draf rekomendasi yang sudah disepakati saat sesi.",
      deadline: "2026-08-25",
    },
  ]);

  const [isCreatingPlan, setIsCreatingPlan] = useState<boolean>(false);

  // Fetch submissions list
  async function fetchSubmissions() {
    setLoadingSubmissions(true);
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
      setLoadingSubmissions(false);
    }
  }

  // Fetch mentees list
  async function fetchMentees() {
    setLoadingMentees(true);
    try {
      const response = await getMentorMenteesApi();
      if (response?.data && response.data.length > 0) {
        setMentees(response.data);
        setSelectedMenteeId(String(response.data[0].mentee_id));
      }
    } catch (err: unknown) {
      console.error("Failed to fetch mentees list", err);
    } finally {
      setLoadingMentees(false);
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, [reviewStatusFilter]);

  useEffect(() => {
    fetchMentees();
  }, []);

  // Handle Review Submission
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

  // Dynamic Task Handlers
  const handleTaskChange = (
    index: number,
    field: keyof ActionPlanItemInput,
    value: string
  ) => {
    const updatedTasks = [...actionPlanTasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setActionPlanTasks(updatedTasks);
  };

  const handleAddTask = () => {
    setActionPlanTasks([
      ...actionPlanTasks,
      {
        task_title: "",
        task_description: "",
        mentor_note: "",
        deadline: "",
      },
    ]);
  };

  const handleRemoveTask = (index: number) => {
    if (actionPlanTasks.length <= 1) return;
    const updatedTasks = actionPlanTasks.filter((_, idx) => idx !== index);
    setActionPlanTasks(updatedTasks);
  };

  // Create Action Plan API Call
  async function handleCreateActionPlan(e: React.FormEvent) {
    e.preventDefault();

    // Validate tasks
    for (let i = 0; i < actionPlanTasks.length; i++) {
      const task = actionPlanTasks[i];
      if (!task.task_title.trim()) {
        setError(`Judul tugas #${i + 1} wajib diisi.`);
        return;
      }
      if (!task.deadline) {
        setError(`Deadline tugas #${i + 1} wajib diisi.`);
        return;
      }
    }

    const targetParentId = customMilestoneId
      ? Number(customMilestoneId) || parentMilestoneId
      : parentMilestoneId;

    setIsCreatingPlan(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const targetIdentifier = selectedMenteeId || "1";
      const res = await createActionPlanApi(targetIdentifier, {
        parent_milestone_id: targetParentId,
        action_plans: actionPlanTasks,
      });

      setSuccessMsg(
        res.message ||
          `${actionPlanTasks.length} Action Plan berhasil dibuat & dicabangkan pada Milestone #${targetParentId}.`
      );

      // Reset form
      setActionPlanTasks([
        {
          task_title: "",
          task_description: "",
          mentor_note: "",
          deadline: "",
        },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat Action Plan.");
    } finally {
      setIsCreatingPlan(false);
    }
  }

  // Find currently selected mentee details
  const selectedMentee = mentees.find(
    (m) => String(m.mentee_id) === selectedMenteeId
  );

  return (
    <UserLayout
      title="Task & Action Plan Audit"
      subtitle="Audit Tugas Mentee & Berikan Penugasan Action Plan Berbasis Milestone"
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

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1.3fr]">
          {/* Antrean Audit Tugas Mentee */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
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

              {loadingSubmissions ? (
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
          </div>

          {/* Form Pembuat Action Plan Berbasis Mentee & Parent Milestone */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="text-ally-primary" size={22} />
                <h3 className="text-lg font-bold text-slate-900">Buat Action Plan Mentee</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Branching Penugasan
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Pilih mentee dan tentukan milestone induk (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">parent_milestone_id</code>) tempat tugas-tugas baru ini akan di-branching pada dashboard mentee.
            </p>

            <form onSubmit={handleCreateActionPlan} className="space-y-5">
              {/* Mentee Selector */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-ally-primary" />
                  Pilih Mentee Bimbingan
                </label>
                {loadingMentees ? (
                  <div className="flex items-center text-xs text-slate-500 py-2">
                    <Loader2 className="animate-spin mr-2" size={14} /> Memuat daftar mentee...
                  </div>
                ) : mentees.length > 0 ? (
                  <select
                    value={selectedMenteeId}
                    onChange={(e) => setSelectedMenteeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    {mentees.map((m) => (
                      <option key={m.mentee_id} value={m.mentee_id}>
                        {m.name} ({m.email}) — {m.target_scholarship || "Beasiswa Umum"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Masukkan Mentee / Booking ID"
                    value={selectedMenteeId}
                    onChange={(e) => setSelectedMenteeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold"
                  />
                )}

                {/* Progress Mentee Preview */}
                {selectedMentee && (
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/80 text-xs">
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                        Readiness Score
                      </span>
                      <span className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                        <Award size={14} /> {selectedMentee.readiness_score || 0}%
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                        Target Beasiswa
                      </span>
                      <span className="font-bold text-slate-800 truncate block">
                        {selectedMentee.target_scholarship || "Umum"} ({selectedMentee.target_country || "ID"})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Milestone Target Selector */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-ally-primary" />
                  Parent Milestone ID Target (Konteks Pembahasan)
                </label>

                <select
                  value={parentMilestoneId}
                  onChange={(e) => {
                    setParentMilestoneId(Number(e.target.value));
                    setCustomMilestoneId("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none mb-2"
                >
                  {MILESTONE_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Atau ID Custom:</span>
                  <input
                    type="number"
                    placeholder="Misal: 3"
                    value={customMilestoneId}
                    onChange={(e) => setCustomMilestoneId(e.target.value)}
                    className="w-24 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    (Default payload: {customMilestoneId || parentMilestoneId})
                  </span>
                </div>
              </div>

              {/* Dynamic Action Plans List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Tugas Action Plan ({actionPlanTasks.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="flex items-center gap-1 text-xs font-bold text-ally-primary hover:underline"
                  >
                    <Plus size={14} /> Tambah Tugas Lain
                  </button>
                </div>

                {actionPlanTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-extrabold text-slate-700">
                        Tugas #{idx + 1}
                      </span>
                      {actionPlanTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Hapus tugas ini"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Judul Tugas (`task_title`) *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Revisi Paragraf Kontribusi Esai"
                        value={task.task_title}
                        onChange={(e) => handleTaskChange(idx, "task_title", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-ally-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Deskripsi Tugas (`task_description`)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Perjelas dampak nyata dari proyek kepemimpinan..."
                        value={task.task_description}
                        onChange={(e) =>
                          handleTaskChange(idx, "task_description", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-ally-primary"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Catatan Mentor (`mentor_note`)
                        </label>
                        <input
                          type="text"
                          placeholder="Fokus pada kuantifikasi data..."
                          value={task.mentor_note || ""}
                          onChange={(e) => handleTaskChange(idx, "mentor_note", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-ally-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Deadline (`deadline`) *
                        </label>
                        <input
                          type="date"
                          value={task.deadline}
                          onChange={(e) => handleTaskChange(idx, "deadline", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-ally-primary font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingPlan}
                  className="w-full rounded-full bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {isCreatingPlan ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Membuat Action Plan Batch...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Kirim & Branch Action Plan ({actionPlanTasks.length} Tugas)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export default MentorActionPlansPage;