import { useState } from "react";

import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Plus,
} from "lucide-react";

import { Link } from "react-router";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  MetricCard,
  SectionHeader,
} from "./MentorShared";

import { explorerData } from "./mentorData";

export default function MenteeManagementPage() {
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
                <h3 className="text-lg font-semibold text-slate-900">
                  Active explorers
                </h3>

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
                      <p className="text-base font-semibold text-slate-900">
                        {explorer.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {explorer.focus}
                      </p>
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
                    <span className="rounded-full bg-white px-3 py-1">
                      {explorer.stage}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={15} />
                      {explorer.nextSession}
                    </span>

                    <span className="flex items-center gap-1">
                      <BadgeCheck size={15} />
                      {explorer.lastSession}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600">
                      {explorer.note}
                    </p>

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
            <h3 className="text-lg font-semibold text-slate-900">
              Mentor insight
            </h3>

            <div className="mt-4 rounded-2xl bg-ally-surface p-4">
              <p className="text-sm font-semibold text-slate-700">
                Focus on momentum, not volume.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The best next move is to reinforce the current growth arc with
                a short session and one concrete follow-up assignment.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">
                  Suggested next step
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Confirm Ari&apos;s Thursday session and send a confidence
                  reflection task.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">
                  Support need
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Mina could benefit from a lighter follow-up and a clearer
                  weekly plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
