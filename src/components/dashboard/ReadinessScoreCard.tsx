import {
  ArrowRight,
  Loader2,
  Target,
} from "lucide-react";

export type ReadinessScoreCardProps = {
  score: number | null;
  loading: boolean;
  unavailable?: boolean;
  onOpenAssessment: () => void;
};

function getReadinessMessage(
  score: number,
): string {
  if (score >= 85) {
    return "You're looking application-ready.";
  }

  if (score >= 70) {
    return "You're making strong progress.";
  }

  if (score >= 50) {
    return "Your foundation is growing.";
  }

  return "There are still useful areas to strengthen.";
}

export default function ReadinessScoreCard({
  score,
  loading,
  unavailable = false,
  onOpenAssessment,
}: ReadinessScoreCardProps) {
  const normalizedScore =
    score === null
      ? null
      : Math.min(
          100,
          Math.max(
            0,
            Math.round(score),
          ),
        );

  return (
    <section
      aria-label="Scholarship readiness score"
      className={[
        "relative h-full overflow-hidden rounded-[22px]",
        "border border-[#cfe0ec] bg-white",
        "p-5 shadow-[0_5px_0_#d7e5ee]",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#e7f5ff] blur-2xl"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#eaf5fb] text-[#16629b]">
            <Target
              size={17}
              aria-hidden="true"
            />
          </div>

          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#16629b]">
            Scholarship Readiness
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center gap-3 py-6">
            <Loader2
              size={24}
              className="animate-spin text-[#16629b]"
              aria-hidden="true"
            />

            <p className="text-sm font-semibold text-slate-500">
              Checking your latest assessment...
            </p>
          </div>
        ) : normalizedScore !== null ? (
          <>
            <div className="mt-4 flex items-end justify-between gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#2c1607]">
                {normalizedScore}%
              </span>

              <span className="text-xs font-semibold text-slate-400">
                / 100
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={normalizedScore}
              aria-label={`Scholarship readiness ${normalizedScore}%`}
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e8eef2]"
            >
              <div
                className="h-full rounded-full bg-[#16629b] transition-[width] duration-500"
                style={{
                  width: `${normalizedScore}%`,
                }}
              />
            </div>

            <p className="mt-auto pt-4 text-sm leading-5 text-slate-500">
              {getReadinessMessage(
                normalizedScore,
              )}
            </p>
          </>
        ) : (
          <div className="flex flex-1 flex-col justify-center py-4">
            <p className="text-sm font-bold text-[#2c1607]">
              {unavailable
                ? "Your latest readiness result isn't available right now."
                : "Complete your assessment to reveal your readiness score."}
            </p>

            <button
              type="button"
              onClick={onOpenAssessment}
              className={[
                "mt-4 inline-flex w-fit items-center gap-2",
                "rounded-xl border border-[#bfd8e8] bg-[#f4faff]",
                "px-3 py-2 text-xs font-bold text-[#16629b]",
                "transition hover:border-[#8db8d5] hover:bg-[#eaf5fb]",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d3eafa]",
              ].join(" ")}
            >
              Open Assessment
              <ArrowRight
                size={14}
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}