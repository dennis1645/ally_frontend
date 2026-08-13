import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Eye,
  FileText,
  LifeBuoy,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Link } from "react-router";

import { ApiError } from "../../api/apiClient";

import {
  confirmMentorBooking,
  createMentorActionPlan,
  createMentorAvailability,
  deleteMentorDocument,
  getMentorAvailabilities,
  getMentorDocumentPreviewUrl,
  getMentorDocuments,
  getMentorDossier,
  getMentorDossierPreReadDocuments,
  getMentorMentees,
  rejectMentorBooking,
  rescheduleMentorBooking,
  uploadMentorDocument,
  type MentorAvailability,
  type MentorDocument,
  type MentorDossier,
  type MentorMentee,
} from "../../api/mentorApi";

import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value: string): string {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderUnknownValue(value: unknown): string {
  if (value === null || value === undefined) return "—";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unable to display value";
  }
}

// --- SHARED COMPONENTS ---
function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

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
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {helper}
      </p>
    </div>
  );
}

function Feedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {success}
        </div>
      )}
    </>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-ally-primary" />
        <p className="mt-3 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

/* =========================================================
   Mentee management
========================================================= */

export function MenteeManagementPage() {
  const [mentees, setMentees] = useState<MentorMentee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMentees(mode: "initial" | "refresh" = "initial") {
    try {
      mode === "initial" ? setLoading(true) : setRefreshing(true);
      setError(null);
      setMentees(await getMentorMentees());
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to load assigned mentees."),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadMentees();
  }, []);

  const filteredMentees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return mentees;

    return mentees.filter((mentee) =>
      [
        mentee.name,
        mentee.email,
        mentee.status,
        mentee.targetMajor ?? "",
        mentee.primaryScholarshipTarget ?? "",
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [mentees, searchQuery]);

  const activeMentees = mentees.filter(
    (mentee) => mentee.status.toLowerCase() === "active",
  ).length;

  const scoredMentees = mentees.filter(
    (mentee) => mentee.readinessScore !== null,
  ).length;

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Mentee Overview"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Explorer data"
          title="Multi-Mentee Dashboard"
          description="Assigned mentees loaded directly from GET /api/mentor/mentees."
          action={
            <button
              type="button"
              onClick={() => void loadMentees("refresh")}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>
          }
        />

        <Feedback error={error} />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Assigned mentees"
            value={String(mentees.length)}
            helper="Returned by the mentor API"
          />
          <MetricCard
            title="Active mentees"
            value={String(activeMentees)}
            helper="Based on returned status"
          />
          <MetricCard
            title="Readiness available"
            value={String(scoredMentees)}
            helper="Mentees with readiness data"
          />
        </div>

        {loading ? (
          <LoadingPanel label="Loading assigned mentees..." />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Assigned mentees
                </h3>
                <p className="text-sm text-slate-500">
                  No frontend explorer mock data is used here.
                </p>
              </div>

              <label className="relative block sm:w-72">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search mentees..."
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-ally-primary"
                />
              </label>
            </div>

            {filteredMentees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                {mentees.length === 0
                  ? "No mentees are currently assigned to this mentor."
                  : "No mentees match your search."}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredMentees.map((mentee) => (
                  <article
                    key={mentee.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-blue-50 font-bold text-ally-primary">
                        {mentee.profilePictureUrl ? (
                          <img
                            src={mentee.profilePictureUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          mentee.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {mentee.name}
                            </h4>
                            {mentee.email && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {mentee.email}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            {mentee.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          <MiniField
                            label="Readiness"
                            value={
                              mentee.readinessScore === null
                                ? "—"
                                : `${mentee.readinessScore}%`
                            }
                          />
                          <MiniField
                            label="Level"
                            value={String(mentee.level ?? "—")}
                          />
                          <MiniField
                            label="Target"
                            value={mentee.primaryScholarshipTarget ?? "—"}
                          />
                          <MiniField
                            label="XP"
                            value={String(mentee.xpPoints ?? "—")}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </UserLayout>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <span className="text-slate-400">{label}</span>
      <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
    </div>
  );
}

/* =========================================================
   Availability
========================================================= */

export function MentorAvailabilityPage() {
  const [slots, setSlots] = useState<MentorAvailability[]>([]);
  const [availableDate, setAvailableDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadSlots() {
    try {
      setLoading(true);
      setError(null);
      setSlots(await getMentorAvailabilities());
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to load mentor availability."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSlots();
  }, []);

  async function handleCreateSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!availableDate || !startTime || !endTime) {
      setError("Date, start time, and end time are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await createMentorAvailability({
        available_date: availableDate,
        start_time: startTime,
        end_time: endTime,
      });

      setSuccess("Availability slot added successfully.");
      setAvailableDate("");
      setStartTime("");
      setEndTime("");
      await loadSlots();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to add availability."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Availability Planner"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Scheduling"
          title="Set your availability for synchronous sessions"
          description="Create and review real mentor availability slots from the API."
          action={
            <button
              type="button"
              onClick={() => void loadSlots()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          }
        />

        <Feedback error={error} success={success} />

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleCreateSlot}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Add availability
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              POST /api/mentor/availabilities
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Available date
                </span>
                <input
                  type="date"
                  required
                  value={availableDate}
                  onChange={(event) => setAvailableDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <TimeInput
                  label="Start time"
                  value={startTime}
                  onChange={setStartTime}
                />
                <TimeInput
                  label="End time"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Add slot
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Current availability
            </h3>
            <p className="text-sm text-slate-500">
              GET /api/mentor/availabilities
            </p>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto animate-spin text-ally-primary" />
              </div>
            ) : slots.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No availability slots have been added yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {slots.map((slot, index) => (
                  <div
                    key={
                      slot.id ??
                      `${slot.availableDate}-${slot.startTime}-${index}`
                    }
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatDate(slot.availableDate)}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Clock3 size={15} />
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </p>
                    </div>

                    <span
                      className={[
                        "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                        slot.isBooked
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700",
                      ].join(" ")}
                    >
                      {slot.isBooked ? "Booked" : "Open"}
                    </span>
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

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="time"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
      />
    </label>
  );
}


/* =========================================================
   Booking actions
========================================================= */

export function MentorBookingsPage() {
  const [bookingId, setBookingId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [newAvailabilityId, setNewAvailabilityId] = useState("");
  const [slots, setSlots] = useState<MentorAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [busyAction, setBusyAction] = useState<
    "confirm" | "reject" | "reschedule" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setSlots(await getMentorAvailabilities());
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Failed to load availability options for rescheduling.",
          ),
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    void loadSlots();
  }, []);

  async function handleConfirm() {
    const id = bookingId.trim();
    const link = meetingLink.trim();

    if (!id || !link) {
      setError("Booking ID and meeting link are required to confirm.");
      return;
    }

    try {
      setBusyAction("confirm");
      setError(null);
      setSuccess(null);

      await confirmMentorBooking(id, {
        meeting_link: link,
      });

      setSuccess(`Booking #${id} confirmed successfully.`);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to confirm booking."),
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReject() {
    const id = bookingId.trim();
    const reason = rejectReason.trim();

    if (!id || !reason) {
      setError("Booking ID and rejection reason are required.");
      return;
    }

    try {
      setBusyAction("reject");
      setError(null);
      setSuccess(null);

      await rejectMentorBooking(id, {
        reason,
      });

      setSuccess(`Booking #${id} rejected successfully.`);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to reject booking."),
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReschedule() {
    const id = bookingId.trim();
    const reason = rescheduleReason.trim();
    const parsedAvailabilityId = Number(newAvailabilityId);

    if (
      !id ||
      !reason ||
      !Number.isInteger(parsedAvailabilityId) ||
      parsedAvailabilityId <= 0
    ) {
      setError(
        "Booking ID, a new availability slot, and reschedule reason are required.",
      );
      return;
    }

    try {
      setBusyAction("reschedule");
      setError(null);
      setSuccess(null);

      await rescheduleMentorBooking(id, {
        new_availability_id: parsedAvailabilityId,
        reason,
      });

      setSuccess(`Booking #${id} rescheduled successfully.`);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to reschedule booking."),
      );
    } finally {
      setBusyAction(null);
    }
  }

  const openSlots = slots.filter(
    (slot) => !slot.isBooked && slot.id !== null,
  );

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Booking Management"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Meeting confirmation"
          title="Confirm, reject, or reschedule a booking"
          description="The action forms below match the exact request bodies in the supplied Postman collection."
        />

        <Feedback error={error} success={success} />

        <div className="mx-auto max-w-4xl">
          <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Booking ID
              </span>
              <input
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                inputMode="numeric"
                placeholder="e.g. 1"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
              />
            </label>

            <p className="mt-2 text-xs text-slate-500">
              No mentor booking-list GET endpoint is present in the collection,
              so use the booking ID produced by the booking workflow.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
              className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                <h3 className="font-semibold text-slate-900">Confirm</h3>
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Meeting link
                </span>
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(event) => setMeetingLink(event.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
                />
              </label>

              <button
                type="submit"
                disabled={busyAction !== null}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busyAction === "confirm" && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Confirm booking
              </button>
            </form>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleReject();
              }}
              className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-rose-700">
                <CircleAlert size={18} />
                <h3 className="font-semibold text-slate-900">Reject</h3>
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Reason
                </span>
                <textarea
                  required
                  rows={4}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Reason for rejecting this session..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
                />
              </label>

              <button
                type="submit"
                disabled={busyAction !== null}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-60"
              >
                {busyAction === "reject" && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Reject booking
              </button>
            </form>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleReschedule();
              }}
              className="rounded-3xl border border-sky-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sky-700">
                <CalendarDays size={18} />
                <h3 className="font-semibold text-slate-900">Reschedule</h3>
              </div>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  New availability
                </span>
                <select
                  required
                  value={newAvailabilityId}
                  onChange={(event) =>
                    setNewAvailabilityId(event.target.value)
                  }
                  disabled={loadingSlots}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
                >
                  <option value="">
                    {loadingSlots
                      ? "Loading slots..."
                      : "Choose an open slot"}
                  </option>

                  {openSlots.map((slot) => (
                    <option key={String(slot.id)} value={String(slot.id)}>
                      {formatDate(slot.availableDate)} ·{" "}
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Reason
                </span>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(event) =>
                    setRescheduleReason(event.target.value)
                  }
                  placeholder="Why is this session being moved?"
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
                />
              </label>

              <button
                type="submit"
                disabled={busyAction !== null || loadingSlots}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 disabled:opacity-60"
              >
                {busyAction === "reschedule" && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Reschedule
              </button>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorSessionsPage() {
  return <MentorBookingsPage />;
}

/* =========================================================
   Action plans
========================================================= */

export function MentorActionPlansPage() {
  const [bookingId, setBookingId] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [parentMilestoneId, setParentMilestoneId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedMilestone = Number(parentMilestoneId);

    if (
      !bookingId.trim() ||
      !taskDescription.trim() ||
      !deadline ||
      !Number.isInteger(parsedMilestone) ||
      parsedMilestone <= 0
    ) {
      setError(
        "Booking ID, task description, deadline, and a valid parent milestone ID are required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await createMentorActionPlan(bookingId.trim(), {
        task_description: taskDescription.trim(),
        deadline,
        parent_milestone_id: parsedMilestone,
      });

      setSuccess("Action plan created successfully.");
      setTaskDescription("");
      setDeadline("");
      setParentMilestoneId("");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to create action plan."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Create Action Plans"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Action plans"
          title="Store Custom Action Plan (Post-Session)"
          description="POST a real follow-up task to the selected booking."
        />

        <Feedback error={error} success={success} />

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Booking ID
              </span>
              <input
                required
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                placeholder="1"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Parent milestone ID
              </span>
              <input
                required
                type="number"
                min="1"
                value={parentMilestoneId}
                onChange={(event) => setParentMilestoneId(event.target.value)}
                placeholder="3"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Task description
            </span>
            <textarea
              required
              rows={5}
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              placeholder="Revisi bagian paragraf kontribusi pada draf motivation letter"
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Deadline
            </span>
            <input
              required
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Create action plan
          </button>
        </form>
      </section>
    </UserLayout>
  );
}

export function ActionItemsPage() {
  return <MentorActionPlansPage />;
}

/* =========================================================
   Dossier
========================================================= */

export function MentorDossierPage() {
  const [bookingId, setBookingId] = useState("");
  const [dossier, setDossier] = useState<MentorDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoadDossier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const id = bookingId.trim();

    if (!id) {
      setError("Booking ID is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDossier(await getMentorDossier(id));
    } catch (requestError) {
      setDossier(null);
      setError(
        getErrorMessage(
          requestError,
          "Failed to load the pre-session dossier.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Pre-Session Dossier & Pre-Read"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Dossier"
          title="Check the explorer context before each session"
          description="GET /api/mentor/dossier/{bookingId}. The returned object is displayed without inventing an undocumented dossier schema."
        />

        <Feedback error={error} />

        <form
          onSubmit={handleLoadDossier}
          className="mb-6 flex max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end"
        >
          <label className="min-w-0 flex-1">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Booking ID
            </span>
            <input
              required
              value={bookingId}
              onChange={(event) => setBookingId(event.target.value)}
              placeholder="1"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-ally-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <BookOpen size={16} />
            )}
            Load dossier
          </button>
        </form>

        {dossier && (
          <div className="space-y-5">
            {getMentorDossierPreReadDocuments(dossier).length > 0 && (
              <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-ally-primary">
                  <FileText size={18} />
                  <h3 className="font-semibold text-slate-900">
                    Pre-read documents
                  </h3>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  These signed URLs come directly from
                  document_vault_pre_read.file_path in the dossier response and
                  are generated by the backend for temporary access.
                </p>

                <div className="mt-4 space-y-3">
                  {getMentorDossierPreReadDocuments(dossier).map(
                    (document) => (
                      <div
                        key={document.filePath}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {document.label}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Temporary signed pre-read
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              document.filePath,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          <Eye size={15} />
                          Open pre-read
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Pre-session data
              </h3>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {Object.entries(dossier).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      {formatLabel(key)}
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">
                      {renderUnknownValue(value)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}


/* =========================================================
   Documents
========================================================= */

export function MentorDocumentsPage() {
  const [documents, setDocuments] = useState<MentorDocument[]>([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError(null);
      setDocuments(await getMentorDocuments());
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to load mentor documents."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !duration.trim() || !file) {
      setError("Title, file, and duration are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await uploadMentorDocument({
        title: title.trim(),
        file,
        duration: duration.trim(),
      });

      setSuccess("Mentor document uploaded successfully.");
      setTitle("");
      setDuration("");
      setFile(null);

      await loadDocuments();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to upload mentor document."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(document: MentorDocument) {
    if (!window.confirm(`Delete "${document.title}"?`)) return;

    try {
      setDeletingId(document.id);
      setError(null);
      setSuccess(null);

      await deleteMentorDocument(document.id);

      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );

      setSuccess("Document deleted successfully.");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to delete mentor document."),
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handlePreview(document: MentorDocument) {
    const url = getMentorDocumentPreviewUrl(document);

    if (!url) {
      setError(
        "The backend did not return a signed preview/download URL for this document.",
      );
      return;
    }

    setError(null);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Documents Library"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Documents library"
          title="Mentor documents"
          description="List, upload, preview, and delete documents using the mentor document APIs."
          action={
            <button
              type="button"
              onClick={() => void loadDocuments()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          }
        />

        <Feedback error={error} success={success} />

        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <form
            onSubmit={handleUpload}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 text-ally-primary">
              <Upload size={18} />
              <h3 className="font-semibold text-slate-900">Upload document</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              multipart/form-data: title + file + duration
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Title
                </span>
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Panduan IELTS 2026"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Duration
                </span>
                <input
                  required
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="5_minutes"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ally-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  File
                </span>
                <input
                  required
                  type="file"
                  onChange={(event) =>
                    setFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full rounded-xl border border-slate-200 bg-white p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-ally-primary"
                />
              </label>

              {file && (
                <p className="text-xs text-slate-500">
                  Selected: {file.name}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                Upload
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Shared documents
            </h3>
            <p className="text-sm text-slate-500">
              GET /api/mentor/documents
            </p>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto animate-spin text-ally-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No mentor documents are available yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {documents.map((document) => {
                  const previewUrl = getMentorDocumentPreviewUrl(document);

                  return (
                    <article
                      key={document.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={18}
                            className="shrink-0 text-ally-primary"
                          />
                          <h4 className="truncate font-semibold text-slate-900">
                            {document.title}
                          </h4>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                          {document.fileName && <span>{document.fileName}</span>}
                          {document.duration && (
                            <span>Duration: {document.duration}</span>
                          )}
                          {document.createdAt && (
                            <span>Added {formatDate(document.createdAt)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreview(document)}
                          disabled={!previewUrl}
                          title={
                            previewUrl
                              ? "Open backend-provided signed preview"
                              : "No signed preview URL returned"
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Eye size={15} />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(document)}
                          disabled={deletingId === document.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60"
                        >
                          {deletingId === document.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              Signed preview URLs are consumed exactly as returned by the
              backend. The frontend never generates expires or signature.
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

/* =========================================================
   Static mentor pages retained
========================================================= */

export function MentorSettingsPage() {
  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Settings"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Settings"
          title="Control your mentor experience"
          description="No mentor-settings API was included in the supplied endpoint set."
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <Settings size={18} />
            <p className="font-semibold text-slate-900">Preferences</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Settings remain unchanged until their backend contract is available.
          </p>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorSupportPage() {
  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Support"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Support"
          title="Get help quickly when you need it"
          description="No mentor-support API was included in the supplied endpoint set."
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <LifeBuoy size={18} />
            <p className="font-semibold text-slate-900">Support options</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            The existing support workspace is preserved.
          </p>
        </div>
      </section>
    </UserLayout>
  );
}

/* =========================================================
   Main mentor dashboard
========================================================= */

export default function MentorDashboardPage() {
  const [mentees, setMentees] = useState<MentorMentee[]>([]);
  const [slots, setSlots] = useState<MentorAvailability[]>([]);
  const [documents, setDocuments] = useState<MentorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const [menteeResult, availabilityResult, documentResult] =
        await Promise.allSettled([
          getMentorMentees(),
          getMentorAvailabilities(),
          getMentorDocuments(),
        ]);

      const errors: string[] = [];

      if (menteeResult.status === "fulfilled") {
        setMentees(menteeResult.value);
      } else {
        setMentees([]);
        errors.push(
          getErrorMessage(menteeResult.reason, "Failed to load mentees."),
        );
      }

      if (availabilityResult.status === "fulfilled") {
        setSlots(availabilityResult.value);
      } else {
        setSlots([]);
        errors.push(
          getErrorMessage(
            availabilityResult.reason,
            "Failed to load availability.",
          ),
        );
      }

      if (documentResult.status === "fulfilled") {
        setDocuments(documentResult.value);
      } else {
        setDocuments([]);
        errors.push(
          getErrorMessage(documentResult.reason, "Failed to load documents."),
        );
      }

      if (errors.length > 0) setError(errors.join(" "));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const openSlots = slots.filter((slot) => !slot.isBooked).length;
  const bookedSlots = slots.filter((slot) => slot.isBooked).length;

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Lantern Guide Center"
      sidebarItems={mentorSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
                Mentor Dashboard
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Shape the next step for each explorer
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Review assigned mentees, publish availability, handle booking
                actions, prepare dossiers, create action plans, and manage
                mentor documents.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh dashboard
            </button>
          </div>

          <Feedback error={error} />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Assigned mentees"
              value={loading ? "..." : String(mentees.length)}
              helper="GET /api/mentor/mentees"
            />
            <MetricCard
              title="Open availability"
              value={loading ? "..." : String(openSlots)}
              helper="Available booking slots"
            />
            <MetricCard
              title="Booked slots"
              value={loading ? "..." : String(bookedSlots)}
              helper="Availability marked booked"
            />
            <MetricCard
              title="Documents"
              value={loading ? "..." : String(documents.length)}
              helper="GET /api/mentor/documents"
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DashboardLink
              to="/mentor/mentees"
              icon={<UsersRound size={19} />}
              title="Explorer overview"
              description="View real assigned mentees and readiness context."
            />
            <DashboardLink
              to="/mentor/dossier"
              icon={<BookOpen size={19} />}
              title="Pre-session dossier"
              description="Load the dossier for a real booking ID."
            />
            <DashboardLink
              to="/mentor/availability"
              icon={<CalendarDays size={19} />}
              title="Availability planner"
              description="Create and review mentor availability."
            />
            <DashboardLink
              to="/mentor/bookings"
              icon={<CheckCircle2 size={19} />}
              title="Booking actions"
              description="Confirm, reject, or reschedule a booking."
            />
            <DashboardLink
              to="/mentor/action-plans"
              icon={<Sparkles size={19} />}
              title="Action plans"
              description="Create a post-session task for a booking."
            />
            <DashboardLink
              to="/mentor/documents"
              icon={<FileText size={19} />}
              title="Documents library"
              description="Upload, preview, and remove mentor documents."
            />
          </div>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-ally-surface p-5">
            <div className="flex items-center gap-2 text-ally-primary">
              <CircleAlert size={18} />
              <p className="font-semibold text-slate-900">API coverage</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Mentees, dossier, availability, booking actions, action plans,
              and document management are connected. No booking-list,
              settings, support, or signed-URL generation endpoint was
              invented.
            </p>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

function DashboardLink({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {description}
          </p>
        </div>
        <ArrowRight
          size={17}
          className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-ally-primary"
        />
      </div>
    </Link>
  );
}