import {
  ArrowRight,
  Check,
  FileText,
  Footprints,
} from "lucide-react";

import type {
  QuestChecklistItem,
} from "../../types/questTracker";

type CurrentMilestoneCardProps = {
  title:
    string;

  description:
    string;

  estimatedCompletion:
    string;

  progress:
    number;

  checklist:
    QuestChecklistItem[];

  onToggleChecklistItem: (
    itemId:
      number,
  ) => void;

  onContinue?:
    () => void;
};

function ChecklistItem({
  item,
  onToggle,
}: {
  item:
    QuestChecklistItem;

  onToggle: (
    itemId:
      number,
  ) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={
        item.completed
      }
      onClick={() =>
        onToggle(
          item.id,
        )
      }
      className={[
        "flex w-full items-center justify-between gap-4 rounded-xl bg-white px-4 py-4 text-left transition",

        item.completed
          ? "border border-[#cbd3da]"
          : "border-2 border-[#1670b4] shadow-sm",

        "hover:border-[#6ba8e6] hover:bg-[#fbfdff]",
      ].join(
        " ",
      )}
    >
      <span className="flex min-w-0 items-center gap-4">
        <span
          className={[
            "grid h-6 w-6 shrink-0 place-items-center rounded-md border-2",

            item.completed
              ? "border-[#16629b] bg-[#16629b] text-white"
              : "border-[#16629b] bg-white text-transparent",
          ].join(
            " ",
          )}
        >
          <Check
            size={15}
            strokeWidth={3}
            aria-hidden="true"
          />
        </span>

        <span
          className={[
            "truncate text-sm sm:text-base",

            item.completed
              ? "text-[#99918c] line-through"
              : "font-bold text-[#2c1607]",
          ].join(
            " ",
          )}
        >
          {item.title}
        </span>
      </span>

      <span
        className={[
          "shrink-0 text-xs sm:text-sm",

          item.completed
            ? "text-[#8c9299]"
            : "font-bold text-[#16629b]",
        ].join(
          " ",
        )}
      >
        {item.completed
          ? item.dueDate
          : item.statusLabel ??
            item.dueDate}
      </span>
    </button>
  );
}

export default function CurrentMilestoneCard({
  title,
  description,
  estimatedCompletion,
  progress,
  checklist,
  onToggleChecklistItem,
  onContinue,
}: CurrentMilestoneCardProps) {
  const normalizedProgress =
    Math.min(
      100,
      Math.max(
        0,
        progress,
      ),
    );

  return (
    <section
      aria-labelledby="active-milestone-title"
      className="relative overflow-hidden rounded-[26px] border border-[#bfcbd5] bg-[#fff0e8] p-6 shadow-sm sm:p-8"
    >
      <FileText
        size={88}
        aria-hidden="true"
        className="pointer-events-none absolute right-7 top-7 text-[#decfc7]/70"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex rounded-md bg-[#d9ebfb] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#16629b]">
            Active Milestone
          </span>

          <h2
            id="active-milestone-title"
            className="mt-3 text-2xl font-extrabold text-[#2c1607]"
          >
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#667085] sm:text-base">
            {description}
          </p>
        </div>

        <div className="relative z-10 text-left sm:text-right">
          <p className="text-4xl font-extrabold tracking-tight text-[#16629b]">
            {normalizedProgress}%
          </p>

          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#7b8188]">
            Est. Completion: {estimatedCompletion}
          </p>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="h-4 overflow-hidden rounded-full bg-[#ffd8c2]">
          <div
            className="h-full rounded-full bg-[#16629b] transition-[width] duration-300"
            style={{
              width:
                `${normalizedProgress}%`,
            }}
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#16629b] bg-white text-[#16629b] shadow-sm transition-[left] duration-300"
          style={{
            left:
              `clamp(14px, ${normalizedProgress}%, calc(100% - 14px))`,
          }}
        >
          <Footprints
            size={14}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {onContinue && (
        <button
          type="button"
          onClick={
            onContinue
          }
          className="relative mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 font-bold text-white shadow-[0_4px_0_#0b4d78] transition hover:bg-[#1b70aa] active:translate-y-0.5 active:shadow-none"
        >
          Continue Document Valley

          <ArrowRight
            size={18}
          />
        </button>
      )}

      <div className="mt-9">
        <h3 className="text-sm font-extrabold uppercase tracking-[0.09em] text-[#16629b]">
          Interactive Checklist
        </h3>

        <div className="mt-4 space-y-3">
          {checklist.map(
            (
              item,
            ) => (
              <ChecklistItem
                key={
                  item.id
                }
                item={
                  item
                }
                onToggle={
                  onToggleChecklistItem
                }
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}