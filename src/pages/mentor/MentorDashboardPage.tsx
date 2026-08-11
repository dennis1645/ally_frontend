import { useState } from "react";

import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Filter,
  GraduationCap,
  LifeBuoy,
  Plus,
  Search,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Link } from "react-router";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

// --- TYPES ---
type Explorer = {
  id: string;
  name: string;
  targetUniv?: string;
  targetMajor?: string;
  targetScholarship: string;
  stage?: string;
  lastSession: string | null;
  documentsSubmitted?: string[];
  assessmentSummary?: string;
  completedDate?: string;
  status: "Active" | "Inactive";
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

// --- MOCK DATA ---
const allExplorersData: Explorer[] = [
  {
    id: "e1",
    name: "Ari Chen",
    targetUniv: "TU Delft / ETH Zurich",
    targetMajor: "Chemical Engineering",
    targetScholarship: "LPDP / Eiffel Excellence",
    stage: "Milestone 2.1 - Essay Review",
    lastSession: "Tue · 10:30 AM",
    documentsSubmitted: ["Motivation Letter v2.pdf", "Academic Transcript.pdf", "TOEFL Certificate.pdf"],
    assessmentSummary: "Focuses on detailing real contributions to the country post-graduation.",
    status: "Active",
  },
  {
    id: "e2",
    name: "Jordan Lee",
    targetUniv: "Wageningen University",
    targetMajor: "Food Technology",
    targetScholarship: "Holland Scholarship",
    stage: "Milestone 1 - University Selection",
    lastSession: null, // Belum pernah sesi
    documentsSubmitted: ["CV ATS Format.pdf", "Research Statement Draft.pdf"],
    assessmentSummary: "Needs extra guidance in selecting a curriculum aligned with their Bachelor's degree.",
    status: "Active",
  },
  {
    id: "h1",
    name: "Mina Alvarez",
    targetScholarship: "Chevening Scholarship",
    lastSession: "14 Feb 2026",
    completedDate: "Feb 2026",
    status: "Inactive",
  },
  {
    id: "h2",
    name: "Devon Vance",
    targetScholarship: "DAAD EPOS",
    lastSession: "10 Jan 2026",
    completedDate: "Jan 2026",
    status: "Inactive",
  },
  {
    id: "h3",
    name: "Siti Rahma",
    targetScholarship: "LPDP Reguler",
    lastSession: "05 Dec 2025",
    completedDate: "Dec 2025",
    status: "Inactive",
  },
];

const initialAvailability: AvailabilitySlot[] = [
  { id: "m1", day: "Mon", time: "8:00 AM", available: true },
  { id: "m2", day: "Mon", time: "2:00 PM", available: false },
  { id: "w1", day: "Wed", time: "11:00 AM", available: true },
  { id: "f1", day: "Fri", time: "4:00 PM", available: true },
];

const initialSessions: SessionItem[] = [
  { id: "s1", mentee: "Ari Chen", topic: "Scholarship interview prep", time: "Thu · 4:00 PM", status: "Confirmed" },
  { id: "s2", mentee: "Mina Alvarez", topic: "Career clarity session", time: "Fri · 11:00 AM", status: "Pending" },
  { id: "s3", mentee: "Jordan Lee", topic: "Goal-setting roadmap", time: "Mon · 2:30 PM", status: "Rescheduled" },
];

const initialAssignments: AssignmentItem[] = [
  { id: "a1", title: "Draft a 3-point reflection", mentee: "Ari Chen", due: "Today · 6:00 PM", status: "Queued", note: "Pair it with a confidence score check." },
  { id: "a2", title: "Complete the leadership worksheet", mentee: "Mina Alvarez", due: "Tomorrow · 12:00 PM", status: "Ready", note: "Use the reflection journal template." },
];

// --- SHARED COMPONENTS ---
function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
          {eyebrow}
        </p>
      )}
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

// --- PAGES ---

