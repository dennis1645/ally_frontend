import { useTranslation } from "react-i18next";
import AchievementsCard from "../../components/dashboard/AchievementsCard";
import ExpeditionTrailCard from "../../components/dashboard/ExpeditionTrailCard";
import ExplorerProfileCard from "../../components/dashboard/ExplorerProfileCard";
import TodaysAscentCard from "../../components/dashboard/TodaysAscentCard";
import UpcomingDeadlinesCard from "../../components/dashboard/UpcomingDeadlinesCard";

import UserLayout from "../../components/layout/UserLayout";
import { useAuth } from "../../context/AuthContext";

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
  const { user, status } = useAuth();
  const { t } = useTranslation();

  return (
    <UserLayout
      title={t("dashboard.title", "Expedition Headquarters")}
      subtitle={t("dashboard.subtitle", "Explorer Dashboard")}
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
          <div className="mx-auto w-full max-w-[1200px] space-y-8">
            
            {/* HEADER PROFIL FULL WIDTH */}
            <ExplorerProfileCard />

            {/* ZIGZAG GRID LAYOUT */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              
              {/* --- BARIS 1 --- */}
              {/* Kiri (1 Kolom): Todays Ascent / Streak */}
              <div className="lg:col-span-1">
                <TodaysAscentCard />
              </div>
              
              {/* Kanan (2 Kolom): Expedition Trail */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1">
                  <ExpeditionTrailCard />
                </div>
              </div>

              {/* --- BARIS 2 --- */}
              {/* Kiri (2 Kolom): Upcoming Deadlines & Mentor Tasks */}
              <div className="lg:col-span-2">
                <UpcomingDeadlinesCard />
              </div>
              
              {/* Kanan (1 Kolom): Achievements */}
              <div className="lg:col-span-1">
                <AchievementsCard badges={user.badges} />
              </div>

            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}