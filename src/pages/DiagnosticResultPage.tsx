import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Info,
  Mountain,
  RefreshCcw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router";

import allyMascot from "../assets/ally-assessment-mascot.png";

import {
  AssessmentHeader,
} from "../components/assessment";

import {
  useDiagnosticResult,
} from "../hooks/useDiagnosticResult";

/* =========================================================
   Result helpers
========================================================= */

function clampScore(
  value: number,
): number {
  return Math.min(
    Math.max(
      value,
      0,
    ),
    100,
  );
}

function getExpeditionLevel(
  score: number,
): string {
  if (
    score < 40
  ) {
    return "Basic Explorer";
  }

  if (
    score < 70
  ) {
    return "Trail Explorer";
  }

  if (
    score < 90
  ) {
    return "Advanced Explorer";
  }

  return "Summit Explorer";
}

function getHeadline(
  score: number,
): string {
  if (
    score < 40
  ) {
    return "A great start, keep it up!";
  }

  if (
    score < 70
  ) {
    return "You're making steady progress!";
  }

  if (
    score < 90
  ) {
    return "You're getting close to the summit!";
  }

  return "You're ready for the summit!";
}

function getMascotMessage(
  score: number,
): string {
  if (
    score < 40
  ) {
    return "Hi, Hiker! We just started the climb. The path ahead might be steep, but with the right preparation, we can definitely reach the peak!";
  }

  if (
    score < 70
  ) {
    return "You're already moving up the trail! Let's strengthen the areas that will help you climb with more confidence.";
  }

  if (
    score < 90
  ) {
    return "Great progress, Hiker! The summit is getting closer. Let's refine your strategy and finish the climb strongly.";
  }

  return "Excellent work, Hiker! You've built a strong foundation. Now let's turn your readiness into a successful expedition.";
}

function isUnassessedLevel(
  readinessLevel:
    string,
): boolean {
  return (
    readinessLevel
      .trim()
      .toLowerCase() ===
    "unassessed"
  );
}

/* =========================================================
   Loading state
========================================================= */

