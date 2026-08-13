import {
  useEffect,
  useState,
} from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  useNavigate,
} from "react-router";

import {
  getDeepDiagnosticResult,
} from "../../api/deepDiagnosticApi";

import {
  ApiError,
} from "../../api/apiClient";

import {
  getRoadmapAccess,
  parseScholarshipId,
  type RoadmapData,
  type RoadmapMilestone,
} from "../../api/roadmapApi";

import {
  getUpcomingReminders,
  isH1MentorTaskReminder,
  type Reminder,
} from "../../api/reminderApi";

import DashboardQuestHero from "../../components/dashboard/DashboardQuestHero";
import Assessment2MilestonePopup from "../../components/assessment/Assessment2MilestonePopup";

import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  AuthUser,
} from "../../types/auth";

import {
  ASSESSMENT_2_ROUTE,
} from "../../routes/assessment2.routes";

type ReadinessState = {
  loading: boolean;
  score: number | null;
  unavailable: boolean;
};

type RoadmapHeroState = {
  loading: boolean;
  roadmap: RoadmapData | null;
};

/*
 * Keeps duplicate reminder requests from React StrictMode/remounts
 * from opening the same SweetAlert twice in one dashboard visit.
 */
const h1MentorReminderRequests =
  new Map<
    string,
    Promise<Reminder[]>
  >();

function localDateKey():
  string {
  const today =
    new Date();

  return [
    today.getFullYear(),
    String(
      today.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    ),
    String(
      today.getDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join(
    "-",
  );
}

function getH1MentorReminders(
  userId:
    | string
    | number,
): Promise<Reminder[]> {
  const requestKey =
    `${String(
      userId,
    )}:${localDateKey()}`;

  const cached =
    h1MentorReminderRequests.get(
      requestKey,
    );

  if (cached) {
    return cached;
  }

  const request =
    getUpcomingReminders(
      1,
    )
      .then(
        (
          reminders,
        ) =>
          reminders.filter(
            isH1MentorTaskReminder,
          ),
      )
      .catch(
        (
          error,
        ) => {
          h1MentorReminderRequests.delete(
            requestKey,
          );

          throw error;
        },
      );

  h1MentorReminderRequests.set(
    requestKey,
    request,
  );

  return request;
}

function reminderAlertStorageKey(
  userId:
    | string
    | number,
  reminder: Reminder,
): string {
  return [
    "ally",
    "mentor-task-h1-alert",
    String(
      userId,
    ),
    localDateKey(),
    reminder.id,
  ].join(
    ":",
  );
}

function formattedReminderDeadline(
  deadline:
    | string
    | null,
): string | null {
  if (!deadline) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})/.exec(
      deadline,
    );

  const parsed =
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
          deadline,
        );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return deadline;
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  );
}

function looksLikeAnalysisFailure(
  suggestion: string | null,
): boolean {
  const normalized =
    suggestion
      ?.trim()
      .toLowerCase() ??
    "";

  if (!normalized) {
    return false;
  }

  return [
    "gagal",
    "failed",
    "failure",
    "error",
    "tidak terhubung",
    "cannot connect",
    "could not connect",
  ].some(
    (
      signal,
    ) =>
      normalized.includes(
        signal,
      ),
  );
}

/* =========================================================
   Loading state

   Matches the new floating-card dashboard layout:
   one large map with utility cards floating over it.
========================================================= */

