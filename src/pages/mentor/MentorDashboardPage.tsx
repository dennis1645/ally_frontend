import { useState } from "react";

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LifeBuoy,
  Plus,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Link } from "react-router";

import UserLayout from "../../components/layout/UserLayout";

import type { SidebarItem } from "../../components/layout/Sidebar";

type Explorer = {
  id: string;
  name: string;
  focus: string;
  stage: string;
  nextSession: string;
  lastSession: string;
  status: "Active" | "Needs follow-up";
  note: string;
};

type AvailabilitySlot = {
  id: string;
  day: string;
  time: string;
  available: boolean;
};

type SessionItem = {
  id: string;
  mentee: string;
  topic: string;
  time: string;
  status: "Confirmed" | "Pending" | "Rescheduled";
};

type AssignmentItem = {
  id: string;
  title: string;
  mentee: string;
  due: string;
  status: "Queued" | "Ready";
  note: string;
};

export const mentorSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/mentor/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Explorer Data",
    path: "/mentor/mentees",
    icon: UsersRound,
  },
  {
    label: "Dossier",
    path: "/mentor/dossier",
    icon: ClipboardList,
  },
  {
    label: "Scheduling",
    path: "/mentor/availability",
    icon: CalendarDays,
  },
  {
    label: "Meeting Confirmation",
    path: "/mentor/bookings",
    icon: CheckCircle2,
  },
  {
    label: "Action Plans",
    path: "/mentor/action-plans",
    icon: BriefcaseBusiness,
  },
  {
    label: "Documents Library",
    path: "/mentor/documents",
    icon: BookOpen,
  },
  {
    label: "Settings",
    path: "/mentor/settings",
    icon: Settings,
  },
  {
    label: "Support",
    path: "/mentor/support",
    icon: LifeBuoy,
  },
  {
    label: "Profile",
    path: "/mentor/profile",
    icon: UserRound,
  },
];

const explorerData: Explorer[] = [
  {
    id: "e1",
    name: "Ari Chen",
    focus: "Scholarship prep",
    stage: "Explorer ready for next step",
    nextSession: "Thu · 4:00 PM",
    lastSession: "Tue · 10:30 AM",
    status: "Active",
    note: "Needs a confidence check before the formal interview.",
  },
  {
    id: "e2",
    name: "Mina Alvarez",
    focus: "Leadership reflection",
    stage: "Asking for more structure",
    nextSession: "Fri · 11:00 AM",
    lastSession: "Mon · 2:00 PM",
    status: "Needs follow-up",
    note: "Great progress on the journaling exercise.",
  },
  {
    id: "e3",
    name: "Jordan Lee",
    focus: "Time management",
    stage: "Ready for action plan",
    nextSession: "Mon · 2:30 PM",
    lastSession: "Wed · 9:00 AM",
    status: "Active",
    note: "Strong engagement and excellent reflection quality.",
  },
];

const initialAvailability: AvailabilitySlot[] = [
  {
    id: "m1",
    day: "Mon",
    time: "8:00 AM",
    available: true,
  },
  {
    id: "m2",
    day: "Mon",
    time: "2:00 PM",
    available: false,
  },
  {
    id: "w1",
    day: "Wed",
    time: "11:00 AM",
    available: true,
  },
  {
    id: "f1",
    day: "Fri",
    time: "4:00 PM",
    available: true,
  },
];

const initialSessions: SessionItem[] = [
  {
    id: "s1",
    mentee: "Ari Chen",
    topic: "Scholarship interview prep",
    time: "Thu · 4:00 PM",
    status: "Confirmed",
  },
  {
    id: "s2",
    mentee: "Mina Alvarez",
    topic: "Career clarity session",
    time: "Fri · 11:00 AM",
    status: "Pending",
  },
  {
    id: "s3",
    mentee: "Jordan Lee",
    topic: "Goal-setting roadmap",
    time: "Mon · 2:30 PM",
    status: "Rescheduled",
  },
];

