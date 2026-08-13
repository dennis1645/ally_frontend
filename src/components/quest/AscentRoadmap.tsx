import {
  Check,
  Compass,
  Flag,
  LockKeyhole,
  MapPinned,
} from "lucide-react";

import expeditionTerrain from "../../assets/expedition-terrain.png";

import type {
  RoadmapData,
  RoadmapEntityId,
  RoadmapMilestone,
} from "../../api/roadmapApi";

export type AscentRoadmapProps = {
  roadmap: RoadmapData;
  selectedMilestoneId?:
    | string
    | number
    | null;
  onMilestoneSelect?: (
    milestone: RoadmapMilestone,
  ) => void;

  specialSelectableMilestoneId?:
    RoadmapEntityId | null;

  variant?:
    | "full"
    | "dashboard";

  scholarshipName?:
    | string
    | null;
};

type RoadmapPoint = {
  left: number;
  top: number;
};

function buildPoints(
  count: number,
): RoadmapPoint[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [
      {
        left: 50,
        top: 68,
      },
    ];
  }

  const leftPattern = [
    44,
    58,
    42,
    58,
    43,
    55,
  ];

  return Array.from(
    {
      length: count,
    },
    (_, index) => {
      const ratio =
        index /
        (count - 1);

      return {
        left:
          leftPattern[
            index %
              leftPattern.length
          ],
        top:
          88 -
          ratio * 76,
      };
    },
  );
}

function buildPath(
  points: RoadmapPoint[],
): string {
  if (
    points.length === 0
  ) {
    return "";
  }

  if (
    points.length === 1
  ) {
    return `M ${points[0].left} ${points[0].top}`;
  }

  let path =
    `M ${points[0].left} ${points[0].top}`;

  for (
    let index = 0;
    index <
    points.length - 1;
    index += 1
  ) {
    const current =
      points[index];

    const next =
      points[index + 1];

    const midY =
      (current.top +
        next.top) /
      2;

    path +=
      ` C ${current.left} ${midY}, ${next.left} ${midY}, ${next.left} ${next.top}`;
  }

  return path;
}

function statusLabel(
  milestone: RoadmapMilestone,
): string {
  switch (
    milestone.status
  ) {
    case "completed":
      return "Completed";

    case "current":
      return "Current";

    case "locked":
      return "Locked";

    default:
      return "Available";
  }
}