export function MenteeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  const filteredExplorers = allExplorersData.filter((explorer) => {
    const matchesSearch = explorer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || explorer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = allExplorersData.filter((e) => e.status === "Active").length;
  const inactiveCount = allExplorersData.filter((e) => e.status === "Inactive").length;
  const reviewCount = 2; // Statis sebagai contoh UI

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
            title="Active Assigned Explorers"
            value={String(activeCount)}
            helper="Assigned by AI & actively guided"
          />
          <MetricCard
            title="History Explorers"
            value={String(inactiveCount)}
            helper="Mentees who have completed their program"
          />
          <MetricCard
            title="Explorers to Review"
            value={String(reviewCount)}
            helper="Mentees with new documents ready for review"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          {/* Main List Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Explorer Directory</h3>
                <p className="text-sm text-slate-500">
                  Manage your active sessions and past mentees
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search mentee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-ally-primary sm:w-64"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-ally-primary cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {filteredExplorers.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No explorers found matching your criteria.
                </div>
              ) : (
                filteredExplorers.map((explorer) => (
                  <div
                    key={explorer.id}
                    className={`rounded-2xl border p-5 transition ${
                      explorer.status === "Active" 
                        ? "border-slate-200 bg-slate-50/70" 
                        : "border-slate-100 bg-slate-50/30 opacity-80 grayscale-[20%]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-slate-900">{explorer.name}</p>
                          {explorer.status === "Inactive" && (
                            <span className="text-xs text-slate-400 font-medium">
                              (Completed: {explorer.completedDate})
                            </span>
                          )}
                        </div>
                        {explorer.stage && explorer.status === "Active" && (
                          <span className="mt-1 inline-block rounded-full bg-ally-surface px-3 py-0.5 text-xs font-medium text-ally-primary">
                            {explorer.stage}
                          </span>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          explorer.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {explorer.status}
                      </span>
                    </div>

                    {explorer.status === "Active" && (
                      <>
                        <div className="mt-4 grid gap-2 rounded-xl bg-white p-3.5 text-sm text-slate-700 shadow-sm border border-slate-100">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={16} className="text-ally-primary shrink-0" />
                            <span>
                              <strong className="font-semibold text-slate-900">Target Univ & Major:</strong>{" "}
                              {explorer.targetUniv} — {explorer.targetMajor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BadgeCheck size={16} className="text-ally-primary shrink-0" />
                            <span>
                              <strong className="font-semibold text-slate-900">Scholarship:</strong>{" "}
                              {explorer.targetScholarship}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-slate-600 bg-slate-100/60 p-3 rounded-xl border border-slate-200/60">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Assessment Note
                          </p>
                          <p className="italic">&ldquo;{explorer.assessmentSummary}&rdquo;</p>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                            Submitted Documents ({explorer.documentsSubmitted?.length || 0})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {explorer.documentsSubmitted?.map((doc, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-2xs"
                              >
                                <FileText size={13} className="text-slate-400" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {explorer.status === "Inactive" && (
                      <div className="mt-3 text-sm text-slate-600">
                        <p><strong>Target Scholarship:</strong> {explorer.targetScholarship}</p>
                        <p className="mt-1 text-xs text-slate-400 italic">Documents are archived and no longer accessible.</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock3 size={15} /> Last session:{" "}
                        <span className="font-medium text-slate-700">
                          {explorer.lastSession ? explorer.lastSession : "-"}
                        </span>
                      </span>
                      {explorer.status === "Active" ? (
                        <Link
                          to="/mentor/dossier"
                          className="inline-flex items-center gap-2 font-semibold text-ally-primary hover:underline"
                        >
                          Mentee Overview
                          <ArrowRight size={16} />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-2 font-medium text-slate-400 cursor-not-allowed">
                          Overview Archived
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Mentor Guidance</h3>
              
              <div className="mt-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ally-primary text-white shadow-sm">
                  <Bot size={22} />
                </div>
                <div className="relative rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  <p>
                    "Don't forget to check your mentee's readiness, they depend on your guidance!"
                  </p>
                </div>
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
        slot.id === id ? { ...slot, available: !slot.available } : slot,
      ),
    );
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Availability planner"
      sidebarItems={mentorSidebarItems}
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
        session.id === id ? { ...session, status } : session,
      ),
    );
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Session workspace"
      sidebarItems={mentorSidebarItems}
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
  const [draft, setDraft] = useState({ title: "", mentee: "", due: "", note: "" });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title || !draft.mentee || !draft.due) return;
    setAssignments((current) => [
      { id: `${Date.now()}`, title: draft.title, mentee: draft.mentee, due: draft.due, status: "Queued", note: draft.note || "Add a short note for the explorer." },
      ...current,
    ]);
    setDraft({ title: "", mentee: "", due: "", note: "" });
  }

  return (
    <UserLayout title="Mentor Portal" subtitle="Follow-up planner" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader eyebrow="Action items" title="Add the next assignment after every session" description="Turn insights into momentum by attaching a clear task and a due date." />
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{assignment.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{assignment.mentee}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${assignment.status === "Ready" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{assignment.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><Clock3 size={15} />{assignment.due}</span>
                  <span className="text-sm text-slate-500">{assignment.note}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Create a new assignment</h3>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary" placeholder="Assignment title" />
              <input value={draft.mentee} onChange={(event) => setDraft((current) => ({ ...current, mentee: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary" placeholder="Explorer name" />
              <input value={draft.due} onChange={(event) => setDraft((current) => ({ ...current, due: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary" placeholder="Due date" />
              <textarea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary" placeholder="Optional note" />
              <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white"><Plus size={16} />Add assignment</button>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorSettingsPage() {
  return (
    <UserLayout title="Mentor Portal" subtitle="Settings" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader eyebrow="Settings" title="Control your mentor experience" description="Adjust preferences for notifications, meeting reminders, and the way your dashboard surfaces information." />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <Settings size={18} />
            <p className="font-semibold text-slate-900">Preferences</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">This workspace is ready to connect to a future settings panel with toggles for availability reminders and session formats.</p>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorSupportPage() {
  return (
    <UserLayout title="Mentor Portal" subtitle="Support" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader eyebrow="Support" title="Get help quickly when you need it" description="Surface a support channel, escalation path, or mentor help center from this section." />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <LifeBuoy size={18} />
            <p className="font-semibold text-slate-900">Support options</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">Link this page to chat support, a mentor forum, or the product team handoff flow later.</p>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorDossierPage() {
  const dossierItems = [
    { title: "Career story", detail: "Strong motivation with clear purpose and long-term ambition." },
    { title: "Academic readiness", detail: "Needs one more language preparation pass before the next session." },
    { title: "Scholarship target", detail: "Focused on LPDP and fully funded global opportunities." },
  ];

  return (
    <UserLayout title="Mentor Portal" subtitle="Pre-Session Dossier & Pre-Read" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader eyebrow="Dossier" title="Check Explorers' Documents Before Each Session" description="Review the mentee context before you open the next mentoring session." />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Pre-session summary</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This view can be connected to the backend dossier endpoint so mentors can review transcripts, milestone status, and pre-read documents before each session.</p>
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
              {["Motivation letter draft", "Academic transcript snapshot", "Scholarship checklist"].map((document) => (
                <div key={document} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{document}</p>
                    <p className="mt-1 text-sm text-slate-500">Ready to review before the session</p>
                  </div>
                  <button className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">Open</button>
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
    { id: "b1", mentee: "Ari Chen", topic: "Scholarship interview prep", time: "Thu · 4:00 PM", status: "Pending" },
    { id: "b2", mentee: "Mina Alvarez", topic: "Career clarity session", time: "Fri · 11:00 AM", status: "Confirmed" },
  ]);

  function updateStatus(id: string, status: "Confirmed" | "Rejected" | "Rescheduled") {
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
  }

  return (
    <UserLayout title="Mentor Portal" subtitle="Confirm / Reject / Reschedule Booking" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader eyebrow="Meeting Confirmation" title="Confirm / Reject / Reschedule Booking" description="Handle consultation requests directly from one place and keep the next step visible." />
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{booking.mentee}</p>
                  <p className="mt-1 text-sm text-slate-600">{booking.topic}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : booking.status === "Rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{booking.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} />{booking.time}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateStatus(booking.id, "Confirmed")} className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">Confirm</button>
                  <button onClick={() => updateStatus(booking.id, "Rejected")} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Reject</button>
                  <button onClick={() => updateStatus(booking.id, "Rescheduled")} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Reschedule</button>
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
    { id: "p1", title: "Rework motivation letter outline", mentee: "Ari Chen", due: "Tomorrow", status: "Queued" },
    { id: "p2", title: "Reflect on leadership growth", mentee: "Mina Alvarez", due: "Friday", status: "Ready" },
  ]);
  const [draft, setDraft] = useState({ title: "", mentee: "", due: "" });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title || !draft.mentee || !draft.due) return;
    setPlans((current) => [{ id: `${Date.now()}`, title: draft.title, mentee: draft.mentee, due: draft.due, status: "Queued" }, ...current]);
    setDraft({ title: "", mentee: "", due: "" });
  }

  return (
    <UserLayout title="Mentor Portal" subtitle="Create Action Plans" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader eyebrow="Action plans" title="Store Custom Action Plan (Post-Session)" description="Turn each session into a concrete next step with a clear assignment and due date." />
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{plan.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{plan.mentee}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.status === "Ready" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{plan.status}</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">Due: {plan.due}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Create action plan</h3>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary" placeholder="Task title" />
              <input value={draft.mentee} onChange={(event) => setDraft((current) => ({ ...current, mentee: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary" placeholder="Explorer name" />
              <input value={draft.due} onChange={(event) => setDraft((current) => ({ ...current, due: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary" placeholder="Deadline" />
              <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white"><Plus size={16} />Save plan</button>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export function MentorDocumentsPage() {
  const documents = [
    { name: "Motivation letter draft", updated: "Updated 2h ago" },
    { name: "Scholarship statement", updated: "Updated yesterday" },
    { name: "Recommendation note", updated: "Updated 3 days ago" },
  ];

  return (
    <UserLayout title="Mentor Portal" subtitle="Documents Preview" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader eyebrow="Documents Library" title="Explorers' Documents Preview" description="Review and manage the documents shared by mentees and mentors before the next session." />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Shared documents</h3>
              <p className="text-sm text-slate-500">The mentor can open, upload, or remove documents as needed.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white"><Plus size={16} />Upload document</button>
          </div>
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.name} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{document.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{document.updated}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Preview</button>
                  <button className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">Open</button>
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
    <UserLayout title="Mentor Portal" subtitle="Lantern Guide Center" sidebarItems={mentorSidebarItems}>
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">Mentor Dashboard</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Shape the next step for each explorer</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Review explorer data, publish availability, confirm sessions, and send thoughtful assignments from one calm workspace.</p>
            </div>
            <div className="rounded-2xl bg-ally-surface p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Today's focus</p>
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
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm"><UsersRound size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">Explorer overview</p>
                  <p className="text-sm text-slate-600">View assigned mentees and their growth notes.</p>
                </div>
              </div>
            </Link>
            <Link to="/mentor/availability" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm"><CalendarDays size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">Availability planner</p>
                  <p className="text-sm text-slate-600">Open blocks for arranging synchronous sessions.</p>
                </div>
              </div>
            </Link>
            <Link to="/mentor/sessions" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm"><CheckCircle2 size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">Session management</p>
                  <p className="text-sm text-slate-600">Confirm or reschedule the next mentor session.</p>
                </div>
              </div>
            </Link>
            <Link to="/mentor/action-items" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm"><Sparkles size={18} /></div>
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
            <p className="mt-3 text-sm leading-6 text-slate-700">The new mentor experience is set up with real UI sections for explorer data, availability, synchronous sessions, and post-session assignments. The left navigation also includes requests, settings, and support so the experience can grow into a full mentor portal.</p>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}