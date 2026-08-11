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