function DashboardLoadingState() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-ally-background px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto w-full max-w-[1480px] animate-pulse">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-4 w-28 rounded bg-white" />

            <div className="mt-2 h-8 w-80 max-w-full rounded bg-white" />

            <div className="mt-2 h-4 w-52 rounded bg-white" />
          </div>

          <div className="h-10 w-44 rounded-xl bg-white" />
        </div>

        <div className="relative min-h-[720px] overflow-hidden rounded-[26px] border border-[#c3d0d9] bg-[#dbeae7] shadow-[0_7px_0_#d8c6ae]">
          <div className="absolute inset-0 bg-white/30" />

          <div className="absolute left-6 top-8 h-[620px] w-[62%] rounded-[24px] bg-white/25" />

          <div className="absolute right-4 top-4 hidden w-[320px] space-y-3 xl:block">
            <div className="h-40 rounded-[22px] bg-white/95" />

            <div className="h-20 rounded-[16px] bg-white/95" />

            <div className="h-20 rounded-[16px] bg-white/95" />

            <div className="h-20 rounded-[16px] bg-white/95" />

            <div className="h-32 rounded-[18px] bg-white/95" />

            <div className="h-36 rounded-[18px] bg-white/95" />
          </div>

          <div className="absolute inset-x-8 bottom-8 h-20 rounded-[22px] bg-white/30 xl:right-[350px]" />
        </div>

        <div className="mt-4 space-y-3 xl:hidden">
          <div className="h-40 rounded-[22px] bg-white" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-[16px] bg-white" />

            <div className="h-20 rounded-[16px] bg-white" />

            <div className="h-20 rounded-[16px] bg-white" />
          </div>

          <div className="h-32 rounded-[18px] bg-white" />

          <div className="h-36 rounded-[18px] bg-white" />
        </div>
      </div>
    </div>
  );
}

function DashboardUnavailableState() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] justify-center py-12">
      <div
        className={[
          "w-full max-w-lg rounded-[24px]",
          "border border-orange-100 bg-white",
          "p-8 text-center",
          "shadow-[0_6px_0_#d8c6ae]",
        ].join(
          " ",
        )}
      >
        <h2 className="text-xl font-extrabold text-[#2c1607]">
          Explorer profile unavailable
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your profile information could not be loaded.
          Please reload the dashboard.
        </p>
      </div>
    </div>
  );
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

function getUserScholarshipId(
  user: AuthUser,
): number | null {
  const direct =
    parseScholarshipId(
      user.target_scholarship_id,
    );

  if (direct) {
    return direct;
  }

  if (
    isRecord(
      user.target_scholarship_data,
    )
  ) {
    return parseScholarshipId(
      user.target_scholarship_data.id,
    );
  }

  return null;
}

