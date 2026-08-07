import {
  memo,
  useCallback,
  useMemo,
} from "react";

import { Check } from "lucide-react";

export type ProgressStepperProps = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];

  onStepSelect?: (
    stepIndex: number,
  ) => void;
};

function ProgressStepperComponent({
  currentStep,
  totalSteps,
  completedSteps,
  onStepSelect,
}: ProgressStepperProps) {
  const completedStepSet =
    useMemo(
      () =>
        new Set(
          completedSteps,
        ),
      [completedSteps],
    );

  const handleStepSelect =
    useCallback(
      (
        stepIndex: number,
      ): void => {
        const isCompleted =
          completedStepSet.has(
            stepIndex,
          );

        const isPreviousStep =
          stepIndex <
          currentStep;

        if (
          !isCompleted ||
          !isPreviousStep
        ) {
          return;
        }

        onStepSelect?.(
          stepIndex,
        );
      },
      [
        completedStepSet,
        currentStep,
        onStepSelect,
      ],
    );

  return (
    <nav
      aria-label="Assessment progress"
      className="flex items-center justify-center gap-2 sm:gap-3"
    >
      {Array.from(
        {
          length:
            totalSteps,
        },
        (
          _,
          stepIndex,
        ) => {
          const isCurrent =
            stepIndex ===
            currentStep;

          const isCompleted =
            completedStepSet.has(
              stepIndex,
            );

          const canNavigate =
            isCompleted &&
            stepIndex <
              currentStep &&
            Boolean(
              onStepSelect,
            );

          let accessibleLabel =
            `Step ${stepIndex + 1}`;

          if (isCurrent) {
            accessibleLabel +=
              ", current step";
          } else if (
            isCompleted
          ) {
            accessibleLabel +=
              ", completed";
          } else {
            accessibleLabel +=
              ", not completed";
          }

          return (
            <button
              key={
                stepIndex
              }
              type="button"
              aria-label={
                accessibleLabel
              }
              aria-current={
                isCurrent
                  ? "step"
                  : undefined
              }
              disabled={
                !canNavigate
              }
              onClick={() =>
                handleStepSelect(
                  stepIndex,
                )
              }
              className={[
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                "border-2 text-xs font-bold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-4",
                "focus-visible:ring-[#1c64a5]/20",

                isCompleted
                  ? "border-[#1c64a5] bg-[#1c64a5] text-white"
                  : "",

                isCurrent &&
                !isCompleted
                  ? "border-[#1c64a5] bg-[#1c64a5] text-white shadow-sm"
                  : "",

                !isCurrent &&
                !isCompleted
                  ? "border-[#c6d7e7] bg-white text-[#8395a5]"
                  : "",

                canNavigate
                  ? "cursor-pointer hover:bg-[#134778]"
                  : "cursor-default disabled:opacity-100",
              ].join(
                " ",
              )}
            >
              {isCompleted ? (
                <Check
                  size={15}
                  strokeWidth={
                    3
                  }
                  aria-hidden="true"
                />
              ) : (
                <span aria-hidden="true">
                  {stepIndex +
                    1}
                </span>
              )}
            </button>
          );
        },
      )}
    </nav>
  );
}

export const ProgressStepper =
  memo(
    ProgressStepperComponent,
  );

ProgressStepper.displayName =
  "ProgressStepper";