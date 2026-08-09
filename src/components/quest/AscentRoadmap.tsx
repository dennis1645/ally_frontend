import {
  Check,
  FileText,
  Flag,
  LockKeyhole,
} from "lucide-react";

import type {
  QuestMilestone,
} from "../../types/questTracker";

type AscentRoadmapProps = {
  milestones:
    QuestMilestone[];

  onMilestoneSelect?:
    (
      milestone:
        QuestMilestone,
    ) => void;
};

const milestoneOffsets = [
  "translate-y-10",
  "translate-y-6",
  "-translate-y-2",
  "translate-y-1",
  "-translate-y-8",
  "-translate-y-14",
] as const;

function MilestoneNode({
  milestone,
  index,
  onSelect,
}: {
  milestone: QuestMilestone;
  index: number;
  onSelect?:
    (
      milestone:
        QuestMilestone,
    ) => void;
}) {
  const isCompleted =
    milestone.status ===
    "completed";

  const isCurrent =
    milestone.status ===
    "current";

  return (
    <button
      type="button"
      onClick={() => {
        onSelect?.(
          milestone,
        );
      }}
      disabled={
        !onSelect
      }
      className={[
        "relative z-10 flex min-w-[118px] flex-col items-center gap-3 text-center",
        onSelect
          ? "cursor-pointer"
          : "cursor-default",
        milestoneOffsets[
          index
        ] ?? "",
      ].join(" ")}
    >
      {isCurrent && (
        <Flag
          size={27}
          fill="currentColor"
          aria-hidden="true"
          className="absolute -top-10 text-red-600 drop-shadow-sm"
        />
      )}

      <div
        className={[
          "relative grid place-items-center border-[4px] border-white shadow-md transition",
          isCurrent
            ? "h-[72px] w-[72px] rounded-2xl bg-[#6ba8e6] text-[#0a4f82] ring-4 ring-[#d6eaff]"
            : "h-12 w-12 rounded-full",
          isCompleted
            ? "bg-[#16629b] text-white"
            : "",
          milestone.status ===
          "locked"
            ? "bg-[#e7edf1] text-[#a4afb8]"
            : "",
        ].join(" ")}
      >
        {isCompleted ? (
          <Check
            size={23}
            strokeWidth={3}
            aria-hidden="true"
          />
        ) : isCurrent ? (
          <FileText
            size={29}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        ) : (
          <LockKeyhole
            size={20}
            aria-hidden="true"
          />
        )}
      </div>

      <span
        className={[
          "max-w-[132px] text-sm leading-5",
          isCurrent
            ? "font-extrabold text-[#16629b]"
            : "font-semibold",
          isCompleted
            ? "text-[#382a21]"
            : "",
          milestone.status ===
          "locked"
            ? "text-[#aaa29d]"
            : "",
        ].join(" ")}
      >
        {milestone.name}
      </span>
    </button>
  );
}

export default function AscentRoadmap({
  milestones,
  onMilestoneSelect,
}: AscentRoadmapProps) {
  return (
    <section
      aria-label="Scholarship ascent roadmap"
      className="overflow-hidden rounded-[28px] border border-[#bfcbd5] bg-[#fffaf7] shadow-sm"
    >
      <div className="overflow-x-auto px-5 py-10 sm:px-8 lg:overflow-visible lg:px-10 lg:py-12">
        <div className="relative mx-auto h-[285px] min-w-[840px] max-w-[1040px]">
          <svg
            aria-hidden="true"
            className="absolute left-4 top-[88px] h-[130px] w-[calc(100%-32px)]"
            preserveAspectRatio="none"
            viewBox="0 0 1000 130"
          >
            <path
              d="M0 105 C150 105 175 60 310 68 C420 74 430 108 550 55 C665 5 690 70 805 21 C885 -13 930 28 1000 3"
              fill="none"
              stroke="#c9d7e0"
              strokeDasharray="9 9"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>

          <div className="absolute inset-x-0 top-[82px] grid grid-cols-6 items-center gap-2 px-2">
            {milestones.map(
              (
                milestone,
                index,
              ) => (
                <MilestoneNode
                  key={
                    milestone.id
                  }
                  milestone={
                    milestone
                  }
                  index={
                    index
                  }
                  onSelect={
                    onMilestoneSelect
                  }
                />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}