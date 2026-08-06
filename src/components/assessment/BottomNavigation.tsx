import {
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
} from "lucide-react";

import {
  memo,
} from "react";

import PrimaryButton from "../ui/PrimaryButton";

export type BottomNavigationProps = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];

  isLastStep: boolean;
  isSubmitting: boolean;
  canGoPrevious: boolean;

  validationMessage:
    string | null;

  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;

  onStepSelect: (
    stepIndex: number,
  ) => void;
};

function BottomNavigationComponent({
  currentStep,
  totalSteps,
  completedSteps,
  isLastStep,
  isSubmitting,
  canGoPrevious,
  validationMessage,
  onPrevious,
  onNext,
  onSubmit,
  onStepSelect,
}: BottomNavigationProps) {
  const steps =
    Array.from(
      {
        length: totalSteps,
      },
      (
        _,
        index,
      ) => index,
    );

  return (
    <footer
      className={[
        "fixed inset-x-0 bottom-0 z-40",
        "border-t border-[#eadfd9]",
        "bg-white/95",
        "shadow-[0_-8px_24px_rgba(67,36,22,0.07)]",
        "backdrop-blur-md",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Validation message */}

        {validationMessage && (
          <div
            aria-live="polite"
            className="mb-2 text-center"
          >
            <p className="text-xs font-semibold leading-5 text-[#ba1a1a] sm:text-sm">
              {validationMessage}
            </p>
          </div>
        )}

        {/* Navigation row */}

        <div
          className={[
            "grid items-center gap-3",
            "grid-cols-[auto_minmax(0,1fr)_auto]",
            "sm:gap-6",
          ].join(" ")}
        >
          {/* Previous button */}

          <button
            type="button"
            disabled={
              !canGoPrevious ||
              isSubmitting
            }
            onClick={
              onPrevious
            }
            className={[
              "inline-flex h-11 items-center justify-center gap-2",
              "rounded-xl border border-[#d8d0cb]",
              "bg-white px-3",
              "text-sm font-bold text-[#1c64a5]",
              "transition-all duration-200",
              "hover:border-[#a8c9e3]",
              "hover:bg-[#f3f8fc]",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#6ba8e6]/25",
              "disabled:cursor-not-allowed",
              "disabled:bg-[#faf9f8]",
              "disabled:text-[#b6aca7]",
              "disabled:opacity-70",
              "sm:min-w-32 sm:px-5",
            ].join(" ")}
          >
            <ArrowLeft
              size={18}
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              Previous
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </button>

          {/* Compact progress stepper */}

          <nav
            aria-label="Assessment pages"
            className="min-w-0"
          >
            <ol className="mx-auto flex w-full max-w-sm items-center">
              {steps.map(
                (
                  stepIndex,
                ) => {
                  const isCurrent =
                    stepIndex ===
                    currentStep;

                  const isCompleted =
                    completedSteps.includes(
                      stepIndex,
                    );

                  const canSelect =
                    isCompleted &&
                    !isCurrent &&
                    !isSubmitting;

                  const connectorCompleted =
                    stepIndex <
                    currentStep;

                  return (
                    <li
                      key={
                        stepIndex
                      }
                      className={[
                        "flex items-center",
                        stepIndex <
                        steps.length - 1
                          ? "flex-1"
                          : "flex-none",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        aria-current={
                          isCurrent
                            ? "step"
                            : undefined
                        }
                        aria-label={`Page ${
                          stepIndex + 1
                        } of ${totalSteps}${
                          isCompleted
                            ? ", completed"
                            : ""
                        }`}
                        disabled={
                          !canSelect
                        }
                        onClick={() =>
                          onStepSelect(
                            stepIndex,
                          )
                        }
                        className={[
                          "relative z-10 grid h-9 w-9 shrink-0",
                          "place-items-center rounded-full",
                          "border-2 text-xs font-extrabold",
                          "transition-all duration-200",
                          "focus-visible:outline-none",
                          "focus-visible:ring-4",
                          "focus-visible:ring-[#6ba8e6]/25",

                          isCurrent
                            ? [
                                "scale-105",
                                "border-[#1c64a5]",
                                "bg-[#1c64a5]",
                                "text-white",
                                "shadow-[0_3px_9px_rgba(28,100,165,0.24)]",
                              ].join(" ")
                            : isCompleted
                              ? [
                                  "border-[#6ba8e6]",
                                  "bg-[#e4f1fb]",
                                  "text-[#1c64a5]",
                                  "enabled:hover:bg-[#d3e8f8]",
                                ].join(" ")
                              : [
                                  "border-[#d9d1cc]",
                                  "bg-white",
                                  "text-[#998b83]",
                                ].join(" "),
                        ].join(" ")}
                      >
                        {isCompleted &&
                        !isCurrent ? (
                          <Check
                            size={15}
                            strokeWidth={3}
                            aria-hidden="true"
                          />
                        ) : (
                          stepIndex + 1
                        )}
                      </button>

                      {stepIndex <
                        steps.length -
                          1 && (
                        <div
                          aria-hidden="true"
                          className={[
                            "h-0.5 min-w-3 flex-1",
                            "transition-colors duration-300",
                            connectorCompleted
                              ? "bg-[#6ba8e6]"
                              : "bg-[#e2dbd7]",
                          ].join(" ")}
                        />
                      )}
                    </li>
                  );
                },
              )}
            </ol>
          </nav>

          {/* Continue / Submit button */}

          <PrimaryButton
            type="button"
            size="lg"
            isLoading={
              isSubmitting
            }
            loadingText="Submitting..."
            rightIcon={
              isLastStep ? (
                <Send
                  size={17}
                  aria-hidden="true"
                />
              ) : (
                <ArrowRight
                  size={19}
                  aria-hidden="true"
                />
              )
            }
            onClick={
              isLastStep
                ? onSubmit
                : onNext
            }
            className={[
              "h-11 min-h-11",
              "min-w-[120px]",
              "justify-center px-4",
              "text-sm",
              "sm:min-w-[170px]",
              "sm:px-6 sm:text-base",
            ].join(" ")}
          >
            <span className="hidden sm:inline">
              {isLastStep
                ? "Submit Assessment"
                : "Continue"}
            </span>

            <span className="sm:hidden">
              {isLastStep
                ? "Submit"
                : "Next"}
            </span>
          </PrimaryButton>
        </div>
      </div>
    </footer>
  );
}

export const BottomNavigation =
  memo(
    BottomNavigationComponent,
  );

BottomNavigation.displayName =
  "BottomNavigation";