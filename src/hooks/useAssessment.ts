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

import type {
  AssessmentQuestionPage,
} from "../utils/paginateQuestions";

import {
  validateSectionAnswers,
} from "../utils/validation";

import type {
  AssessmentAnswers,
  DiagnosticQuestion,
  PersistedAssessmentState,
  SubmitAssessmentPayload,
} from "../types/diagnostic";

/* =========================================================
   Public types
========================================================= */

export type UseAssessmentOptions = {
  questions: DiagnosticQuestion[];
};

export type UseAssessmentReturn = {
  pages: AssessmentQuestionPage[];

  currentPage: AssessmentQuestionPage;

  currentStep: number;

  answers: AssessmentAnswers;

  completedSteps: number[];

  isLastPage: boolean;

  canGoPrevious: boolean;

  validationMessage: string | null;

  unansweredQuestionIds: number[];

  answeredQuestionCount: number;

  totalQuestionCount: number;

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

  buildSubmissionPayload:
    () => SubmitAssessmentPayload;

  clearAssessment:
    () => void;
};

/* =========================================================
   Empty-page fallback
========================================================= */

const EMPTY_PAGE:
  AssessmentQuestionPage = {
  key: "empty-assessment-page",
  pageNumber: 1,
  title: "Initial Assessment",
  description:
    "No questions are available.",
  speech:
    "The assessment questions are currently unavailable.",
  questions: [],
};

/* =========================================================
   Internal helpers
========================================================= */

function uniqueSortedNumbers(
  values: number[],
): number[] {
  return [
    ...new Set(values),
  ].sort(
    (
      first,
      second,
    ) => first - second,
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
  first: AssessmentAnswers,
  second: AssessmentAnswers,
): boolean {
  const firstEntries =
    Object.entries(first);

  const secondEntries =
    Object.entries(second);

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
      second[questionId] ===
      optionId,
  );
}

/* =========================================================
   Hook
========================================================= */