export default function DashboardPage() {
  const navigate =
    useNavigate();

  const {
    user,
    status,
  } =
    useAuth();

  const [
    readiness,
    setReadiness,
  ] =
    useState<ReadinessState>({
      loading:
        true,
      score:
        null,
      unavailable:
        false,
    });

  const [
    roadmapHero,
    setRoadmapHero,
  ] =
    useState<RoadmapHeroState>({
      loading:
        true,
      roadmap:
        null,
    });

  const [
    assessment2Complete,
    setAssessment2Complete,
  ] =
    useState<
      boolean | null
    >(
      null,
    );

  const [
    assessment2PopupOpen,
    setAssessment2PopupOpen,
  ] =
    useState(
      false,
    );

  /* =======================================================
     Readiness + Assessment 2 status
  ======================================================= */

  useEffect(
    () => {
      let active =
        true;

      async function loadReadiness():
        Promise<void> {
        setReadiness({
          loading:
            true,
          score:
            null,
          unavailable:
            false,
        });

        try {
          const result =
            await getDeepDiagnosticResult();

          if (
            !active
          ) {
            return;
          }

          const assessmentCompleted =
            Boolean(
              result.id !==
                null ||
              result.revisedPercentage !==
                null ||
              result.recommendations.length >
                0 ||
              result.suggestion?.trim() ||
              result.assessmentType?.trim(),
            );

          setAssessment2Complete(
            assessmentCompleted,
          );

          const score =
            result.revisedPercentage;

          const validScore =
            typeof score ===
              "number" &&
            Number.isFinite(
              score,
            ) &&
            !looksLikeAnalysisFailure(
              result.suggestion,
            );

          setReadiness({
            loading:
              false,
            score:
              validScore
                ? score
                : null,
            unavailable:
              !validScore,
          });
        } catch (
          error
        ) {
          console.error(
            "[Dashboard] Unable to load readiness score:",
            error,
          );

          if (
            !active
          ) {
            return;
          }

          setAssessment2Complete(
            error instanceof
                ApiError &&
              error.status ===
                404
              ? false
              : null,
          );

          setReadiness({
            loading:
              false,
            score:
              null,
            unavailable:
              true,
          });
        }
      }

      if (
        status ===
          "authenticated" &&
        user
      ) {
        void loadReadiness();
      } else if (
        status !==
        "loading"
      ) {
        setAssessment2Complete(
          null,
        );

        setReadiness({
          loading:
            false,
          score:
            null,
          unavailable:
            false,
        });
      }

      return () => {
        active =
          false;
      };
    },
    [
      status,
      user,
    ],
  );

  /* =======================================================
     Dashboard Quest Hero roadmap

     Dashboard only READS the user's canonical roadmap.

     Premium timeline generation and mentor matching remain
     owned by the existing Quest Tracker flow.
  ======================================================= */

  useEffect(
    () => {
      let active =
        true;

      async function loadRoadmapHero():
        Promise<void> {
        if (
          status !==
            "authenticated" ||
          !user
        ) {
          setRoadmapHero({
            loading:
              false,
            roadmap:
              null,
          });

          return;
        }

        const targetId =
          getUserScholarshipId(
            user,
          );

        if (
          !targetId
        ) {
          setRoadmapHero({
            loading:
              false,
            roadmap:
              null,
          });

          return;
        }

        setRoadmapHero({
          loading:
            true,
          roadmap:
            null,
        });

        try {
          const access =
            await getRoadmapAccess(
              targetId,
            );

          if (
            !active
          ) {
            return;
          }

          setRoadmapHero({
            loading:
              false,
            roadmap:
              access.roadmap,
          });
        } catch (
          roadmapError
        ) {
          console.warn(
            "[Dashboard] Unable to load Quest Tracker hero:",
            roadmapError,
          );

          if (
            !active
          ) {
            return;
          }

          setRoadmapHero({
            loading:
              false,
            roadmap:
              null,
          });
        }
      }

      void loadRoadmapHero();

      return () => {
        active =
          false;
      };
    },
    [
      status,
      user,
    ],
  );

  /* =======================================================
     Existing H-1 mentor-task reminder
  ======================================================= */

  useEffect(
    () => {
      let active =
        true;

      if (
        status !==
          "authenticated" ||
        !user
      ) {
        return () => {
          active =
            false;
        };
      }

      const authenticatedUser =
        user;

      async function showMentorDeadlineAlert():
        Promise<void> {
        try {
          const reminders =
            await getH1MentorReminders(
              authenticatedUser.id,
            );

          if (
            !active ||
            reminders.length ===
              0
          ) {
            return;
          }

          const unseen =
            reminders.filter(
              (
                reminder,
              ) =>
                window.localStorage.getItem(
                  reminderAlertStorageKey(
                    authenticatedUser.id,
                    reminder,
                  ),
                ) !==
                "shown",
            );

          if (
            unseen.length ===
            0
          ) {
            return;
          }

          unseen.forEach(
            (
              reminder,
            ) => {
              window.localStorage.setItem(
                reminderAlertStorageKey(
                  authenticatedUser.id,
                  reminder,
                ),
                "shown",
              );
            },
          );

          const first =
            unseen[
              0
            ];

          const dateLabel =
            formattedReminderDeadline(
              first.deadline,
            );

          const message =
            unseen.length ===
              1
              ? `Your mentor task "${first.title}" is due tomorrow${
                  dateLabel
                    ? ` (${dateLabel})`
                    : ""
                }.`
              : `You have ${unseen.length} mentor tasks due tomorrow: ${unseen
                  .map(
                    (
                      reminder,
                    ) =>
                      reminder.title,
                  )
                  .join(
                    ", ",
                  )}.`;

          const result =
            await Swal.fire({
              icon:
                "warning",

              title:
                unseen.length ===
                  1
                  ? "Mentor task due tomorrow"
                  : `${unseen.length} mentor tasks due tomorrow`,

              text:
                message,

              confirmButtonText:
                "Open Quest Tracker",

              cancelButtonText:
                "Later",

              showCancelButton:
                true,

              reverseButtons:
                true,

              confirmButtonColor:
                "#16629b",

              cancelButtonColor:
                "#8a735f",

              background:
                "#ffffff",

              color:
                "#2c1607",

              customClass: {
                popup:
                  "rounded-[24px]",

                confirmButton:
                  "rounded-xl px-5 py-2.5 font-bold",

                cancelButton:
                  "rounded-xl px-5 py-2.5 font-bold",
              },
            });

          if (
            active &&
            result.isConfirmed
          ) {
            navigate(
              "/quests",
            );
          }
        } catch (
          error
        ) {
          console.error(
            "[Dashboard] Unable to check H-1 mentor-task reminders:",
            error,
          );
        }
      }

      void showMentorDeadlineAlert();

      return () => {
        active =
          false;
      };
    },
    [
      navigate,
      status,
      user,
    ],
  );

  function handleContinueJourney():
    void {
    navigate(
      "/quests",
    );
  }

  function handleMilestoneSelect(
    milestone:
      RoadmapMilestone,
  ): void {
    const orderedMilestones =
      roadmapHero.roadmap
        ? [
            ...roadmapHero
              .roadmap
              .milestones,
          ].sort(
            (
              first,
              second,
            ) =>
              first.order -
              second.order,
          )
        : [];

    const milestoneIndex =
      orderedMilestones.findIndex(
        (
          candidate,
        ) =>
          String(
            candidate.id,
          ) ===
          String(
            milestone.id,
          ),
      );

    /*
     * Milestone 2 is Assessment 2.
     *
     * Keep this interaction on the Dashboard instead of
     * immediately sending the user to another page.
     */
    if (
      milestoneIndex ===
        1 &&
      assessment2Complete ===
        false
    ) {
      setAssessment2PopupOpen(
        true,
      );

      return;
    }

    /*
     * Fallback:
     * if for some reason the milestone cannot be found in the
     * currently loaded roadmap, open the full Quest Tracker.
     */
    if (
      milestoneIndex <
      0
    ) {
      handleContinueJourney();

      return;
    }

    navigate(
      `/quests?milestone=${
        milestoneIndex +
        1
      }`,
    );
  }

  function handleBookMentor():
    void {
    navigate(
      "/sessions",
    );
  }

  return (
    <>
      <UserLayout
        title="Dashboard"
        topbarProps={{
          showSearch:
            false,
        }}
      >
        {status ===
        "loading" ? (
          <DashboardLoadingState />
        ) : !user ? (
          <section className="min-h-[calc(100vh-80px)] bg-ally-background px-4 py-8">
            <DashboardUnavailableState />
          </section>
        ) : (
          <DashboardQuestHero
            roadmap={
              roadmapHero.roadmap
            }
            loading={
              roadmapHero.loading
            }
            user={
              user
            }
            readinessScore={
              readiness.score
            }
            readinessLoading={
              readiness.loading
            }
            assessment2Complete={
              assessment2Complete
            }
            onOpenQuestTracker={
              handleContinueJourney
            }
            onMilestoneSelect={
              handleMilestoneSelect
            }
            onBookMentor={
              handleBookMentor
            }
          />
        )}
      </UserLayout>

      <Assessment2MilestonePopup
        isOpen={
          assessment2PopupOpen
        }
        onClose={() => {
          setAssessment2PopupOpen(
            false,
          );
        }}
        onStartAssessment={() => {
          navigate(
            ASSESSMENT_2_ROUTE,
          );
        }}
      />
    </>
  );
}