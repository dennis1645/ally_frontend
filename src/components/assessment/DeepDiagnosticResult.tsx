import {
  AlertCircle,
  Compass,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import {
  PrimaryButton,
  SecondaryButton,
} from "../ui";

import type {
  DeepDiagnosticResult as DeepDiagnosticResultData,
} from "../../api/deepDiagnosticApi";

export type DeepDiagnosticResultProps = {
  result:
    DeepDiagnosticResultData | null;

  resultError:
    string | null;

  onRetry:
    () => void;

  onReturnToExpedition:
    () => void;

  onDashboard:
    () => void;
};

function resultLooksLikeAnalysisFailure(
  result:
    DeepDiagnosticResultData | null,
): boolean {
  const suggestion =
    result?.suggestion
      ?.trim()
      .toLowerCase() ??
    "";

  if (
    !suggestion
  ) {
    return false;
  }

  const failureSignals =
    [
      "gagal",
      "failed",
      "failure",
      "error",
      "tidak terhubung",
      "cannot connect",
      "could not connect",
    ];

  return failureSignals.some(
    (
      signal,
    ) =>
      suggestion.includes(
        signal,
      ),
  );
}

export default function DeepDiagnosticResult({
  result,
  resultError,
  onRetry,
  onReturnToExpedition,
  onDashboard,
}: DeepDiagnosticResultProps) {
  const analysisFailed =
    resultLooksLikeAnalysisFailure(
      result,
    );

  if (
    resultError ||
    analysisFailed
  ) {
    return (
      <div className="mx-auto grid w-full max-w-[820px] gap-7 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
        <div className="relative mx-auto h-44 w-44">
          <div
            aria-hidden="true"
            className="absolute bottom-2 left-1/2 h-6 w-28 -translate-x-1/2 rounded-[100%] bg-[#4f3a2d]/10 blur-md"
          />

          <img
            src={
              allyMascot
            }
            alt="Ally expedition guide"
            className="relative h-full w-full object-contain object-bottom"
          />
        </div>

        <div
          className={[
            "rounded-[26px] border-2 border-[#e5c991]",
            "bg-[#fff9eb] p-6",
            "shadow-[0_7px_0_rgba(122,88,47,0.16)]",
            "sm:p-7",
          ].join(
            " ",
          )}
        >
          <div className="flex items-center gap-2 text-[#a36d1d]">
            <AlertCircle
              size={20}
              aria-hidden="true"
            />

            <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
              Analysis compass paused
            </p>
          </div>

          <h2 className="mt-3 text-2xl font-extrabold text-[#2c1607]">
            Your answers are safely recorded, Explorer. 🧭
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#63564e] sm:text-base">
            It looks like my analysis compass needs another moment. Your
            assessment submission completed, but I can&apos;t confidently show
            an analysis result yet.
          </p>

          {result?.suggestion && (
            <p className="mt-3 rounded-xl border border-[#ead8b7] bg-white/70 px-4 py-3 text-sm leading-6 text-[#6c5a4a]">
              {
                result.suggestion
              }
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton
              leftIcon={
                <RotateCcw size={17} />
              }
              onClick={
                onRetry
              }
            >
              Try Results Again
            </PrimaryButton>

            <SecondaryButton
              onClick={
                onReturnToExpedition
              }
            >
              Back to Expedition
            </SecondaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[880px] text-center">
      <div className="relative mx-auto h-48 w-48">
        <Star
          aria-hidden="true"
          className="absolute -right-2 top-3 text-[#e8ad44]"
          size={30}
          fill="currentColor"
        />

        <Sparkles
          aria-hidden="true"
          className="absolute left-0 top-8 text-[#16629b]"
          size={25}
        />

        <div
          aria-hidden="true"
          className="absolute bottom-2 left-1/2 h-7 w-32 -translate-x-1/2 rounded-[100%] bg-[#4f3a2d]/10 blur-md"
        />

        <img
          src={
            allyMascot
          }
          alt="Ally celebrating the completed expedition assessment"
          className="relative h-full w-full object-contain object-bottom"
        />
      </div>

      <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#7a582f]">
        Assessment complete
      </p>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2c1607] sm:text-4xl">
        You made it, Explorer! 🎉
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#667085]">
        We&apos;ve learned more about your scholarship journey. Your next
        expedition step is getting closer.
      </p>

      <section
        className={[
          "mx-auto mt-7 max-w-2xl rounded-[24px]",
          "border border-[#c7dce9] bg-white/90 p-6 text-left",
          "shadow-[0_6px_0_rgba(22,98,155,0.10)]",
        ].join(
          " ",
        )}
      >
        <div className="flex items-center gap-2 text-[#16629b]">
          <Compass
            size={18}
            aria-hidden="true"
          />

          <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
            Ally&apos;s assessment insight
          </p>
        </div>

        {result?.revisedPercentage !==
          null &&
          result?.revisedPercentage !==
            undefined && (
          <p className="mt-4 text-3xl font-extrabold text-[#2c1607]">
            {
              result.revisedPercentage
            }
            %
          </p>
        )}

        <p className="mt-3 text-sm leading-7 text-[#5e625f] sm:text-base">
          {result?.suggestion ??
            "Your Deep Diagnostic was completed successfully. Continue your expedition to see the next step Ally unlocks for you."}
        </p>
      </section>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <PrimaryButton
          onClick={
            onReturnToExpedition
          }
        >
          Continue Expedition
        </PrimaryButton>

        <SecondaryButton
          onClick={
            onDashboard
          }
        >
          Go to Dashboard
        </SecondaryButton>
      </div>
    </div>
  );
}