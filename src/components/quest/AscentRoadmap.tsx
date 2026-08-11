import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  FileSearch2,
  FileText,
  Flag,
  LockKeyhole,
  MessageSquareText,
  Send,
  Star,
  UsersRound,
} from "lucide-react";

import expeditionTerrain from "../../assets/expedition-terrain.png";

import MilestoneAllyGuide from "./MilestoneAllyGuide";
import MilestoneBlur from "./MilestoneBlur";

import type {
  QuestMilestone,
} from "../../types/questTracker";

type AscentRoadmapProps = {
  milestones: QuestMilestone[];

  onMilestoneSelect?: (
    milestone: QuestMilestone,
  ) => void;

  onStartAssessment?: (
  ) => void;

  /**
   * Expands the expedition map to fill the Quest Tracker's
   * available page area instead of using the normal card size.
   */
  fullPage?: boolean;

  /**
   * Optional page-level information rendered inside the map.
   * This keeps contextual UI visually attached to the trail.
   */
  overlay?: ReactNode;
};

type MilestoneIconProps = {
  milestone: QuestMilestone;
  size?: number;
};

const desktopPositions: Record<
  number,
  {
    top: string;
    left: string;
    cardSide: "left" | "right";
  }
> = {
  1: {
    top: "91%",
    left: "45%",
    cardSide: "right",
  },
  2: {
    top: "75%",
    left: "57%",
    cardSide: "left",
  },
  3: {
    top: "59%",
    left: "43%",
    cardSide: "right",
  },
  4: {
    top: "43%",
    left: "57%",
    cardSide: "left",
  },
  5: {
    top: "27%",
    left: "43%",
    cardSide: "right",
  },
  6: {
    top: "5%",
    left: "54%",
    cardSide: "left",
  },
};

/**
 * Blur-of-war is shown only when a milestone is BOTH:
 *
 * 1. progression-locked, and
 * 2. not yet discovered/generated.
 *
 * `isDiscovered !== true` intentionally treats an omitted API
 * field as undiscovered for locked milestones, which is the safer
 * default because it prevents future milestone information from
 * being exposed accidentally.
 */
function isUndiscoveredLockedMilestone(
  milestone:
    QuestMilestone,
): boolean {
  return (
    milestone.status ===
      "locked" &&
    milestone.isDiscovered !==
      true
  );
}

function MilestoneIcon({
  milestone,
  size = 24,
}: MilestoneIconProps) {
  if (
    milestone.status ===
    "completed"
  ) {
    return (
      <Star
        size={size}
        fill="currentColor"
        strokeWidth={2.2}
        aria-hidden="true"
      />
    );
  }

  if (
    milestone.status ===
    "locked"
  ) {
    return (
      <LockKeyhole
        size={size}
        aria-hidden="true"
      />
    );
  }

  switch (
    milestone.name
  ) {
    case "Research Trail":
      return (
        <FileSearch2
          size={size}
          strokeWidth={2.3}
          aria-hidden="true"
        />
      );

    case "Document Valley":
      return (
        <FileText
          size={size}
          strokeWidth={2.3}
          aria-hidden="true"
        />
      );

    case "Essay Pass":
      return (
        <MessageSquareText
          size={size}
          strokeWidth={2.3}
          aria-hidden="true"
        />
      );

    case "Interview Summit":
      return (
        <UsersRound
          size={size}
          strokeWidth={2.3}
          aria-hidden="true"
        />
      );

    case "Submission Gate":
      return (
        <Send
          size={size}
          strokeWidth={2.3}
          aria-hidden="true"
        />
      );

    default:
      return (
        <Flag
          size={size}
          strokeWidth={2.3}
          aria-hidden="true"
        />
      );
  }
}

function StatusLabel({
  milestone,
}: {
  milestone:
    QuestMilestone;
}) {
  if (
    milestone.status ===
    "completed"
  ) {
    return (
      <span className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#9b681f]">
        Completed
      </span>
    );
  }

  if (
    milestone.status ===
    "current"
  ) {
    return (
      <span className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#16629b]">
        Your next step
      </span>
    );
  }

  return (
    <span className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
      Locked
    </span>
  );
}