const initialAssignments: AssignmentItem[] = [
  {
    id: "a1",
    title: "Draft a 3-point reflection",
    mentee: "Ari Chen",
    due: "Today · 6:00 PM",
    status: "Queued",
    note: "Pair it with a confidence score check.",
  },
  {
    id: "a2",
    title: "Complete the leadership worksheet",
    mentee: "Mina Alvarez",
    due: "Tomorrow · 12:00 PM",
    status: "Ready",
    note: "Use the reflection journal template.",
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
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

export function MenteeManagementPage() {
  const [explorers] = useState(explorerData);

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Mentee Overview"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Explorer data"
          title="Multi-Mentee Dashboard"
          description="Review active explorers, understand their current focus, and prepare the next supportive step."
        />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Assigned explorers"
            value="3"
            helper="All active and visible in your current view"
          />
          <MetricCard
            title="Needs follow-up"
            value="1"
            helper="A quick check-in is recommended this week"
          />
          <MetricCard
            title="Next sessions"
            value="3"
            helper="All scheduled for the next 72 hours"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Active explorers</h3>
                <p className="text-sm text-slate-500">
                  Your assigned mentees and their latest momentum
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                <Plus size={16} />
                Add explorer
              </button>
            </div>

            <div className="space-y-4">
              {explorers.map((explorer) => (
                <div
                  key={explorer.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{explorer.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{explorer.focus}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        explorer.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {explorer.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-white px-3 py-1">{explorer.stage}</span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={15} /> {explorer.nextSession}
                    </span>
                    <span className="flex items-center gap-1">
                      <BadgeCheck size={15} /> {explorer.lastSession}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600">{explorer.note}</p>
                    <Link
                      to="/mentor/sessions"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-ally-primary"
                    >
                      Plan session
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Mentor insight</h3>
            <div className="mt-4 rounded-2xl bg-ally-surface p-4">
              <p className="text-sm font-semibold text-slate-700">Focus on momentum, not volume.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The best next move is to reinforce the current growth arc with a short session and one concrete follow-up assignment.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Suggested next step</p>
                <p className="mt-1 text-sm text-slate-600">
                  Confirm Ari&apos;s Thursday session and send a confidence reflection task.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Support need</p>
                <p className="mt-1 text-sm text-slate-600">
                  Mina could benefit from a lighter follow-up and a clearer weekly plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorAvailabilityPage() {
  const [slots, setSlots] = useState(initialAvailability);

  function toggleSlot(id: string) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              available: !slot.available,
            }
          : slot,
      ),
    );
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Availability planner"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Scheduling"
          title="Set your availability for synchronous sessions"
          description="Keep your weekly calendar flexible and easy for explorers to book around."
        />

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Weekly availability</h3>
                <p className="text-sm text-slate-500">
                  Toggle the time blocks you want to make visible for booking.
                </p>
              </div>
              <button className="rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white">
                Save slots
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleSlot(slot.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    slot.available
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{slot.day}</p>
                      <p className="mt-1 text-sm text-slate-600">{slot.time}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        slot.available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {slot.available ? "Open" : "Paused"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Booking guidance</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Best practice</p>
                <p className="mt-1 text-sm text-slate-600">
                  Keep one buffer block each day so sessions feel calm instead of rushed.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Suggested cadence</p>
                <p className="mt-1 text-sm text-slate-600">
                  Offer a mix of quick 25-minute sessions and 60-minute deeper check-ins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorSessionsPage() {
  const [sessions, setSessions] = useState(initialSessions);

  function updateSessionStatus(id: string, status: SessionItem["status"]) {
    setSessions((current) =>
      current.map((session) =>
        session.id === id
          ? {
              ...session,
              status,
            }
          : session,
      ),
    );
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Session workspace"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Sync sessions"
          title="Confirm or reschedule your upcoming sessions"
          description="Keep the conversation momentum high by making the next step obvious for each explorer."
        />

        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{session.mentee}</p>
                  <p className="mt-1 text-sm text-slate-600">{session.topic}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    session.status === "Confirmed"
                      ? "bg-emerald-100 text-emerald-700"
                      : session.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays size={16} />
                  {session.time}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateSessionStatus(session.id, "Confirmed")}
                    className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateSessionStatus(session.id, "Rescheduled")}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </UserLayout>
  );
}

export function ActionItemsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [draft, setDraft] = useState({
    title: "",
    mentee: "",
    due: "",
    note: "",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title || !draft.mentee || !draft.due) {
      return;
    }

    setAssignments((current) => [
      {
        id: `${Date.now()}`,
        title: draft.title,
        mentee: draft.mentee,
        due: draft.due,
        status: "Queued",
        note: draft.note || "Add a short note for the explorer.",
      },
      ...current,
    ]);

    setDraft({
      title: "",
      mentee: "",
      due: "",
      note: "",
    });
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Follow-up planner"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Action items"
          title="Add the next assignment after every session"
          description="Turn insights into momentum by attaching a clear task and a due date."
        />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{assignment.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{assignment.mentee}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      assignment.status === "Ready"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <Clock3 size={15} />
                    {assignment.due}
                  </span>
                  <span className="text-sm text-slate-500">{assignment.note}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Create a new assignment</h3>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Assignment title"
              />
              <input
                value={draft.mentee}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, mentee: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Explorer name"
              />
              <input
                value={draft.due}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, due: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Due date"
              />
              <textarea
                value={draft.note}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, note: event.target.value }))
                }
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Optional note"
              />
              <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white">
                <Plus size={16} />
                Add assignment
              </button>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorSettingsPage() {
  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Settings"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Settings"
          title="Control your mentor experience"
          description="Adjust preferences for notifications, meeting reminders, and the way your dashboard surfaces information."
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <Settings size={18} />
            <p className="font-semibold text-slate-900">Preferences</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            This workspace is ready to connect to a future settings panel with toggles for availability reminders and session formats.
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
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Support"
          title="Get help quickly when you need it"
          description="Surface a support channel, escalation path, or mentor help center from this section."
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <LifeBuoy size={18} />
            <p className="font-semibold text-slate-900">Support options</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Link this page to chat support, a mentor forum, or the product team handoff flow later.
          </p>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorDossierPage() {
  const dossierItems = [
    {
      title: "Career story",
      detail: "Strong motivation with clear purpose and long-term ambition.",
    },
    {
      title: "Academic readiness",
      detail: "Needs one more language preparation pass before the next session.",
    },
    {
      title: "Scholarship target",
      detail: "Focused on LPDP and fully funded global opportunities.",
    },
  ];

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Pre-Session Dossier & Pre-Read"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Dossier"
          title="Check Explorers' Documents Before Each Session"
          description="Review the mentee context before you open the next mentoring session."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Pre-session summary</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This view can be connected to the backend dossier endpoint so mentors can review transcripts, milestone status, and pre-read documents before each session.
            </p>
            <div className="mt-6 space-y-3">
              {dossierItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Pre-read documents</h3>
            <div className="mt-4 space-y-3">
              {[
                "Motivation letter draft",
                "Academic transcript snapshot",
                "Scholarship checklist",
              ].map((document) => (
                <div key={document} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{document}</p>
                    <p className="mt-1 text-sm text-slate-500">Ready to review before the session</p>
                  </div>
                  <button className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorBookingsPage() {
  const [bookings, setBookings] = useState([
    {
      id: "b1",
      mentee: "Ari Chen",
      topic: "Scholarship interview prep",
      time: "Thu · 4:00 PM",
      status: "Pending",
    },
    {
      id: "b2",
      mentee: "Mina Alvarez",
      topic: "Career clarity session",
      time: "Fri · 11:00 AM",
      status: "Confirmed",
    },
  ]);

  function updateStatus(id: string, status: "Confirmed" | "Rejected" | "Rescheduled") {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status,
            }
          : booking,
      ),
    );
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Confirm / Reject / Reschedule Booking"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Meeting Confirmation"
          title="Confirm / Reject / Reschedule Booking"
          description="Handle consultation requests directly from one place and keep the next step visible."
        />

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{booking.mentee}</p>
                  <p className="mt-1 text-sm text-slate-600">{booking.topic}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : booking.status === "Rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  {booking.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays size={16} />
                  {booking.time}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateStatus(booking.id, "Confirmed")} className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">
                    Confirm
                  </button>
                  <button onClick={() => updateStatus(booking.id, "Rejected")} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                    Reject
                  </button>
                  <button onClick={() => updateStatus(booking.id, "Rescheduled")} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorActionPlansPage() {
  const [plans, setPlans] = useState([
    {
      id: "p1",
      title: "Rework motivation letter outline",
      mentee: "Ari Chen",
      due: "Tomorrow",
      status: "Queued",
    },
    {
      id: "p2",
      title: "Reflect on leadership growth",
      mentee: "Mina Alvarez",
      due: "Friday",
      status: "Ready",
    },
  ]);

  const [draft, setDraft] = useState({
    title: "",
    mentee: "",
    due: "",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title || !draft.mentee || !draft.due) {
      return;
    }

    setPlans((current) => [
      {
        id: `${Date.now()}`,
        title: draft.title,
        mentee: draft.mentee,
        due: draft.due,
        status: "Queued",
      },
      ...current,
    ]);

    setDraft({
      title: "",
      mentee: "",
      due: "",
    });
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Create Action Plans"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Action plans"
          title="Store Custom Action Plan (Post-Session)"
          description="Turn each session into a concrete next step with a clear assignment and due date."
        />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{plan.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{plan.mentee}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.status === "Ready" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                    {plan.status}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-500">Due: {plan.due}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Create action plan</h3>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Task title"
              />
              <input
                value={draft.mentee}
                onChange={(event) => setDraft((current) => ({ ...current, mentee: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Explorer name"
              />
              <input
                value={draft.due}
                onChange={(event) => setDraft((current) => ({ ...current, due: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Deadline"
              />
              <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white">
                <Plus size={16} />
                Save plan
              </button>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorDocumentsPage() {
  const documents = [
    {
      name: "Motivation letter draft",
      updated: "Updated 2h ago",
    },
    {
      name: "Scholarship statement",
      updated: "Updated yesterday",
    },
    {
      name: "Recommendation note",
      updated: "Updated 3 days ago",
    },
  ];

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Documents Preview"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Documents Library"
          title="Explorers' Documents Preview"
          description="Review and manage the documents shared by mentees and mentors before the next session."
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Shared documents</h3>
              <p className="text-sm text-slate-500">The mentor can open, upload, or remove documents as needed.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white">
              <Plus size={16} />
              Upload document
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.name} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{document.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{document.updated}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                    Preview
                  </button>
                  <button className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export default function MentorDashboardPage() {
  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Lantern Guide Center"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
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
                Review explorer data, publish availability, confirm sessions, and send thoughtful assignments from one calm workspace.
              </p>
            </div>
            <div className="rounded-2xl bg-ally-surface p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Today&apos;s focus</p>
              <p className="mt-1">3 explorers need a gentle nudge and 2 sessions are ready to confirm.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <MetricCard title="Active explorers" value="3" helper="Assigned and visible now" />
            <MetricCard title="Open sessions" value="2" helper="Waiting for your confirmation" />
            <MetricCard title="Assignments" value="2" helper="New follow-up tasks prepared" />
            <MetricCard title="Availability" value="4" helper="Configured sessions this week" />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Link to="/mentor/mentees" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <UsersRound size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Explorer overview</p>
                  <p className="text-sm text-slate-600">View assigned mentees and their growth notes.</p>
                </div>
              </div>
            </Link>
            <Link to="/mentor/availability" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Availability planner</p>
                  <p className="text-sm text-slate-600">Open blocks for arranging synchronous sessions.</p>
                </div>
              </div>
            </Link>
            <Link to="/mentor/sessions" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Session management</p>
                  <p className="text-sm text-slate-600">Confirm or reschedule the next mentor session.</p>
                </div>
              </div>
            </Link>
            <Link to="/mentor/action-items" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Follow-up assignments</p>
                  <p className="text-sm text-slate-600">Set thoughtful takeaways after each session.</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-ally-surface p-5">
            <div className="flex items-center gap-2 text-ally-primary">
              <CircleAlert size={18} />
              <p className="font-semibold text-slate-900">Mentor note</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              The new mentor experience is set up with real UI sections for explorer data, availability, synchronous sessions, and post-session assignments. The left navigation also includes requests, settings, and support so the experience can grow into a full mentor portal.
            </p>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
