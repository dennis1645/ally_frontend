import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocalStorage,
} from "./useLocalStorage";

import {
  ASSESSMENT_STORAGE_KEY,
  ASSESSMENT_STORAGE_VERSION,
} from "../utils/constants";

import {
  createEmptyAssessmentState,
  deserializeAssessmentState,
  serializeAssessmentState,
} from "../utils/assessmentStorage";

import {
  paginateQuestions,
} from "../utils/paginateQuestions";

import {
  validateSectionAnswers,
} from "../utils/validation";

import type {
  AssessmentAnswers,
  AssessmentAnswersPayload,
  AssessmentPage,
  DiagnosticQuestion,
  PersistedAssessmentState,
} from "../types/diagnostic";

/* =========================================================
   Public types
========================================================= */

export type UseAssessmentOptions = {
  questions:
    DiagnosticQuestion[];
};

export type UseAssessmentReturn = {
  /*
   * Frontend assessment pages.
   *
   * Twenty questions become four pages containing
   * five questions each.
   */
  pages:
    AssessmentPage[];

  /*
   * Currently visible page.
   */
  currentPage:
    AssessmentPage;

  /*
   * Zero-based page index.
   */
  currentStep: number;

  /*
   * Selected options keyed by question ID.
   *
   * Example:
   * {
   *   "1": 5,
   *   "2": 10
   * }
   */
  answers:
    AssessmentAnswers;

  /*
   * Zero-based indexes of completed pages.
   */
  completedSteps:
    number[];

  isLastPage: boolean;

  canGoPrevious: boolean;

  validationMessage:
    string | null;

  unansweredQuestionIds:
    number[];

  answeredQuestionCount:
    number;

  totalQuestionCount:
    number;

  setAnswer: (
    questionId: number,
    optionId: number,
  ) => void;

  next: () => boolean;

  previous: () => void;

  goToCompletedStep: (
    stepIndex: number,
  ) => void;

  validateCurrentPage:
    () => boolean;

  /*
   * Returns only the answers.
   *
   * InitialAssessment.tsx adds:
   * - assessment_type
   * - guest_token
   */
  buildSubmissionPayload:
    () => AssessmentAnswersPayload;

  clearAssessment: () => void;
};

/* =========================================================
   Empty page fallback
========================================================= */

const EMPTY_ASSESSMENT_PAGE:
  AssessmentPage = {
    key:
      "empty",

    title:
      "Initial Assessment",

    description:
      "No assessment questions are available.",

    speech:
      "The assessment is not available right now.",

    questions:
      [],
  };

/* =========================================================
   Internal helpers
========================================================= */

function clampNumber(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
  );
}

function uniqueSortedNumbers(
  values: number[],
): number[] {
  return [
    ...new Set(
      values,
    ),
  ].sort(
    (
      first,
      second,
    ) =>
      first -
      second,
  );
}

function areNumberArraysEqual(
  first: number[],
  second: number[],
): boolean {
  return (
    first.length ===
      second.length &&
    first.every(
      (
        value,
        index,
      ) =>
        value ===
        second[index],
    )
  );
}

function areAnswerMapsEqual(
  first:
    AssessmentAnswers,
  second:
    AssessmentAnswers,
): boolean {
  const firstEntries =
    Object.entries(
      first,
    );

  const secondEntries =
    Object.entries(
      second,
    );

  if (
    firstEntries.length !==
    secondEntries.length
  ) {
    return false;
  }

  return firstEntries.every(
    ([
      questionId,
      optionId,
    ]) =>
      second[
        questionId
      ] ===
      optionId,
  );
}

/**
 * Verify that an answer belongs to a real question and that
 * its selected option belongs to that question.
 */
