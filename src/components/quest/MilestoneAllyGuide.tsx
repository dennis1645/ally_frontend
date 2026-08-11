import {
  ArrowRight,
  Compass,
} from "lucide-react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import type {
  QuestMilestone,
} from "../../types/questTracker";

type MilestoneAllyGuideProps = {
  milestone:
    QuestMilestone;

  message:
    string;

  isVisible:
    boolean;

  onStart:
    () => void;

  position?:
    | "left"
    | "right";

  layout?:
    | "desktop"
    | "mobile";
};

export default function MilestoneAllyGuide({
  milestone,
  message,
  isVisible,
  onStart,
  position = "left",
  layout = "desktop",
}: MilestoneAllyGuideProps) {
  /*
   * The assessment prompt belongs only to the active
   * Research Trail milestone.
   *
   * If the milestone becomes completed or locked later,
   * this guide automatically stops rendering without any
   * duplicated progress state.
   */
  const canStartAssessment =
    milestone.name ===
      "Research Trail" &&
    milestone.status ===
      "current";

  if (
    !canStartAssessment
  ) {
    return null;
  }

  const isMobile =
    layout ===
    "mobile";

  const bubblePointerClass =
    isMobile ||
    position ===
      "right"
      ? [
          "-left-2 top-8",
          "border-b-2 border-l-2",
        ].join(
          " ",
        )
      : [
          "-right-2 top-8",
          "border-r-2 border-t-2",
        ].join(
          " ",
        );

  return (
    <aside
      aria-label="Guidance from Ally for Research Trail"
      className={[
        "z-40",
        "transition-all duration-200 ease-out",
        "motion-reduce:transform-none motion-reduce:transition-none",
        isMobile
          ? [
              "relative flex w-full items-end gap-2.5",
              "overflow-hidden",
              isVisible
                ? "max-h-[330px] translate-y-0 opacity-100"
                : "pointer-events-none max-h-0 -translate-y-2 opacity-0",
            ].join(
              " ",
            )
          : [
              "pointer-events-auto absolute top-1/2",
              "flex w-[390px] -translate-y-1/2 items-end gap-3",
              "invisible scale-[0.96] opacity-0",
              "group-hover:visible group-hover:scale-100 group-hover:opacity-100",
              "group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100",
              position ===
              "left"
                ? "right-[calc(100%+20px)] origin-right flex-row-reverse translate-x-2 group-hover:translate-x-0 group-focus-within:translate-x-0"
                : "left-[calc(100%+20px)] origin-left -translate-x-2 group-hover:translate-x-0 group-focus-within:translate-x-0",
            ].join(
              " ",
            ),
      ].join(
        " ",
      )}
    >
      <div
        className={[
          "relative shrink-0 self-end",
          isMobile
            ? "w-[76px]"
            : "w-[112px]",
        ].join(
          " ",
        )}
      >
        <div
          aria-hidden="true"
          className={[
            "absolute bottom-1 left-1/2 -z-10 -translate-x-1/2",
            "rounded-[100%] bg-[#4b392d]/15 blur-md",
            isMobile
              ? "h-4 w-14"
              : "h-5 w-20",
          ].join(
            " ",
          )}
        />

        <img
          src={
            allyMascot
          }
          alt="Ally, your scholarship expedition guide"
          className={[
            "block w-full object-contain object-bottom",
            "drop-shadow-[0_7px_6px_rgba(44,22,7,0.16)]",
            isVisible
              ? "translate-y-0 opacity-100"
              : "",
          ].join(
            " ",
          )}
        />
      </div>

      <div
        className={[
          "relative min-w-0 flex-1",
          "rounded-2xl border-2 border-[#b99568]",
          "bg-[#fff8e9]/95 text-left",
          "shadow-[0_6px_0_rgba(122,88,47,0.22),0_14px_30px_rgba(44,22,7,0.14)]",
          "backdrop-blur-sm",
          isMobile
            ? "px-3.5 py-3.5"
            : "px-5 py-4",
        ].join(
          " ",
        )}
      >
        <span
          aria-hidden="true"
          className={[
            "absolute h-4 w-4 rotate-45",
            "border-[#b99568] bg-[#fff8e9]",
            bubblePointerClass,
          ].join(
            " ",
          )}
        />

        <div className="flex items-center gap-1.5 text-[#16629b]">
          <Compass
            size={
              isMobile
                ? 13
                : 15
            }
            strokeWidth={2.4}
            aria-hidden="true"
          />

          <span
            className={[
              "font-extrabold uppercase tracking-[0.12em]",
              isMobile
                ? "text-[9px]"
                : "text-[10px]",
            ].join(
              " ",
            )}
          >
            Ally · Expedition Guide
          </span>
        </div>

        <p
          className={[
            "mt-2 whitespace-pre-line font-semibold text-[#3d2514]",
            isMobile
              ? "text-xs leading-5"
              : "text-sm leading-6",
          ].join(
            " ",
          )}
        >
          {
            message
          }
        </p>

        <button
          type="button"
          aria-label="Start assessment with Ally"
          onClick={(
            event,
          ) => {
            /*
             * The guide sits inside the checkpoint interaction
             * group. Stop propagation so pressing the CTA does
             * not also trigger the checkpoint's existing click
             * behavior.
             */
            event.stopPropagation();

            onStart();
          }}
          className={[
            "mt-3 inline-flex min-h-10 items-center justify-center gap-1.5",
            "rounded-xl border-2 border-[#00497a]",
            "bg-[#16629b] px-4 py-2",
            "text-xs font-extrabold text-white",
            "shadow-[0_4px_0_#00497a]",
            "transition duration-150",
            "hover:-translate-y-0.5 hover:bg-[#0f6fa9]",
            "active:translate-y-[2px] active:shadow-[0_2px_0_#00497a]",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bcaff]",
            "motion-reduce:transform-none motion-reduce:transition-none",
          ].join(
            " ",
          )}
        >
          Start Assessment

          <ArrowRight
            size={15}
            strokeWidth={2.4}
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}