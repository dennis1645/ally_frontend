import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  Footprints,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import type {
  DailyObjective,
  EssayAnalysisScore,
  EssayGear,
  EssayPassRequirements,
  EssayRecommendation,
} from "../../types/essayPass";

export type EssayPassSupportRailProps = {
  expeditionProgress:
    number;

  completedMilestones:
    number;

  totalMilestones:
    number;

  nextMilestone:
    string;

  daysRemaining:
    number;

  analysisScores:
    EssayAnalysisScore[];

  recommendations:
    EssayRecommendation[];

  isAnalyzing:
    boolean;

  analysisCompleted:
    boolean;

  dailyObjectives:
    DailyObjective[];

  requirements:
    EssayPassRequirements;

  deadlineTitle:
    string;

  deadlineText:
    string;

  gear:
    EssayGear[];

  onAnalyze:
    () => void;

  onOpenReport:
    () => void;

  onToggleObjective:
    (
      objectiveId:
        number,
    ) => void;

  onOpenDeadline:
    () => void;

  onOpenGear:
    (
      gearId:
        number,
    ) => void;

  onContinue:
    () => void;
};

function scoreToneClass(
  tone:
    EssayAnalysisScore["tone"],
): string {
  if (
    tone ===
    "green"
  ) {
    return "border-emerald-500";
  }

  if (
    tone ===
    "blue"
  ) {
    return "border-[#63a8e5]";
  }

  if (
    tone ===
    "gold"
  ) {
    return "border-[#8b623f]";
  }

  return "border-red-400";
}

