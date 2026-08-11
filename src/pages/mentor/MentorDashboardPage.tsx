import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Link } from "react-router";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  MetricCard,
} from "./MentorShared";


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

          {/* HEADER */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
                Mentor Dashboard
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Shape the next step for each explorer
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Review explorer data, publish availability, confirm sessions,
                and send thoughtful assignments from one calm workspace.
              </p>
            </div>

            <div className="rounded-2xl bg-ally-surface p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">
                Today&apos;s focus
              </p>

              <p className="mt-1">
                3 explorers need a gentle nudge and 2 sessions are ready to
                confirm.
              </p>
            </div>
          </div>


          {/* METRICS */}

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Active explorers"
              value="3"
              helper="Assigned and visible now"
            />

            <MetricCard
              title="Open sessions"
              value="2"
              helper="Waiting for your confirmation"
            />

            <MetricCard
              title="Assignments"
              value="2"
              helper="New follow-up tasks prepared"
            />

            <MetricCard
              title="Availability"
              value="4"
              helper="Configured sessions this week"
            />
          </div>


          {/* QUICK ACTIONS */}

          <div className="mt-8 grid gap-4 lg:grid-cols-2">

            <Link
              to="/mentor/mentees"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <UsersRound size={18} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Explorer overview
                  </p>

                  <p className="text-sm text-slate-600">
                    View assigned mentees and their growth notes.
                  </p>
                </div>
              </div>
            </Link>


            <Link
              to="/mentor/availability"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Availability planner
                  </p>

                  <p className="text-sm text-slate-600">
                    Open blocks for arranging synchronous sessions.
                  </p>
                </div>
              </div>
            </Link>


            <Link
              to="/mentor/sessions"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Session management
                  </p>

                  <p className="text-sm text-slate-600">
                    Confirm or reschedule the next mentor session.
                  </p>
                </div>
              </div>
            </Link>


            <Link
              to="/mentor/action-items"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-ally-primary hover:bg-ally-surface"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-ally-primary shadow-sm">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Follow-up assignments
                  </p>

                  <p className="text-sm text-slate-600">
                    Set thoughtful takeaways after each session.
                  </p>
                </div>
              </div>
            </Link>

          </div>


          {/* NOTE */}

          <div className="mt-8 rounded-3xl border border-slate-200 bg-ally-surface p-5">
            <div className="flex items-center gap-2 text-ally-primary">
              <CircleAlert size={18} />

              <p className="font-semibold text-slate-900">
                Mentor note
              </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              The new mentor experience is set up with real UI sections for
              explorer data, availability, synchronous sessions, and
              post-session assignments. The left navigation also includes
              requests, settings, and support so the experience can grow into
              a full mentor portal.
            </p>
          </div>

        </div>
      </section>
    </UserLayout>
  );
}
