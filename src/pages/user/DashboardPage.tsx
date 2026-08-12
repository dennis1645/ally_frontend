import {
  ArrowRight,
  Compass,
  Map,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  getDeepDiagnosticResult,
} from "../../api/deepDiagnosticApi";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import AchievementsCard from "../../components/dashboard/AchievementsCard";
import ExplorerProfileCard from "../../components/dashboard/ExplorerProfileCard";
import MentorTasksCard from "../../components/dashboard/MentorTasksCard";
import IELTSPracticeQuizCard from "../../components/dashboard/IELTSPracticeQuizCard";
import ReadinessScoreCard from "../../components/dashboard/ReadinessScoreCard";
import StreakStatusCard from "../../components/dashboard/StreakStatusCard";
import UpcomingDeadlinesCard from "../../components/dashboard/UpcomingDeadlinesCard";
import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  dashboardFallback,
} from "../../mocks/dashboardFallback";

type ReadinessState = {
  loading: boolean;
  score: number | null;
  unavailable: boolean;
};

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

function DashboardLoadingState() {
  return (
    <div className="mx-auto w-full max-w-[1220px] animate-pulse space-y-6">
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

      <div
        className={[
          "grid items-start gap-6",
          "xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]",
        ].join(" ")}
      >
        <div className="h-[420px] rounded-[24px] bg-white" />

        <div className="space-y-6">
          <div className="h-64 rounded-[24px] bg-white" />
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
          Your profile information could not be loaded. Please reload the dashboard.
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#dceeff]/70 blur-2xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 left-20 h-32 w-32 rounded-full bg-[#ffe2c9]/60 blur-2xl"
      />

      <div className="relative">
        <div className="mb-5 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f3ff] text-[#16629b]">
            <Map
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_245px] lg:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div
                aria-hidden="true"
                className="absolute inset-x-3 bottom-0 h-5 rounded-full bg-[#6f5135]/10 blur-md"
              />

              <img
                src={allyMascot}
                alt="Ally the explorer mascot"
                className="ally-mascot-float relative h-28 w-28 object-contain sm:h-32 sm:w-32"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div
                className={[
                  "relative rounded-[22px]",
                  "border border-[#efd0bd] bg-[#fff8f3]",
                  "px-5 py-5 shadow-sm",
                  "sm:px-6",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "absolute left-[-8px] top-1/2 hidden",
                    "h-4 w-4 -translate-y-1/2 rotate-45",
                    "border-b border-l border-[#efd0bd]",
                    "bg-[#fff8f3] sm:block",
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
                      Keep going, Explorer! Your Research Trail is waiting.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#66584d] sm:text-[15px]">
                      Continue exploring scholarships that match your goals and keep building your preparation plan.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className={[
                  "mt-4 inline-flex min-h-11 items-center justify-center gap-2",
                  "rounded-xl bg-[#16629b] px-5 py-3",
                  "text-sm font-bold text-white",
                  "shadow-[0_4px_0_#0d4773]",
                  "transition duration-200",
                  "hover:-translate-y-0.5 hover:bg-[#115787]",
                  "hover:shadow-[0_6px_0_#0d4773]",
                  "active:translate-y-0.5 active:scale-[0.99]",
                  "active:shadow-[0_2px_0_#0d4773]",
                  "focus-visible:outline-none focus-visible:ring-4",
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

          <div
            className={[
              "rounded-[22px] border-2 border-[#72afe0]",
              "bg-white/90 p-5",
              "shadow-[0_8px_22px_rgba(22,98,155,0.13)]",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 text-[#16629b]">
              <Compass
                size={18}
                aria-hidden="true"
              />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Current Milestone
              </span>
            </div>

            <h3 className="mt-4 text-xl font-extrabold text-[#2c1607]">
              Research Trail
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Discover scholarship opportunities that fit your profile, goals, and study plans.
            </p>

            <div className="mt-4 rounded-xl bg-[#f3f9fd] px-3 py-2.5 text-xs font-semibold leading-5 text-[#245f88]">
              Your dedicated Quest Tracker keeps the full expedition map — the dashboard stays focused on what matters now.
            </div>
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
  } =
    useAuth();

  const [
    readiness,
    setReadiness,
  ] =
    useState<ReadinessState>({
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

  function handleOpenMentorSessions():
    void {
    navigate("/sessions");
  }

  return (
     <UserLayout title="Dashboard"
        subtitle="Explorer Basecamp & Overview"
      
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
                Primary dashboard area

                LEFT
                - Profile
                - Next Expedition Step

                RIGHT
                - Streak
                - Readiness Score
                - Upcoming Deadlines
            ================================================ */}

            <div
              className={[
                "grid items-start gap-6",
                "xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.8fr)]",
              ].join(" ")}
            >
              {/* Primary journey column — placement intentionally preserved */}
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

              {/* Compact status rail */}
              <aside
                aria-label="Scholarship journey status"
                className="min-w-0 space-y-4"
              >
                <StreakStatusCard
                  count={
                    dashboardFallback.streakCount
                  }
                  isFallback
                />

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

                <UpcomingDeadlinesCard />
              </aside>
            </div>

            {/* ===============================================
                Bottom dashboard area

                - Mentor Tasks
                - Achievements
            ================================================ */}

            <section
              aria-label="Practice, mentor guidance, and achievements"
              className={[
                "mt-6 grid items-start gap-6",
                "xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]",
              ].join(" ")}
            >
              <div className="min-w-0">
                <MentorTasksCard
                  tasks={[
                    ...dashboardFallback.mentorTasks,
                  ]}
                  onOpenSessions={
                    handleOpenMentorSessions
                  }
                  usingFallback
                />
              </div>

              <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-1">
                <IELTSPracticeQuizCard />

                <AchievementsCard
                  badges={user.badges}
                />
              </div>
            </section>
          </div>
        )}
      </section>
    </UserLayout>
  );
}