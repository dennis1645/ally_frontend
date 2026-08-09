import {
  CheckCircle2,
  Download,
  PlayCircle,
  RotateCcw,
  X,
} from "lucide-react";

import type {
  EssayAnalysisScore,
  EssayGear,
  EssayRecommendation,
  EssayTemplate,
  EssayVersion,
  LanguageSkillProgress,
} from "../../types/essayPass";

type ModalShellProps = {
  title:
    string;

  children:
    React.ReactNode;

  onClose:
    () => void;
};

function ModalShell({
  title,
  children,
  onClose,
}: ModalShellProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        title
      }
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/45 p-4"
      onMouseDown={
        onClose
      }
    >
      <div
        className="my-8 w-full max-w-2xl rounded-3xl border border-[#ead3bd] bg-white p-6 shadow-2xl sm:p-7"
        onMouseDown={(
          event,
        ) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-[#2c1607]">
            {title}
          </h2>

          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={
              onClose
            }
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export type VersionHistoryModalProps = {
  versions:
    EssayVersion[];

  onClose:
    () => void;

  onRestore:
    (
      version:
        EssayVersion,
    ) => void;

  onView:
    (
      version:
        EssayVersion,
    ) => void;
};

export function VersionHistoryModal({
  versions,
  onClose,
  onRestore,
  onView,
}: VersionHistoryModalProps) {
  return (
    <ModalShell
      title="Version History"
      onClose={
        onClose
      }
    >
      <div className="space-y-3">
        {versions.map(
          (
            version,
          ) => (
            <article
              key={
                version.id
              }
              className="rounded-2xl border border-[#ead3bd] bg-[#fffaf7] p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-extrabold text-[#2c1607]">
                    {
                      version.label
                    }
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      version.dateLabel
                    }{" "}
                    ·{" "}
                    {
                      version.characterCount.toLocaleString()
                    }{" "}
                    characters
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onView(
                        version,
                      );
                    }}
                    className="min-h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-[#3f4147]"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRestore(
                        version,
                      );
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#16629b] px-4 text-sm font-bold text-white"
                  >
                    <RotateCcw
                      size={15}
                    />

                    Restore
                  </button>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </ModalShell>
  );
}

export function VersionPreviewModal({
  version,
  onClose,
}: {
  version:
    EssayVersion;

  onClose:
    () => void;
}) {
  return (
    <ModalShell
      title={
        version.label
      }
      onClose={
        onClose
      }
    >
      <p className="text-sm font-semibold text-slate-500">
        {
          version.dateLabel
        }
      </p>

      <div className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#fff8f5] p-5 text-sm leading-7 text-[#3f4147]">
        {
          version.content
        }
      </div>
    </ModalShell>
  );
}

export function TemplatePreviewModal({
  template,
  onClose,
  onUse,
}: {
  template:
    EssayTemplate;

  onClose:
    () => void;

  onUse:
    () => void;
}) {
  return (
    <ModalShell
      title={`${template.title} Template`}
      onClose={
        onClose
      }
    >
      <p className="text-sm text-slate-500">
        {
          template.description
        }
      </p>

      <ol className="mt-5 space-y-3">
        {template.sections.map(
          (
            section,
            index,
          ) => (
            <li
              key={
                section
              }
              className="flex items-center gap-3 rounded-xl bg-[#fff1ea] p-3 text-sm font-semibold text-[#3f4147]"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#dceeff] text-xs font-extrabold text-[#16629b]">
                {index + 1}
              </span>

              {section}
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        onClick={
          onUse
        }
        className="mt-6 min-h-11 w-full rounded-xl bg-[#16629b] px-5 font-bold text-white"
      >
        Use Template
      </button>
    </ModalShell>
  );
}

export function AIReportModal({
  scores,
  recommendations,
  onClose,
  onDownload,
}: {
  scores:
    EssayAnalysisScore[];

  recommendations:
    EssayRecommendation[];

  onClose:
    () => void;

  onDownload:
    () => void;
}) {
  return (
    <ModalShell
      title="Essay Analysis Report"
      onClose={
        onClose
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {scores.map(
          (
            score,
          ) => (
            <div
              key={
                score.id
              }
              className="rounded-2xl border border-[#ead3bd] bg-[#fffaf7] p-4 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {
                  score.label
                }
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#16629b]">
                {
                  score.value
                }
              </p>
            </div>
          ),
        )}
      </div>

      <h3 className="mt-7 font-extrabold text-[#2c1607]">
        Recommendations
      </h3>

      <ul className="mt-3 space-y-3">
        {recommendations.map(
          (
            recommendation,
          ) => (
            <li
              key={
                recommendation.id
              }
              className="flex items-start gap-2 text-sm leading-6 text-[#4d5560]"
            >
              <CheckCircle2
                size={17}
                className="mt-1 shrink-0 text-[#63a8e5]"
              />

              {
                recommendation.text
              }
            </li>
          ),
        )}
      </ul>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={
            onClose
          }
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 font-bold text-[#3f4147]"
        >
          Close
        </button>

        <button
          type="button"
          onClick={
            onDownload
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 font-bold text-white"
        >
          <Download
            size={17}
          />

          Download Report
        </button>
      </div>
    </ModalShell>
  );
}

export function LanguageProgressModal({
  skills,
  onClose,
  onReadingPractice,
}: {
  skills:
    LanguageSkillProgress[];

  onClose:
    () => void;

  onReadingPractice:
    () => void;
}) {
  return (
    <ModalShell
      title="Language Gear Check"
      onClose={
        onClose
      }
    >
      <div className="space-y-4">
        {skills.map(
          (
            skill,
          ) => (
            <div
              key={
                skill.id
              }
              className="rounded-2xl border border-[#ead3bd] bg-[#fffaf7] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-extrabold text-[#2c1607]">
                  {
                    skill.label
                  }
                </h3>

                <span className="text-sm font-bold text-[#16629b]">
                  Band {
                    skill.band
                  }
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#63a8e5]"
                  style={{
                    width:
                      `${skill.progress}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {
                  skill.progress
                }% training progress
              </p>
            </div>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={
          onReadingPractice
        }
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 font-bold text-white"
      >
        <PlayCircle
          size={18}
        />

        Open Reading Practice
      </button>
    </ModalShell>
  );
}

export function ReadingPracticeModal({
  onClose,
  completed,
  onComplete,
}: {
  onClose:
    () => void;

  completed:
    boolean;

  onComplete:
    () => void;
}) {
  return (
    <ModalShell
      title="Reading Practice"
      onClose={
        onClose
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#eaf6ff] p-4 text-center">
          <p className="text-xs font-bold text-slate-500">
            Current Band
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#16629b]">
            7.5
          </p>
        </div>

        <div className="rounded-2xl bg-[#fff1ea] p-4 text-center">
          <p className="text-xs font-bold text-slate-500">
            Progress
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#8b623f]">
            72%
          </p>
        </div>

        <div className="rounded-2xl bg-[#f3f5f7] p-4 text-center">
          <p className="text-xs font-bold text-slate-500">
            Questions
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#3f4147]">
            18 / 25
          </p>
        </div>
      </div>

      <p className="mt-6 leading-7 text-slate-600">
        Practice reading comprehension, evidence identification, and inference questions using a frontend-only mock session.
      </p>

      <button
        type="button"
        onClick={
          onComplete
        }
        className="mt-6 min-h-11 w-full rounded-xl bg-[#16629b] px-5 font-bold text-white"
      >
        {completed
          ? "Practice Completed ✓"
          : "Continue Practice"}
      </button>
    </ModalShell>
  );
}

export function DeadlineModal({
  scholarship,
  date,
  remaining,
  onClose,
  onAction,
}: {
  scholarship:
    string;

  date:
    string;

  remaining:
    string;

  onClose:
    () => void;

  onAction:
    (
      message:
        string,
    ) => void;
}) {
  return (
    <ModalShell
      title={
        scholarship
      }
      onClose={
        onClose
      }
    >
      <div className="rounded-2xl bg-red-50 p-5">
        <p className="text-sm font-bold text-red-800">
          Application Deadline
        </p>

        <p className="mt-1 text-xl font-extrabold text-red-900">
          {date}
        </p>

        <p className="mt-4 text-sm text-red-700">
          Remaining:{" "}
          <strong>
            {remaining}
          </strong>
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            onAction(
              "Requirements opened in frontend prototype.",
            );
          }}
          className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 font-bold text-[#3f4147]"
        >
          View Requirements
        </button>

        <button
          type="button"
          onClick={() => {
            onAction(
              "Application continuation simulated.",
            );
          }}
          className="min-h-11 flex-1 rounded-xl bg-[#16629b] px-4 font-bold text-white"
        >
          Continue Application
        </button>
      </div>
    </ModalShell>
  );
}

export function GearDetailsModal({
  gear,
  onClose,
}: {
  gear:
    EssayGear;

  onClose:
    () => void;
}) {
  return (
    <ModalShell
      title={
        gear.name
      }
      onClose={
        onClose
      }
    >
      <div className="rounded-2xl bg-[#fff8f5] p-5">
        <p className="leading-7 text-slate-600">
          {
            gear.description
          }
        </p>

        <p
          className={[
            "mt-4 font-extrabold",

            gear.unlocked
              ? "text-emerald-600"
              : "text-slate-400",
          ].join(
            " ",
          )}
        >
          {gear.unlocked
            ? "Unlocked"
            : "Locked"}
        </p>
      </div>
    </ModalShell>
  );
}