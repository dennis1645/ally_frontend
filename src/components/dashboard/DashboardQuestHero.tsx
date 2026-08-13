import {
  ArrowRight,
  Compass,
  Loader2,
  Sparkles,
} from "lucide-react";

import expeditionTerrain from "../../assets/expedition-terrain.png";

import type {
  RoadmapData,
  RoadmapEntityId,
  RoadmapMilestone,
} from "../../api/roadmapApi";

import type {
  AuthUser,
} from "../../types/auth";

import ExplorerProfileCard from "./ExplorerProfileCard";
import IELTSPracticeQuizCard from "./IELTSPracticeQuizCard";
import AscentRoadmap from "../quest/AscentRoadmap";

type DashboardQuestHeroProps = {
  roadmap: RoadmapData | null;
  loading: boolean;
  user: AuthUser;
  readinessScore: number | null;
  readinessLoading: boolean;
  assessment2Complete: boolean | null;
  onOpenQuestTracker: () => void;
  onMilestoneSelect: (
    milestone: RoadmapMilestone,
  ) => void;
  onBookMentor: () => void;
};

function EmptyQuestMap({
  onOpenQuestTracker,
}: {
  onOpenQuestTracker: () => void;
}) {
  return (
    <section
      aria-label="Quest Tracker setup"
      className={[
        "relative min-h-[650px] overflow-hidden rounded-[26px]",
        "border border-[#c3d0d9] bg-[#dbeae7]",
        "shadow-[0_7px_0_#d8c6ae]",
      ].join(
        " ",
      )}
    >
      <img
        src={
          expeditionTerrain
        }
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/18"
      />

      <div className="relative z-10 flex min-h-[650px] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[24px] border border-white/80 bg-white/92 p-6 text-center shadow-xl backdrop-blur">
          <Sparkles
            size={27}
            aria-hidden="true"
            className="mx-auto text-[#16629b]"
          />

          <h2 className="mt-4 text-xl font-extrabold text-[#2c1607]">
            Your expedition is ready to be mapped
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Open Quest Tracker to finish setting up your scholarship timeline.
          </p>

          <button
            type="button"
            onClick={
              onOpenQuestTracker
            }
            className={[
              "mt-5 inline-flex min-h-11 items-center justify-center gap-2",
              "rounded-xl bg-[#16629b] px-5 py-3",
              "text-sm font-extrabold text-white",
              "shadow-[0_4px_0_#0d4773]",
              "transition hover:-translate-y-0.5 hover:bg-[#115787]",
            ].join(
              " ",
            )}
          >
            Open Quest Tracker

            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function DashboardQuestHero({
  roadmap,
  loading,
  user,
  readinessScore,
  readinessLoading,
  assessment2Complete,
  onOpenQuestTracker,
  onMilestoneSelect,
  onBookMentor,
}: DashboardQuestHeroProps) {
  const orderedMilestones =
    roadmap
      ? [
          ...roadmap.milestones,
        ].sort(
          (
            first,
            second,
          ) =>
            first.order -
            second.order,
        )
      : [];

  const assessmentMilestoneId:
    RoadmapEntityId | null =
      assessment2Complete ===
        false
        ? orderedMilestones[
            1
          ]?.id ??
          null
        : null;

  const scholarshipName =
    user.target_scholarship_data?.name ??
    user.primary_scholarship_target ??
    "Your selected scholarship";

  return (
    <section
      aria-label="Dashboard scholarship expedition"
      className={[
        "relative min-h-[calc(100vh-80px)] w-full",
        "bg-ally-background",
        "px-3 py-4 sm:px-5 sm:py-5 lg:px-6",
      ].join(
        " ",
      )}
    >
      <div className="mx-auto w-full max-w-[1480px]">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#7a582f]">
              <Compass
                size={17}
                aria-hidden="true"
              />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]">
                Quest Tracker
              </p>
            </div>

            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#2c1607] sm:text-3xl">
              Your Scholarship Expedition
            </h1>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {scholarshipName}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onOpenQuestTracker
            }
            className={[
              "inline-flex min-h-10 w-fit items-center justify-center gap-2",
              "rounded-xl border border-[#bfd8e8] bg-white px-4 py-2.5",
              "text-xs font-extrabold text-[#16629b]",
              "shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f4faff]",
            ].join(
              " ",
            )}
          >
            Open Full Quest Tracker

            <ArrowRight
              size={14}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="relative">
          <main className="min-w-0">
            {loading ? (
              <div className="grid min-h-[720px] place-items-center rounded-[26px] border border-[#c3d0d9] bg-[#dbeae7] shadow-[0_7px_0_#d8c6ae]">
                <div className="rounded-[20px] border border-white/80 bg-white/90 px-5 py-4 text-center shadow-lg backdrop-blur">
                  <Loader2
                    size={24}
                    aria-hidden="true"
                    className="mx-auto animate-spin text-[#16629b]"
                  />

                  <p className="mt-3 text-sm font-bold text-[#2c1607]">
                    Loading your expedition...
                  </p>
                </div>
              </div>
            ) : roadmap ? (
              <AscentRoadmap
                roadmap={
                  roadmap
                }
                variant="dashboard"
                scholarshipName={
                  scholarshipName
                }
                specialSelectableMilestoneId={
                  assessmentMilestoneId
                }
                onMilestoneSelect={
                  onMilestoneSelect
                }
              />
            ) : (
              <EmptyQuestMap
                onOpenQuestTracker={
                  onOpenQuestTracker
                }
              />
            )}
          </main>

          {/* =================================================
              Desktop:
              one compact explorer card floating over the map.
          ================================================= */}
          <aside
            aria-label="Explorer summary and IELTS practice"
            className={[
              /*
               * Keep this floating rail above the roadmap only.
               *
               * Topbar is z-30, so using z-[25] here ensures global
               * UI such as Notifications / Document Vault renders
               * above the profile + IELTS cards when opened.
               */
              "pointer-events-none absolute right-4 top-4 z-[25] hidden",
              "w-[300px] xl:block",
            ].join(
              " ",
            )}
          >
            <div className="pointer-events-auto space-y-3">
              <ExplorerProfileCard
                user={
                  user
                }
                variant="overlay"
                readinessScore={
                  readinessScore
                }
                readinessLoading={
                  readinessLoading
                }
                onBookMentor={
                  onBookMentor
                }
              />

              <IELTSPracticeQuizCard
                variant="compact"
              />
            </div>
          </aside>
        </div>

        {/* Mobile/tablet:
            keep the same single card, but place it below the map. */}
        <div className="mt-4 space-y-3 xl:hidden">
          <ExplorerProfileCard
            user={
              user
            }
            variant="overlay"
            readinessScore={
              readinessScore
            }
            readinessLoading={
              readinessLoading
            }
            onBookMentor={
              onBookMentor
            }
          />

          <IELTSPracticeQuizCard
            variant="compact"
          />
        </div>
      </div>
    </section>
  );
}