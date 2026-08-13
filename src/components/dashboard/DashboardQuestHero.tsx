import type {
  ReactNode,
} from "react";

import {
  ArrowRight,
  BrainCircuit,
  Compass,
  Flame,
  Loader2,
  Sparkles,
  UsersRound,
  Zap,
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

function formatStat(
  value:
    | number
    | null
    | undefined,
  suffix = "",
): string {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return "—";
  }

  return `${Math.max(
    0,
    Math.round(
      value,
    ),
  ).toLocaleString()}${suffix}`;
}

function CompactStat({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[16px] border border-[#dbe4ea] bg-white px-3.5 py-3 shadow-[0_3px_0_#e4ebef]">
      <div className="flex items-center gap-2 text-[#16629b]">
        {icon}

        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>

      <p className="mt-2 text-lg font-extrabold leading-none text-[#2c1607]">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-slate-400">
        {helper}
      </p>
    </div>
  );
}

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

  const readinessValue =
    readinessLoading
      ? "..."
      : typeof readinessScore ===
            "number" &&
          Number.isFinite(
            readinessScore,
          )
        ? `${Math.round(
            Math.max(
              0,
              Math.min(
                100,
                readinessScore,
              ),
            ),
          )}%`
        : "—";

  const xpValue =
    formatStat(
      typeof user.xp_points ===
        "number"
        ? user.xp_points
        : null,
      " XP",
    );

  const streakValue =
    typeof user.current_streak ===
      "number" &&
    Number.isFinite(
      user.current_streak,
    )
      ? `${Math.max(
          0,
          Math.floor(
            user.current_streak,
          ),
        )} ${
          Math.floor(
            user.current_streak,
          ) ===
          1
            ? "day"
            : "days"
        }`
      : "—";

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

        <div
          className={[
            "grid items-start gap-4",
            "xl:grid-cols-[minmax(0,1fr)_310px]",
          ].join(
            " ",
          )}
        >
          <main className="min-w-0">
            {loading ? (
              <div className="grid min-h-[650px] place-items-center rounded-[26px] border border-[#c3d0d9] bg-[#dbeae7] shadow-[0_7px_0_#d8c6ae]">
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

          <aside
            aria-label="Explorer expedition sidebar"
            className="min-w-0 space-y-3 xl:max-h-[calc(100vh-132px)] xl:overflow-y-auto xl:pr-1"
          >
            <ExplorerProfileCard
              user={
                user
              }
              variant="sidebar"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <CompactStat
                icon={
                  <BrainCircuit
                    size={15}
                    aria-hidden="true"
                  />
                }
                label="Readiness Score"
                value={
                  readinessValue
                }
                helper="Scholarship readiness"
              />

              <CompactStat
                icon={
                  <Zap
                    size={15}
                    aria-hidden="true"
                  />
                }
                label="XP"
                value={
                  xpValue
                }
                helper="Experience points"
              />

              <CompactStat
                icon={
                  <Flame
                    size={15}
                    aria-hidden="true"
                  />
                }
                label="Streak"
                value={
                  streakValue
                }
                helper="Current streak"
              />
            </div>

            <section className="rounded-[18px] border border-[#ead8c8] bg-white p-4 shadow-[0_4px_0_#e7d9cc]">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff5e8] text-[#9a6726]">
                  <UsersRound
                    size={18}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#7a582f]">
                    Book a Mentor
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Get guidance from a scholarship mentor.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  onBookMentor
                }
                className={[
                  "mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2",
                  "rounded-xl border border-[#bfd8e8] bg-[#f4faff] px-3 py-2",
                  "text-xs font-extrabold text-[#16629b]",
                  "transition hover:bg-[#eaf5fb]",
                ].join(
                  " ",
                )}
              >
                Book Mentor

                <ArrowRight
                  size={14}
                  aria-hidden="true"
                />
              </button>
            </section>

            <IELTSPracticeQuizCard
              variant="compact"
            />
          </aside>
        </div>
      </div>
    </section>
  );
}