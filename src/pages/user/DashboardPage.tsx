import {
  ArrowRight,
  Compass,
  Map as MapIcon,
  Sparkles,
} from "lucide-react";

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
  getUpcomingReminders,
  isH1MentorTaskReminder,
  type Reminder,
} from "../../api/reminderApi";

import allyMascot from "../../assets/ally-assessment-mascot.png";

// import AchievementsCard from "../../components/dashboard/AchievementsCard";
import ExplorerProfileCard from "../../components/dashboard/ExplorerProfileCard";
import IELTSPracticeQuizCard from "../../components/dashboard/IELTSPracticeQuizCard";
import ReadinessScoreCard from "../../components/dashboard/ReadinessScoreCard";
import StreakStatusCard from "../../components/dashboard/StreakStatusCard";
import UpcomingDeadlinesCard from "../../components/dashboard/UpcomingDeadlinesCard";

import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

type ReadinessState = {
  loading: boolean;
  score: number | null;
  unavailable: boolean;
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
    (signal) =>
      normalized.includes(
        signal,
      ),
  );
}

function DashboardLoadingState() {
  return (
    <div className="mx-auto w-full max-w-[1220px] animate-pulse space-y-6">
      {/* Main dashboard skeleton */}
      <div
        className={[
          "grid items-start gap-6",
          "xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.8fr)]",
        ].join(" ")}
      >
        <div className="space-y-6">
          <div className="h-64 rounded-[24px] bg-white" />

          <div className="h-80 rounded-[26px] bg-white" />
        </div>

        <div className="space-y-4">
          <div className="h-40 rounded-[22px] bg-white" />

          <div className="h-44 rounded-[22px] bg-white" />

          <div className="h-64 rounded-[24px] bg-white" />
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
        ].join(" ")}
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

type NextExpeditionStepProps = {
  onContinue: () => void;
};

