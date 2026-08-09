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
  questions:
    DiagnosticQuestion[];
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
    getOrCreateGuestToken,
  } =
    useDiagnosticGuestToken();

  const [
    submitDialogOpen,
    setSubmitDialogOpen,
  ] =
    useState(
      false,
    );

  const [
    submissionErrorMessage,
    setSubmissionErrorMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const stepContainerRef =
    useRef<
      HTMLDivElement | null
    >(
      null,
    );

  /*
   * Synchronous submit lock.
   *
   * React state updates are asynchronous, so a rapid second
   * confirmation event can arrive before isSubmitting has
   * re-rendered the dialog. This ref changes immediately.
   */
  const submissionLockRef =
    useRef(
      false,
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

  /* =======================================================
     Ensure anonymous assessment identity exists
  ======================================================= */

  useEffect(
    () => {
      /*
       * Guarantee that every anonymous assessment attempt
       * has a guest token.
       *
       * Existing token:
       *   reuse it.
       *
       * Missing token:
       *   generate a new token and save it to localStorage.
       *
       * This means users can safely enter the assessment
       * directly without relying on ChooseAdventurePage to
       * create the token first.
       */
      const guestToken =
        getOrCreateGuestToken();

      if (
        import.meta.env.DEV
      ) {
        console.info(
          "[Diagnostic] Assessment guest token ready:",
          {
            has_guest_token:
              Boolean(
                guestToken,
              ),
          },
        );
      }
    },
    [
      getOrCreateGuestToken,
    ],
  );

  /* =======================================================
     Focus current assessment page
  ======================================================= */

  useEffect(
    () => {
      const animationFrameId =
        window.requestAnimationFrame(
          () => {
            stepContainerRef.current?.focus({
              preventScroll:
                true,
            });

            window.scrollTo({
              top:
                0,

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
    },
    [
      assessment.currentStep,
    ],
  );

  /* =======================================================
     Next page
  ======================================================= */

  const handleNext =
    useCallback(
      (): void => {
        assessment.next();
      },
      [
        assessment,
      ],
    );

  /* =======================================================
     Previous page
  ======================================================= */

  const handlePrevious =
    useCallback(
      (): void => {
        assessment.previous();
      },
      [
        assessment,
      ],
    );

  /* =======================================================
     Jump to completed page
  ======================================================= */

  const handleStepSelect =
    useCallback(
      (
        stepIndex:
          number,
      ): void => {
        assessment.goToCompletedStep(
          stepIndex,
        );
      },
      [
        assessment,
      ],
    );

  /* =======================================================
     Open submission confirmation
  ======================================================= */

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

  /* =======================================================
     Submission-dialog state
  ======================================================= */

  const handleDialogOpenChange =
    useCallback(
      (
        open:
          boolean,
      ): void => {
        if (
          submission.isSubmitting
        ) {
          return;
        }

        setSubmitDialogOpen(
          open,
        );

        if (
          !open
        ) {
          setSubmissionErrorMessage(
            null,
          );

          submission.reset();
        }
      },
      [
        submission,
      ],
    );

  /* =======================================================
     Submit anonymous assessment
  ======================================================= */

  const handleConfirmSubmission =
    useCallback(
      async (): Promise<void> => {
        /*
         * Block duplicate confirmation synchronously.
         */
        if (
          submissionLockRef.current
        ) {
          if (
            import.meta.env.DEV
          ) {
            console.info(
              "[Diagnostic] Duplicate assessment submission blocked.",
            );
          }

          return;
        }

        submissionLockRef.current =
          true;

        setSubmissionErrorMessage(
          null,
        );

        try {
          const answersPayload =
            assessment
              .buildSubmissionPayload();

          /*
           * The assessment attempt should already have a token.
           * Never generate a different token during submission.
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

          if (
            import.meta.env.DEV
          ) {
            console.info(
              "[Diagnostic] Submitting anonymous assessment:",
              {
                assessment_type:
                  payload
                    .assessment_type,

                has_guest_token:
                  Boolean(
                    payload
                      .guest_token,
                  ),

                answer_count:
                  payload
                    .answers
                    .length,
              },
            );
          }

          /*
           * POST is status-only on the frontend.
           *
           * Once it succeeds, navigate immediately. Do not clear
           * local assessment progress before the route transition.
           */
          await submission.submit(
            payload,
          );

          if (
            import.meta.env.DEV
          ) {
            console.info(
              "[Diagnostic] POST succeeded. Navigating to result.",
              {
                target:
                  DIAGNOSTIC_RESULT_ROUTE,

                has_guest_token:
                  true,

                current_path:
                  window.location.pathname,
              },
            );
          }

          /*
           * Keep localStorage as the primary token source, and
           * also pass the same token in route state as a fallback.
           */
          navigate(
            DIAGNOSTIC_RESULT_ROUTE,
            {
              replace:
                true,

              state: {
                guestToken,
              },
            },
          );

          /*
           * Keep the synchronous lock engaged after success.
           * This component is leaving the assessment route.
           */
        } catch (
          submissionError:
            unknown
        ) {
          submissionLockRef.current =
            false;

          setSubmissionErrorMessage(
            submissionError instanceof
              Error
              ? submissionError.message
              : "Unable to submit the assessment. Please try again.",
          );

          if (
            import.meta.env.DEV
          ) {
            console.error(
              "[Diagnostic] Assessment submission failed.",
              submissionError,
            );
          }
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
        ].join(
          " ",
        )}
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
          tabIndex={
            -1
          }
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
              .questions
              .length >
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

  if (
    isLoading
  ) {
    return (
      <LoadingSkeleton />
    );
  }

  if (
    error
  ) {
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

  if (
    isEmpty
  ) {
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