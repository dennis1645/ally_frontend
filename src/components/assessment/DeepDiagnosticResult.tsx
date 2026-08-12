import {
  AlertCircle,
  CheckCircle2,
  Compass,
  Loader2,
  MapPinned,
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
  DeepDiagnosticScholarshipRecommendation,
} from "../../api/deepDiagnosticApi";

export type DeepDiagnosticResultProps = {
  result:
    DeepDiagnosticResultData | null;

  resultError:
    string | null;

  recommendationError:
    string | null;

  choosingScholarshipId:
    number | null;

  onRetry:
    () => void;

  onChooseRecommendation:
    (
      recommendation:
        DeepDiagnosticScholarshipRecommendation,
    ) => void;

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

function formatFundingType(
  value:
    string | null,
): string | null {
  if (!value) {
    return null;
  }

  return value
    .replace(
      /[_-]+/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function RecommendationCard({
  recommendation,
  busy,
  disabled,
  onChoose,
}: {
  recommendation:
    DeepDiagnosticScholarshipRecommendation;

  busy:
    boolean;

  disabled:
    boolean;

  onChoose:
    () => void;
}) {
  const fundingType =
    formatFundingType(
      recommendation.fundingType,
    );

  return (
    <article
      className={[
        "rounded-[20px]",
        "border border-[#d6e3ec]",
        "bg-white",
        "p-4 text-left",
        "shadow-sm",
        "sm:p-5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#16629b]">
            <MapPinned
              size={16}
              aria-hidden="true"
            />

            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em]">
              Recommended destination
            </p>
          </div>

          <h3 className="mt-2 text-lg font-extrabold text-[#2c1607]">
            {recommendation.name}
          </h3>
        </div>

        {recommendation.matchPercentage !==
          null && (
          <span className="shrink-0 rounded-full bg-[#e8f3fc] px-2.5 py-1 text-xs font-extrabold text-[#16629b]">
            {Math.round(
              recommendation.matchPercentage,
            )}
            % match
          </span>
        )}
      </div>

      {(fundingType ||
        recommendation.providerCountry) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {fundingType && (
            <span className="rounded-full bg-[#fff5e8] px-2.5 py-1 text-xs font-semibold text-[#8a5f32]">
              {fundingType}
            </span>
          )}

          {recommendation.providerCountry && (
            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {recommendation.providerCountry}
            </span>
          )}
        </div>
      )}

      {recommendation.reason && (
        <p className="mt-3 text-sm leading-6 text-[#667085]">
          {recommendation.reason}
        </p>
      )}

      <PrimaryButton
        className="mt-4 w-full sm:w-auto"
        disabled={
          disabled
        }
        leftIcon={
          busy ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <CheckCircle2
              size={16}
            />
          )
        }
        onClick={
          onChoose
        }
      >
        {busy
          ? "Choosing Scholarship..."
          : "Choose Scholarship"}
      </PrimaryButton>
    </article>
  );
}

export default function DeepDiagnosticResult({
  result,
  resultError,
  recommendationError,
  choosingScholarshipId,
  onRetry,
  onChooseRecommendation,
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
          ].join(" ")}
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
              {result.suggestion}
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

  const recommendations =
    result?.recommendations ??
    [];

  return (
    <div className="mx-auto w-full max-w-[920px] text-center">
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
        We&apos;ve learned more about your scholarship journey. Now choose the
        scholarship destination you want Ally to build your roadmap around.
      </p>

      <section
        className={[
          "mx-auto mt-7 max-w-2xl rounded-[24px]",
          "border border-[#c7dce9] bg-white/90 p-6 text-left",
          "shadow-[0_6px_0_rgba(22,98,155,0.10)]",
        ].join(" ")}
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
            {result.revisedPercentage}%
          </p>
        )}

        <p className="mt-3 text-sm leading-7 text-[#5e625f] sm:text-base">
          {result?.suggestion ??
            "Your Deep Diagnostic was completed successfully. Continue your expedition to see the next step Ally unlocks for you."}
        </p>
      </section>

      {recommendations.length >
        0 && (
        <section className="mx-auto mt-7 max-w-3xl text-left">
          <div className="mb-4 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#7a582f]">
              Scholarship matcher
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#2c1607]">
              Choose your destination
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#667085]">
              Your selection uses the scholarship&apos;s backend ID directly.
              You never need to enter an ID yourself.
            </p>
          </div>

          {recommendationError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-[#efc7b2] bg-[#fff2eb] p-3 text-sm leading-6 text-[#9b4c2f]"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span>
                {recommendationError}
              </span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map(
              (
                recommendation,
              ) => (
                <RecommendationCard
                  key={
                    recommendation.scholarshipId
                  }
                  recommendation={
                    recommendation
                  }
                  busy={
                    choosingScholarshipId ===
                    recommendation.scholarshipId
                  }
                  disabled={
                    choosingScholarshipId !==
                    null
                  }
                  onChoose={() =>
                    onChooseRecommendation(
                      recommendation,
                    )
                  }
                />
              ),
            )}
          </div>
        </section>
      )}

      {recommendations.length ===
        0 && (
        <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-dashed border-[#c8d6df] bg-white/70 px-5 py-4 text-sm leading-6 text-[#667085]">
          Ally completed your assessment, but this result did not include a
          scholarship recommendation ID yet. You can return to the expedition
          or scholarship catalogue and choose a scholarship there.
        </div>
      )}

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <SecondaryButton
          onClick={
            onReturnToExpedition
          }
        >
          Continue Expedition
        </SecondaryButton>

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