function MilestoneInfoPopover({
  milestone,
  align = "left",
  mobileVisible = false,
}: {
  milestone:
    QuestMilestone;

  align?:
    | "left"
    | "right";

  mobileVisible?:
    boolean;
}) {
  return (
    <article
      role="tooltip"
      className={[
        "rounded-2xl border p-4 backdrop-blur-md",
        "transition-all duration-200",
        "sm:p-5",
        milestone.status ===
        "current"
          ? [
              "border-[#79b4df] bg-white/95",
              "shadow-[0_7px_0_rgba(22,98,155,0.18),0_14px_30px_rgba(44,22,7,0.12)]",
            ].join(
              " ",
            )
          : milestone.status ===
              "completed"
            ? [
                "border-[#e6c993] bg-[#fffaf1]/95",
                "shadow-[0_12px_28px_rgba(44,22,7,0.12)]",
              ].join(
                " ",
              )
            : [
                "border-white/70 bg-white/92",
                "shadow-[0_12px_28px_rgba(44,22,7,0.12)]",
              ].join(
                " ",
              ),
        align ===
        "right"
          ? "md:text-right"
          : "text-left",
        mobileVisible
          ? "block"
          : "",
      ].join(" ")}
    >
      <StatusLabel
        milestone={
          milestone
        }
      />

      <h3
        className={[
          "mt-1.5 text-base font-extrabold sm:text-lg",
          milestone.status ===
          "current"
            ? "text-[#16629b]"
            : milestone.status ===
                "locked"
              ? "text-slate-600"
              : "text-[#2c1607]",
        ].join(" ")}
      >
        {milestone.id}.{" "}
        {milestone.name}
      </h3>

      <p
        className={[
          "mt-1.5 text-xs leading-5 sm:text-sm sm:leading-6",
          milestone.status ===
          "locked"
            ? "text-slate-500"
            : "text-[#61564e]",
        ].join(" ")}
      >
        {
          milestone.description
        }
      </p>
    </article>
  );
}

function MilestoneMarker({
  milestone,
  onSelect,
  onMobileToggle,
}: {
  milestone:
    QuestMilestone;

  onSelect?: (
    milestone:
      QuestMilestone,
  ) => void;

  onMobileToggle?: (
    milestone:
      QuestMilestone,
  ) => void;
}) {
  const canOpen =
    milestone.status !==
      "locked" &&
    Boolean(
      milestone.destination,
    ) &&
    Boolean(onSelect);

  function handleClick(): void {
    /*
     * On mobile the checkpoint acts as the disclosure control,
     * because hover is not available.
     *
     * Desktop click behavior remains available for an unlocked
     * checkpoint with a destination.
     */
    if (
      window.matchMedia(
        "(max-width: 767px)",
      ).matches
    ) {
      onMobileToggle?.(
        milestone,
      );

      return;
    }

    if (canOpen) {
      onSelect?.(
        milestone,
      );
    }
  }

  return (
    <button
      type="button"
      aria-label={`${milestone.name}: ${milestone.status}. Hover or focus for details.`}
      onClick={
        handleClick
      }
      className={[
        "relative z-20 grid shrink-0 place-items-center border-4 border-white",
        "transition duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bcaff]",
        milestone.status ===
        "current"
          ? [
              "h-[76px] w-[76px] rounded-[22px]",
              "bg-[#16629b] text-white",
              "shadow-[0_0_0_7px_rgba(155,202,255,0.48),0_9px_24px_rgba(22,98,155,0.32)]",
              "group-hover:scale-[1.055] group-hover:brightness-110",
              "group-focus-within:scale-[1.055] group-focus-within:brightness-110",
              "sm:h-[88px] sm:w-[88px]",
            ].join(
              " ",
            )
          : "h-14 w-14 rounded-full sm:h-16 sm:w-16",
        milestone.status ===
        "completed"
          ? [
              "bg-[#c69c6e] text-white",
              "shadow-[0_0_18px_rgba(198,156,110,0.55)]",
            ].join(
              " ",
            )
          : "",
        milestone.status ===
        "locked"
          ? "bg-[#e6eaed]/95 text-[#98a3ad] shadow-sm"
          : "",
        canOpen
          ? "cursor-pointer hover:-translate-y-1"
          : "cursor-default",
      ].join(" ")}
    >
      {milestone.status ===
        "current" && (
        <>
          <span
            aria-hidden="true"
            className="absolute -inset-3 -z-10 animate-pulse rounded-[28px] bg-[#6ba8e6]/25"
          />

          <span
            aria-hidden="true"
            className="absolute -top-8 left-1/2 -translate-x-1/2"
          >
            <Flag
              size={22}
              fill="currentColor"
              className="text-[#e97651] drop-shadow-sm"
            />
          </span>
        </>
      )}

      <MilestoneIcon
        milestone={
          milestone
        }
        size={
          milestone.status ===
          "current"
            ? 32
            : 24
        }
      />
    </button>
  );
}

