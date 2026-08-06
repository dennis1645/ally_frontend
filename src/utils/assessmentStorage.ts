import {
  ASSESSMENT_STORAGE_VERSION,
  INITIAL_ASSESSMENT_PAGE_COUNT,
} from "./constants";

import type {
  AssessmentAnswers,
  PersistedAssessmentState,
} from "../types/diagnostic";

/* =========================================================
   Page limits
========================================================= */

/*
 * The assessment currently contains four frontend pages.
 *
 * Because page indexes are zero-based:
 *
 * Page 1 → index 0
 * Page 2 → index 1
 * Page 3 → index 2
 * Page 4 → index 3
 */
const MAXIMUM_ASSESSMENT_PAGE_INDEX =
  Math.max(
    INITIAL_ASSESSMENT_PAGE_COUNT -
      1,
    0,
  );

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
    !Array.isArray(
      value,
    )
  );
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(
      value,
    ) &&
    value > 0
  );
}

function isNonNegativeInteger(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(
      value,
    ) &&
    value >= 0
  );
}

function clampPageIndex(
  value: number,
): number {
  return Math.min(
    Math.max(
      value,
      0,
    ),
    MAXIMUM_ASSESSMENT_PAGE_INDEX,
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
      new Date()
        .toISOString(),
  };
}

/* =========================================================
   Answer normalization
========================================================= */

function normalizeAnswers(
  value: unknown,
): AssessmentAnswers {
  if (
    !isRecord(
      value,
    )
  ) {
    return {};
  }

  const answers:
    AssessmentAnswers =
    {};

  for (
    const [
      questionIdKey,
      optionId,
    ] of Object.entries(
      value,
    )
  ) {
    const questionId =
      Number(
        questionIdKey,
      );

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
      String(
        questionId,
      )
    ] =
      optionId;
  }

  return answers;
}

/* =========================================================
   Completed-page normalization
========================================================= */

function normalizeCompletedSteps(
  value: unknown,
): number[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  const validSteps =
    value.filter(
      (
        step,
      ): step is number =>
        isNonNegativeInteger(
          step,
        ) &&
        step <=
          MAXIMUM_ASSESSMENT_PAGE_INDEX,
    );

  return [
    ...new Set(
      validSteps,
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
   Updated-at normalization
========================================================= */

function normalizeUpdatedAt(
  value: unknown,
): string {
  if (
    typeof value !==
      "string"
  ) {
    return new Date()
      .toISOString();
  }

  const normalizedValue =
    value.trim();

  if (
    normalizedValue.length ===
      0 ||
    Number.isNaN(
      Date.parse(
        normalizedValue,
      ),
    )
  ) {
    return new Date()
      .toISOString();
  }

  return normalizedValue;
}

/* =========================================================
   State normalization
========================================================= */

export function normalizeAssessmentState(
  value: unknown,
): PersistedAssessmentState {
  const fallback =
    createEmptyAssessmentState();

  if (
    !isRecord(
      value,
    )
  ) {
    return fallback;
  }

  /*
   * Discard local-storage data from the old section-based
   * assessment when the storage version does not match.
   */
  if (
    value.version !==
    ASSESSMENT_STORAGE_VERSION
  ) {
    return fallback;
  }

  const currentStep =
    isNonNegativeInteger(
      value.currentStep,
    )
      ? clampPageIndex(
          value.currentStep,
        )
      : 0;

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

    updatedAt:
      normalizeUpdatedAt(
        value.updatedAt,
      ),
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