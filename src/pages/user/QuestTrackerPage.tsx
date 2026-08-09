import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import AchievementBadges from "../../components/quest/AchievementBadges";
import AllyEncouragement from "../../components/quest/AllyEncouragement";
import AscentRoadmap from "../../components/quest/AscentRoadmap";
import CurrentMilestoneCard from "../../components/quest/CurrentMilestoneCard";
import UpcomingTrails from "../../components/quest/UpcomingTrails";
import UserLayout from "../../components/layout/UserLayout";

import {
  questTrackerMockData,
} from "../../mocks/questTrackerMock";

import type {
  QuestChecklistItem,
} from "../../types/questTracker";

function calculateChecklistProgress(
  checklist:
    QuestChecklistItem[],
): number {
  if (
    checklist.length ===
    0
  ) {
    return 0;
  }

  const totalWeight =
    checklist.reduce(
      (
        total,
        item,
      ) =>
        total +
        Math.max(
          0,
          item.progressWeight,
        ),
      0,
    );

  if (
    totalWeight <=
    0
  ) {
    return 0;
  }

  const completedWeight =
    checklist.reduce(
      (
        total,
        item,
      ) =>
        item.completed
          ? total +
            Math.max(
              0,
              item.progressWeight,
            )
          : total,
      0,
    );

  return Math.round(
    (
      completedWeight /
      totalWeight
    ) *
      100,
  );
}

export default function QuestTrackerPage() {
  const navigate =
    useNavigate();

  const [
    checklist,
    setChecklist,
  ] =
    useState<QuestChecklistItem[]>(
      () =>
        questTrackerMockData.checklist.map(
          (
            item,
          ) => ({
            ...item,
          }),
        ),
    );

  const [
    selectedTrailId,
    setSelectedTrailId,
  ] =
    useState<number | null>(
      null,
    );

  const progress =
    useMemo(
      () =>
        calculateChecklistProgress(
          checklist,
        ),
      [
        checklist,
      ],
    );

  function toggleChecklistItem(
    itemId:
      number,
  ): void {
    setChecklist(
      (
        currentChecklist,
      ) =>
        currentChecklist.map(
          (
            item,
          ) =>
            item.id ===
            itemId
              ? {
                  ...item,

                  completed:
                    !item.completed,
                }
              : item,
        ),
    );
  }

  function handleSelectTrail(
    trailId:
      number,
  ): void {
    if (
      trailId ===
      1
    ) {
      navigate(
        "/quests/essay-pass",
      );

      return;
    }

    setSelectedTrailId(
      (
        currentTrailId,
      ) =>
        currentTrailId ===
        trailId
          ? null
          : trailId,
    );
  }

  function handleMilestoneSelect(
    milestoneName:
      string,
  ): void {
    if (
      milestoneName ===
      "Document Valley"
    ) {
      navigate(
        "/quests/document-valley",
      );

      return;
    }

    if (
      milestoneName ===
      "Essay Pass"
    ) {
      navigate(
        "/quests/essay-pass",
      );
    }
  }

  return (
    <UserLayout
      title="Quest Tracker"
    >
      <section
        aria-label="Quest Tracker content"
        className="min-h-[calc(100vh-80px)] bg-ally-background px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#2c1607] sm:text-4xl">
              Your Ascent Progress
            </h2>

            <p className="mt-2 text-base leading-7 text-[#667085] sm:text-lg">
              Every milestone brings you one step closer to your scholarship summit.
            </p>
          </header>

          <AscentRoadmap
            milestones={
              questTrackerMockData.milestones
            }
            onMilestoneSelect={(
              milestone,
            ) => {
              handleMilestoneSelect(
                milestone.name,
              );
            }}
          />

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(285px,0.78fr)] xl:items-start">
            <div className="space-y-7">
              <CurrentMilestoneCard
                title={
                  questTrackerMockData.currentMilestone.title
                }
                description={
                  questTrackerMockData.currentMilestone.description
                }
                estimatedCompletion={
                  questTrackerMockData.currentMilestone.estimatedCompletion
                }
                progress={
                  progress
                }
                checklist={
                  checklist
                }
                onToggleChecklistItem={
                  toggleChecklistItem
                }
                onContinue={() => {
                  navigate(
                    "/quests/document-valley",
                  );
                }}
              />

              <AllyEncouragement
                progress={
                  progress
                }
                milestoneTitle={
                  questTrackerMockData.currentMilestone.title
                }
              />
            </div>

            <aside className="space-y-8">
              <UpcomingTrails
                trails={
                  questTrackerMockData.upcomingTrails
                }
                selectedTrailId={
                  selectedTrailId
                }
                onSelectTrail={
                  handleSelectTrail
                }
              />

              <AchievementBadges
                badges={
                  questTrackerMockData.badges
                }
              />
            </aside>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}