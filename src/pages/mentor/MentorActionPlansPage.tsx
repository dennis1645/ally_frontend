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
  CalendarCheck,
  CheckCircle2,
  Info,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorSubmissionsApi,
  reviewSubmissionApi,
  createActionPlanApi,
  getMentorMenteesApi,
  getMentorDashboardStatsApi,
  getMentorInvoicesApi,
  getMentorDossierApi,
  type MenteeSubmission,
  type MenteeItem,
  type ActionPlanItemInput,
  type MentorDossierData,
  type MenteeMilestoneProgressItem,
} from "../../api/mentorApi";

export type BookingOption = {
  booking_id: number | string;
  label: string;
  mentee_name?: string;
  mentee_id?: number;
};

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

  // Mentees & Bookings Data State
  const [mentees, setMentees] = useState<MenteeItem[]>([]);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>("");

  const [bookingsList, setBookingsList] = useState<BookingOption[]>([
    { booking_id: "1", label: "Booking ID #1 — Mentee Konsultasi" },
    { booking_id: "2", label: "Booking ID #2 — Mentee Sesi Esai" },
    { booking_id: "3", label: "Booking ID #3 — Mentee Rekomendasi" },
  ]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("1");
  const [customBookingId, setCustomBookingId] = useState<string>("");

  // Mentee Dossier & Database Milestones State
  const [dossier, setDossier] = useState<MentorDossierData | null>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);
  const [hasBooking, setHasBooking] = useState<boolean>(true);
  const [menteeMilestones, setMenteeMilestones] = useState<
    MenteeMilestoneProgressItem[]
  >([]);

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

  // Fetch mentees list & available bookings
  async function fetchMenteesAndBookings() {
    try {
      const [menteesRes, statsRes, invoicesRes] = await Promise.allSettled([
        getMentorMenteesApi(),
        getMentorDashboardStatsApi(),
        getMentorInvoicesApi(),
      ]);

      if (menteesRes.status === "fulfilled" && menteesRes.value?.data) {
        setMentees(menteesRes.value.data);
        if (menteesRes.value.data.length > 0) {
          setSelectedMenteeId(String(menteesRes.value.data[0].mentee_id));
        }
      }

      const extractedBookings: BookingOption[] = [];

      if (statsRes.status === "fulfilled" && statsRes.value?.data?.upcoming_schedules) {
        statsRes.value.data.upcoming_schedules.forEach((sch) => {
          extractedBookings.push({
            booking_id: String(sch.id),
            label: `Booking #${sch.id} — ${sch.mentee?.name || "Mentee"} (${sch.session_status})`,
            mentee_name: sch.mentee?.name,
            mentee_id: sch.mentee?.id,
          });
        });
      }

      if (invoicesRes.status === "fulfilled" && invoicesRes.value?.data?.history) {
        invoicesRes.value.data.history.forEach((inv) => {
          if (!extractedBookings.some((b) => String(b.booking_id) === String(inv.booking_id))) {
            extractedBookings.push({
              booking_id: String(inv.booking_id),
              label: `Booking #${inv.booking_id} — ${inv.mentee_name} (${inv.consultation_date})`,
              mentee_name: inv.mentee_name,
            });
          }
        });
      }

      if (extractedBookings.length > 0) {
        setBookingsList(extractedBookings);
        setSelectedBookingId(String(extractedBookings[0].booking_id));
      }
    } catch (err: unknown) {
      console.error("Failed to fetch mentees & bookings data", err);
    }
  }

  // Active target Booking ID
  const activeBookingId = customBookingId.trim()
    ? customBookingId.trim()
    : selectedBookingId;

  // Fetch dossier for active booking to load user milestones from database
  useEffect(() => {
    if (!activeBookingId) return;

    async function loadMenteeDossierAndMilestones() {
      setLoadingDossier(true);
      try {
        const response = await getMentorDossierApi(activeBookingId);
        if (response?.data) {
          setDossier(response.data);
          setHasBooking(true);

          // Extract milestones from dossier
          const fetchedMilestones = response.data.milestones_progress || [];
          setMenteeMilestones(fetchedMilestones);

          if (fetchedMilestones.length > 0) {
            setParentMilestoneId(fetchedMilestones[0].milestone_id);
          }

          if (response.data.mentee_profile?.id) {
            setSelectedMenteeId(String(response.data.mentee_profile.id));
          }
        } else {
          setDossier(null);
          setHasBooking(false);
          setMenteeMilestones([]);
        }
      } catch (err) {
        console.warn(`No active booking/dossier found for booking ID #${activeBookingId}`, err);
        setDossier(null);
        setHasBooking(false);
        setMenteeMilestones([]);
      } finally {
        setLoadingDossier(false);
      }
    }

    loadMenteeDossierAndMilestones();
  }, [activeBookingId]);

  useEffect(() => {
    fetchSubmissions();
  }, [reviewStatusFilter]);

  useEffect(() => {
    fetchMenteesAndBookings();
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

    if (!activeBookingId) {
      setError("Booking ID wajib dipilih atau diisi.");
      return;
    }

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
      const res = await createActionPlanApi(activeBookingId, {
        parent_milestone_id: targetParentId,
        action_plans: actionPlanTasks,
      });

      setSuccessMsg(
        res.message ||
          `${actionPlanTasks.length} Action Plan berhasil dibuat & dicabangkan pada Milestone #${targetParentId} (Booking #${activeBookingId}).`
      );

      // Reset tasks list
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

  // Find currently selected mentee details (from dossier or mentee list)
  const activeMenteeProfile = dossier?.mentee_profile;
  const selectedMentee =
    mentees.find((m) => String(m.mentee_id) === selectedMenteeId) ||
    (activeMenteeProfile
      ? {
          mentee_id: activeMenteeProfile.id,
          name: activeMenteeProfile.name,
          email: activeMenteeProfile.email,
          readiness_score: activeMenteeProfile.readiness_score,
          target_scholarship: activeMenteeProfile.target_scholarship,
          target_country: "ID",
          phone_number: "-",
          total_xp: 0,
          progress_summary: { total_tasks: 0, completed_tasks: 0, progress_percentage: "0%" },
          uploaded_documents_count: 0,
        }
      : null);

  return (
    <UserLayout
      title="Task & Action Plan Audit"
      subtitle="Audit Tugas Mentee & Berikan Penugasan Action Plan Berbasis Milestone Database"
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

          {/* Form Pembuat Action Plan Berbasis Mentee, Booking ID & Parent Milestone */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="text-ally-primary" size={22} />
                <h3 className="text-lg font-bold text-slate-900">Buat Action Plan Mentee</h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  hasBooking
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {hasBooking ? "Booking Ada" : "Tidak Ada Booking"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Pilih Booking Sesi, lalu tentukan Milestone Induk Mentee dari database (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">user_milestones</code>) untuk mencabangkan Action Plan baru.
            </p>

            <form onSubmit={handleCreateActionPlan} className="space-y-5">
              {/* Booking ID Selector */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <CalendarCheck size={14} className="text-ally-primary" />
                  1. Pilih Booking Sesi Konsultasi
                </label>

                <select
                  value={selectedBookingId}
                  onChange={(e) => {
                    setSelectedBookingId(e.target.value);
                    setCustomBookingId("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none mb-2"
                >
                  {bookingsList.map((b) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      {b.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Atau ID Booking Kustom:</span>
                  <input
                    type="text"
                    placeholder="Misal: 1"
                    value={customBookingId}
                    onChange={(e) => setCustomBookingId(e.target.value)}
                    className="w-28 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    (ID aktif dipanggil: <code className="font-bold text-slate-700">{activeBookingId}</code>)
                  </span>
                </div>

                {/* Status Indicator Booking Status */}
                {loadingDossier ? (
                  <div className="mt-3 flex items-center text-xs text-slate-500">
                    <Loader2 className="animate-spin mr-2" size={14} /> Memuat data dossier & milestone mentee dari database...
                  </div>
                ) : !hasBooking ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>Tidak ada booking / dossier ditemukan untuk Booking ID #{activeBookingId}</span>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Booking #{activeBookingId} Aktif • Mentee: <strong>{selectedMentee?.name || "Mentee"}</strong></span>
                  </div>
                )}
              </div>

              {/* Mentee Profile Preview */}
              {selectedMentee && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-ally-primary" />
                    Profil & Status Mentee
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                        Mentee
                      </span>
                      <span className="font-bold text-slate-800 truncate block">
                        {selectedMentee.name}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                        Readiness Score
                      </span>
                      <span className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                        <Award size={14} /> {selectedMentee.readiness_score || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Milestone Target Selector dari Database Dossier */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-ally-primary" />
                  Parent Milestone ID (`user_milestones` Database Mentee)
                </label>

                {loadingDossier ? (
                  <div className="flex items-center text-xs text-slate-500 py-2">
                    <Loader2 className="animate-spin mr-2" size={14} /> Memuat daftar milestone mentee...
                  </div>
                ) : menteeMilestones.length > 0 ? (
                  <select
                    value={parentMilestoneId}
                    onChange={(e) => {
                      setParentMilestoneId(Number(e.target.value));
                      setCustomMilestoneId("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none mb-2"
                  >
                    {menteeMilestones.map((m) => (
                      <option key={m.milestone_id} value={m.milestone_id}>
                        [ID #{m.milestone_id}] {m.task_name} {m.status ? `(${m.status})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 flex items-center gap-2">
                    <Info size={15} />
                    <span>
                      {!hasBooking
                        ? "Tidak ada booking aktif untuk mentee ini."
                        : "Mentee ini belum memiliki milestone utama di database."}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Atau ID Milestone Manual:</span>
                  <input
                    type="number"
                    placeholder="Misal: 12"
                    value={customMilestoneId}
                    onChange={(e) => setCustomMilestoneId(e.target.value)}
                    className="w-24 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    (ID parent dikirim: <code className="font-bold text-slate-700">{customMilestoneId || parentMilestoneId}</code>)
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
                  disabled={isCreatingPlan || !hasBooking}
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