export function useAssessment({
  questions,
}: UseAssessmentOptions): UseAssessmentReturn {
  const {
    value: persistedState,
    setValue: setPersistedState,
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
     Create pages of five questions
  ======================================================= */

  const pages =
    useMemo(
      () =>
        paginateQuestions(
          questions,
        ),
      [questions],
    );

  const maximumStepIndex =
    Math.max(
      pages.length - 1,
      0,
    );

  const currentStep =
    Math.min(
      Math.max(
        persistedState.currentStep,
        0,
      ),
      maximumStepIndex,
    );

  const currentPage =
    pages[currentStep] ??
    EMPTY_PAGE;

  const isLastPage =
    pages.length > 0 &&
    currentStep ===
      pages.length - 1;

  const canGoPrevious =
    currentStep > 0;

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
            (question) => [
              question.id,
              question,
            ],
          ),
        ),
      [questions],
    );

  /* =======================================================
     Current-page validation
  ======================================================= */

  const validationResult =
    useMemo(
      () =>
        validateSectionAnswers(
          currentPage.questions,
          persistedState.answers,
        ),
      [
        currentPage.questions,
        persistedState.answers,
      ],
    );

  const unansweredQuestionIds =
    validationResult
      .unansweredQuestionIds;

  const answeredQuestionCount =
    useMemo(
      () =>
        questions.reduce(
          (
            total,
            question,
          ) => {
            const selectedOptionId =
              persistedState.answers[
                String(
                  question.id,
                )
              ];

            return selectedOptionId !==
              undefined
              ? total + 1
              : total;
          },
          0,
        ),
      [
        questions,
        persistedState.answers,
      ],
    );

  /* =======================================================
     Restore and sanitize saved progress
  ======================================================= */

  useEffect(() => {
    if (
      questions.length === 0 ||
      pages.length === 0
    ) {
      return;
    }

    setPersistedState(
      (
        currentState,
      ) => {
        const validAnswers:
          AssessmentAnswers =
          {};

        for (
          const [
            questionIdKey,
            optionId,
          ] of Object.entries(
            currentState.answers,
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
            questionId <= 0
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

          validAnswers[
            String(questionId)
          ] = optionId;
        }

        /*
         * A version change means the assessment page structure
         * changed. Preserve valid answers, but restart page
         * navigation from page one.
         */
        const usesCurrentVersion =
          currentState.version ===
          ASSESSMENT_STORAGE_VERSION;

        const validCompletedSteps =
          usesCurrentVersion
            ? uniqueSortedNumbers(
                currentState.completedSteps.filter(
                  (
                    stepIndex,
                  ) =>
                    Number.isInteger(
                      stepIndex,
                    ) &&
                    stepIndex >=
                      0 &&
                    stepIndex <
                      pages.length,
                ),
              )
            : [];

        const sanitizedStep =
          usesCurrentVersion
            ? Math.min(
                Math.max(
                  currentState.currentStep,
                  0,
                ),
                maximumStepIndex,
              )
            : 0;

        const stateIsUnchanged =
          currentState.version ===
            ASSESSMENT_STORAGE_VERSION &&
          currentState.currentStep ===
            sanitizedStep &&
          areAnswerMapsEqual(
            currentState.answers,
            validAnswers,
          ) &&
          areNumberArraysEqual(
            currentState.completedSteps,
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
            new Date().toISOString(),
        };
      },
    );
  }, [
    maximumStepIndex,
    pages.length,
    questionById,
    questions.length,
    setPersistedState,
  ]);

  /* =======================================================
     Answer selection
  ======================================================= */

  const setAnswer =
    useCallback(
      (
        questionId: number,
        optionId: number,
      ): void => {
        const question =
          questionById.get(
            questionId,
          );

        if (!question) {
          return;
        }

        const optionExists =
          question.options.some(
            (option) =>
              option.id ===
              optionId,
          );

        if (!optionExists) {
          return;
        }

        setPersistedState(
          (
            currentState,
          ) => ({
            ...currentState,

            answers: {
              ...currentState.answers,

              [String(
                questionId,
              )]: optionId,
            },

            updatedAt:
              new Date().toISOString(),
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
     Validation method
  ======================================================= */

  const validateCurrentPage =
    useCallback(
      (): boolean => {
        const validation =
          validateSectionAnswers(
            currentPage.questions,
            persistedState.answers,
          );

        if (
          !validation.valid
        ) {
          const missingCount =
            validation
              .unansweredQuestionIds
              .length;

          setValidationMessage(
            missingCount === 1
              ? "Please answer the remaining question before continuing."
              : `Please answer the remaining ${missingCount} questions before continuing.`,
          );

          return false;
        }

        setValidationMessage(
          null,
        );

        return true;
      },
      [
        currentPage.questions,
        persistedState.answers,
      ],
    );

  /* =======================================================
     Next-page navigation
  ======================================================= */

  const next =
    useCallback(
      (): boolean => {
        if (isLastPage) {
          return false;
        }

        if (
          !validateCurrentPage()
        ) {
          return false;
        }

        setPersistedState(
          (
            currentState,
          ) => ({
            ...currentState,

            currentStep:
              Math.min(
                currentStep + 1,
                maximumStepIndex,
              ),

            completedSteps:
              uniqueSortedNumbers([
                ...currentState
                  .completedSteps,
                currentStep,
              ]),

            updatedAt:
              new Date().toISOString(),
          }),
        );

        return true;
      },
      [
        currentStep,
        isLastPage,
        maximumStepIndex,
        setPersistedState,
        validateCurrentPage,
      ],
    );

  /* =======================================================
     Previous-page navigation
  ======================================================= */

  const previous =
    useCallback(
      (): void => {
        if (
          currentStep <= 0
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

            currentStep:
              Math.max(
                currentStep - 1,
                0,
              ),

            updatedAt:
              new Date().toISOString(),
          }),
        );
      },
      [
        currentStep,
        setPersistedState,
      ],
    );

  /* =======================================================
     Step navigation
  ======================================================= */

  const goToCompletedStep =
    useCallback(
      (
        stepIndex: number,
      ): void => {
        const isValidStep =
          Number.isInteger(
            stepIndex,
          ) &&
          stepIndex >= 0 &&
          stepIndex <
            pages.length;

        if (!isValidStep) {
          return;
        }

        if (
          stepIndex ===
          currentStep
        ) {
          return;
        }

        const isCompleted =
          persistedState
            .completedSteps
            .includes(
              stepIndex,
            );

        if (!isCompleted) {
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

            currentStep:
              stepIndex,

            updatedAt:
              new Date().toISOString(),
          }),
        );
      },
      [
        currentStep,
        pages.length,
        persistedState
          .completedSteps,
        setPersistedState,
      ],
    );

  /* =======================================================
     Submission payload
  ======================================================= */

  const buildSubmissionPayload =
    useCallback(
      (): SubmitAssessmentPayload => {
        const sortedQuestions =
          [...questions].sort(
            (
              first,
              second,
            ): number => {
              const orderDifference =
                first.order_number -
                second.order_number;

              if (
                orderDifference !==
                0
              ) {
                return orderDifference;
              }

              return (
                first.id -
                second.id
              );
            },
          );

        const answers =
          sortedQuestions.map(
            (question) => {
              const optionId =
                persistedState.answers[
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
                  (option) =>
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
        persistedState.answers,
        questions,
      ],
    );

  /* =======================================================
     Reset assessment
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

  return {
    pages,

    currentPage,

    currentStep,

    answers:
      persistedState.answers,

    completedSteps:
      persistedState
        .completedSteps,

    isLastPage,

    canGoPrevious,

    validationMessage,

    unansweredQuestionIds,

    answeredQuestionCount,

    totalQuestionCount:
      questions.length,

    setAnswer,

    next,

    previous,

    goToCompletedStep,

    validateCurrentPage,

    buildSubmissionPayload,

    clearAssessment,
  };
}