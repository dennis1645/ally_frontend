import {
  Check,
  Compass,
  Flag,
  LockKeyhole,
  MapPinned,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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



type DashboardTrailPoint = {
  x: number;
  y: number;
};

type DashboardMapSize = {
  width: number;
  height: number;
};

const DASHBOARD_TRAIL_VIEWBOX_WIDTH =
  1086;

const DASHBOARD_TRAIL_VIEWBOX_HEIGHT =
  1449;

/*
 * These points trace the CENTRE of the actual brown walking path in
 * expedition-terrain.png from the lower trail toward the summit.
 *
 * Important:
 * - The path is not an arbitrary S curve anymore.
 * - The points were placed against the real green/brown terrain image.
 * - The SVG uses the same xMidYMid "slice" behaviour as object-cover,
 *   so the white line stays on top of the painted brown trail.
 */
const DASHBOARD_TRAIL_REFERENCE_POINTS:
  DashboardTrailPoint[] = [
    {
      x: 480,
      y: 1438,
    },
    {
      x: 592,
      y: 1348,
    },
    {
      x: 599,
      y: 1248,
    },
    {
      x: 455,
      y: 1148,
    },
    {
      x: 450,
      y: 1048,
    },
    {
      x: 580,
      y: 948,
    },
    {
      x: 628,
      y: 848,
    },
    {
      x: 526,
      y: 748,
    },
    {
      x: 492,
      y: 648,
    },
    {
      x: 591,
      y: 548,
    },
    {
      x: 402,
      y: 448,
    },
    {
      x: 574,
      y: 348,
    },
    {
      x: 471,
      y: 248,
    },
    {
      x: 534,
      y: 178,
    },
    {
      x: 548,
      y: 120,
    },
    {
      x: 535,
      y: 82,
    },
  ];

function catmullRomPoint(
  point0:
    DashboardTrailPoint,
  point1:
    DashboardTrailPoint,
  point2:
    DashboardTrailPoint,
  point3:
    DashboardTrailPoint,
  t: number,
): DashboardTrailPoint {
  const clamped =
    Math.max(
      0,
      Math.min(
        1,
        t,
      ),
    );

  const t2 =
    clamped *
    clamped;

  const t3 =
    t2 *
    clamped;

  return {
    x:
      0.5 *
      (
        2 *
          point1.x +
        (
          -point0.x +
          point2.x
        ) *
          clamped +
        (
          2 *
            point0.x -
          5 *
            point1.x +
          4 *
            point2.x -
          point3.x
        ) *
          t2 +
        (
          -point0.x +
          3 *
            point1.x -
          3 *
            point2.x +
          point3.x
        ) *
          t3
      ),

    y:
      0.5 *
      (
        2 *
          point1.y +
        (
          -point0.y +
          point2.y
        ) *
          clamped +
        (
          2 *
            point0.y -
          5 *
            point1.y +
          4 *
            point2.y -
          point3.y
        ) *
          t2 +
        (
          -point0.y +
          3 *
            point1.y -
          3 *
            point2.y +
          point3.y
        ) *
          t3
      ),
  };
}

function buildDashboardTrailPath(
  points:
    DashboardTrailPoint[],
): string {
  if (
    points.length ===
    0
  ) {
    return "";
  }

  if (
    points.length ===
    1
  ) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path =
    `M ${points[0].x} ${points[0].y}`;

  /*
   * Convert the Catmull-Rom guide points to cubic Bézier commands.
   * This gives us the smooth wandering shape of the painted trail
   * without cutting sharp corners between the sampled road centres.
   */
  for (
    let index =
      0;
    index <
    points.length -
      1;
    index +=
      1
  ) {
    const point0 =
      points[
        Math.max(
          0,
          index -
            1,
        )
      ];

    const point1 =
      points[
        index
      ];

    const point2 =
      points[
        index +
          1
      ];

    const point3 =
      points[
        Math.min(
          points.length -
            1,
          index +
            2,
        )
      ];

    const control1 = {
      x:
        point1.x +
        (
          point2.x -
          point0.x
        ) /
          6,

      y:
        point1.y +
        (
          point2.y -
          point0.y
        ) /
          6,
    };

    const control2 = {
      x:
        point2.x -
        (
          point3.x -
          point1.x
        ) /
          6,

      y:
        point2.y -
        (
          point3.y -
          point1.y
        ) /
          6,
    };

    path +=
      ` C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${point2.x} ${point2.y}`;
  }

  return path;
}

const DASHBOARD_TRAIL_PATH =
  buildDashboardTrailPath(
    DASHBOARD_TRAIL_REFERENCE_POINTS,
  );

/*
 * progress = 0  -> bottom of the brown trail
 * progress = 1  -> summit
 */
function pointOnDashboardTrail(
  progress: number,
): DashboardTrailPoint {
  const clampedProgress =
    Math.max(
      0,
      Math.min(
        1,
        progress,
      ),
    );

  const segmentCount =
    DASHBOARD_TRAIL_REFERENCE_POINTS.length -
    1;

  const scaledProgress =
    clampedProgress *
    segmentCount;

  const segmentIndex =
    Math.min(
      segmentCount -
        1,
      Math.floor(
        scaledProgress,
      ),
    );

  const segmentProgress =
    clampedProgress ===
    1
      ? 1
      : scaledProgress -
        segmentIndex;

  const point0 =
    DASHBOARD_TRAIL_REFERENCE_POINTS[
      Math.max(
        0,
        segmentIndex -
          1,
      )
    ];

  const point1 =
    DASHBOARD_TRAIL_REFERENCE_POINTS[
      segmentIndex
    ];

  const point2 =
    DASHBOARD_TRAIL_REFERENCE_POINTS[
      Math.min(
        DASHBOARD_TRAIL_REFERENCE_POINTS.length -
          1,
        segmentIndex +
          1,
      )
    ];

  const point3 =
    DASHBOARD_TRAIL_REFERENCE_POINTS[
      Math.min(
        DASHBOARD_TRAIL_REFERENCE_POINTS.length -
          1,
        segmentIndex +
          2,
      )
    ];

  return catmullRomPoint(
    point0,
    point1,
    point2,
    point3,
    segmentProgress,
  );
}

/*
 * Because the terrain image uses object-cover, a wide desktop hero
 * shows only a middle slice of the portrait illustration.
 *
 * This finds which part of the native image is currently visible.
 * We then distribute ALL dashboard milestones inside that visible
 * part of the real brown trail instead of placing some milestones
 * outside the cropped viewport.
 */
function getVisibleNativeYRange(
  mapSize:
    DashboardMapSize,
): {
  top: number;
  bottom: number;
} {
  if (
    mapSize.width <=
      0 ||
    mapSize.height <=
      0
  ) {
    return {
      top:
        350,
      bottom:
        1080,
    };
  }

  const scale =
    Math.max(
      mapSize.width /
        DASHBOARD_TRAIL_VIEWBOX_WIDTH,
      mapSize.height /
        DASHBOARD_TRAIL_VIEWBOX_HEIGHT,
    );

  const renderedHeight =
    DASHBOARD_TRAIL_VIEWBOX_HEIGHT *
    scale;

  const offsetY =
    (
      mapSize.height -
      renderedHeight
    ) /
    2;

  return {
    top:
      Math.max(
        0,
        -offsetY /
          scale,
      ),

    bottom:
      Math.min(
        DASHBOARD_TRAIL_VIEWBOX_HEIGHT,
        (
          mapSize.height -
          offsetY
        ) /
          scale,
      ),
  };
}

/*
 * The traced road moves continuously upward, so we can binary-search
 * the trail progress that corresponds to a native image Y coordinate.
 */
function progressForDashboardY(
  targetY: number,
): number {
  let low =
    0;

  let high =
    1;

  for (
    let iteration =
      0;
    iteration <
    28;
    iteration +=
      1
  ) {
    const middle =
      (
        low +
        high
      ) /
      2;

    const point =
      pointOnDashboardTrail(
        middle,
      );

    if (
      point.y >
      targetY
    ) {
      low =
        middle;
    } else {
      high =
        middle;
    }
  }

  return (
    low +
    high
  ) /
  2;
}

function buildDashboardTrailPoints(
  count: number,
  mapSize:
    DashboardMapSize,
): {
  milestones:
    DashboardTrailPoint[];
  goal:
    DashboardTrailPoint;
} {
  if (
    count <=
    0
  ) {
    return {
      milestones:
        [],
      goal:
        pointOnDashboardTrail(
          0.82,
        ),
    };
  }

  const visible =
    getVisibleNativeYRange(
      mapSize,
    );

  const visibleHeight =
    Math.max(
      1,
      visible.bottom -
      visible.top,
    );

  /*
   * Keep marker cards away from the very top/bottom crop edges.
   */
  const bottomY =
    visible.bottom -
    visibleHeight *
      0.09;

  const topY =
    visible.top +
    visibleHeight *
      0.11;

  const startProgress =
    progressForDashboardY(
      bottomY,
    );

  const goalProgress =
    progressForDashboardY(
      topY,
    );

  const finalMilestoneProgress =
    startProgress +
    (
      goalProgress -
      startProgress
    ) *
      0.84;

  const milestones =
    count ===
    1
      ? [
          pointOnDashboardTrail(
            startProgress,
          ),
        ]
      : Array.from(
          {
            length:
              count,
          },
          (
            _,
            index,
          ) =>
            pointOnDashboardTrail(
              startProgress +
              (
                finalMilestoneProgress -
                startProgress
              ) *
                (
                  index /
                  (
                    count -
                    1
                  )
                ),
            ),
        );

  return {
    milestones,
    goal:
      pointOnDashboardTrail(
        goalProgress,
      ),
  };
}

/*
 * Convert native expedition-terrain.png coordinates to the actual
 * object-cover coordinates of the dashboard hero.
 */
function dashboardPointStyle(
  point:
    DashboardTrailPoint,
  mapSize:
    DashboardMapSize,
): {
  left: string;
  top: string;
} {
  if (
    mapSize.width <=
      0 ||
    mapSize.height <=
      0
  ) {
    return {
      left:
        "50%",
      top:
        "50%",
    };
  }

  const scale =
    Math.max(
      mapSize.width /
        DASHBOARD_TRAIL_VIEWBOX_WIDTH,
      mapSize.height /
        DASHBOARD_TRAIL_VIEWBOX_HEIGHT,
    );

  const renderedWidth =
    DASHBOARD_TRAIL_VIEWBOX_WIDTH *
    scale;

  const renderedHeight =
    DASHBOARD_TRAIL_VIEWBOX_HEIGHT *
    scale;

  const offsetX =
    (
      mapSize.width -
      renderedWidth
    ) /
    2;

  const offsetY =
    (
      mapSize.height -
      renderedHeight
    ) /
    2;

  return {
    left:
      `${
        offsetX +
        point.x *
          scale
      }px`,

    top:
      `${
        offsetY +
        point.y *
          scale
      }px`,
  };
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

  const mapRef =
    useRef<HTMLElement | null>(
      null,
    );

  const [
    mapSize,
    setMapSize,
  ] =
    useState<DashboardMapSize>({
      width:
        0,
      height:
        0,
    });

  useEffect(
    () => {
      const element =
        mapRef.current;

      if (!element) {
        return;
      }

      const updateSize =
        (): void => {
          setMapSize({
            width:
              element.clientWidth,
            height:
              element.clientHeight,
          });
        };

      updateSize();

      if (
        typeof ResizeObserver ===
        "undefined"
      ) {
        window.addEventListener(
          "resize",
          updateSize,
        );

        return () => {
          window.removeEventListener(
            "resize",
            updateSize,
          );
        };
      }

      const observer =
        new ResizeObserver(
          updateSize,
        );

      observer.observe(
        element,
      );

      return () => {
        observer.disconnect();
      };
    },
    [],
  );

  const {
    milestones:
      trailPoints,
    goal:
      goalPoint,
  } =
    buildDashboardTrailPoints(
      milestones.length,
      mapSize,
    );

  const trailPath =
    DASHBOARD_TRAIL_PATH;

  /*
   * Give the curved trail enough vertical breathing room while still
   * keeping the dashboard hero compact. The SVG scales responsively
   * across the entire terrain card.
   */
  const mapHeight =
    Math.max(
      720,
      milestones.length *
        88 +
        120,
    );

  const goalStyle =
    dashboardPointStyle(
      goalPoint,
      mapSize,
    );

  return (
    <section
      ref={
        mapRef
      }
      aria-label="Scholarship quest map following the painted terrain trail"
      className={[
        "relative isolate w-full overflow-hidden rounded-[26px]",
        "border border-[#c3d0d9] bg-[#dbeae7]",
        "shadow-[0_7px_0_#d8c6ae]",
      ].join(
        " ",
      )}
      style={{
        minHeight:
          `${mapHeight}px`,
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

      {/* =====================================================
          Painted-terrain expedition route

          This SVG uses the native dimensions of expedition-terrain.png
          and traces the centre of the actual brown road in the artwork.

          preserveAspectRatio="xMidYMid slice" mirrors CSS object-cover.
          The white route therefore crops and scales exactly with the image.
      ====================================================== */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        viewBox={`0 0 ${DASHBOARD_TRAIL_VIEWBOX_WIDTH} ${DASHBOARD_TRAIL_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* soft terrain shadow under the white route */}
        <path
          d={
            trailPath
          }
          fill="none"
          stroke="rgba(122,88,47,0.20)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="13"
        />

        {/* main white expedition trail */}
        <path
          d={
            trailPath
          }
          fill="none"
          stroke="rgba(255,255,255,0.97)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7.5"
        />

        {/* small warm dashed detail so the route still feels mapped */}
        <path
          d={
            trailPath
          }
          fill="none"
          stroke="rgba(122,88,47,0.42)"
          strokeDasharray="7 10"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>

      {milestones.map(
        (
          milestone,
          index,
        ) => {
          const point =
            trailPoints[
              index
            ];

          if (!point) {
            return null;
          }

          const forceSelectable =
            specialSelectableMilestoneId !==
              null &&
            String(
              specialSelectableMilestoneId,
            ) ===
              String(
                milestone.id,
              );

          /*
           * Keep labels away from the outer edges:
           * left/middle nodes label to the right,
           * right-side nodes label to the left.
           */
          const labelOnRight =
            point.x <
            545;

          const pointStyle =
            dashboardPointStyle(
              point,
              mapSize,
            );

          return (
            <div
              key={
                String(
                  milestone.id,
                )
              }
              className="absolute z-20"
              style={{
                ...pointStyle,
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
                      ? "left-[calc(100%+16px)]"
                      : "right-[calc(100%+16px)] text-right",
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

      {/* Scholarship goal / Submission Gate */}
      <div
        className="absolute z-20"
        style={{
          ...goalStyle,
          transform:
            "translate(-50%, -50%)",
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className="relative h-16 w-16">
            <div className="absolute bottom-0 left-1/2 h-12 w-1 -translate-x-1/2 rounded-full bg-[#7a582f]" />

            <Flag
              size={34}
              fill="currentColor"
              aria-hidden="true"
              className="absolute left-1/2 top-0 -translate-x-[4px] text-[#ba1a1a]"
            />
          </div>

          <div className="mt-1 rounded-xl border border-white/80 bg-white/92 px-3 py-2 text-center shadow-md backdrop-blur">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7a582f]">
              Scholarship Goal
            </p>

            <p className="mt-0.5 text-[11px] font-extrabold text-[#16629b]">
              Submission Gate
            </p>
          </div>
        </div>
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