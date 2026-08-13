import {
  useEffect,
  useState,
  type ReactNode,
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
  X,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router";

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

  onStartAssessment?: () => void;

  fullPage?: boolean;

  overlay?: ReactNode;

  /**
   * Route used when a locked milestone requires
   * a subscription.
   *
   * Change this if your actual subscription route
   * is different.
   */
  subscriptionRoute?: string;
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


/* =========================================================
   Helpers
   ========================================================= */

function isUndiscoveredLockedMilestone(
  milestone: QuestMilestone,
): boolean {
  return (
    milestone.status === "locked" &&
    milestone.isDiscovered !== true
  );
}


function MilestoneIcon({
  milestone,
  size = 24,
}: MilestoneIconProps) {
  if (milestone.status === "completed") {
    return (
      <Star
        size={size}
        fill="currentColor"
        strokeWidth={2.2}
        aria-hidden="true"
      />
    );
  }

  if (milestone.status === "locked") {
    return (
      <LockKeyhole
        size={size}
        aria-hidden="true"
      />
    );
  }

  switch (milestone.name) {
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
  milestone: QuestMilestone;
}) {
  if (milestone.status === "completed") {
    return (
      <span className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#9b681f]">
        Completed
      </span>
    );
  }

  if (milestone.status === "current") {
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


/* =========================================================
   Milestone information card
   ========================================================= */

function MilestoneInfoPopover({
  milestone,
  align = "left",
  mobileVisible = false,
}: {
  milestone: QuestMilestone;

  align?: "left" | "right";

  mobileVisible?: boolean;
}) {
  return (
    <article
      role="tooltip"
      className={[
        "rounded-2xl border p-4 backdrop-blur-md",
        "transition-all duration-200",
        "sm:p-5",

        milestone.status === "current"
          ? [
              "border-[#79b4df] bg-white/95",
              "shadow-[0_7px_0_rgba(22,98,155,0.18),0_14px_30px_rgba(44,22,7,0.12)]",
            ].join(" ")
          : milestone.status === "completed"
            ? [
                "border-[#e6c993] bg-[#fffaf1]/95",
                "shadow-[0_12px_28px_rgba(44,22,7,0.12)]",
              ].join(" ")
            : [
                "border-white/70 bg-white/92",
                "shadow-[0_12px_28px_rgba(44,22,7,0.12)]",
              ].join(" "),

        align === "right"
          ? "md:text-right"
          : "text-left",

        mobileVisible
          ? "block"
          : "",
      ].join(" ")}
    >
      <StatusLabel milestone={milestone} />

      <h3
        className={[
          "mt-1.5 text-base font-extrabold sm:text-lg",

          milestone.status === "current"
            ? "text-[#16629b]"
            : milestone.status === "locked"
              ? "text-slate-600"
              : "text-[#2c1607]",
        ].join(" ")}
      >
        {milestone.id}. {milestone.name}
      </h3>

      <p
        className={[
          "mt-1.5 text-xs leading-5 sm:text-sm sm:leading-6",

          milestone.status === "locked"
            ? "text-slate-500"
            : "text-[#61564e]",
        ].join(" ")}
      >
        {milestone.description}
      </p>
    </article>
  );
}


/* =========================================================
   Locked milestone modal
   ========================================================= */

function LockedMilestoneModal({
  milestone,
  onClose,
  onUnlock,
}: {
  milestone: QuestMilestone;
  onClose: () => void;
  onUnlock: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-[#17324a]/35 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-milestone-title"
    >
      <div
        className={[
          "relative w-full max-w-[430px]",
          "overflow-hidden rounded-[28px]",
          "border border-white/80",
          "bg-white/95",
          "p-6 sm:p-7",
          "shadow-[0_18px_0_rgba(44,22,7,0.10),0_30px_80px_rgba(22,50,74,0.28)]",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={[
            "absolute right-4 top-4",
            "grid h-9 w-9 place-items-center",
            "rounded-full bg-slate-100",
            "text-slate-500",
            "transition hover:bg-slate-200",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bcaff]",
          ].join(" ")}
        >
          <X size={17} />
        </button>

        <div
          className={[
            "mx-auto grid h-16 w-16 place-items-center",
            "rounded-[20px]",
            "bg-[#e9eef2]",
            "text-[#7d8992]",
            "shadow-[0_7px_0_rgba(122,88,47,0.10)]",
          ].join(" ")}
        >
          <LockKeyhole size={28} />
        </div>

        <div className="mt-5 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7a582f]">
            Quest Locked
          </p>

          <h2
            id="locked-milestone-title"
            className="mt-2 text-2xl font-extrabold tracking-tight text-[#2c1607]"
          >
            {milestone.name}
          </h2>

          <p className="mx-auto mt-3 max-w-[330px] text-sm leading-6 text-[#667085]">
            {milestone.description}
          </p>

          <div className="mt-5 rounded-2xl border border-[#e8dfd4] bg-[#fffaf3] p-4 text-left">
            <div className="flex gap-3">
              <Sparkles
                size={18}
                className="mt-0.5 shrink-0 text-[#c69c6e]"
              />

              <p className="text-xs leading-5 text-[#65584e]">
                This part of your expedition is waiting
                for you. Unlock Ally Premium to continue
                your scholarship journey.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onUnlock}
              className={[
                "flex-1 rounded-xl",
                "bg-[#16629b] px-5 py-3",
                "text-sm font-extrabold text-white",
                "shadow-[0_5px_0_#0d466f]",
                "transition",
                "hover:-translate-y-0.5",
                "hover:bg-[#125886]",
                "active:translate-y-0.5",
                "active:shadow-[0_2px_0_#0d466f]",
              ].join(" ")}
            >
              Unlock Quest
            </button>

            <button
              type="button"
              onClick={onClose}
              className={[
                "rounded-xl border border-[#dce2e6]",
                "bg-white px-5 py-3",
                "text-sm font-bold text-slate-600",
                "transition hover:bg-slate-50",
              ].join(" ")}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   Milestone marker
   ========================================================= */

function MilestoneMarker({
  milestone,
  onSelect,
  onMobileToggle,
}: {
  milestone: QuestMilestone;

  onSelect?: (
    milestone: QuestMilestone,
  ) => void;

  onMobileToggle?: (
    milestone: QuestMilestone,
  ) => void;
}) {
  function handleClick(): void {
    if (
      window.matchMedia(
        "(max-width: 767px)",
      ).matches
    ) {
      onMobileToggle?.(milestone);
      return;
    }

    /*
     * IMPORTANT:
     * Locked milestones are now also sent to onSelect.
     * The parent can decide what to do with them.
     */
    onSelect?.(milestone);
  }

  const isLocked =
    milestone.status === "locked";

  const isCurrent =
    milestone.status === "current";

  const isCompleted =
    milestone.status === "completed";

  return (
    <button
      type="button"
      aria-label={`${milestone.name}: ${milestone.status}. Click to open.`}
      onClick={handleClick}
      className={[
        "relative z-20 grid shrink-0 place-items-center",
        "border-4 border-white",
        "transition duration-300",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bcaff]",

        isCurrent
          ? [
              "h-[76px] w-[76px] rounded-[22px]",
              "bg-[#16629b] text-white",
              "shadow-[0_0_0_7px_rgba(155,202,255,0.48),0_9px_24px_rgba(22,98,155,0.32)]",
              "hover:scale-[1.055] hover:brightness-110",
              "sm:h-[88px] sm:w-[88px]",
            ].join(" ")
          : "h-14 w-14 rounded-full sm:h-16 sm:w-16",

        isCompleted
          ? [
              "bg-[#c69c6e] text-white",
              "shadow-[0_0_18px_rgba(198,156,110,0.55)]",
              "hover:-translate-y-1 hover:brightness-105",
            ].join(" ")
          : "",

        isLocked
          ? [
              "cursor-pointer",
              "bg-[#e6eaed]/95 text-[#98a3ad]",
              "shadow-sm",
              "hover:-translate-y-1 hover:bg-white",
            ].join(" ")
          : "cursor-pointer",
      ].join(" ")}
    >
      {isCurrent && (
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
        milestone={milestone}
        size={isCurrent ? 32 : 24}
      />
    </button>
  );
}


/* =========================================================
   Mobile roadmap
   ========================================================= */

function MobileRoadmap({
  milestones,
  onMilestoneSelect,
  onStartAssessment,
  fullPage = false,
}: AscentRoadmapProps) {
  const [
    openMilestoneId,
    setOpenMilestoneId,
  ] = useState<number | null>(null);

  const ascendingMilestones = [
    ...milestones,
  ].reverse();

  function toggleMobilePopover(
    milestone: QuestMilestone,
  ): void {
    setOpenMilestoneId(
      (currentId) =>
        currentId === milestone.id
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
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="absolute bottom-12 left-[43px] top-12 w-0.5 border-l-2 border-dashed border-white/80"
      />

      <div className="space-y-8">
        {ascendingMilestones.map(
          (milestone) => {
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
                  key={milestone.id}
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
                key={milestone.id}
                className="group relative z-20 grid grid-cols-[58px_minmax(0,1fr)] items-center gap-3 focus-within:z-[80]"
              >
                <MilestoneMarker
                  milestone={milestone}
                  onSelect={
                    onMilestoneSelect
                  }
                  onMobileToggle={
                    toggleMobilePopover
                  }
                />

                {showAllyGuide ? (
                  <MilestoneAllyGuide
                    milestone={milestone}
                    message={
                      "Hi! I'm Ally 👋\nLet's start your assessment to unlock your study plan!"
                    }
                    isVisible={isOpen}
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
                    ].join(" ")}
                  >
                    <MilestoneInfoPopover
                      milestone={milestone}
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


/* =========================================================
   Desktop roadmap
   ========================================================= */

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
      ].join(" ")}
    >
      {/* Main expedition path */}
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
        (milestone) => {
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
            position.cardSide === "left";

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
                key={milestone.id}
                className="pointer-events-none absolute z-30"
                style={{
                  top: position.top,
                  left: position.left,
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
              key={milestone.id}
              className="group absolute z-20 hover:z-[80] focus-within:z-[80]"
              style={{
                top: position.top,
                left: position.left,
                transform:
                  "translate(-50%, -50%)",
              }}
            >
              <MilestoneMarker
                milestone={milestone}
                onSelect={
                  onMilestoneSelect
                }
              />

              {showAllyGuide ? (
                <MilestoneAllyGuide
                  milestone={milestone}
                  message={
                    "Hi! I'm Ally 👋\nLet's start your assessment to unlock your study plan!"
                  }
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
                  ].join(" ")}
                >
                  <MilestoneInfoPopover
                    milestone={milestone}
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
        Click a checkpoint to continue your expedition.
      </p>
    </div>
  );
}


/* =========================================================
   Fog / cloud layer
   ========================================================= */

function ExpeditionFog({
  intensity = 1,
}: {
  intensity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      style={{
        opacity: intensity,
      }}
    >
      <div
        className={[
          "absolute -left-[12%] top-[3%]",
          "h-[170px] w-[45%]",
          "rounded-full",
          "bg-white/35",
          "blur-[35px]",
          "animate-[fogDrift_13s_ease-in-out_infinite_alternate]",
        ].join(" ")}
      />

      <div
        className={[
          "absolute right-[-10%] top-[22%]",
          "h-[210px] w-[48%]",
          "rounded-full",
          "bg-white/30",
          "blur-[42px]",
          "animate-[fogDriftReverse_17s_ease-in-out_infinite_alternate]",
        ].join(" ")}
      />

      <div
        className={[
          "absolute left-[20%] top-[35%]",
          "h-[145px] w-[38%]",
          "rounded-full",
          "bg-white/25",
          "blur-[38px]",
          "animate-[fogDrift_19s_ease-in-out_infinite_alternate]",
        ].join(" ")}
      />

      <div
        className={[
          "absolute bottom-[-50px] left-[-10%]",
          "h-[180px] w-[55%]",
          "rounded-full",
          "bg-white/30",
          "blur-[45px]",
          "animate-[fogDriftReverse_15s_ease-in-out_infinite_alternate]",
        ].join(" ")}
      />
    </div>
  );
}


/* =========================================================
   Zoom transition
   ========================================================= */

function ExpeditionZoomOverlay({
  active,
  milestone,
}: {
  active: boolean;
  milestone: QuestMilestone | null;
}) {
  return (
    <div
      aria-hidden={!active}
      className={[
        "pointer-events-none fixed inset-0 z-[250]",
        "grid place-items-center",
        "bg-[#e9f3f4]",
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",

        active
          ? "visible opacity-100"
          : "invisible opacity-0",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0",
          "bg-white",
          "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",

          active
            ? "scale-100"
            : "scale-[1.35]",
        ].join(" ")}
      />

      <div
        className={[
          "relative z-10 text-center",
          "transition-all duration-500",

          active
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-5 scale-90 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] bg-[#16629b] text-white shadow-[0_8px_0_#0d466f]">
          {milestone && (
            <MilestoneIcon
              milestone={milestone}
              size={34}
            />
          )}
        </div>

        <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7a582f]">
          Entering quest
        </p>

        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2c1607]">
          {milestone?.name}
        </h2>

        <div className="mx-auto mt-5 h-1.5 w-20 overflow-hidden rounded-full bg-[#dce5e9]">
          <div className="h-full w-full origin-left animate-[zoomProgress_700ms_ease-out]" />
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   Main component
   ========================================================= */

export default function AscentRoadmap({
  milestones,
  onMilestoneSelect,
  onStartAssessment,
  fullPage = false,
  overlay,
  subscriptionRoute = "/subscription",
}: AscentRoadmapProps) {
  const navigate =
    useNavigate();

  const [
    zoomingMilestone,
    setZoomingMilestone,
  ] = useState<QuestMilestone | null>(
    null,
  );

  const [
    lockedMilestone,
    setLockedMilestone,
  ] = useState<QuestMilestone | null>(
    null,
  );

  const [
    _revealedMilestones,
    setRevealedMilestones,
  ] = useState<
    Set<number>
  >(
    () =>
      new Set(
        milestones
          .filter(
            (milestone) =>
              milestone.isDiscovered ===
                true ||
              milestone.status !==
                "locked",
          )
          .map(
            (milestone) =>
              milestone.id,
          ),
      ),
  );


  /*
   * Keep revealed milestone state synchronized
   * if the API/mock data changes.
   */
  useEffect(() => {
    setRevealedMilestones(
      new Set(
        milestones
          .filter(
            (milestone) =>
              milestone.isDiscovered ===
                true ||
              milestone.status !==
                "locked",
          )
          .map(
            (milestone) =>
              milestone.id,
          ),
      ),
    );
  }, [milestones]);


  /*
   * Current milestone:
   *
   * click
   *   ↓
   * zoom animation
   *   ↓
   * reveal
   *   ↓
   * navigate
   */
  function handleMilestoneClick(
    milestone: QuestMilestone,
  ): void {


    if (
      milestone.status ===
      "locked"
    ) {
      setLockedMilestone(
        milestone,
      );

      return;
    }


    /*
     * Completed/current milestones
     * can trigger the RPG zoom.
     */
    if (
      milestone.destination
    ) {
      setZoomingMilestone(
        milestone,
      );

      setRevealedMilestones(
        (previous) => {
          const next =
            new Set(previous);

          next.add(
            milestone.id,
          );

          return next;
        },
      );

      window.setTimeout(() => {
        onMilestoneSelect?.(
          milestone,
        );

        setZoomingMilestone(
          null,
        );
      }, 700);

      return;
    }


    /*
     * Fallback when milestone has no
     * destination.
     */
    onMilestoneSelect?.(
      milestone,
    );
  }


  function handleUnlockQuest(): void {
    setLockedMilestone(
      null,
    );

    navigate(
      subscriptionRoute,
    );
  }


  return (
    <>
      <section
        aria-label="Your Scholarship Expedition map"
        className={[
          "relative isolate z-0 w-full overflow-hidden bg-[#dbeae7]",

          fullPage
            ? [
                "min-h-[calc(100vh-80px)] max-w-none",
                "rounded-none border-0 shadow-none",
              ].join(" ")
            : [
                "mx-auto max-w-[920px]",
                "rounded-[30px]",
                "border border-[#c3d0d9]",
                "shadow-[0_8px_0_#d8c6ae]",
              ].join(" "),
        ].join(" ")}
      >
        {/* =================================================
            Terrain
        ================================================= */}

        <img
          src={expeditionTerrain}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-white/12"
        />


        {/* =================================================
            Animated atmospheric fog
        ================================================= */}

        <ExpeditionFog />


        {/* =================================================
            Overlay / expedition progress card
        ================================================= */}

        {overlay && (
          <div
            className={[
              "absolute z-[25]",
              "left-4 top-4",
              "w-[calc(100%-2rem)] max-w-[440px]",
              "sm:left-6 sm:top-6 sm:w-[420px]",
              "lg:left-8 lg:top-8 lg:w-[440px]",
            ].join(" ")}
          >
            {overlay}
          </div>
        )}


        {/* =================================================
            Desktop roadmap
        ================================================= */}

        <DesktopRoadmap
          milestones={milestones}
          onMilestoneSelect={
            handleMilestoneClick
          }
          onStartAssessment={
            onStartAssessment
          }
          fullPage={fullPage}
        />


        {/* =================================================
            Mobile roadmap
        ================================================= */}

        <MobileRoadmap
          milestones={milestones}
          onMilestoneSelect={
            handleMilestoneClick
          }
          onStartAssessment={
            onStartAssessment
          }
          fullPage={fullPage}
        />


        {/* =================================================
            Zoom transition
        ================================================= */}

        <ExpeditionZoomOverlay
          active={
            zoomingMilestone !== null
          }
          milestone={
            zoomingMilestone
          }
        />
      </section>


      {/* ===================================================
          Locked quest modal
      =================================================== */}

      {lockedMilestone && (
        <LockedMilestoneModal
          milestone={
            lockedMilestone
          }
          onClose={() =>
            setLockedMilestone(
              null,
            )
          }
          onUnlock={
            handleUnlockQuest
          }
        />
      )}


      {/* ===================================================
          Animation keyframes
      =================================================== */}

      <style>
        {`
          @keyframes fogDrift {
            0% {
              transform: translate3d(-18px, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(12px, -8px, 0) scale(1.04);
            }

            100% {
              transform: translate3d(28px, 6px, 0) scale(1.08);
            }
          }

          @keyframes fogDriftReverse {
            0% {
              transform: translate3d(20px, 4px, 0) scale(1.05);
            }

            50% {
              transform: translate3d(-12px, -5px, 0) scale(1);
            }

            100% {
              transform: translate3d(-28px, 8px, 0) scale(1.08);
            }
          }

          @keyframes zoomProgress {
            from {
              transform: scaleX(0);
            }

            to {
              transform: scaleX(1);
            }
          }
        `}
      </style>
    </>
  );
}