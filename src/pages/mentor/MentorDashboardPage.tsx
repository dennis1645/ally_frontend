import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  FileText,
  RefreshCw,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { Link } from "react-router";

import { ApiError } from "../../api/apiClient";

import {
  getMentorAvailabilities,
  getMentorDashboardStats,
  getMentorMentees,
  getMentorSubmissions,
  type MentorAvailability,
  type MentorDashboardStats,
  type MentorMentee,
  type MentorSubmission,
} from "../../api/mentorApi";

import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function Feedback({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {error}
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
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

export default function MentorDashboardPage() {
  const [mentees, setMentees] = useState<MentorMentee[]>([]);
  const [slots, setSlots] = useState<MentorAvailability[]>([]);
  const [dashboardStats, setDashboardStats] =
    useState<MentorDashboardStats | null>(null);
  const [pendingSubmissions, setPendingSubmissions] =
    useState<MentorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const [statsResult, menteeResult, availabilityResult, submissionResult] =
        await Promise.allSettled([
          getMentorDashboardStats(),
          getMentorMentees(),
          getMentorAvailabilities(),
          getMentorSubmissions("pending"),
        ]);

      const errors: string[] = [];

      if (statsResult.status === "fulfilled") {
        setDashboardStats(statsResult.value);
      } else {
        setDashboardStats(null);
      }

      if (menteeResult.status === "fulfilled") {
        setMentees(menteeResult.value);
      } else {
        setMentees([]);
        errors.push(getErrorMessage(menteeResult.reason, "Failed to load mentees."));
      }

      if (availabilityResult.status === "fulfilled") {
        setSlots(availabilityResult.value);
      } else {
        setSlots([]);
        errors.push(
          getErrorMessage(availabilityResult.reason, "Failed to load availability."),
        );
      }

      if (submissionResult.status === "fulfilled") {
        setPendingSubmissions(submissionResult.value);
      } else {
        setPendingSubmissions([]);
        errors.push(
          getErrorMessage(submissionResult.reason, "Failed to load pending reviews."),
        );
      }

      if (
        statsResult.status === "rejected" &&
        menteeResult.status === "rejected" &&
        availabilityResult.status === "rejected" &&
        submissionResult.status === "rejected"
      ) {
        errors.unshift(
          getErrorMessage(
            statsResult.reason,
            "Failed to load mentor dashboard statistics.",
          ),
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

  const fallbackOpenSlots = slots.filter((slot) => !slot.isBooked).length;
  const fallbackBookedSlots = slots.filter((slot) => slot.isBooked).length;

  const assignedMentees = dashboardStats?.assignedMentees ?? mentees.length;
  const openSlots = dashboardStats?.openAvailability ?? fallbackOpenSlots;
  const bookedSlots = dashboardStats?.bookedSessions ?? fallbackBookedSlots;
  const pendingReviews =
    dashboardStats?.pendingReviews ?? pendingSubmissions.length;

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
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh dashboard
            </button>
          </div>

          <Feedback error={error} />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Assigned mentees"
              value={loading ? "..." : String(assignedMentees)}
              helper="Assigned and visible now"
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
              title="Pending reviews"
              value={loading ? "..." : String(pendingReviews)}
              helper="Mentee submissions awaiting feedback"
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
              description="Review the backend pre-read for a mentee booking."
            />
            <DashboardLink
              to="/mentor/availability"
              icon={<CalendarDays size={19} />}
              title="Availability planner"
              description="Create and review mentor availability."
            />
            <DashboardLink
              to="/mentor/availability"
              icon={<CheckCircle2 size={19} />}
              title="Booking actions"
              description="Confirm, reject, reschedule, or complete a session."
            />
            <DashboardLink
              to="/mentor/action-plans"
              icon={<Sparkles size={19} />}
              title="Action plans"
              description="Create follow-up tasks and review mentee submissions."
            />
            <DashboardLink
              to="/mentor/documents"
              icon={<FileText size={19} />}
              title="Documents library"
              description="Review documents attached to mentee submissions."
            />
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-ally-surface p-5">
            <div className="flex items-center gap-2 text-ally-primary">
              <CircleAlert size={18} />
              <p className="font-semibold text-slate-900">API coverage</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Dashboard statistics, assigned mentees, availability, and the
              pending submission review queue are connected to the updated
              mentor APIs. Existing mentor tools and navigation remain in the
              same workspace.
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
          <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
        </div>
        <ArrowRight
          size={17}
          className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-ally-primary"
        />
      </div>
    </Link>
  );
}
