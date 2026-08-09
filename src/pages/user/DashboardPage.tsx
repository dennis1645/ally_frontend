import AchievementsCard from "../../components/dashboard/AchievementsCard";
import AllySpeechCard from "../../components/dashboard/AllySpeechCard";
import ExpeditionTrailCard from "../../components/dashboard/ExpeditionTrailCard";
import ExplorerProfileCard from "../../components/dashboard/ExplorerProfileCard";
import MotivationalQuoteCard from "../../components/dashboard/MotivationalQuoteCard";
import TodaysAscentCard from "../../components/dashboard/TodaysAscentCard";
import UpcomingDeadlinesCard from "../../components/dashboard/UpcomingDeadlinesCard";
import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

/*
 * Temporary source from the latest diagnostic response.
 *
 * GET /api/profile does not currently return
 * weaknesses_mapping. Replace this constant with the latest
 * authenticated diagnostic-result response when that API is
 * connected to the dashboard.
 */
const currentDiagnosticWeaknesses = [
  "english_not_certified",
  "weak_storytelling",
  "cv_needs_improvement",
  "essay_incomplete",
  "previous_rejection",
  "unclear_rejection_reasons",
  "leadership_achievement_gap",
  "cv_format_issue",
] as const;

function DashboardLoadingState() {
  return (
    <div
      className={[
        "mx-auto grid w-full max-w-[1200px]",
        "animate-pulse items-start gap-6",
        "xl:grid-cols-[minmax(0,1fr)_340px]",
      ].join(" ")}
    >
      <div className="space-y-6">
        <div className="h-64 rounded-[24px] bg-white" />

        <div className="h-96 rounded-[24px] bg-white" />
      </div>

      <div className="space-y-6">
        <div className="h-64 rounded-[24px] bg-white" />

        <div className="h-96 rounded-[24px] bg-white" />
      </div>
    </div>
  );
}

function DashboardUnavailableState() {
  return (
    <div className="mx-auto grid min-h-[320px] w-full max-w-[1200px] place-items-center">
      <div
        className={[
          "w-full max-w-lg rounded-[24px]",
          "border border-orange-100 bg-white",
          "p-8 text-center",
          "shadow-[0_6px_0_#d8c6ae]",
        ].join(" ")}
      >
        <h2 className="text-xl font-bold text-[#2c1607]">
          Explorer profile unavailable
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your profile information could not be loaded. Please reload the dashboard.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    user,
    status,
  } =
    useAuth();

  return (
    <UserLayout
      title="Expedition Headquarters"
      subtitle="Explorer Dashboard">
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
        {status ===
        "loading" ? (
          <DashboardLoadingState />
        ) : !user ? (
          <DashboardUnavailableState />
        ) : (
          <div
            className={[
              "mx-auto grid w-full max-w-[1200px]",
              "items-start gap-6",
              "xl:grid-cols-[minmax(0,1fr)_340px]",
            ].join(" ")}
          >
            {/* Main dashboard column */}

            <div className="space-y-6">
              <ExplorerProfileCard
                user={
                  user
                }
              />

              <ExpeditionTrailCard />

              <div className="grid gap-6 lg:grid-cols-2">
                <AllySpeechCard />

                <MotivationalQuoteCard />
              </div>
            </div>

            {/* Right dashboard column */}

            <aside className="space-y-6">
              <AchievementsCard
                badges={
                  user.badges
                }
              />

              <TodaysAscentCard
                weaknesses={
                  currentDiagnosticWeaknesses
                }
              />

              <UpcomingDeadlinesCard />
            </aside>
          </div>
        )}
      </section>
    </UserLayout>
  );
}