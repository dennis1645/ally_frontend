import {
  ArrowRight,
  CalendarClock,
  Flame,
  Loader2,
  Sparkles,
} from "lucide-react";

import expeditionTerrain from "../../assets/expedition-terrain.png";
import allyMascot from "../../assets/ally-assessment-mascot.png";

import type {
  RoadmapData,
  RoadmapEntityId,
  RoadmapMilestone,
} from "../../api/roadmapApi";

import {
  API_BASE_URL,
} from "../../api/apiClient";

import type {
  Reminder,
} from "../../api/reminderApi";

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
  visibleMilestoneCount?: number | null;
  fogLocked?: boolean;
  nextDeadline?: Reminder | null;
  deadlineLoading?: boolean;
  selectedMilestoneId?: RoadmapEntityId | null;
  onOpenQuestTracker: () => void;
  onMilestoneSelect: (
    milestone: RoadmapMilestone,
  ) => void;
  onBookMentor: () => void;
};

function resolveProfilePictureUrl(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.startsWith(
      "http://",
    ) ||
    normalized.startsWith(
      "https://",
    ) ||
    normalized.startsWith(
      "blob:",
    ) ||
    normalized.startsWith(
      "data:",
    )
  ) {
    return normalized;
  }

  try {
    const apiOrigin =
      new URL(
        API_BASE_URL,
      ).origin;

    return `${apiOrigin}/${normalized.replace(
      /^\/+/,
      "",
    )}`;
  } catch {
    return normalized;
  }
}

function explorerInitials(
  name: string,
): string {
  const value =
    name
      .trim()
      .split(
        /\s+/,
      )
      .slice(
        0,
        2,
      )
      .map(
        (
          part,
        ) =>
          part
            .charAt(
              0,
            )
            .toUpperCase(),
      )
      .join(
        "",
      );

  return value ||
    "EX";
}

function formatDeadlineDate(
  value:
    | string
    | null,
): string | null {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})/.exec(
      value,
    );

  const date =
    match
      ? new Date(
          Number(
            match[1],
          ),
          Number(
            match[2],
          ) -
            1,
          Number(
            match[3],
          ),
        )
      : new Date(
          value,
        );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
    },
  ).format(
    date,
  );
}

function deadlineRemainingLabel(
  reminder:
    Reminder,
): string {
  const days =
    reminder.daysRemaining;

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  if (
    typeof days ===
      "number" &&
    days > 1
  ) {
    return `${days} days left`;
  }

  return "Upcoming";
}

type WeeklyStreakStatus =
  | "frozen"
  | "completed"
  | "upcoming"
  | string;

type WeeklyStreakTrackerItem = {
  day: string;
  date: string | null;
  status: WeeklyStreakStatus;
  isToday: boolean;
};

function normalizeWeeklyStreakTracker(
  value: unknown,
): WeeklyStreakTrackerItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(
    (
      item,
    ) => {
      if (
        typeof item !==
          "object" ||
        item ===
          null ||
        Array.isArray(
          item,
        )
      ) {
        return [];
      }

      const record =
        item as Record<
          string,
          unknown
        >;

      const day =
        typeof record.day ===
          "string"
          ? record.day.trim()
          : "";

      if (!day) {
        return [];
      }

      return [
        {
          day,

          date:
            typeof record.date ===
              "string"
              ? record.date
              : null,

          status:
            typeof record.status ===
              "string"
              ? record.status
              : "upcoming",

          isToday:
            record.is_today ===
            true,
        },
      ];
    },
  );
}