function MilestoneMarker({
  milestone,
  selected,
  forceSelectable = false,
  onSelect,
}: {
  milestone: RoadmapMilestone;
  selected: boolean;
  forceSelectable?: boolean;
  onSelect?: (
    milestone: RoadmapMilestone,
  ) => void;
}) {
  const locked =
    milestone.status ===
    "locked";

  return (
    <button
      type="button"
      disabled={
        (
          locked &&
          !forceSelectable
        ) ||
        !onSelect
      }
      onClick={() => {
        onSelect?.(
          milestone,
        );
      }}
      aria-label={`${milestone.title}: ${statusLabel(
        milestone,
      )}`}
      className={[
        "relative grid place-items-center",
        "border-4 border-white",
        "transition duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bcaff]",

        milestone.status ===
        "current"
          ? "h-[82px] w-[82px] rounded-[22px] bg-[#16629b] text-white shadow-[0_0_0_7px_rgba(155,202,255,0.45),0_12px_28px_rgba(22,98,155,0.32)]"
          : "h-16 w-16 rounded-full",

        milestone.status ===
        "completed"
          ? "bg-[#c69c6e] text-white shadow-lg"
          : "",

        milestone.status ===
        "available"
          ? "bg-[#d5a66f] text-white shadow-lg"
          : "",

        locked
          ? forceSelectable
            ? "cursor-pointer bg-[#e6eaed] text-[#8d99a2] hover:-translate-y-1"
            : "cursor-default bg-[#e6eaed] text-[#98a3ad]"
          : "cursor-pointer hover:-translate-y-1",

        selected
          ? "ring-4 ring-[#f2c77d]"
          : "",
      ].join(" ")}
    >
      {milestone.status ===
        "current" && (
        <Flag
          size={22}
          fill="currentColor"
          className="absolute -top-8 text-[#e97651]"
          aria-hidden="true"
        />
      )}

      {milestone.status ===
      "completed" ? (
        <Check
          size={28}
          strokeWidth={3}
          aria-hidden="true"
        />
      ) : locked ? (
        <LockKeyhole
          size={24}
          aria-hidden="true"
        />
      ) : (
        <MapPinned
          size={
            milestone.status ===
            "current"
              ? 32
              : 25
          }
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function Overview({
  roadmap,
  scholarshipName,
}: {
  roadmap: RoadmapData;
  scholarshipName?:
    | string
    | null;
}) {
  const completed =
    roadmap.milestones.filter(
      (milestone) =>
        milestone.completed,
    ).length;

  const current =
    roadmap.milestones.find(
      (milestone) =>
        milestone.status ===
        "current",
    );

  const percentage =
    roadmap.milestones.length >
    0
      ? Math.round(
          roadmap.milestones.reduce(
            (
              total,
              milestone,
            ) =>
              total +
              milestone.progress,
            0,
          ) /
            roadmap.milestones.length,
        )
      : 0;

  return (
    <aside className="rounded-[24px] border border-white/80 bg-white/92 p-5 shadow-[0_8px_0_rgba(122,88,47,0.14),0_18px_45px_rgba(44,22,7,0.16)] backdrop-blur-md">
      <div className="flex items-center gap-2 text-[#7a582f]">
        <Compass
          size={16}
          aria-hidden="true"
        />

        <p className="text-xs font-extrabold uppercase tracking-[0.16em]">
          Quest Tracker
        </p>
      </div>

      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#2c1607] sm:text-3xl">
        Your Scholarship Expedition
      </h1>

      <p className="mt-2 text-sm leading-6 text-[#667085]">
        {scholarshipName?.trim()
          ? scholarshipName.trim()
          : `Scholarship #${roadmap.scholarshipId}`}
      </p>

      <div className="my-4 h-px bg-[#e7ddd3]" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#16629b]">
            Expedition progress
          </p>

          <p className="mt-1 text-lg font-extrabold text-[#2c1607]">
            {completed} / {roadmap.milestones.length} milestones completed
          </p>
        </div>

        <p className="text-2xl font-extrabold text-[#7a582f]">
          {percentage}%
        </p>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf1f3]">
        <div
          className="h-full rounded-full bg-[#16629b] transition-[width] duration-500"
          style={{
            width:
              `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600">
        Current milestone:{" "}
        <span className="font-extrabold text-[#16629b]">
          {current?.title ??
            "Expedition complete"}
        </span>
      </p>
    </aside>
  );
}


function DashboardVerticalRoadmap({
  roadmap,
  selectedMilestoneId,
  onMilestoneSelect,
  specialSelectableMilestoneId,
}: {
  roadmap: RoadmapData;
  selectedMilestoneId:
    | RoadmapEntityId
    | null;
  onMilestoneSelect?: (
    milestone: RoadmapMilestone,
  ) => void;
  specialSelectableMilestoneId:
    | RoadmapEntityId
    | null;
}) {
  const milestones =
    [
      ...roadmap.milestones,
    ].sort(
      (
        first,
        second,
      ) =>
        first.order -
        second.order,
    );

  const verticalHeight =
    Math.max(
      640,
      milestones.length *
        104 +
        90,
    );

  const topPadding =
    8;

  const bottomPadding =
    91;

  return (
    <section
      aria-label="Vertical scholarship quest map"
      className={[
        "relative isolate w-full overflow-hidden rounded-[26px]",
        "border border-[#c3d0d9] bg-[#dbeae7]",
        "shadow-[0_7px_0_#d8c6ae]",
      ].join(
        " ",
      )}
      style={{
        minHeight:
          `${verticalHeight}px`,
      }}
    >
      <img
        src={
          expeditionTerrain
        }
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/10"
      />

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[7%] bottom-[7%] w-[4px] -translate-x-1/2 rounded-full bg-white/90 shadow-sm"
      />

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[7%] bottom-[7%] w-px -translate-x-1/2 border-l border-dashed border-[#7a582f]/60"
      />

      {milestones.map(
        (
          milestone,
          index,
        ) => {
          const ratio =
            milestones.length <=
            1
              ? 0.5
              : index /
                (
                  milestones.length -
                  1
                );

          const top =
            topPadding +
            ratio *
              (
                bottomPadding -
                topPadding
              );

          const forceSelectable =
            specialSelectableMilestoneId !==
              null &&
            String(
              specialSelectableMilestoneId,
            ) ===
              String(
                milestone.id,
              );

          const labelOnRight =
            index %
              2 ===
            0;

          return (
            <div
              key={
                String(
                  milestone.id,
                )
              }
              className="absolute left-1/2 z-20 -translate-x-1/2"
              style={{
                top:
                  `${top}%`,
                transform:
                  "translate(-50%, -50%)",
              }}
            >
              <div className="group relative">
                <MilestoneMarker
                  milestone={
                    milestone
                  }
                  selected={
                    String(
                      selectedMilestoneId,
                    ) ===
                    String(
                      milestone.id,
                    )
                  }
                  forceSelectable={
                    forceSelectable
                  }
                  onSelect={
                    onMilestoneSelect
                  }
                />

                <button
                  type="button"
                  disabled={
                    milestone.status ===
                      "locked" &&
                    !forceSelectable
                  }
                  onClick={() => {
                    onMilestoneSelect?.(
                      milestone,
                    );
                  }}
                  className={[
                    "absolute top-1/2 w-[132px] -translate-y-1/2",
                    "rounded-[16px] border border-white/80 bg-white/92",
                    "px-3 py-2.5 text-left shadow-lg backdrop-blur",
                    "transition duration-200",
                    "sm:w-[165px]",
                    milestone.status ===
                      "locked" &&
                    !forceSelectable
                      ? "cursor-default opacity-70"
                      : "cursor-pointer group-hover:-translate-y-[calc(50%+2px)]",
                    labelOnRight
                      ? "left-[calc(100%+18px)]"
                      : "right-[calc(100%+18px)] text-right",
                  ].join(
                    " ",
                  )}
                >
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7a582f]">
                    Milestone{" "}
                    {index +
                      1}
                    {" · "}
                    {
                      statusLabel(
                        milestone,
                      )
                    }
                  </p>

                  <p className="mt-1 line-clamp-2 text-[11px] font-extrabold leading-4 text-[#2c1607] sm:text-xs">
                    {index ===
                    1
                      ? "Assessment 2"
                      : milestone.title}
                  </p>

                  <p className="mt-1 text-[9px] font-bold text-[#16629b] sm:text-[10px]">
                    {Math.round(
                      milestone.progress,
                    )}
                    % complete
                  </p>
                </button>
              </div>
            </div>
          );
        },
      )}

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-center shadow-md backdrop-blur">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#7a582f]">
          Scholarship Goal
        </p>

        <Flag
          size={15}
          className="mx-auto mt-1 text-[#e97651]"
          fill="currentColor"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

export default function AscentRoadmap({
  roadmap,
  selectedMilestoneId = null,
  onMilestoneSelect,
  specialSelectableMilestoneId = null,
  variant = "full",
  scholarshipName = null,
}: AscentRoadmapProps) {
  if (
    variant ===
    "dashboard"
  ) {
    return (
      <DashboardVerticalRoadmap
        roadmap={
          roadmap
        }
        selectedMilestoneId={
          selectedMilestoneId
        }
        onMilestoneSelect={
          onMilestoneSelect
        }
        specialSelectableMilestoneId={
          specialSelectableMilestoneId
        }
      />
    );
  }

  const points =
    buildPoints(
      roadmap.milestones.length,
    );

  const path =
    buildPath(points);

  const minimumHeight =
    Math.max(
      780,
      roadmap.milestones.length *
        155,
    );

  return (
    <section
      aria-label="AI-generated scholarship roadmap"
      className="relative isolate min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#dbeae7]"
    >
      <img
        src={
          expeditionTerrain
        }
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/12"
      />

      <div className="absolute left-4 top-4 z-30 w-[calc(100%-2rem)] max-w-[440px] sm:left-6 sm:top-6 lg:left-8 lg:top-8">
        <Overview
          roadmap={
            roadmap
          }
          scholarshipName={
            scholarshipName
          }
        />
      </div>

      {/* Desktop map */}
      <div
        className="relative z-10 hidden md:block"
        style={{
          height:
            `max(calc(100vh - 80px), ${minimumHeight}px)`,
        }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.94)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
          />

          <path
            d={path}
            fill="none"
            stroke="rgba(122,88,47,0.46)"
            strokeDasharray="2.5 2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.42"
          />
        </svg>

        {roadmap.milestones.map(
          (
            milestone,
            index,
          ) => {
            const point =
              points[index];

            if (!point) {
              return null;
            }

            return (
              <div
                key={
                  String(
                    milestone.id,
                  )
                }
                className="absolute z-20"
                style={{
                  left:
                    `${point.left}%`,
                  top:
                    `${point.top}%`,
                  transform:
                    "translate(-50%, -50%)",
                }}
              >
                <div className="group relative flex flex-col items-center">
                  <MilestoneMarker
                    milestone={
                      milestone
                    }
                    selected={
                      String(
                        selectedMilestoneId,
                      ) ===
                      String(
                        milestone.id,
                      )
                    }
                    forceSelectable={
                      specialSelectableMilestoneId !==
                        null &&
                      String(
                        specialSelectableMilestoneId,
                      ) ===
                        String(
                          milestone.id,
                        )
                    }
                    onSelect={
                      onMilestoneSelect
                    }
                  />

                  <div className="mt-3 w-[210px] rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-center shadow-lg backdrop-blur">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#7a582f]">
                      {statusLabel(
                        milestone,
                      )}
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-[#2c1607]">
                      {milestone.title}
                    </p>

                    <p className="mt-1 text-xs text-[#667085]">
                      {Math.round(
                        milestone.progress,
                      )}% complete
                    </p>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* Mobile list */}
      <div className="relative z-10 space-y-4 px-4 pb-8 pt-[330px] md:hidden">
        {roadmap.milestones.map(
          (
            milestone,
          ) => {
            const locked =
              milestone.status ===
              "locked";

            const forceSelectable =
              specialSelectableMilestoneId !==
                null &&
              String(
                specialSelectableMilestoneId,
              ) ===
                String(
                  milestone.id,
                );

            return (
              <div
                key={
                  String(
                    milestone.id,
                  )
                }
                className={[
                  "flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-lg backdrop-blur",
                  locked
                    ? "border-white/60 bg-white/60 opacity-70"
                    : "border-white/80 bg-white/92",
                ].join(" ")}
              >
                <MilestoneMarker
                  milestone={
                    milestone
                  }
                  selected={
                    String(
                      selectedMilestoneId,
                    ) ===
                    String(
                      milestone.id,
                    )
                  }
                  forceSelectable={
                    forceSelectable
                  }
                  onSelect={
                    onMilestoneSelect
                  }
                />

                <button
                  type="button"
                  disabled={
                    locked &&
                    !forceSelectable
                  }
                  onClick={() => {
                    onMilestoneSelect?.(
                      milestone,
                    );
                  }}
                  className={[
                    "min-w-0 flex-1 text-left",
                    locked &&
                    !forceSelectable
                      ? "cursor-default"
                      : "cursor-pointer",
                  ].join(" ")}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#7a582f]">
                    {statusLabel(
                      milestone,
                    )}
                  </p>

                  <p className="mt-1 font-extrabold text-[#2c1607]">
                    {milestone.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    {milestone.description}
                  </p>
                </button>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}