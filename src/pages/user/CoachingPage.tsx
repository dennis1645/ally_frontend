import {
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import {
  useState,
} from "react";

import allyMascot from "../../assets/ally-explorer.png";

import ExpeditionLogs from "../../components/coaching/ExpeditionLogs";
import GuidedPaths from "../../components/coaching/GuidedPaths";
import NextExpeditionCard from "../../components/coaching/NextExpeditionCard";

import UserLayout from "../../components/layout/UserLayout";

import {
  coachingGuidedPaths,
  coachingHero,
  coachingPastSessions,
  upcomingCoachingSession,
} from "../../mocks/coachingMock";

import type {
  CoachingPathId,
} from "../../types/coaching";

export default function CoachingPage() {
  const [
    selectedPath,
    setSelectedPath,
  ] =
    useState<CoachingPathId | null>(
      null,
    );

  const [
    notice,
    setNotice,
  ] =
    useState<string | null>(
      null,
    );

  function showTemporaryNotice(
    message:
      string,
  ): void {
    setNotice(
      message,
    );

    window.setTimeout(
      () => {
        setNotice(
          (
            current,
          ) =>
            current ===
            message
              ? null
              : current,
        );
      },
      3000,
    );
  }

  function handleSelectPath(
    pathId:
      CoachingPathId,
  ): void {
    setSelectedPath(
      pathId,
    );

    const selected =
      coachingGuidedPaths.find(
        (
          path,
        ) =>
          path.id ===
          pathId,
      );

    showTemporaryNotice(
      selected
        ? `${selected.title} selected. This prototype uses local frontend state only.`
        : "Guided path selected.",
    );
  }

  return (
    <UserLayout
      title="Coaching">
      <section
        aria-label="Coaching dashboard content"
        className="min-h-[calc(100vh-80px)] bg-[#fff8f5] px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      >
        <div className="mx-auto w-full max-w-[1120px] space-y-10">

          {/* Hero */}

          <section className="overflow-hidden rounded-[28px] border border-[#ead3bd] bg-[#f4f4f6] px-6 py-7 shadow-sm sm:px-8 lg:px-10">
            <div className="flex flex-col items-center gap-7 md:flex-row md:items-center">
              <div className="relative shrink-0">
                <div
                  aria-hidden="true"
                  className="absolute bottom-2 left-1/2 h-5 w-28 -translate-x-1/2 rounded-[100%] bg-slate-400/20 blur-md"
                />

                <img
                  src={
                    allyMascot
                  }
                  alt="Ally explorer mascot"
                  className="relative h-36 w-36 object-contain sm:h-40 sm:w-40"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="relative max-w-xl rounded-2xl border border-[#efd0bd] bg-[#fff8f5] px-6 py-5 shadow-sm sm:px-7">
                  <div
                    aria-hidden="true"
                    className="absolute left-[-8px] top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-b border-l border-[#efd0bd] bg-[#fff8f5] md:block"
                  />

                  <p className="text-base italic leading-7 text-[#4f4137] sm:text-lg">
                    &ldquo;{
                      coachingHero.quote
                    }&rdquo;
                  </p>
                </div>

                <p className="mt-5 text-center text-sm leading-6 text-slate-600 md:text-left sm:text-base">
                  {
                    coachingHero.subtitle
                  }
                </p>
              </div>
            </div>
          </section>

          <NextExpeditionCard
            session={
              upcomingCoachingSession
            }
            onViewSchedule={() => {
              showTemporaryNotice(
                "Schedule view is represented with mock data in this frontend prototype.",
              );
            }}
            onJoinMeeting={() => {
              showTemporaryNotice(
                "Join Meeting clicked. No real meeting URL is connected in this frontend-only prototype.",
              );
            }}
          />

          <GuidedPaths
            paths={
              coachingGuidedPaths
            }
            selectedPath={
              selectedPath
            }
            onSelect={
              handleSelectPath
            }
          />

          <ExpeditionLogs
            sessions={
              coachingPastSessions
            }
          />
        </div>

        {notice && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-[70] max-w-sm rounded-2xl border border-[#c8dfef] bg-white px-5 py-4 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf7ff] text-[#16629b]">
                <CheckCircle2
                  size={18}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[#2c1607]">
                    Coaching
                  </p>

                  <Sparkles
                    size={15}
                    className="text-[#16629b]"
                  />
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {notice}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}