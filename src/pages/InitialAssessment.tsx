import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  useDiagnosticGuestToken,
} from "../hooks/useDiagnosticGuestToken";

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

import {
  DIAGNOSTIC_RESULT_ROUTE,
  INITIAL_DIAGNOSTIC_ASSESSMENT_TYPE,
} from "../utils/constants";

import type {
  DiagnosticQuestion,
  SubmitAssessmentPayload,
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

  const navigate =
    useNavigate();

  const submission =
    useSubmitAssessment();

  const {
    getGuestToken,
  } =
    useDiagnosticGuestToken();

  const [
    submitDialogOpen,
    setSubmitDialogOpen,
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
         * The final assessment page must be valid before
         * the confirmation dialog can open.
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
          /*
           * useAssessment returns only the answers selected
           * during the current assessment attempt.
           */
          const answersPayload =
            assessment
              .buildSubmissionPayload();

          /*
           * The token was generated when the visitor clicked
           * Start Free Assessment on ChooseAdventurePage.
           *
           * Read that token here instead of silently generating
           * or replacing it during submission.
           */
          const guestToken =
            getGuestToken();

          if (
            !guestToken
          ) {
            throw new Error(
              "No guest token was found for this assessment attempt. Please return to Choose Adventure and start the assessment again.",
            );
          }

          const payload:
            SubmitAssessmentPayload = {
            assessment_type:
              INITIAL_DIAGNOSTIC_ASSESSMENT_TYPE,

            guest_token:
              guestToken,

            answers:
              answersPayload.answers,
          };

          /*
           * Wait for the backend to calculate and store the
           * anonymous result under this guest token.
           */
          await submission.submit(
            payload,
          );

          /*
           * Clear only the saved answers and page progress.
           * Keep the guest token because the result page needs
           * the same token for GET /api/diagnostic/my-result.
           */
          assessment.clearAssessment();

          setSubmitDialogOpen(
            false,
          );

          /*
           * Redirect immediately after successful submission.
           * DiagnosticResultPage will use the existing token to
           * retrieve and display the anonymous result.
           */
          navigate(
            DIAGNOSTIC_RESULT_ROUTE,
            {
              replace:
                true,
            },
          );
        } catch (
          submissionError: unknown
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
        getGuestToken,
        navigate,
        submission,
      ],
    );

  /* =======================================================
     Assessment pages
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#fff8f5]">
      <AssessmentHeader />

      <main
        className={[
          "mx-auto w-full max-w-4xl",
          "px-4 pb-56 pt-8",
          "sm:px-6 sm:pt-10",
          "lg:px-8",
        ].join(" ")}
      >
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