function StreakIceCube({
  active,
}: {
  active: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={[
        /*
         * Faceted blue ice block:
         * intentionally irregular rather than a rounded UI square,
         * matching the crystalline reference the user provided.
         */
        "relative h-9 w-9 shrink-0 overflow-hidden",
        "drop-shadow-[0_3px_2px_rgba(31,126,173,0.18)]",
        active
          ? "opacity-100"
          : "opacity-30 grayscale-[0.15]",
      ].join(
        " ",
      )}
      style={{
        clipPath:
          "polygon(14% 8%, 68% 0%, 93% 15%, 100% 57%, 83% 92%, 37% 100%, 8% 80%, 0% 39%)",
      }}
    >
      {/* Main saturated ice body */}
      <span
        className="absolute inset-0 bg-gradient-to-br from-[#55ecf3] via-[#32c9ef] to-[#087ec2]"
      />

      {/* Pale crystalline top plane */}
      <span
        className="absolute left-0 top-0 h-[48%] w-full bg-[#aef8fb]"
        style={{
          clipPath:
            "polygon(14% 8%, 68% 0%, 93% 15%, 63% 46%, 29% 38%, 0% 39%)",
        }}
      />

      {/* Cyan upper-left facet */}
      <span
        className="absolute inset-0 bg-[#48dfe9]"
        style={{
          clipPath:
            "polygon(14% 8%, 29% 38%, 8% 80%, 0% 39%)",
        }}
      />

      {/* Bright center facet */}
      <span
        className="absolute inset-0 bg-[#82f2f5]"
        style={{
          clipPath:
            "polygon(29% 38%, 63% 46%, 51% 73%, 21% 60%)",
        }}
      />

      {/* Deep blue lower-left facet */}
      <span
        className="absolute inset-0 bg-[#0b96d0]"
        style={{
          clipPath:
            "polygon(8% 80%, 21% 60%, 51% 73%, 37% 100%)",
        }}
      />

      {/* Darkest lower center facet */}
      <span
        className="absolute inset-0 bg-[#0875b9]"
        style={{
          clipPath:
            "polygon(51% 73%, 75% 58%, 83% 92%, 37% 100%)",
        }}
      />

      {/* Right crystal plane */}
      <span
        className="absolute inset-0 bg-[#36bee9]"
        style={{
          clipPath:
            "polygon(63% 46%, 93% 15%, 100% 57%, 75% 58%, 51% 73%)",
        }}
      />

      {/* White translucent shard near the top-right */}
      <span
        className="absolute inset-0 bg-white/50"
        style={{
          clipPath:
            "polygon(68% 0%, 93% 15%, 63% 46%, 55% 18%)",
        }}
      />

      {/* Thin crystalline seams */}
      <span
        className="absolute left-[28%] top-[6%] h-[80%] w-px rotate-[-18deg] bg-white/45"
      />
      <span
        className="absolute left-[62%] top-[13%] h-[74%] w-px rotate-[17deg] bg-white/45"
      />
      <span
        className="absolute left-[17%] top-[52%] h-px w-[67%] rotate-[9deg] bg-white/35"
      />

      {/* Small glossy highlight */}
      <span
        className="absolute left-[17%] top-[13%] h-[5px] w-[10px] -rotate-[8deg] rounded-full bg-white/60 blur-[0.4px]"
      />
    </div>
  );
}

