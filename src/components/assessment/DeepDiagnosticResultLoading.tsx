import {
  Compass,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AllyDialogue from "./AllyDialogue";

const LOADING_MESSAGES = [
  "I’m reviewing the patterns in your answers and mapping your strongest scholarship signals. 🧭",
  "Now I’m comparing your academic, leadership, language, and application-readiness clues.",
  "I’m checking which scholarship paths fit your profile best. A few more trail markers to inspect!",
  "Almost there — I’m turning everything into your readiness insight and recommended next steps. ✨",
] as const;

const CHECK_ITEMS = [
  "Your strengths",
  "Readiness gaps",
  "Scholarship fit",
  "Next-step guidance",
] as const;

export default function DeepDiagnosticResultLoading() {
  const [messageIndex, setMessageIndex] =
    useState(
      0,
    );

  const [elapsedSeconds, setElapsedSeconds] =
    useState(
      0,
    );

  useEffect(
    () => {
      const messageTimer =
        window.setInterval(
          () => {
            setMessageIndex(
              (current) =>
                (current + 1) %
                LOADING_MESSAGES.length,
            );
          },
          4200,
        );

      const elapsedTimer =
        window.setInterval(
          () => {
            setElapsedSeconds(
              (current) =>
                current + 1,
            );
          },
          1000,
        );

      return () => {
        window.clearInterval(
          messageTimer,
        );

        window.clearInterval(
          elapsedTimer,
        );
      };
    },
    [],
  );

  const waitingMessage =
    useMemo(
      () => {
        if (
          elapsedSeconds < 10
        ) {
          return "Ally is analyzing your expedition data…";
        }

        if (
          elapsedSeconds < 25
        ) {
          return "The AI analysis is still working — you can stay right here.";
        }

        return "This analysis can take a little longer when Ally is comparing more scholarship signals.";
      },
      [
        elapsedSeconds,
      ],
    );

  return (
    <div className="my-auto w-full py-3 sm:py-6">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-5 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bad6e7] bg-[#eaf5fb]/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#16629b] shadow-sm">
            <Sparkles
              size={15}
              className="animate-pulse"
              aria-hidden="true"
            />
            Ally is analyzing your trail
          </div>
        </div>

        <AllyDialogue
          key={`result-loading-message-${messageIndex}`}
          text={
            LOADING_MESSAGES[
              messageIndex
            ]
          }
          typingSpeed={18}
          label="Ally explains the Deep Diagnostic analysis"
        />

        <div className="relative mx-auto mt-8 max-w-[610px] overflow-hidden rounded-[24px] border border-[#d8e2e8] bg-white/78 px-5 py-5 shadow-[0_5px_0_rgba(22,98,155,0.08)] backdrop-blur sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 top-[63px] h-[42px] opacity-55"
          >
            <svg
              viewBox="0 0 560 48"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M4 29 C75 2 122 46 191 24 C259 2 306 45 375 22 C445 -1 490 37 556 16"
                fill="none"
                stroke="#b8cbd6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M4 29 C75 2 122 46 191 24 C259 2 306 45 375 22 C445 -1 490 37 556 16"
                fill="none"
                stroke="#16629b"
                strokeWidth="3"
                strokeLinecap="round"
                className="route-line"
              />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CHECK_ITEMS.map(
              (
                item,
                index,
              ) => {
                const isHighlighted =
                  index ===
                  messageIndex;

                return (
                  <div
                    key={item}
                    className={[
                      "flex min-h-[92px] flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center transition-all duration-500",
                      isHighlighted
                        ? "-translate-y-1 border-[#7db6db] bg-[#eaf5fb] shadow-md"
                        : "border-[#e2e8ec] bg-white/82",
                    ].join(
                      " ",
                    )}
                  >
                    <div
                      className={[
                        "grid h-8 w-8 place-items-center rounded-full transition-all duration-500",
                        isHighlighted
                          ? "bg-[#16629b] text-white"
                          : "bg-[#f1f4f6] text-[#7d8c94]",
                      ].join(
                        " ",
                      )}
                    >
                      {isHighlighted ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Compass
                          size={15}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <span className="mt-2 text-[11px] font-bold leading-4 text-[#45545d]">
                      {item}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="mx-auto flex w-fit items-center gap-2 text-sm font-semibold text-[#53636c]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#70a9cf] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16629b]" />
            </span>
            {waitingMessage}
          </div>

          <p className="mt-2 text-xs leading-5 text-[#89959c]">
            Your answers are already submitted. This screen stays open until the result API returns the completed analysis.
          </p>
        </div>
      </div>
    </div>
  );
}