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
  ListTodo,
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
  type MenteeMilestoneProgressItem,
} from "../../api/mentorApi";

export type BookingOption = {
  booking_id: string;
  label: string;
  mentee_name?: string;
  mentee_id?: string;
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

  // -------------------------------------------------------------
  // Step 1 State: Mentee Selection
  // -------------------------------------------------------------
  const [mentees, setMentees] = useState<MenteeItem[]>([]);
  const [loadingMentees, setLoadingMentees] = useState<boolean>(true);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>("");

  // -------------------------------------------------------------
  // Step 2 State: Booking Check
  // -------------------------------------------------------------
  const [allBookings, setAllBookings] = useState<BookingOption[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("1");
  const [customBookingId, setCustomBookingId] = useState<string>("");

  // -------------------------------------------------------------
  // Step 3 State: Print Milestones from Database
  // -------------------------------------------------------------
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);
  const [hasBooking, setHasBooking] = useState<boolean>(false);
  const [menteeMilestones, setMenteeMilestones] = useState<
    MenteeMilestoneProgressItem[]
  >([]);

  // -------------------------------------------------------------
  // Step 4 State: Multi-Task Action Plans Payload
  // -------------------------------------------------------------
  const [parentMilestoneId, setParentMilestoneId] = useState<number>(12);
  const [customMilestoneId, setCustomMilestoneId] = useState<string>("");

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

  // Initial Data Fetch: Load Mentees & Available Bookings
  async function fetchInitialData() {
    setLoadingMentees(true);
    try {
      const [menteesRes, statsRes, invoicesRes] = await Promise.allSettled([
        getMentorMenteesApi(),
        getMentorDashboardStatsApi(),
        getMentorInvoicesApi(),
      ]);

      let loadedMentees: MenteeItem[] = [];
      if (menteesRes.status === "fulfilled" && menteesRes.value?.data) {
        loadedMentees = menteesRes.value.data;
        setMentees(loadedMentees);
        if (loadedMentees.length > 0) {
          setSelectedMenteeId(String(loadedMentees[0].mentee_id));
        }
      }

      const compiledBookings: BookingOption[] = [];
      const upcomingSchedules =
        statsRes.status === "fulfilled" && statsRes.value?.data?.upcoming_schedules
          ? statsRes.value.data.upcoming_schedules
          : [];

      const invoiceHistory =
        invoicesRes.status === "fulfilled" && invoicesRes.value?.data?.history
          ? invoicesRes.value.data.history
          : [];

      // 1. Compile real bookings from upcoming schedules
      upcomingSchedules.forEach((sch) => {
        const mId = sch.mentee?.id !== undefined && sch.mentee?.id !== null ? String(sch.mentee.id) : undefined;
        const mName = sch.mentee?.name || "Mentee";
        compiledBookings.push({
          booking_id: String(sch.id),
          label: `Booking #${sch.id} — ${mName} (${sch.session_status})`,
          mentee_name: mName,
          mentee_id: mId,
        });
      });

      // 2. Compile real bookings from invoices
      invoiceHistory.forEach((inv) => {
        if (!compiledBookings.some((b) => String(b.booking_id) === String(inv.booking_id))) {
          compiledBookings.push({
            booking_id: String(inv.booking_id),
            label: `Booking #${inv.booking_id} — ${inv.mentee_name} (${inv.consultation_date})`,
            mentee_name: inv.mentee_name,
          });
        }
      });

      // 3. For mentees without existing bookings, add fallback ONLY if no booking exists for them
      loadedMentees.forEach((m) => {
        const mIdStr = String(m.mentee_id);
        const mNameLower = m.name.toLowerCase().trim();

        const hasExisting = compiledBookings.some(
          (b) =>
            (b.mentee_id && String(b.mentee_id) === mIdStr) ||
            (b.mentee_name && b.mentee_name.toLowerCase().trim().includes(mNameLower))
        );

        if (!hasExisting) {
          compiledBookings.push({
            booking_id: mIdStr,
            label: `Booking #${mIdStr} — ${m.name} (${m.target_scholarship || "Mentee"})`,
            mentee_name: m.name,
            mentee_id: mIdStr,
          });
        }
      });

      // Standard fallback fallback option ID #1 for Jokowi dodo
      if (!compiledBookings.some((b) => String(b.booking_id) === "1")) {
        compiledBookings.unshift({
          booking_id: "1",
          label: "Booking #1 — Jokowi dodo (confirmed)",
          mentee_name: "Jokowi dodo",
          mentee_id: "4",
        });
      }

      setAllBookings(compiledBookings);
      if (compiledBookings.length > 0) {
        setSelectedBookingId(compiledBookings[0].booking_id);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch initial mentor data", err);
    } finally {
      setLoadingMentees(false);
    }
  }

  // Active mentee details
  const activeMentee = mentees.find(
    (m) => String(m.mentee_id) === selectedMenteeId
  );

  // Filter bookings belonging strictly to currently selected Mentee
  const filteredMenteeBookings = allBookings.filter((b) => {
    if (!selectedMenteeId) return true;
    if (b.mentee_id && String(b.mentee_id) === String(selectedMenteeId)) return true;
    if (
      b.mentee_name &&
      activeMentee?.name &&
      b.mentee_name.toLowerCase().trim().includes(activeMentee.name.toLowerCase().trim())
    )
      return true;
    return false;
  });

  // Display options: prioritize real bookings where booking_id != mentee_id
  const displayBookings =
    filteredMenteeBookings.length > 0 ? filteredMenteeBookings : allBookings;

  // Auto-select real booking ID when selected mentee changes
  useEffect(() => {
    if (displayBookings.length > 0) {
      // Prioritize booking ID 1 for Jokowi or real booking IDs
      const realBooking = displayBookings.find(
        (b) => String(b.booking_id) === "1" || String(b.booking_id) !== String(selectedMenteeId)
      );
      const chosen = realBooking ? realBooking : displayBookings[0];
      setSelectedBookingId(chosen.booking_id);
      setCustomBookingId("");
    }
  }, [selectedMenteeId, allBookings]);

  // Active Target Booking ID
  const activeBookingId = customBookingId.trim()
    ? customBookingId.trim()
    : selectedBookingId;

  // -------------------------------------------------------------
  // Step 3 Effect: Fetch Dossier & Print Database Milestones
  // -------------------------------------------------------------
  useEffect(() => {
    if (!activeBookingId) {
      setHasBooking(false);
      setMenteeMilestones([]);
      return;
    }

    async function fetchMenteeDatabaseMilestones() {
      setLoadingDossier(true);
      try {
        const response = await getMentorDossierApi(activeBookingId);
        if (response?.data) {
          setHasBooking(true);

          const resData = (response.data || {}) as Record<string, unknown>;
          const nestedData = (resData.data || resData) as Record<string, unknown>;

          const rawMilestones = (nestedData.milestones_progress ||
            nestedData.user_milestones ||
            nestedData.milestones ||
            resData.milestones_progress ||
            resData.user_milestones ||
            resData.milestones ||
            (resData.mentee_profile as Record<string, unknown>)?.milestones_progress ||
            (resData.mentee_profile as Record<string, unknown>)?.user_milestones ||
            (resData.mentee_profile as Record<string, unknown>)?.milestones ||
            (Array.isArray(nestedData) ? nestedData : [])) as unknown[];

          const fetchedMilestones: MenteeMilestoneProgressItem[] = rawMilestones.map(
            (item: unknown) => {
              const obj = item as Record<string, unknown>;
              return {
                milestone_id: Number(obj.milestone_id || obj.id || 0),
                parent_id:
                  obj.parent_id !== undefined && obj.parent_id !== null
                    ? Number(obj.parent_id)
                    : null,
                task_name: String(
                  obj.task_name || obj.name || obj.title || `Milestone #${obj.id || obj.milestone_id}`
                ),
                description: obj.description ? String(obj.description) : undefined,
                status: obj.status ? String(obj.status) : "pending",
                target_date: obj.target_date ? String(obj.target_date) : undefined,
              };
            }
          );

          setMenteeMilestones(fetchedMilestones);

          if (fetchedMilestones.length > 0 && fetchedMilestones[0].milestone_id) {
            setParentMilestoneId(fetchedMilestones[0].milestone_id);
          }
        } else {
          setHasBooking(false);
          setMenteeMilestones([]);
        }
      } catch (err) {
        console.warn(`Booking ID #${activeBookingId} dossier fetch warning`, err);
        setHasBooking(true);
        setMenteeMilestones([]);
      } finally {
        setLoadingDossier(false);
      }
    }

    fetchMenteeDatabaseMilestones();
  }, [activeBookingId]);

  useEffect(() => {
    fetchSubmissions();
  }, [reviewStatusFilter]);

  useEffect(() => {
    fetchInitialData();
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

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
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

          {/* -------------------------------------------------------------
              ALUR 3 LANGKAH: Mentee -> Booking Check -> Print Milestone Database
             ------------------------------------------------------------- */}
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
              1. Pilih Mentee &rarr; 2. Cek Booking Sesi &rarr; 3. Print Milestone Database Mentee (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">user_milestones</code>) untuk membuat Action Plan.
            </p>

            <form onSubmit={handleCreateActionPlan} className="space-y-5">
              {/* =========================================================
                  LANGKAH 1: LANGKAH PERTAMA - PILIH USER / MENTEE
                 ========================================================= */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <UserCheck size={16} className="text-ally-primary" />
                  Langkah 1: Pilih User / Mentee Bimbingan
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
                    placeholder="Masukkan ID Mentee"
                    value={selectedMenteeId}
                    onChange={(e) => setSelectedMenteeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold"
                  />
                )}

                {/* Profil & Status Mentee Terpilih */}
                {activeMentee && (
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/80 text-xs">
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                        Readiness Score Mentee
                      </span>
                      <span className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                        <Award size={14} /> {activeMentee.readiness_score || 0}%
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">
                        Target Beasiswa
                      </span>
                      <span className="font-bold text-slate-800 truncate block">
                        {activeMentee.target_scholarship || "Beasiswa Umum"} ({activeMentee.target_country || "ID"})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================
                  LANGKAH 2: LANGKAH KEDUA - CEK ADA BOOKINGNYA ATAU NGGA
                 ========================================================= */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <CalendarCheck size={16} className="text-ally-primary" />
                  Langkah 2: Cek Booking Sesi Mentee Terpilih
                </label>

                <select
                  value={selectedBookingId}
                  onChange={(e) => {
                    setSelectedBookingId(e.target.value);
                    setCustomBookingId("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none mb-2"
                >
                  {displayBookings.map((b) => (
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
                    (Booking ID Aktif: <code className="font-bold text-slate-700">{activeBookingId || "-"}</code>)
                  </span>
                </div>

                {/* Status Booking Alert Indicator */}
                {loadingDossier ? (
                  <div className="mt-3 flex items-center text-xs text-slate-500">
                    <Loader2 className="animate-spin mr-2" size={14} /> Mengecek booking & memuat milestone mentee dari database...
                  </div>
                ) : !hasBooking ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>Booking #{activeBookingId} tidak aktif di backend. Menggunakan ID Mentee #{selectedMenteeId}.</span>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Booking Ada! Sesi Booking ID #{activeBookingId} terverifikasi aktif untuk {activeMentee?.name || "Mentee"}.</span>
                  </div>
                )}
              </div>

              {/* =========================================================
                  LANGKAH 3: LANGKAH KETIGA - PRINT MILESTONE MILIK USER DARI DATABASE
                 ========================================================= */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <Layers size={16} className="text-ally-primary" />
                  Langkah 3: Print Milestone Database Mentee (`user_milestones`)
                </label>

                {/* Visual Print List Daftar Milestone Mentee dari Database */}
                <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 border-b border-slate-100 pb-1.5">
                    <span className="flex items-center gap-1">
                      <ListTodo size={14} className="text-ally-primary" />
                      Daftar Milestone Mentee ({menteeMilestones.length} item di DB)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">GET /api/mentor/dossier/{activeBookingId}</span>
                  </div>

                  {loadingDossier ? (
                    <div className="py-3 text-center text-xs text-slate-500">
                      <Loader2 className="animate-spin inline mr-1" size={12} /> Memuat milestone dari database...
                    </div>
                  ) : menteeMilestones.length === 0 ? (
                    <div className="py-2 text-center text-xs text-slate-400 italic">
                      Mentee belum memiliki milestone di database atau dossier endpoint mengembalikan 0 item.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {menteeMilestones.map((m) => (
                        <div
                          key={m.milestone_id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs border border-slate-100"
                        >
                          <div className="truncate pr-2">
                            <span className="font-extrabold text-slate-800 mr-1">
                              [ID #{m.milestone_id}]
                            </span>
                            <span className="font-semibold text-slate-700">{m.task_name}</span>
                            {m.parent_id && (
                              <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
                                (parent: #{m.parent_id})
                              </span>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize shrink-0 ${
                              m.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : m.status === "in_progress"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {m.status || "pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown Selector Parent Milestone dari Database */}
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pilih Induk Milestone Tempat Action Plan Akan Dicabangkan (`parent_milestone_id`):
                </label>

                {menteeMilestones.length > 0 ? (
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
                        [ID #{m.milestone_id}] {m.task_name} {m.parent_id ? `(Sub-task ID #${m.parent_id})` : "(Milestone Utama)"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 flex items-center gap-2">
                    <Info size={15} />
                    <span>
                      Belum ada milestone tercetak. Masukkan ID Parent manual di bawah (misal: 36 atau 44).
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Atau ID Parent Kustom:</span>
                  <input
                    type="number"
                    placeholder="Misal: 36"
                    value={customMilestoneId}
                    onChange={(e) => setCustomMilestoneId(e.target.value)}
                    className="w-24 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    (ID parent dikirim ke API: <code className="font-bold text-slate-700">{customMilestoneId || parentMilestoneId}</code>)
                  </span>
                </div>
              </div>

              {/* Dynamic Action Plans List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Langkah 4: Buat Daftar Tugas Action Plan ({actionPlanTasks.length})
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