function sanitizeAnswers(
  answers:
    AssessmentAnswers,
  questionById:
    Map<
      number,
      DiagnosticQuestion
    >,
): AssessmentAnswers {
  const sanitizedAnswers:
    AssessmentAnswers = {};

  for (
    const [
      questionIdKey,
      optionId,
    ] of Object.entries(
      answers,
    )
  ) {
    const questionId =
      Number(
        questionIdKey,
      );

    if (
      !Number.isInteger(
        questionId,
      ) ||
      questionId <= 0 ||
      !Number.isInteger(
        optionId,
      ) ||
      optionId <= 0
    ) {
      continue;
    }

    const question =
      questionById.get(
        questionId,
      );

    if (!question) {
      continue;
    }

    const optionExists =
      question.options.some(
        (option) =>
          option.id ===
          optionId,
      );

    if (!optionExists) {
      continue;
    }

    sanitizedAnswers[
      String(
        questionId,
      )
    ] =
      optionId;
  }

  return sanitizedAnswers;
}

/**
 * Keep only valid completed-page indexes.
 *
 * A page remains completed only when all questions on that
 * page still have valid answers.
 */
function sanitizeCompletedSteps(
  completedSteps: number[],
  pages:
    AssessmentPage[],
  answers:
    AssessmentAnswers,
): number[] {
  const validSteps =
    completedSteps.filter(
      (stepIndex) => {
        if (
          !Number.isInteger(
            stepIndex,
          ) ||
          stepIndex < 0 ||
          stepIndex >=
            pages.length
        ) {
          return false;
        }

        const page =
          pages[
            stepIndex
          ];

        if (!page) {
          return false;
        }

        return validateSectionAnswers(
          page.questions,
          answers,
        ).valid;
      },
    );

  return uniqueSortedNumbers(
    validSteps,
  );
}

/* =========================================================
   Hook
========================================================= */

