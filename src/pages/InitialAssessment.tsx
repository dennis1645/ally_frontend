import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
} from "lucide-react";

import allyMascot from "../assets/ally-assessment-mascot.png";

import {
  AllySpeechBubble,
  AssessmentHeader,
  BottomNavigation,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  QuestionCard,
  QuestionItem,
  SectionTitle,
  SubmitDialog,
} from "../components/assessment";

import {
  useAssessment,
} from "../hooks/useAssessment";

import {
  useDiagnosticQuestions,
} from "../hooks/useDiagnosticQuestions";

import {
  useSubmitAssessment,
} from "../hooks/useSubmitAssessment";

import type {
  DiagnosticQuestion,
} from "../types/diagnostic";

/* =========================================================
   Loaded assessment experience
========================================================= */

type AssessmentExperienceProps = {
  questions: DiagnosticQuestion[];
};

function AssessmentExperience({
  questions,
}: AssessmentExperienceProps) {
  const assessment =
    useAssessment({
      questions,
    });

  const submission =
    useSubmitAssessment();

  const [
    submitDialogOpen,
    setSubmitDialogOpen,
  ] =
    useState(false);

  const [
    submissionComplete,
    setSubmissionComplete,
  ] =
    useState(false);

  const [
    submissionErrorMessage,
    setSubmissionErrorMessage,
  ] =
    useState<string | null>(
      null,
    );

  const stepContainerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const unansweredQuestionSet =
    useMemo(
      () =>
        new Set(
          assessment
            .unansweredQuestionIds,
        ),
      [
        assessment
          .unansweredQuestionIds,
      ],
    );

  const showQuestionErrors =
    assessment.validationMessage !==
    null;

  /*
   * Focus and scroll to the beginning whenever the
   * visible assessment page changes.
   */
  useEffect(() => {
    if (
      submissionComplete
    ) {
      return;
    }

    const animationFrameId =
      window.requestAnimationFrame(
        () => {
          stepContainerRef.current?.focus({
            preventScroll:
              true,
          });

          window.scrollTo({
            top: 0,
            behavior:
              "smooth",
          });
        },
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );
    };
  }, [
    assessment.currentStep,
    submissionComplete,
  ]);

  const handleNext =
    useCallback(
      (): void => {
        assessment.next();
      },
      [assessment],
    );

  const handlePrevious =
    useCallback(
      (): void => {
        assessment.previous();
      },
      [assessment],
    );

  const handleStepSelect =
    useCallback(
      (
        stepIndex: number,
      ): void => {
        assessment.goToCompletedStep(
          stepIndex,
        );
      },
      [assessment],
    );

  const handleSubmitRequest =
    useCallback(
      (): void => {
        /*
         * Page four must also be valid before the confirmation
         * dialog can open.
         */
        const pageIsValid =
          assessment.validateCurrentPage();

        if (
          !pageIsValid
        ) {
          return;
        }

        setSubmissionErrorMessage(
          null,
        );

        submission.reset();

        setSubmitDialogOpen(
          true,
        );
      },
      [
        assessment,
        submission,
      ],
    );

  const handleDialogOpenChange =
    useCallback(
      (
        open: boolean,
      ): void => {
        if (
          submission.isSubmitting
        ) {
          return;
        }

        setSubmitDialogOpen(
          open,
        );

        if (!open) {
          setSubmissionErrorMessage(
            null,
          );

          submission.reset();
        }
      },
      [submission],
    );

  const handleConfirmSubmission =
    useCallback(
      async (): Promise<void> => {
        setSubmissionErrorMessage(
          null,
        );

        try {
          const payload =
            assessment
              .buildSubmissionPayload();

          await submission.submit(
            payload,
          );

          /*
           * Clear saved answers only after the backend confirms
           * that submission succeeded.
           */
          assessment.clearAssessment();

          setSubmitDialogOpen(
            false,
          );

          setSubmissionComplete(
            true,
          );

          window.scrollTo({
            top: 0,
            behavior:
              "smooth",
          });
        } catch (
          submissionError
        ) {
          setSubmissionErrorMessage(
            submissionError instanceof
              Error
              ? submissionError.message
              : "Unable to submit the assessment. Please try again.",
          );
        }
      },
      [
        assessment,
        submission,
      ],
    );

  /* =======================================================
     Submission success
  ======================================================= */

  if (
    submissionComplete
  ) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <AssessmentHeader />

        <main className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-4xl place-items-center px-4 py-16 sm:px-6 lg:px-8">
          <section
            aria-labelledby="assessment-submitted-title"
            className={[
              "w-full max-w-lg rounded-3xl",
              "border border-[#e8ddd7] bg-white",
              "p-8 text-center",
              "shadow-[0_8px_30px_rgba(67,36,22,0.07)]",
              "sm:p-10",
            ].join(" ")}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e9f7ef] text-[#27865b]">
              <CheckCircle2
                size={34}
                strokeWidth={
                  2.4
                }
                aria-hidden="true"
              />
            </div>

            <h1
              id="assessment-submitted-title"
              className="mt-6 text-2xl font-bold tracking-tight text-[#331a0e] sm:text-3xl"
            >
              Assessment Submitted
            </h1>

            <p className="mt-4 text-sm leading-7 text-[#6c5950] sm:text-base">
              Your answers have been
              submitted successfully.
              Ally can now calculate
              your scholarship
              readiness.
            </p>
          </section>
        </main>
      </div>
    );
  }

  /* =======================================================
     Assessment pages
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <AssessmentHeader />

      <main className="mx-auto w-full max-w-4xl px-4 pb-56 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <AllySpeechBubble
          message={
            assessment
              .currentPage
              .speech
          }
          mascotSrc={
            allyMascot
          }
        />

        <div
          ref={
            stepContainerRef
          }
          tabIndex={-1}
          aria-label={`Assessment page ${
            assessment.currentStep +
            1
          }: ${
            assessment
              .currentPage
              .title
          }`}
          className="mt-10 outline-none"
        >
          <SectionTitle
            assessmentTitle="Initial Assessment"
            sectionTitle={
              assessment
                .currentPage
                .title
            }
            description={
              assessment
                .currentPage
                .description
            }
            currentStep={
              assessment.currentStep +
              1
            }
            totalSteps={
              assessment.pages.length
            }
          />

          <QuestionCard>
            {assessment
              .currentPage
              .questions.length >
            0 ? (
              <div className="divide-y divide-[#eee4df]">
                {assessment.currentPage.questions.map(
                  (
                    question,
                    questionIndex,
                  ) => {
                    const isFirst =
                      questionIndex ===
                      0;

                    const isLast =
                      questionIndex ===
                      assessment
                        .currentPage
                        .questions
                        .length -
                        1;

                    return (
                      <div
                        key={
                          question.id
                        }
                        className={[
                          isFirst
                            ? "pb-8"
                            : "py-8",

                          isLast
                            ? "pb-0"
                            : "",
                        ].join(
                          " ",
                        )}
                      >
                        <QuestionItem
                          question={
                            question
                          }
                          selectedOptionId={
                            assessment
                              .answers[
                              String(
                                question.id,
                              )
                            ]
                          }
                          hasError={
                            showQuestionErrors &&
                            unansweredQuestionSet.has(
                              question.id,
                            )
                          }
                          disabled={
                            submission
                              .isSubmitting
                          }
                          onAnswer={
                            assessment
                              .setAnswer
                          }
                        />
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm leading-6 text-[#6c5950]">
                  No questions are
                  available for this
                  page.
                </p>
              </div>
            )}
          </QuestionCard>
        </div>
      </main>

      <BottomNavigation
        currentStep={
          assessment.currentStep
        }
        totalSteps={
          assessment.pages.length
        }
        completedSteps={
          assessment.completedSteps
        }
        isLastStep={
          assessment.isLastPage
        }
        isSubmitting={
          submission.isSubmitting
        }
        canGoPrevious={
          assessment.canGoPrevious
        }
        validationMessage={
          assessment
            .validationMessage
        }
        onPrevious={
          handlePrevious
        }
        onNext={
          handleNext
        }
        onSubmit={
          handleSubmitRequest
        }
        onStepSelect={
          handleStepSelect
        }
      />

      <SubmitDialog
        open={
          submitDialogOpen
        }
        isSubmitting={
          submission.isSubmitting
        }
        errorMessage={
          submissionErrorMessage ??
          submission.error
            ?.message ??
          null
        }
        onOpenChange={
          handleDialogOpenChange
        }
        onConfirm={
          handleConfirmSubmission
        }
      />
    </div>
  );
}

/* =========================================================
   Page states
========================================================= */

export default function InitialAssessment() {
  const {
    questions,
    isLoading,
    isEmpty,
    error,
    retry,
  } =
    useDiagnosticQuestions();

  if (isLoading) {
    return (
      <LoadingSkeleton />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <AssessmentHeader />

        <ErrorState
          title="Unable to load assessment"
          message={
            error.message ||
            "Something went wrong while loading the assessment."
          }
          onRetry={() => {
            void retry();
          }}
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-[#fff8f5]">
        <AssessmentHeader />

        <EmptyState
          title="No assessment questions available"
          message="No assessment questions are currently available. Please check again later."
        />
      </div>
    );
  }

  return (
    <AssessmentExperience
      questions={
        questions
      }
    />
  );
}