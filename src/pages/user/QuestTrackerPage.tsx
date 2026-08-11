import {
  Compass,
  Flag,
} from "lucide-react";

import {
  useNavigate,
} from "react-router";

import AscentRoadmap from "../../components/quest/AscentRoadmap";
import UserLayout from "../../components/layout/UserLayout";

import {
  questTrackerMockData,
} from "../../mocks/questTrackerMock";

import {
  ASSESSMENT_2_ROUTE,
} from "../../routes/assessment2.routes";

import type {
  QuestMilestone,
} from "../../types/questTracker";


/*
 * =========================================================
 * Expedition Overview
 * =========================================================
 *
 * Small progress card shown on top of the expedition map.
 */

function ExpeditionOverviewOverlay({
  milestones,
}: {
  milestones: QuestMilestone[];
}) {
  const completedCount =
    milestones.filter(
      (milestone) =>
        milestone.status ===
        "completed",
    ).length;

  const currentMilestone =
    milestones.find(
      (milestone) =>
        milestone.status ===
        "current",
    );

  const total =
    milestones.length;

  const percentage =
    total > 0
      ? Math.round(
          (completedCount /
            total) *
            100,
        )
      : 0;

  return (
    <aside
      aria-label="Scholarship Expedition overview"
      className={[
        "rounded-[24px]",
        "border border-white/80",
        "bg-white/92",
        "p-4",
        "backdrop-blur-md",
        "shadow-[0_8px_0_rgba(122,88,47,0.14),0_18px_45px_rgba(44,22,7,0.16)]",
        "sm:p-5",
      ].join(" ")}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#7a582f] sm:text-xs">
        Quest Tracker
      </p>

      <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#2c1607] sm:text-3xl">
        Your Scholarship Expedition
      </h1>

      <p className="mt-1.5 text-xs leading-5 text-[#667085] sm:text-sm sm:leading-6">
        Follow the trail and complete each quest to reach your scholarship destination.
      </p>

      <div className="my-4 h-px bg-[#e7ddd3]" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#16629b]">
            <Compass
              size={16}
              aria-hidden="true"
            />

            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] sm:text-xs">
              Expedition progress
            </p>
          </div>

          <p className="mt-1.5 text-lg font-extrabold text-[#2c1607] sm:text-xl">
            {completedCount} /{" "}
            {total} milestones completed
          </p>
        </div>

        <p className="shrink-0 text-xl font-extrabold text-[#7a582f] sm:text-2xl">
          {percentage}%
        </p>
      </div>

      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
        <Flag
          size={14}
          aria-hidden="true"
          className="text-[#e97651]"
        />

        Current milestone:

        <span className="font-extrabold text-[#16629b]">
          {currentMilestone?.name ??
            "Expedition complete"}
        </span>
      </p>

      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full border border-[#cdd7df] bg-[#edf1f3]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          percentage
        }
        aria-label={`${percentage}% of expedition milestones completed`}
      >
        <div
          className="relative h-full rounded-full bg-[#16629b] transition-[width] duration-500"
          style={{
            width:
              `${percentage}%`,
          }}
        >
          {percentage > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-[#c69c6e]"
            />
          )}
        </div>
      </div>
    </aside>
  );
}


/*
 * =========================================================
 * Quest Tracker Page
 * =========================================================
 */

export default function QuestTrackerPage() {
  const navigate =
    useNavigate();


  /*
   * -------------------------------------------------------
   * Milestone selection
   * -------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Locked milestones are NOT blocked here anymore.
   *
   * AscentRoadmap handles:
   *
   *   locked
   *      ↓
   *   locked modal
   *      ↓
   *   subscription
   *
   * Current / completed milestones:
   *
   *   click
   *      ↓
   *   zoom animation
   *      ↓
   *   destination
   */
  function handleMilestoneSelect(
    milestone: QuestMilestone,
  ): void {
    /*
     * AscentRoadmap already handles
     * locked milestones.
     *
     * We only navigate when a destination
     * exists.
     */
    if (
      milestone.destination
    ) {
      navigate(
        milestone.destination,
      );
    }
  }


  /*
   * -------------------------------------------------------
   * Assessment entry
   * -------------------------------------------------------
   *
   * This is still used by the existing Ally guide
   * attached to Research Trail.
   */
  function handleStartAssessment(): void {
    navigate(
      ASSESSMENT_2_ROUTE,
    );
  }


  return (
    <UserLayout
      title="Quest Tracker" subtitle="Expedition Roadmap & Milestones"
      topbarProps={{
        showSearch: false,
      }}
    >
      <section
        aria-label="Quest Tracker milestone expedition"
        className={[
          "relative min-h-[calc(100vh-80px)]",
          "overflow-hidden",
          "bg-ally-background",
        ].join(" ")}
      >

        {/* =================================================
            Expedition Roadmap
        ================================================= */}

        <AscentRoadmap
          fullPage
          milestones={
            questTrackerMockData.milestones
          }
          onMilestoneSelect={
            handleMilestoneSelect
          }
          onStartAssessment={
            handleStartAssessment
          }
          subscriptionRoute="/subscription"
          overlay={
            <ExpeditionOverviewOverlay
              milestones={
                questTrackerMockData.milestones
              }
            />
          }
        />

      </section>
    </UserLayout>
  );
}