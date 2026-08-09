import {
  ArrowRight,
  Video,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  UpcomingCoachingSession,
} from "../../types/coaching";

export type NextExpeditionCardProps = {
  session:
    UpcomingCoachingSession;

  onViewSchedule:
    () => void;

  onJoinMeeting:
    () => void;
};

function formatCountdown(
  totalSeconds:
    number,
): string {
  const safeSeconds =
    Math.max(
      0,
      totalSeconds,
    );

  const hours =
    Math.floor(
      safeSeconds /
        3600,
    );

  const minutes =
    Math.floor(
      (
        safeSeconds %
        3600
      ) /
        60,
    );

  const seconds =
    safeSeconds %
    60;

  return [
    hours,
    minutes,
    seconds,
  ]
    .map(
      (
        value,
      ) =>
        String(
          value,
        ).padStart(
          2,
          "0",
        ),
    )
    .join(
      ":",
    );
}

export default function NextExpeditionCard({
  session,
  onViewSchedule,
  onJoinMeeting,
}: NextExpeditionCardProps) {
  const [
    secondsRemaining,
    setSecondsRemaining,
  ] =
    useState(
      session.countdownSeconds,
    );

  useEffect(
    () => {
      setSecondsRemaining(
        session.countdownSeconds,
      );

      const timer =
        window.setInterval(
          () => {
            setSecondsRemaining(
              (
                current,
              ) =>
                current >
                0
                  ? current -
                    1
                  : 0,
            );
          },
          1000,
        );

      return () => {
        window.clearInterval(
          timer,
        );
      };
    },
    [
      session.countdownSeconds,
    ],
  );

  const countdown =
    useMemo(
      () =>
        formatCountdown(
          secondsRemaining,
        ),
      [
        secondsRemaining,
      ],
    );

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-extrabold text-[#2c1607] sm:text-2xl">
          Your Next Expedition
        </h2>

        <button
          type="button"
          onClick={
            onViewSchedule
          }
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#16629b] transition hover:text-[#0f4c79]"
        >
          View all schedule

          <ArrowRight
            size={16}
          />
        </button>
      </div>

      <article className="rounded-[18px] border-2 border-[#5fa9e8] bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="w-[62px] shrink-0 rounded-xl bg-[#14669d] px-2 py-3 text-center text-white shadow-inner">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/90">
                {session.month}
              </p>

              <p className="mt-0.5 text-2xl font-extrabold leading-none">
                {session.day}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#3f4147]">
                {session.time}
              </p>

              <h3 className="mt-1 text-xl font-extrabold leading-tight text-[#16629b] sm:text-2xl">
                {session.title}
              </h3>
            </div>
          </div>

          <div className="hidden h-14 w-px bg-slate-200 xl:block" />

          <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between xl:max-w-[520px]">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white bg-[#6caee4] text-xs font-bold text-white shadow-md">
                {
                  session.mentorInitials
                }
              </div>

              <div>
                <p className="text-sm font-bold text-[#2c1607]">
                  {
                    session.mentorName
                  }
                </p>

                <p className="max-w-[120px] text-xs leading-4 text-slate-500">
                  {
                    session.mentorSubtitle
                  }
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500">
                Starts in
              </p>

              <p className="font-mono text-xl font-extrabold tracking-wide text-red-600 sm:text-2xl">
                {countdown}
              </p>
            </div>

            <button
              type="button"
              onClick={
                onJoinMeeting
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#16629b] px-6 font-semibold text-white shadow-[0_4px_0_#0b4d78] transition hover:bg-[#1c70ab] active:translate-y-0.5 active:shadow-none"
            >
              <Video
                size={18}
              />

              Join Meeting
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}