function LoadingResult() {
  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <AssessmentHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 lg:px-10">
        <div className="grid animate-pulse gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="h-9 w-48 rounded-full bg-[#ffe3d2]" />

            <div className="h-14 w-4/5 rounded-xl bg-[#eadfd9]" />

            <div className="h-6 w-full rounded-lg bg-[#eee5e0]" />

            <div className="h-6 w-3/4 rounded-lg bg-[#eee5e0]" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-32 rounded-xl bg-white" />

              <div className="h-32 rounded-xl bg-white" />
            </div>
          </div>

          <div className="min-h-[420px] rounded-3xl bg-[#fff1ea]" />
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   Error state
========================================================= */

type ResultErrorProps = {
  title:
    string;

  message:
    string;

  showRetry?:
    boolean;

  onRetry?:
    () => void;
};

function ResultError({
  title,
  message,
  showRetry = false,
  onRetry,
}: ResultErrorProps) {
  const navigate =
    useNavigate();

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <AssessmentHeader />

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-2xl place-items-center px-4 py-16">
        <section className="w-full rounded-3xl border border-[#e8ddd7] bg-white p-8 text-center shadow-[0_5px_0_#d1c0aa] sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600">
            <AlertCircle
              size={32}
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#2c1607]">
            {title}
          </h1>

          <p className="mt-4 leading-7 text-[#5f626a]">
            {message}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {showRetry &&
              onRetry && (
                <button
                  type="button"
                  onClick={
                    onRetry
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#16629b] bg-white px-6 py-3 font-semibold text-[#16629b] shadow-[0_4px_0_#d1c0aa]"
                >
                  <RefreshCcw
                    size={18}
                  />

                  Try Again
                </button>
              )}

            <button
              type="button"
              onClick={() => {
                navigate(
                  "/choose-adventure",
                );
              }}
              className="rounded-xl border-2 border-[#00497a] bg-[#16629b] px-6 py-3 font-semibold text-white shadow-[0_4px_0_#00497a]"
            >
              Return to Adventure
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   Result page
========================================================= */

export default function DiagnosticResultPage() {
  const navigate =
    useNavigate();

  const {
    result,
    isLoading,
    isMissingToken,
    error,
    retry,
  } =
    useDiagnosticResult();

  /* =======================================================
     Page states
  ======================================================= */

  if (
    isLoading
  ) {
    return (
      <LoadingResult />
    );
  }

  if (
    isMissingToken
  ) {
    return (
      <ResultError
        title="No anonymous result found"
        message="Your assessment guest token is missing. Return to the adventure page and begin a new assessment."
      />
    );
  }

  if (
    error
  ) {
    return (
      <ResultError
        title="Unable to load your result"
        message={
          error.message
        }
        showRetry
        onRetry={
          retry
        }
      />
    );
  }

  if (
    !result
  ) {
    return (
      <ResultError
        title="Result not found"
        message="The server did not return an assessment result for this guest token."
        showRetry
        onRetry={
          retry
        }
      />
    );
  }

  /* =======================================================
     Normalize display values
  ======================================================= */

  const score =
    clampScore(
      result.overall_score,
    );

  const roundedScore =
    Math.round(
      score,
    );

  /*
   * The backend readiness_level is authoritative.
   *
   * New backend:
   * readiness_level
   *
   * Frontend normalized model:
   * result.readiness_level
   *
   * The score-based level is retained only as a fallback for
   * older records that do not contain readiness_level.
   */
  const backendReadinessLevel =
    typeof result.readiness_level ===
      "string"
      ? result.readiness_level.trim()
      : "";

  const expeditionLevel =
    backendReadinessLevel ||
    getExpeditionLevel(
      score,
    );

  /*
   * "Unassessed" is a valid backend result state.
   *
   * For example, when the assessment was saved successfully
   * but the AI analysis service could not be reached, the
   * backend may return:
   *
   * readiness_percentage: 0
   * readiness_level: "Unassessed"
   * reason: "Gagal terhubung ..."
   *
   * In that case, 0 is not treated as a genuine readiness
   * score in the UI.
   */
  const isUnassessed =
    isUnassessedLevel(
      expeditionLevel,
    );

  const headline =
    isUnassessed
      ? "Your assessment was submitted"
      : getHeadline(
          score,
        );

  const mascotMessage =
    isUnassessed
      ? "Your answers have been saved successfully. Your readiness analysis is not available yet, so your assessment has been marked as Unassessed."
      : getMascotMessage(
          score,
        );

  const recommendation =
    typeof result.system_recommendation ===
      "string" &&
    result.system_recommendation.trim()
      .length > 0
      ? result.system_recommendation.trim()
      : isUnassessed
        ? "We could not complete your readiness analysis right now. Please try again later."
        : "Your assessment has been completed successfully.";

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="flex min-h-screen flex-col bg-[#fff8f5] text-[#2c1607]">
      <AssessmentHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-10 sm:px-8 lg:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          {/* =================================================
              Left result content
          ================================================== */}

          <section className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ffe3d2] px-4 py-2 text-[#7a582f]">
              <BadgeCheck
                size={18}
              />

              <span className="text-sm font-semibold">
                Assessment Complete
              </span>
            </div>

            <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {headline}
            </h1>

            {isUnassessed ? (
              <div className="mt-5 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-[#5f401a]">
                <div className="flex items-start gap-3">
                  <Info
                    size={21}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">
                      Analysis temporarily unavailable
                    </p>

                    <p className="mt-2 text-sm leading-7 sm:text-base">
                      {recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#414750] sm:text-lg">
                {recommendation}
              </p>
            )}

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {/* =============================================
                  Overall score
              ============================================== */}

              <article className="rounded-xl border border-[#ffdcc6] bg-white p-6 shadow-[0_5px_0_#d1c0aa]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#414750]">
                  Current Score
                </p>

                {isUnassessed ? (
                  <div className="mt-3">
                    <p className="text-2xl font-extrabold text-[#16629b]">
                      Not available
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#717781]">
                      Your assessment was saved, but the analysis has not been completed.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-[#16629b]">
                      {roundedScore}%
                    </span>

                    <span className="text-lg text-[#717781]">
                      / 100%
                    </span>
                  </div>
                )}
              </article>

              {/* =============================================
                  Backend readiness level
              ============================================== */}

              <article className="group relative rounded-xl border border-[#ffdcc6] bg-white p-6 shadow-[0_5px_0_#d1c0aa]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#414750]">
                  Expedition Level
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <Mountain
                    size={28}
                    fill="currentColor"
                    className="text-[#7a582f]"
                  />

                  <span className="text-xl font-semibold sm:text-2xl">
                    {expeditionLevel}
                  </span>
                </div>

                <Info
                  size={20}
                  className="absolute bottom-4 right-4 text-[#717781]"
                />

                <div className="pointer-events-none absolute right-0 top-full z-20 mt-4 w-72 rounded-xl border border-[#c1c7d1] bg-white p-4 text-sm italic leading-6 text-[#414750] opacity-0 shadow-lg transition group-hover:opacity-100">
                  {backendReadinessLevel
                    ? "Your expedition level is provided by your diagnostic assessment result."
                    : "Your expedition level is estimated from your overall diagnostic score because no readiness level was returned."}
                </div>
              </article>
            </div>
          </section>

          {/* =================================================
              Mascot panel
          ================================================== */}

          <aside className="relative flex min-h-[430px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#fff1ea] p-8">
            <div className="relative z-10 max-w-xs rounded-xl bg-[#ffe3d2] p-6 text-[#5f401a] shadow-sm">
              <p className="leading-7">
                {mascotMessage}
              </p>

              <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-[#ffe3d2]" />
            </div>

            <img
              src={
                allyMascot
              }
              alt="Ally explorer mascot"
              className="relative z-10 mt-8 w-64 object-contain"
            />

            <div className="absolute bottom-12 h-8 w-48 rounded-[100%] bg-[#5f401a]/10 blur-md" />
          </aside>
        </div>
      </main>

      {/* =====================================================
          Footer actions
      ====================================================== */}

      <footer className="border-t border-[#ffdcc6] px-4 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              navigate(
                "/choose-adventure",
              );
            }}
            className="min-h-14 rounded-xl border-2 border-[#16629b] bg-white px-8 font-semibold text-[#16629b] shadow-[0_4px_0_#d1c0aa]"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => {
              /*
               * Keep the diagnostic guest token while the
               * visitor creates an account so the backend can
               * link this anonymous result to the new user.
               */
              navigate(
                "/auth?mode=register",
              );
            }}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-[#00497a] bg-[#16629b] px-8 font-semibold text-white shadow-[0_4px_0_#00497a]"
          >
            Start my Expedition with Ally

            <ArrowRight
              size={20}
            />
          </button>
        </div>
      </footer>
    </div>
  );
}