function WeeklyStreakTimeline({
  tracker,
}: {
  tracker: WeeklyStreakTrackerItem[];
}) {
  if (
    tracker.length ===
    0
  ) {
    return (
      <div className="mt-3 rounded-xl bg-[#f6f9fa] px-3 py-2 text-center text-[10px] font-bold text-[#8a9aa3]">
        Weekly streak data will appear here.
      </div>
    );
  }

  return (
    <div className="relative mt-3">
      <div
        aria-hidden="true"
        className="absolute left-[7%] right-[7%] top-[14px] h-[2px] rounded-full bg-[#dce8ed]"
      />

      <div className="relative grid grid-cols-7">
        {tracker.map(
          (
            item,
            index,
          ) => {
            const frozen =
              item.status ===
              "frozen";

            const completed =
              item.status ===
              "completed";

            const upcoming =
              item.status ===
              "upcoming";

            return (
              <div
                key={`${item.day}-${item.date ?? index}`}
                className="flex min-w-0 flex-col items-center"
                title={[
                  item.day,
                  item.date,
                  item.status,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    " · ",
                  )}
              >
                <div
                  className={[
                    "relative z-[1] grid h-7 w-7 place-items-center rounded-[9px] border",
                    "text-[10px] font-extrabold shadow-[0_2px_0_rgba(31,71,94,0.08)]",
                    frozen
                      ? "border-[#9fd4ec] bg-[#dff4ff] text-[#287fa8]"
                      : completed
                        ? "border-[#e8a653] bg-[#fff0d5] text-[#a56215]"
                        : upcoming
                          ? "border-[#d7e2e7] bg-white text-[#b1bec5]"
                          : "border-[#d7e2e7] bg-white text-[#7e929d]",
                    item.isToday
                      ? "ring-2 ring-[#16629b]/25 ring-offset-1"
                      : "",
                  ].join(
                    " ",
                  )}
                >
                  {frozen
                    ? "❄"
                    : completed
                      ? "✓"
                      : "·"}
                </div>

                <span
                  className={[
                    "mt-1.5 text-[9px] font-extrabold uppercase",
                    item.isToday
                      ? "text-[#16629b]"
                      : "text-[#7e8d95]",
                  ].join(
                    " ",
                  )}
                >
                  {item.day
                    .slice(
                      0,
                      1,
                    )
                    .toUpperCase()}
                </span>

                {item.isToday && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-[#16629b]" />
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

function DashboardStreakOverlay({
  streak,
  isFrozen,
  weeklyTracker,
}: {
  streak: number;
  isFrozen: boolean;
  weeklyTracker: WeeklyStreakTrackerItem[];
}) {
  const frozenDays =
    weeklyTracker.filter(
      (
        item,
      ) =>
        item.status ===
        "frozen",
    ).length;

  /*
   * Three cube slots are always shown.
   * The weekly tracker determines how many are actively frozen.
   * `is_streak_frozen` is a fallback if the backend says the freeze
   * is active before a frozen day has appeared in the weekly array.
   */
  const activeIceCubes =
    Math.min(
      3,
      frozenDays >
        0
        ? frozenDays
        : isFrozen
          ? 1
          : 0,
    );

  return (
    <section
      aria-label={`${streak} day streak`}
      className={[
        "w-full overflow-hidden rounded-[22px] border border-white/90 bg-white/95",
        "px-4 pb-3.5 pt-3.5",
        "shadow-[0_12px_30px_rgba(29,58,79,0.16)] backdrop-blur-md",
        "xl:w-[292px]",
      ].join(
        " ",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-[66px] w-[66px] shrink-0 place-items-center overflow-hidden rounded-[18px] bg-[#eef7fb]">
          <img
            src={
              allyMascot
            }
            alt="Ally"
            className="h-[62px] w-[62px] object-contain object-bottom"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[#a86616]">
            <Flame
              size={16}
              fill="currentColor"
              aria-hidden="true"
            />

            <span className="text-[9px] font-extrabold uppercase tracking-[0.14em]">
              Streak
            </span>
          </div>

          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-[30px] font-extrabold leading-none text-[#2c1607]">
              {streak}
            </span>

            <span className="text-sm font-extrabold text-[#7a6759]">
              {streak ===
              1
                ? "day"
                : "days"}
            </span>
          </div>

          {isFrozen && (
            <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#428eb4]">
              Streak freeze active
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1.5 text-[8px] font-extrabold uppercase tracking-[0.13em] text-[#83949c]">
            Ice Cubes
          </p>

          <div className="flex gap-1.5">
            {[0, 1, 2].map(
              (
                cubeIndex,
              ) => (
                <StreakIceCube
                  key={
                    cubeIndex
                  }
                  active={
                    cubeIndex <
                    activeIceCubes
                  }
                />
              ),
            )}
          </div>
        </div>

        <p className="max-w-[126px] text-right text-[9px] font-bold leading-4 text-[#7d8e97]">
          Frozen days protect your streak.
        </p>
      </div>

      <div className="mt-3 border-t border-[#e8eff2] pt-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-[#83949c]">
            This Week
          </p>

          {isFrozen && (
            <span className="rounded-full bg-[#e7f7ff] px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#287fa8]">
              Protected
            </span>
          )}
        </div>

        <WeeklyStreakTimeline
          tracker={
            weeklyTracker
          }
        />
      </div>
    </section>
  );
}

function DashboardDeadlineOverlay({
  reminder,
  loading,
}: {
  reminder: Reminder | null;
  loading: boolean;
}) {
  const dateLabel =
    formatDeadlineDate(
      reminder?.deadline ??
      null,
    );

  return (
    <section
      aria-label="Upcoming deadline"
      className={[
        "w-[250px] rounded-[21px] border border-white/90",
        "bg-white/94 px-4 py-3.5",
        "shadow-[0_12px_30px_rgba(29,58,79,0.16)] backdrop-blur-md",
      ].join(
        " ",
      )}
    >
      <div className="flex items-center gap-2 text-[#16629b]">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#eaf5fb]">
          <CalendarClock
            size={16}
            aria-hidden="true"
          />
        </div>

        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em]">
          Next Deadline
        </p>
      </div>

      {loading &&
      !reminder ? (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Loader2
            size={14}
            className="animate-spin text-[#16629b]"
            aria-hidden="true"
          />

          Checking your trail...
        </div>
      ) : reminder ? (
        <>
          <p className="mt-2.5 line-clamp-2 text-sm font-extrabold leading-5 text-[#2c1607]">
            {reminder.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold">
            {dateLabel && (
              <span className="text-[#667085]">
                {dateLabel}
              </span>
            )}

            <span className="rounded-full bg-[#fff5df] px-2 py-1 text-[#9b681f]">
              {
                deadlineRemainingLabel(
                  reminder,
                )
              }
            </span>
          </div>
        </>
      ) : (
        <p className="mt-2.5 text-xs font-semibold leading-5 text-slate-500">
          No upcoming deadline yet.
        </p>
      )}
    </section>
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
  visibleMilestoneCount = null,
  fogLocked = false,
  nextDeadline = null,
  deadlineLoading = false,
  selectedMilestoneId = null,
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

  const profilePicture =
    resolveProfilePictureUrl(
      user.profile_picture_url ??
      user.profile_picture,
    );

  const streak =
    typeof user.current_streak ===
      "number" &&
    Number.isFinite(
      user.current_streak,
    )
      ? Math.max(
          0,
          Math.floor(
            user.current_streak,
          ),
        )
      : 0;

  /*
   * GET /api/profile now supplies:
   * - is_streak_frozen
   * - weekly_streak_tracker[]
   *
   * AuthUser intentionally permits additional backend profile fields,
   * so the dashboard can consume these without adding another API call.
   */
  const isStreakFrozen =
    user.is_streak_frozen ===
    true;

  const weeklyStreakTracker =
    normalizeWeeklyStreakTracker(
      user.weekly_streak_tracker,
    );

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
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={[
                "grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-full",
                "border-[3px] border-white bg-[#eaf5fb]",
                "shadow-[0_3px_0_rgba(22,98,155,0.14)]",
              ].join(
                " ",
              )}
            >
              {profilePicture ? (
                <img
                  src={
                    profilePicture
                  }
                  alt={`${user.name}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-extrabold text-[#16629b]">
                  {
                    explorerInitials(
                      user.name,
                    )
                  }
                </span>
              )}
            </div>

            <h1 className="min-w-0 truncate text-xl font-extrabold tracking-tight text-[#2c1607] sm:text-2xl">
              Explorer {user.name}
            </h1>
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
            {roadmap ? (
              <div className="relative">
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
                  selectedMilestoneId={
                    selectedMilestoneId
                  }
                  dashboardVisibleMilestoneCount={
                    visibleMilestoneCount
                  }
                  dashboardFogLocked={
                    fogLocked
                  }
                  onMilestoneSelect={
                    onMilestoneSelect
                  }
                />

                {loading && (
                  <div className="pointer-events-none absolute bottom-4 left-4 z-[24] xl:left-[282px]">
                    <div className="flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-3.5 py-2 text-[10px] font-extrabold text-[#16629b] shadow-lg backdrop-blur-md">
                      <Loader2
                        size={14}
                        aria-hidden="true"
                        className="animate-spin"
                      />

                      Updating your Premium expedition...
                    </div>
                  </div>
                )}
              </div>
            ) : loading ? (
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
            ) : (
              <EmptyQuestMap
                onOpenQuestTracker={
                  onOpenQuestTracker
                }
              />
            )}
          </main>

          {/* =================================================
              Left map overlays

              These are deliberately below the global Topbar (z-30) and
              above the roadmap/cloud layers. They remain contained by the
              Dashboard map composition and do not change roadmap behavior.
          ================================================= */}
          <aside
            aria-label="Streak and upcoming deadline"
            className="pointer-events-none absolute inset-0 z-[23] hidden xl:block"
          >
            <div className="pointer-events-auto absolute left-4 top-4">
              <DashboardStreakOverlay
  streak={
    streak
  }
  isFrozen={
    isStreakFrozen
  }
  weeklyTracker={
    weeklyStreakTracker
  }
/>
            </div>

            <div className="pointer-events-auto absolute bottom-4 left-4">
              <DashboardDeadlineOverlay
                reminder={
                  nextDeadline
                }
                loading={
                  deadlineLoading
                }
              />
            </div>
          </aside>

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
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardStreakOverlay
  streak={
    streak
  }
  isFrozen={
    isStreakFrozen
  }
  weeklyTracker={
    weeklyStreakTracker
  }
/>

            <DashboardDeadlineOverlay
              reminder={
                nextDeadline
              }
              loading={
                deadlineLoading
              }
            />
          </div>

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