function NextExpeditionStep({
  onContinue,
}: NextExpeditionStepProps) {
  return (
    <section
      aria-labelledby="next-expedition-step-title"
      className={[
        "relative overflow-hidden rounded-[26px]",
        "border border-[#ead8c8]",
        "bg-gradient-to-br from-[#fffaf6] via-white to-[#eef7ff]",
        "p-5 shadow-[0_6px_0_#dfcdbb]",
        "sm:p-6 lg:p-7",
      ].join(" ")}
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-right-12 -top-12",
          "h-40 w-40 rounded-full",
          "bg-[#dceeff]/70 blur-2xl",
        ].join(" ")}
      />

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute",
          "-bottom-14 left-20",
          "h-32 w-32 rounded-full",
          "bg-[#ffe2c9]/60 blur-2xl",
        ].join(" ")}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f3ff] text-[#16629b]">
            <MapIcon
              size={18}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#7a582f]">
              Your Next Expedition Step
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Continue from your current scholarship checkpoint
            </p>
          </div>
        </div>

        {/* Ally (left) + speech bubble/milestone/button (right) */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Ally mascot - left column */}
          <div
            className={[
              "flex shrink-0 items-center justify-center",
              "sm:w-[28%] sm:max-w-[170px]",
            ].join(" ")}
          >
            <div className="relative mx-auto">
              <div
                aria-hidden="true"
                className={[
                  "absolute inset-x-3 bottom-0",
                  "h-5 rounded-full",
                  "bg-[#6f5135]/10 blur-md",
                ].join(" ")}
              />

              <img
                src={allyMascot}
                alt="Ally the explorer mascot"
                className={[
                  "ally-mascot-float relative",
                  "h-24 w-24 object-contain",
                  "sm:h-28 sm:w-28",
                ].join(" ")}
              />
            </div>
          </div>

          {/* Right column: speech bubble, milestone, button */}
          <div className="min-w-0 flex-1 space-y-4">
            {/* Speech bubble - points toward Ally */}
            <div
              className={[
                "relative rounded-[22px]",
                "border border-[#efd0bd]",
                "bg-[#fff8f3]",
                "px-5 py-5 shadow-sm",
                "sm:px-6",
              ].join(" ")}
            >
              {/* Speech bubble pointer, aimed left at Ally */}
              <span
                aria-hidden="true"
                className={[
                  "absolute left-[-8px] top-1/2 hidden",
                  "h-4 w-4 -translate-y-1/2 rotate-45",
                  "border-b border-l border-[#efd0bd]",
                  "bg-[#fff8f3]",
                  "sm:block",
                ].join(" ")}
              />

              <div className="flex items-start gap-2">
                <Sparkles
                  size={18}
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-[#e49a36]"
                />

                <div>
                  <h2
                    id="next-expedition-step-title"
                    className="text-lg font-extrabold leading-7 text-[#2c1607] sm:text-xl"
                  >
                    Keep going, Explorer! 
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#66584d] sm:text-[15px]">
                    Continue exploring scholarships that match
                    your goals and keep building your preparation
                    plan.
                  </p>
                </div>
              </div>
            </div>

            {/* Current milestone */}
            <div
              className={[
                "rounded-[20px]",
                "border-2 border-[#72afe0]",
                "bg-white/90 px-5 py-4",
                "shadow-[0_8px_22px_rgba(22,98,155,0.13)]",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 text-[#16629b]">
                <Compass
                  size={18}
                  aria-hidden="true"
                />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                  Current Milestone: Research Trail
                </span>
              </div>
            </div>

            {/* Continue journey button */}
            <button
              type="button"
              onClick={onContinue}
              className={[
                "inline-flex min-h-11",
                "items-center justify-center gap-2",
                "rounded-xl bg-[#16629b]",
                "px-5 py-3",
                "text-sm font-bold text-white",
                "shadow-[0_4px_0_#0d4773]",
                "transition duration-200",
                "hover:-translate-y-0.5",
                "hover:bg-[#115787]",
                "hover:shadow-[0_6px_0_#0d4773]",
                "active:translate-y-0.5",
                "active:scale-[0.99]",
                "active:shadow-[0_2px_0_#0d4773]",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#9bcaff]",
              ].join(" ")}
            >
              Continue Journey

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const navigate =
    useNavigate();

  const {
    user,
    status,
  } = useAuth();

  const [
    readiness,
    setReadiness,
  ] = useState<ReadinessState>({
    loading: true,
    score: null,
    unavailable: false,
  });

  useEffect(
    () => {
      let active = true;

      async function loadReadiness():
        Promise<void> {
        setReadiness({
          loading: true,
          score: null,
          unavailable: false,
        });

        try {
          const result =
            await getDeepDiagnosticResult();

          if (!active) {
            return;
          }

          const score =
            result.revisedPercentage;

          const validScore =
            typeof score === "number" &&
            Number.isFinite(score) &&
            !looksLikeAnalysisFailure(
              result.suggestion,
            );

          setReadiness({
            loading: false,

            score:
              validScore
                ? score
                : null,

            unavailable:
              !validScore,
          });
        } catch (error) {
          console.error(
            "[Dashboard] Unable to load readiness score:",
            error,
          );

          if (!active) {
            return;
          }

          setReadiness({
            loading: false,
            score: null,
            unavailable: true,
          });
        }
      }

      if (
        status === "authenticated" &&
        user
      ) {
        void loadReadiness();
      } else if (
        status !== "loading"
      ) {
        setReadiness({
          loading: false,
          score: null,
          unavailable: false,
        });
      }

      return () => {
        active = false;
      };
    },
    [
      status,
      user,
    ],
  );

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

      // Capture the narrowed user so TypeScript preserves non-null
      // status inside the asynchronous reminder callback.
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

          /*
           * The supplied backend exposes the reminder feed, but no
           * read/unread mutation endpoint. This local flag prevents
           * the dashboard alert from repeating all day without
           * pretending to mark a backend notification as read.
           */
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
            unseen[0];

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
    navigate("/quests");
  }

  function handleOpenAssessment():
    void {
    navigate(
      "/assessment/deep-diagnostic",
    );
  }

  return (
    <UserLayout
      title="Dashboard"
      topbarProps={{
        showSearch: false,
      }}
    >
      <section
        aria-label="Dashboard content"
        className={[
          "min-h-[calc(100vh-80px)]",
          "bg-ally-background",
          "px-4 py-6",
          "sm:px-6 sm:py-8",
          "lg:px-8",
        ].join(" ")}
      >
        {status === "loading" ? (
          <DashboardLoadingState />
        ) : !user ? (
          <DashboardUnavailableState />
        ) : (
          <div className="mx-auto w-full max-w-[1220px]">
            {/* ===============================================
                PRIMARY DASHBOARD

                LEFT
                - Explorer Profile
                - Next Expedition Step

                RIGHT
                - IELTS Practice
                - Weekly Streak
                - Readiness Score
                - Upcoming Deadlines
            ================================================ */}

            <div
              className={[
                "grid items-start gap-6",
                "xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.8fr)]",
              ].join(" ")}
            >
              {/* Main journey column */}
              <main className="min-w-0 space-y-6">
                <ExplorerProfileCard
                  user={user}
                />

                <NextExpeditionStep
                  onContinue={
                    handleContinueJourney
                  }
                />
              </main>

              {/* Scholarship status rail */}
              <aside
                aria-label="Scholarship journey status"
                className="min-w-0 space-y-4"
              >
                <IELTSPracticeQuizCard />

                {/* Streak card now loads its own API data */}
                <StreakStatusCard />

                <ReadinessScoreCard
                  score={
                    readiness.score
                  }
                  loading={
                    readiness.loading
                  }
                  unavailable={
                    readiness.unavailable
                  }
                  onOpenAssessment={
                    handleOpenAssessment
                  }
                />

                <UpcomingDeadlinesCard
                  user={user}
                />

              </aside>
            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}