import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorDossierApi,
  confirmBookingApi,
  rejectBookingApi,
  rescheduleBookingApi,
  completeBookingApi,
  reviewMenteeApi,
  getMentorDashboardStatsApi,
  getMentorInvoicesApi,
  type MentorDossierData,
} from "../../api/mentorApi";

export type BookingOption = {
  booking_id: string;
  label: string;
};

export function MentorDossierPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId") || "1";

  const [bookingId, setBookingId] = useState<string>(bookingIdParam);
  const [availableBookings, setAvailableBookings] = useState<BookingOption[]>([]);
  const [dossier, setDossier] = useState<MentorDossierData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals & Action States
  const [confirmMeetingLink, setConfirmMeetingLink] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const [rescheduleData, setRescheduleData] = useState({
    available_date: "",
    start_time: "10:00",
    end_time: "11:00",
    reason: "",
  });
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);

  const [sessionProofFile, setSessionProofFile] = useState<File | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const [reviewData, setReviewData] = useState({ rating: 5, feedback: "" });
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Load available booking sessions from backend
  useEffect(() => {
    async function loadAvailableBookings() {
      try {
        const [statsRes, invoicesRes] = await Promise.allSettled([
          getMentorDashboardStatsApi(),
          getMentorInvoicesApi(),
        ]);

        const compiled: BookingOption[] = [];

        if (statsRes.status === "fulfilled" && statsRes.value?.data?.upcoming_schedules) {
          statsRes.value.data.upcoming_schedules.forEach((sch) => {
            compiled.push({
              booking_id: String(sch.id),
              label: `Booking #${sch.id} — ${sch.mentee?.name || "Mentee"} (${sch.session_status})`,
            });
          });
        }

        if (invoicesRes.status === "fulfilled" && invoicesRes.value?.data?.history) {
          invoicesRes.value.data.history.forEach((inv) => {
            if (!compiled.some((b) => b.booking_id === String(inv.booking_id))) {
              compiled.push({
                booking_id: String(inv.booking_id),
                label: `Booking #${inv.booking_id} — ${inv.mentee_name} (${inv.consultation_date})`,
              });
            }
          });
        }

        // Fallbacks
        if (!compiled.some((b) => b.booking_id === "1")) {
          compiled.push({ booking_id: "1", label: "Booking ID #1 (Jokowi dodo)" });
        }
        if (!compiled.some((b) => b.booking_id === "2")) {
          compiled.push({ booking_id: "2", label: "Booking ID #2 (Mardha)" });
        }

        setAvailableBookings(compiled);
      } catch (err) {
        console.warn("Failed to load available booking list", err);
      }
    }

    loadAvailableBookings();
  }, []);

  // Sync state if search param changes
  useEffect(() => {
    setBookingId(searchParams.get("bookingId") || "1");
  }, [searchParams]);

  // Fetch Dossier Data from Backend
  async function fetchDossier(id: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await getMentorDossierApi(id);
      if (response?.data) {
        setDossier(response.data);
        if (response.data.meeting_link) {
          setConfirmMeetingLink(response.data.meeting_link);
        }
      } else {
        setDossier(null);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch dossier", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat dossier mentee dari server."
      );
      setDossier(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDossier(bookingId);
  }, [bookingId]);

  // Handler Actions
  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmMeetingLink.trim()) {
      setError("Silakan masukkan link meeting Google Meet / Zoom.");
      return;
    }
    setIsConfirming(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await confirmBookingApi(bookingId, confirmMeetingLink);
      setSuccessMessage(res.message || "Sesi konsultasi berhasil dikonfirmasi!");
      fetchDossier(bookingId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengonfirmasi booking.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleRejectBooking() {
    if (!window.confirm("Apakah Anda yakin ingin menolak booking sesi ini?")) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await rejectBookingApi(bookingId);
      setSuccessMessage(res.message || "Booking berhasil ditolak.");
      fetchDossier(bookingId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menolak booking.");
    }
  }

  async function handleRescheduleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!rescheduleData.available_date || !rescheduleData.reason.trim()) {
      setError("Tanggal baru dan alasan reschedule wajib diisi.");
      return;
    }
    setIsRescheduling(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await rescheduleBookingApi(bookingId, rescheduleData);
      setSuccessMessage(res.message || "Permintaan reschedule berhasil dikirim ke mentee!");
      fetchDossier(bookingId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal reschedule booking.");
    } finally {
      setIsRescheduling(false);
    }
  }

  async function handleCompleteBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionProofFile) {
      setError("Silakan unggah foto/tangkapan layar bukti sesi konsultasi.");
      return;
    }
    setIsCompleting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await completeBookingApi(bookingId, sessionProofFile);
      setSuccessMessage(
        res.message ||
          `Sesi selesai! Fee sebesar Rp ${res.data.earned_fee?.toLocaleString("id-ID")} telah ditambahkan ke saldo Anda.`
      );
      fetchDossier(bookingId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mencairkan fee / menyelesaiakan sesi.");
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleReviewMentee(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewData.feedback.trim()) {
      setError("Silakan tulis masukan/feedback evaluasi mentee.");
      return;
    }
    setIsReviewing(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await reviewMenteeApi(bookingId, reviewData);
      setSuccessMessage(res.message || "Evaluasi mentee berhasil dikirim!");
      fetchDossier(bookingId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirimkan review.");
    } finally {
      setIsReviewing(false);
    }
  }

  const mentee = dossier?.mentee_profile;

  return (
    <UserLayout
      title="Mentee Dossier"
      subtitle="Pre-Session Document & Booking Actions"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        {/* Top Header & Booking Selector */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/mentor/mentees"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-ally-primary"
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Mentee
          </Link>

          {/* Booking ID Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <CalendarCheck size={16} className="text-ally-primary" />
            <span className="text-xs font-bold text-slate-700">Pilih Booking ID Sesi:</span>
            {availableBookings.length > 0 && (
              <select
                value={bookingId}
                onChange={(e) => {
                  const val = e.target.value;
                  setBookingId(val);
                  setSearchParams({ bookingId: val });
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-800 outline-none"
              >
                {availableBookings.map((b) => (
                  <option key={b.booking_id} value={b.booking_id}>
                    {b.label}
                  </option>
                ))}
              </select>
            )}

            <span className="text-[11px] text-slate-400 font-medium">Atau ID:</span>
            <input
              type="text"
              placeholder="1"
              value={bookingId}
              onChange={(e) => {
                const val = e.target.value;
                setBookingId(val);
                setSearchParams({ bookingId: val });
              }}
              className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 outline-none text-center"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-3">
            <CheckCircle2 size={20} />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-ally-primary" />
            <span className="ml-3 text-sm font-semibold text-slate-600">
              Memuat Dossier Booking #{bookingId}...
            </span>
          </div>
        ) : !dossier ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Dossier untuk Booking #{bookingId} tidak ditemukan.
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Silakan pilih salah satu Booking ID yang tersedia dari pilihan di atas (misal: Booking #1 atau Booking #2).
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mentee Context Header */}
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ally-surface text-ally-primary font-bold text-2xl shadow-inner border border-ally-primary/10">
                    {mentee?.name ? mentee.name.charAt(0) : "M"}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-slate-900">{mentee?.name}</h1>
                      <span className="rounded-full bg-ally-surface px-3 py-1 text-xs font-semibold text-ally-primary border border-ally-primary/20 uppercase">
                        Status Sesi: {dossier.session_status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <BadgeCheck size={16} className="text-ally-primary" />
                        Target: {mentee?.target_scholarship || "LPDP"}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                        Readiness Score: {mentee?.readiness_score || 0}%
                      </span>
                      <span className="text-xs text-slate-500">
                        {mentee?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-right">
                  {dossier.meeting_link && (
                    <a
                      href={dossier.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                    >
                      <ExternalLink size={14} /> Join Meeting Link
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Split Content: Vault Documents & Booking Actions */}
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              {/* Document Vault Pre-Read */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-ally-primary" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Document Vault (Pre-Read)
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {dossier.document_vault_pre_read?.length || 0} File
                  </span>
                </div>

                <div className="space-y-3">
                  {!dossier.document_vault_pre_read || dossier.document_vault_pre_read.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      Belum ada berkas persiapan yang diunggah mentee untuk sesi ini.
                    </p>
                  ) : (
                    dossier.document_vault_pre_read.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-slate-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{doc.file_name}</p>
                            <p className="text-xs text-slate-500 uppercase">{doc.file_type}</p>
                          </div>
                        </div>
                        <a
                          href={doc.preview_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-ally-primary hover:underline"
                        >
                          <ExternalLink size={14} /> Download / View
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions Panel (Confirm, Reject, Reschedule, Complete, Review) */}
              <div className="space-y-6">
                {/* Confirm & Reject Panel */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">1. Konfirmasi & Link Meeting</h3>
                  <form onSubmit={handleConfirmBooking} className="space-y-3">
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={confirmMeetingLink}
                      onChange={(e) => setConfirmMeetingLink(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-ally-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isConfirming}
                        className="rounded-full bg-ally-primary px-4 py-2 text-xs font-bold text-white hover:bg-ally-primary/90 disabled:opacity-50"
                      >
                        {isConfirming ? "Menyimpan..." : "Setujui & Simpan Link"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectBooking}
                        className="rounded-full bg-rose-100 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-200"
                      >
                        Tolak Booking
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reschedule Panel */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">2. Reschedule Sesi</h3>
                  <form onSubmit={handleRescheduleBooking} className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="date"
                        value={rescheduleData.available_date}
                        onChange={(e) =>
                          setRescheduleData({ ...rescheduleData, available_date: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 p-2 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="10:00"
                        value={rescheduleData.start_time}
                        onChange={(e) =>
                          setRescheduleData({ ...rescheduleData, start_time: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 p-2 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="11:00"
                        value={rescheduleData.end_time}
                        onChange={(e) =>
                          setRescheduleData({ ...rescheduleData, end_time: e.target.value })
                        }
                        className="rounded-xl border border-slate-200 p-2 text-xs outline-none"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Alasan reschedule..."
                      value={rescheduleData.reason}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, reason: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isRescheduling}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isRescheduling ? "Mengirim..." : "Kirim Reschedule ke Mentee"}
                    </button>
                  </form>
                </div>

                {/* Complete & Claim Fee Panel */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    3. Selesaikan Sesi & Upload Bukti (Cairkan Fee)
                  </h3>
                  <form onSubmit={handleCompleteBooking} className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSessionProofFile(e.target.files ? e.target.files[0] : null)
                      }
                      className="w-full text-xs text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200"
                    />
                    <button
                      type="submit"
                      disabled={isCompleting}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isCompleting ? "Memproses..." : "Selesaikan Sesi & Klaim Fee"}
                    </button>
                  </form>
                </div>

                {/* Mentee Evaluation & Review Panel */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    4. Berikan Evaluasi / Review Mentee
                  </h3>
                  <form onSubmit={handleReviewMentee} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600">Rating:</label>
                      <select
                        value={reviewData.rating}
                        onChange={(e) =>
                          setReviewData({ ...reviewData, rating: Number(e.target.value) })
                        }
                        className="rounded-xl border border-slate-200 p-1.5 text-xs font-bold"
                      >
                        <option value={5}>5 Bintang ⭐⭐⭐⭐⭐</option>
                        <option value={4}>4 Bintang ⭐⭐⭐⭐</option>
                        <option value={3}>3 Bintang ⭐⭐⭐</option>
                        <option value={2}>2 Bintang ⭐⭐</option>
                        <option value={1}>1 Bintang ⭐</option>
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Feedback untuk mentee pasca-konsultasi..."
                      value={reviewData.feedback}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, feedback: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isReviewing}
                      className="rounded-full bg-ally-primary px-4 py-2 text-xs font-bold text-white hover:bg-ally-primary/90 disabled:opacity-50"
                    >
                      {isReviewing ? "Kirim Review..." : "Simpan Review Mentee"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </UserLayout>
  );
}

export default MentorDossierPage;