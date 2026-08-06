import {
  ASSESSMENT_STORAGE_VERSION,
  REVIEW_STEP_INDEX,
} from "./constants";

import type {
  AssessmentAnswers,
  PersistedAssessmentState,
} from "../types/diagnostic";

/* =========================================================
   Runtime helpers
========================================================= */

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

function clampStep(
  value: number,
): number {
  return Math.min(
    Math.max(
      value,
      0,
    ),
    REVIEW_STEP_INDEX,
  );
}

/* =========================================================
   Initial state
========================================================= */

export function createEmptyAssessmentState():
  PersistedAssessmentState {
  return {
    version:
      ASSESSMENT_STORAGE_VERSION,

    currentStep:
      0,

    answers:
      {},

    completedSteps:
      [],

    updatedAt:
      new Date().toISOString(),
  };
}

/* =========================================================
   Answer normalization
========================================================= */

function normalizeAnswers(
  value: unknown,
): AssessmentAnswers {
  if (!isRecord(value)) {
    return {};
  }

  const answers:
    AssessmentAnswers =
    {};

  for (
    const [
      questionIdKey,
      optionId,
    ] of Object.entries(value)
  ) {
    const questionId =
      Number(questionIdKey);

    if (
      !isPositiveInteger(
        questionId,
      ) ||
      !isPositiveInteger(
        optionId,
      )
    ) {
      continue;
    }

    answers[
      String(questionId)
    ] = optionId;
  }

  return answers;
}

/* =========================================================
   Completed-step normalization
========================================================= */

function normalizeCompletedSteps(
  value: unknown,
): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter(
        (
          step,
        ): step is number =>
          typeof step ===
            "number" &&
          Number.isInteger(
            step,
          ) &&
          step >= 0 &&
          step <
            REVIEW_STEP_INDEX,
      ),
    ),
  ].sort(
    (
      firstStep,
      secondStep,
    ) =>
      firstStep -
      secondStep,
  );
}

/* =========================================================
   State normalization
========================================================= */

export function normalizeAssessmentState(
  value: unknown,
): PersistedAssessmentState {
  const fallback =
    createEmptyAssessmentState();

  if (!isRecord(value)) {
    return fallback;
  }

  if (
    value.version !==
    ASSESSMENT_STORAGE_VERSION
  ) {
    return fallback;
  }

  const currentStep =
    typeof value.currentStep ===
      "number" &&
    Number.isInteger(
      value.currentStep,
    )
      ? clampStep(
          value.currentStep,
        )
      : 0;

  const updatedAt =
    typeof value.updatedAt ===
      "string" &&
    !Number.isNaN(
      Date.parse(
        value.updatedAt,
      ),
    )
      ? value.updatedAt
      : new Date().toISOString();

  return {
    version:
      ASSESSMENT_STORAGE_VERSION,

    currentStep,

    answers:
      normalizeAnswers(
        value.answers,
      ),

    completedSteps:
      normalizeCompletedSteps(
        value.completedSteps,
      ),

    updatedAt,
  };
}

/* =========================================================
   Serialization
========================================================= */

export function serializeAssessmentState(
  state:
    PersistedAssessmentState,
): string {
  const normalizedState =
    normalizeAssessmentState(
      state,
    );

  return JSON.stringify(
    normalizedState,
  );
}

export function deserializeAssessmentState(
  serializedValue: string,
): PersistedAssessmentState {
  try {
    const parsedValue =
      JSON.parse(
        serializedValue,
      ) as unknown;

    return normalizeAssessmentState(
      parsedValue,
    );
  } catch {
    return createEmptyAssessmentState();
  }
}