import { useState } from "react";

import { CalendarDays } from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  SectionHeader,
} from "./MentorShared";

import {
  initialSessions,
  type SessionItem,
} from "./mentorData";

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState(initialSessions);

  function updateSessionStatus(
    id: string,
    status: SessionItem["status"],
  ) {
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
            <div
              key={session.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {session.mentee}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {session.topic}
                  </p>
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
                    onClick={() =>
                      updateSessionStatus(session.id, "Confirmed")
                    }
                    className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() =>
                      updateSessionStatus(session.id, "Rescheduled")
                    }
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