export function useAssessment({
  questions,
}: UseAssessmentOptions): UseAssessmentReturn {
  const {
    value:
      persistedState,

    setValue:
      setPersistedState,

    removeValue:
      removePersistedState,
  } =
    useLocalStorage<PersistedAssessmentState>(
      ASSESSMENT_STORAGE_KEY,
      createEmptyAssessmentState,
      {
        serialize:
          serializeAssessmentState,

        deserialize:
          deserializeAssessmentState,

        onError: (
          error,
        ) => {
          if (
            import.meta.env.DEV
          ) {
            console.error(
              "[Assessment] Local-storage error:",
              error,
            );
          }
        },
      },
    );

  const [
    validationMessage,
    setValidationMessage,
  ] =
    useState<string | null>(
      null,
    );

  /* =======================================================
     Create frontend pages
  ======================================================= */

  const pages =
    useMemo(
      () =>
        paginateQuestions(
          questions,
        ),
      [
        questions,
      ],
    );

  const maximumStepIndex =
    Math.max(
      pages.length -
        1,
      0,
    );

  const currentStep =
    clampNumber(
      persistedState
        .currentStep,
      0,
      maximumStepIndex,
    );

  const currentPage =
    pages[
      currentStep
    ] ??
    EMPTY_ASSESSMENT_PAGE;

  const isLastPage =
    pages.length >
      0 &&
    currentStep ===
      pages.length -
        1;

  const canGoPrevious =
    currentStep >
    0;

  /* =======================================================
     Question lookup
  ======================================================= */

  const questionById =
    useMemo(
      () =>
        new Map<
          number,
          DiagnosticQuestion
        >(
          questions.map(
            (
              question,
            ) => [
              question.id,
              question,
            ],
          ),
        ),
      [
        questions,
      ],
    );

  /* =======================================================
     Current-page validation
  ======================================================= */

  const validationResult =
    useMemo(
      () =>
        validateSectionAnswers(
          currentPage
            .questions,
          persistedState
            .answers,
        ),
      [
        currentPage
          .questions,
        persistedState
          .answers,
      ],
    );

  const unansweredQuestionIds =
    validationResult
      .unansweredQuestionIds;

  /* =======================================================
     Assessment statistics
  ======================================================= */

  const answeredQuestionCount =
    useMemo(
      () =>
        questions.reduce(
          (
            total,
            question,
          ) => {
            const selectedOptionId =
              persistedState
                .answers[
                String(
                  question.id,
                )
              ];

            const selectedOptionIsValid =
              question.options.some(
                (
                  option,
                ) =>
                  option.id ===
                  selectedOptionId,
              );

            return selectedOptionIsValid
              ? total + 1
              : total;
          },
          0,
        ),
      [
        questions,
        persistedState
          .answers,
      ],
    );

  const totalQuestionCount =
    questions.length;

  /* =======================================================
     Restore and sanitize local state
  ======================================================= */

  useEffect(() => {
    if (
      questions.length ===
        0 ||
      pages.length ===
        0
    ) {
      return;
    }

    setPersistedState(
      (
        currentState,
      ) => {
        const validAnswers =
          sanitizeAnswers(
            currentState
              .answers,
            questionById,
          );

        /*
         * A storage-version change resets the page navigation
         * while preserving answers that are still valid.
         */
        const versionMatches =
          currentState
            .version ===
          ASSESSMENT_STORAGE_VERSION;

        const validCompletedSteps =
          versionMatches
            ? sanitizeCompletedSteps(
                currentState
                  .completedSteps,
                pages,
                validAnswers,
              )
            : [];

        const sanitizedStep =
          versionMatches
            ? clampNumber(
                currentState
                  .currentStep,
                0,
                Math.max(
                  pages.length -
                    1,
                  0,
                ),
              )
            : 0;

        const stateIsUnchanged =
          currentState
            .version ===
            ASSESSMENT_STORAGE_VERSION &&
          currentState
            .currentStep ===
            sanitizedStep &&
          areAnswerMapsEqual(
            currentState
              .answers,
            validAnswers,
          ) &&
          areNumberArraysEqual(
            currentState
              .completedSteps,
            validCompletedSteps,
          );

        if (
          stateIsUnchanged
        ) {
          return currentState;
        }

        return {
          version:
            ASSESSMENT_STORAGE_VERSION,

          currentStep:
            sanitizedStep,

          answers:
            validAnswers,

          completedSteps:
            validCompletedSteps,

          updatedAt:
            new Date()
              .toISOString(),
        };
      },
    );
  }, [
    pages,
    questionById,
    questions.length,
    setPersistedState,
  ]);

  /* =======================================================
     Select an answer
  ======================================================= */

  const setAnswer =
    useCallback(
      (
        questionId:
          number,
        optionId:
          number,
      ): void => {
        const question =
          questionById.get(
            questionId,
          );

        if (!question) {
          if (
            import.meta.env.DEV
          ) {
            console.warn(
              `[Assessment] Question ${questionId} does not exist.`,
            );
          }

          return;
        }

        const optionExists =
          question.options.some(
            (
              option,
            ) =>
              option.id ===
              optionId,
          );

        if (
          !optionExists
        ) {
          if (
            import.meta.env.DEV
          ) {
            console.warn(
              `[Assessment] Option ${optionId} does not belong to question ${questionId}.`,
            );
          }

          return;
        }

        setPersistedState(
          (
            currentState,
          ) => ({
            ...currentState,

            version:
              ASSESSMENT_STORAGE_VERSION,

            answers: {
              ...currentState
                .answers,

              [String(
                questionId,
              )]:
                optionId,
            },

            updatedAt:
              new Date()
                .toISOString(),
          }),
        );

        setValidationMessage(
          null,
        );
      },
      [
        questionById,
        setPersistedState,
      ],
    );

  /* =======================================================
     Validate current page
  ======================================================= */

  const validateCurrentPage =
    useCallback(
      (): boolean => {
        const validation =
          validateSectionAnswers(
            currentPage
              .questions,
            persistedState
              .answers,
          );

        if (
          !validation.valid
        ) {
          setValidationMessage(
            "Please answer all questions before continuing.",
          );

          return false;
        }

        setValidationMessage(
          null,
        );

        return true;
      },
      [
        currentPage
          .questions,
        persistedState
          .answers,
      ],
    );

  /* =======================================================
     Move to next page
  ======================================================= */

  const next =
    useCallback(
      (): boolean => {
        if (
          isLastPage
        ) {
          return false;
        }

        const validation =
          validateSectionAnswers(
            currentPage
              .questions,
            persistedState
              .answers,
          );

        if (
          !validation.valid
        ) {
          setValidationMessage(
            "Please answer all questions before continuing.",
          );

          return false;
        }

        setValidationMessage(
          null,
        );

        setPersistedState(
          (
            currentState,
          ) => ({
            ...currentState,

            version:
              ASSESSMENT_STORAGE_VERSION,

            currentStep:
              Math.min(
                currentStep +
                  1,
                maximumStepIndex,
              ),

            completedSteps:
              uniqueSortedNumbers([
                ...currentState
                  .completedSteps,
                currentStep,
              ]),

            updatedAt:
              new Date()
                .toISOString(),
          }),
        );

        return true;
      },
      [
        currentPage
          .questions,
        currentStep,
        isLastPage,
        maximumStepIndex,
        persistedState
          .answers,
        setPersistedState,
      ],
    );

  /* =======================================================
     Move to previous page
  ======================================================= */

  const previous =
    useCallback(
      (): void => {
        if (
          currentStep <=
          0
        ) {
          return;
        }

        setValidationMessage(
          null,
        );

        setPersistedState(
          (
            currentState,
          ) => ({
            ...currentState,

            version:
              ASSESSMENT_STORAGE_VERSION,

            currentStep:
              Math.max(
                currentStep -
                  1,
                0,
              ),

            updatedAt:
              new Date()
                .toISOString(),
          }),
        );
      },
      [
        currentStep,
        setPersistedState,
      ],
    );

  /* =======================================================
     Navigate through completed page indicators
  ======================================================= */

  const goToCompletedStep =
    useCallback(
      (
        stepIndex:
          number,
      ): void => {
        if (
          !Number.isInteger(
            stepIndex,
          ) ||
          stepIndex < 0 ||
          stepIndex >=
            pages.length
        ) {
          return;
        }

        const isCompleted =
          persistedState
            .completedSteps
            .includes(
              stepIndex,
            );

        if (
          !isCompleted
        ) {
          return;
        }

        setValidationMessage(
          null,
        );

        setPersistedState(
          (
            currentState,
          ) => ({
            ...currentState,

            version:
              ASSESSMENT_STORAGE_VERSION,

            currentStep:
              stepIndex,

            updatedAt:
              new Date()
                .toISOString(),
          }),
        );
      },
      [
        pages.length,
        persistedState
          .completedSteps,
        setPersistedState,
      ],
    );

  /* =======================================================
     Build answer-only payload
  ======================================================= */

  const buildSubmissionPayload =
    useCallback(
      (): AssessmentAnswersPayload => {
        const answers =
          questions.map(
            (
              question,
            ) => {
              const optionId =
                persistedState
                  .answers[
                  String(
                    question.id,
                  )
                ];

              if (
                optionId ===
                undefined
              ) {
                throw new Error(
                  `Question ${question.id} has not been answered.`,
                );
              }

              const optionExists =
                question.options.some(
                  (
                    option,
                  ) =>
                    option.id ===
                    optionId,
                );

              if (
                !optionExists
              ) {
                throw new Error(
                  `Question ${question.id} contains an invalid selected option.`,
                );
              }

              return {
                question_id:
                  question.id,

                option_id:
                  optionId,
              };
            },
          );

        return {
          answers,
        };
      },
      [
        persistedState
          .answers,
        questions,
      ],
    );

  /* =======================================================
     Clear locally persisted answers
  ======================================================= */

  const clearAssessment =
    useCallback(
      (): void => {
        removePersistedState();

        setValidationMessage(
          null,
        );
      },
      [
        removePersistedState,
      ],
    );

  /* =======================================================
     Public hook result
  ======================================================= */

  return {
    pages,

    currentPage,

    currentStep,

    answers:
      persistedState
        .answers,

    completedSteps:
      persistedState
        .completedSteps,

    isLastPage,

    canGoPrevious,

    validationMessage,

    unansweredQuestionIds,

    answeredQuestionCount,

    totalQuestionCount,

    setAnswer,

    next,

    previous,

    goToCompletedStep,

    validateCurrentPage,

    buildSubmissionPayload,

    clearAssessment,
  };
}