export default function EssayPassSupportRail({
  expeditionProgress,
  completedMilestones,
  totalMilestones,
  nextMilestone,
  daysRemaining,
  analysisScores,
  recommendations,
  isAnalyzing,
  analysisCompleted,
  dailyObjectives,
  requirements,
  deadlineTitle,
  deadlineText,
  gear,
  onAnalyze,
  onOpenReport,
  onToggleObjective,
  onOpenDeadline,
  onOpenGear,
  onContinue,
}: EssayPassSupportRailProps) {
  const allRequirementsComplete =
    Object.values(
      requirements,
    ).every(
      Boolean,
    );

  const completeCount =
    Object.values(
      requirements,
    ).filter(
      Boolean,
    ).length;

  return (
    <aside className="space-y-6">
      {/* Expedition Status */}

      <section className="relative overflow-hidden rounded-2xl border border-[#c7cfd6] bg-white p-6 shadow-sm">
        <div
          aria-hidden="true"
          className="absolute right-4 top-3 text-slate-200"
        >
          <Flag
            size={54}
          />
        </div>

        <p className="relative text-xs font-extrabold uppercase tracking-[0.13em] text-[#8b623f]">
          Expedition Status
        </p>

        <div className="relative mt-4 flex items-end justify-between gap-4">
          <span className="text-5xl font-extrabold text-[#2c1607]">
            {expeditionProgress}%
          </span>

          <span className="pb-1 text-sm font-bold text-[#4d5560]">
            {completedMilestones} / {totalMilestones} Milestones
          </span>
        </div>

        <div className="relative mt-4 h-3 rounded-full bg-[#ffd8c2]">
          <div
            className="h-full rounded-full bg-[#63a8e5]"
            style={{
              width:
                `${expeditionProgress}%`,
            }}
          />

          <span
            aria-hidden="true"
            className="absolute top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#63a8e5] bg-white text-[#63a8e5]"
            style={{
              left:
                `clamp(14px, ${expeditionProgress}%, calc(100% - 14px))`,
            }}
          >
            <Footprints
              size={14}
            />
          </span>
        </div>

        <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#fff0e8] p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ffe0c8] text-[#8b623f]">
            <Clock3
              size={18}
            />
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
              Next Milestone
            </p>

            <p className="mt-0.5 text-sm font-extrabold text-[#2c1607]">
              {nextMilestone} ({daysRemaining} Days)
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#dce6ed] bg-[#f8fbfd] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-[#4d5560]">
              Essay Pass requirements
            </p>

            <span className="text-xs font-extrabold text-[#16629b]">
              {completeCount}/5
            </span>
          </div>

          {allRequirementsComplete && (
            <p className="mt-3 flex items-center gap-2 text-sm font-extrabold text-emerald-600">
              <CheckCircle2
                size={17}
              />

              Essay Pass Complete
            </p>
          )}

          <button
            type="button"
            disabled={
              !allRequirementsComplete
            }
            onClick={
              onContinue
            }
            className="mt-3 min-h-11 w-full rounded-xl bg-[#16629b] px-4 text-sm font-bold text-white shadow-[0_4px_0_#0b4d78] transition enabled:hover:bg-[#1d70aa] enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {allRequirementsComplete
              ? "Continue Expedition →"
              : "Complete requirements to continue"}
          </button>
        </div>
      </section>

      {/* AI Analysis */}

      <section className="overflow-hidden rounded-2xl border border-[#d8c7bc] bg-white shadow-sm">
        <header className="flex items-center gap-2 border-b border-[#efd0bd] bg-[#ffe0b8] px-5 py-4">
          <Sparkles
            size={18}
            className="text-[#8b623f]"
          />

          <h2 className="font-extrabold text-[#2c1607]">
            Ally AI Analysis
          </h2>
        </header>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-x-3 gap-y-6">
            {analysisScores.map(
              (
                score,
              ) => (
                <div
                  key={
                    score.id
                  }
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={[
                      "grid h-14 w-14 place-items-center rounded-full border-[4px] bg-white text-sm font-extrabold text-[#2c1607]",
                      scoreToneClass(
                        score.tone,
                      ),
                    ].join(
                      " ",
                    )}
                  >
                    {
                      score.value
                    }
                  </div>

                  <span className="mt-2 text-[9px] font-extrabold uppercase tracking-wide text-slate-600">
                    {
                      score.label
                    }
                  </span>
                </div>
              ),
            )}
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-600">
              Recommendations
            </p>

            <ul className="mt-3 space-y-2">
              {recommendations
                .slice(
                  0,
                  3,
                )
                .map(
                  (
                    recommendation,
                  ) => (
                    <li
                      key={
                        recommendation.id
                      }
                      className="flex items-start gap-2 text-xs leading-5 text-[#4d5560]"
                    >
                      {recommendation.tone ===
                      "success" ? (
                        <CheckCircle2
                          size={15}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />
                      ) : (
                        <AlertTriangle
                          size={15}
                          className="mt-0.5 shrink-0 text-red-400"
                        />
                      )}

                      <span>
                        {
                          recommendation.text
                        }
                      </span>
                    </li>
                  ),
                )}
            </ul>
          </div>

          <button
            type="button"
            disabled={
              isAnalyzing
            }
            onClick={
              onAnalyze
            }
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#16629b] px-4 text-sm font-bold text-white transition hover:bg-[#1d70aa] disabled:cursor-wait disabled:opacity-70"
          >
            {isAnalyzing && (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            )}

            {isAnalyzing
              ? "Analyzing your essay..."
              : analysisCompleted
                ? "Analyze Essay Again"
                : "Analyze Essay"}
          </button>

          <button
            type="button"
            onClick={
              onOpenReport
            }
            className="mt-3 min-h-11 w-full rounded-xl border border-[#efd0bd] bg-[#ffd7bd] px-4 text-sm font-bold text-[#3f2a1d] transition hover:bg-[#ffc9a6]"
          >
            Detailed PDF Report
          </button>
        </div>
      </section>

      {/* Daily Objectives */}

      <section className="rounded-2xl border border-[#c7cfd6] bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-[#2c1607]">
          <Flag
            size={18}
            className="text-[#16629b]"
          />

          Daily Objectives
        </h2>

        <div className="mt-4 space-y-3">
          {dailyObjectives.map(
            (
              objective,
            ) => (
              <label
                key={
                  objective.id
                }
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#fff0e8] p-3"
              >
                <input
                  type="checkbox"
                  checked={
                    objective.completed
                  }
                  onChange={() => {
                    onToggleObjective(
                      objective.id,
                    );
                  }}
                  className="h-5 w-5 rounded border-slate-300 text-[#63a8e5] focus:ring-[#63a8e5]"
                />

                <span
                  className={[
                    "text-sm",

                    objective.completed
                      ? "text-slate-400 line-through"
                      : "text-[#3f4147]",
                  ].join(
                    " ",
                  )}
                >
                  {
                    objective.title
                  }
                </span>
              </label>
            ),
          )}
        </div>
      </section>

      {/* Deadline */}

      <button
        type="button"
        onClick={
          onOpenDeadline
        }
        className="flex w-full items-start gap-3 rounded-2xl border border-red-200 bg-[#ffd9d5] p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-red-600"
        />

        <div>
          <h2 className="font-extrabold text-red-800">
            Deadline Approach!
          </h2>

          <p className="mt-1 text-xs leading-5 text-red-700">
            {deadlineTitle} {deadlineText}
          </p>
        </div>
      </button>

      {/* Gear */}

      <section className="rounded-2xl border border-[#c7cfd6] bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-[#2c1607]">
          Gear Unlocked
        </h2>

        <div className="mt-4 flex gap-4">
          {gear.map(
            (
              item,
            ) => {
              const itemClass =
                item.tone ===
                "gold"
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : item.tone ===
                      "blue"
                    ? "border-[#63a8e5] bg-[#eaf6ff] text-[#16629b]"
                    : "border-dashed border-slate-300 bg-[#fff0e8] text-slate-300";

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  aria-label={
                    item.name
                  }
                  onClick={() => {
                    onOpenGear(
                      item.id,
                    );
                  }}
                  className={[
                    "grid h-14 w-14 place-items-center rounded-full border-2 transition hover:scale-105",
                    itemClass,
                  ].join(
                    " ",
                  )}
                >
                  {item.unlocked ? (
                    <FileText
                      size={22}
                    />
                  ) : (
                    <LockKeyhole
                      size={21}
                    />
                  )}
                </button>
              );
            },
          )}
        </div>
      </section>
    </aside>
  );
}