function MobileRoadmap({
  milestones,
  onMilestoneSelect,
  onStartAssessment,
  fullPage = false,
}: AscentRoadmapProps) {
  const [
    openMilestoneId,
    setOpenMilestoneId,
  ] =
    useState<
      number | null
    >(null);

  const ascendingMilestones =
    [
      ...milestones,
    ].reverse();

  function toggleMobilePopover(
    milestone:
      QuestMilestone,
  ): void {
    setOpenMilestoneId(
      (
        currentId,
      ) =>
        currentId ===
        milestone.id
          ? null
          : milestone.id,
    );
  }

  return (
    <div
      className={[
        "relative z-10 px-4 pb-8 md:hidden",
        fullPage
          ? "min-h-[calc(100vh-80px)] pt-[300px]"
          : "py-8",
      ].join(
        " ",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute bottom-12 left-[43px] top-12 w-0.5 border-l-2 border-dashed border-white/80"
      />

      <div className="space-y-8">
        {ascendingMilestones.map(
          (
            milestone,
          ) => {
            const isOpen =
              openMilestoneId ===
              milestone.id;

            const isBlurred =
              isUndiscoveredLockedMilestone(
                milestone,
              );

            const showAllyGuide =
              milestone.name ===
                "Research Trail" &&
              milestone.status ===
                "current" &&
              Boolean(
                onStartAssessment,
              );

            if (isBlurred) {
              return (
                <div
                  key={
                    milestone.id
                  }
                  className="relative grid grid-cols-[58px_minmax(0,1fr)] items-center gap-3"
                >
                  <div
                    aria-hidden="true"
                    className="relative z-10 h-12 w-12 justify-self-center rounded-full bg-white/30 blur-md"
                  />

                  <MilestoneBlur
                    layout="mobile"
                  />
                </div>
              );
            }

            return (
              <div
                key={
                  milestone.id
                }
                className="group relative z-20 grid grid-cols-[58px_minmax(0,1fr)] items-center gap-3 focus-within:z-[80]"
              >
                <MilestoneMarker
                  milestone={
                    milestone
                  }
                  onSelect={
                    onMilestoneSelect
                  }
                  onMobileToggle={
                    toggleMobilePopover
                  }
                />

                {showAllyGuide ? (
                  <MilestoneAllyGuide
                    milestone={
                      milestone
                    }
                    message={"Hi! I'm Ally 👋\nLet's start your assessment to unlock your study plan!"}
                    isVisible={
                      isOpen
                    }
                    onStart={
                      onStartAssessment!
                    }
                    position="right"
                    layout="mobile"
                  />
                ) : (
                  <div
                    className={[
                      "origin-left transition-all duration-200",
                      isOpen
                        ? "visible translate-x-0 scale-100 opacity-100"
                        : "invisible -translate-x-2 scale-95 opacity-0",
                    ].join(
                      " ",
                    )}
                  >
                    <MilestoneInfoPopover
                      milestone={
                        milestone
                      }
                      mobileVisible={
                        isOpen
                      }
                    />
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      <p className="mt-7 text-center text-xs font-medium text-white/95 drop-shadow">
        Tap a checkpoint to view its expedition details.
      </p>
    </div>
  );
}

function DesktopRoadmap({
  milestones,
  onMilestoneSelect,
  onStartAssessment,
  fullPage = false,
}: AscentRoadmapProps) {
  return (
    <div
      className={[
        "relative z-10 hidden md:block",
        fullPage
          ? "h-[calc(100vh-80px)] min-h-[760px]"
          : "h-[1040px] lg:h-[1080px]",
      ].join(
        " ",
      )}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M45 93 C36 86 42 78 57 75 C68 71 62 63 43 59 C30 55 34 47 57 43 C70 39 63 31 43 27 C55 23 57 16 39 12 C36 9 43 6 54 5"
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeLinecap="round"
          strokeWidth="1.2"
        />

        <path
          d="M45 93 C36 86 42 78 57 75 C68 71 62 63 43 59 C30 55 34 47 57 43 C70 39 63 31 43 27 C55 23 57 16 39 12 C36 9 43 6 54 5"
          fill="none"
          stroke="rgba(122,88,47,0.48)"
          strokeDasharray="2.5 2.8"
          strokeLinecap="round"
          strokeWidth="0.42"
        />
      </svg>

      {milestones.map(
        (
          milestone,
        ) => {
          const position =
            desktopPositions[
              milestone.id
            ];

          if (!position) {
            return null;
          }

          const isBlurred =
            isUndiscoveredLockedMilestone(
              milestone,
            );

          const cardOnLeft =
            position.cardSide ===
            "left";

          const showAllyGuide =
            milestone.name ===
              "Research Trail" &&
            milestone.status ===
              "current" &&
            Boolean(
              onStartAssessment,
            );

          if (isBlurred) {
            return (
              <div
                key={
                  milestone.id
                }
                className="pointer-events-none absolute z-30"
                style={{
                  top:
                    position.top,
                  left:
                    position.left,
                  transform:
                    "translate(-50%, -50%)",
                }}
              >
                <MilestoneBlur
                  layout="desktop"
                />
              </div>
            );
          }

          return (
            <div
              key={
                milestone.id
              }
              className="group absolute z-20 hover:z-[80] focus-within:z-[80]"
              style={{
                top:
                  position.top,
                left:
                  position.left,
                transform:
                  "translate(-50%, -50%)",
              }}
            >
              <MilestoneMarker
                milestone={
                  milestone
                }
                onSelect={
                  onMilestoneSelect
                }
              />

              {showAllyGuide ? (
                <MilestoneAllyGuide
                  milestone={
                    milestone
                  }
                  message={"Hi! I'm Ally 👋\nLet's start your assessment to unlock your study plan!"}
                  isVisible={false}
                  onStart={
                    onStartAssessment!
                  }
                  position={
                    cardOnLeft
                      ? "left"
                      : "right"
                  }
                  layout="desktop"
                />
              ) : (
                <div
                  className={[
                    "pointer-events-none absolute top-1/2 z-[90] w-[250px] -translate-y-1/2 lg:w-[285px]",
                    "invisible scale-95 opacity-0 transition-all duration-200",
                    "group-hover:visible group-hover:scale-100 group-hover:opacity-100",
                    "group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100",
                    cardOnLeft
                      ? "right-[calc(100%+20px)] origin-right translate-x-2 group-hover:translate-x-0 group-focus-within:translate-x-0"
                      : "left-[calc(100%+20px)] origin-left -translate-x-2 group-hover:translate-x-0 group-focus-within:translate-x-0",
                  ].join(
                    " ",
                  )}
                >
                  <MilestoneInfoPopover
                    milestone={
                      milestone
                    }
                    align={
                      cardOnLeft
                        ? "right"
                        : "left"
                    }
                  />
                </div>
              )}
            </div>
          );
        },
      )}

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/75 px-4 py-2 text-xs font-semibold text-[#5d5149] shadow-sm backdrop-blur">
        Hover over a checkpoint to see milestone details.
      </p>
    </div>
  );
}

export default function AscentRoadmap({
  milestones,
  onMilestoneSelect,
  onStartAssessment,
  fullPage = false,
  overlay,
}: AscentRoadmapProps) {
  return (
    <section
      aria-label="Your Scholarship Expedition map"
      className={[
        "relative isolate z-0 w-full overflow-hidden bg-[#dbeae7]",
        fullPage
          ? [
              "min-h-[calc(100vh-80px)] max-w-none",
              "rounded-none border-0 shadow-none",
            ].join(
              " ",
            )
          : [
              "mx-auto max-w-[920px]",
              "rounded-[30px] border border-[#c3d0d9]",
              "shadow-[0_8px_0_#d8c6ae]",
            ].join(
              " ",
            ),
      ].join(" ")}
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

      {overlay && (
        <div
          className={[
            "absolute z-[25]",
            "left-4 top-4",
            "w-[calc(100%-2rem)] max-w-[440px]",
            "sm:left-6 sm:top-6 sm:w-[420px]",
            "lg:left-8 lg:top-8 lg:w-[440px]",
          ].join(
            " ",
          )}
        >
          {overlay}
        </div>
      )}

      <DesktopRoadmap
        milestones={
          milestones
        }
        onMilestoneSelect={
          onMilestoneSelect
        }
        onStartAssessment={
          onStartAssessment
        }
        fullPage={
          fullPage
        }
      />

      <MobileRoadmap
        milestones={
          milestones
        }
        onMilestoneSelect={
          onMilestoneSelect
        }
        onStartAssessment={
          onStartAssessment
        }
        fullPage={
          fullPage
        }
      />
    </section>
  );
}