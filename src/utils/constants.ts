/* =========================================================
   Diagnostic configuration
========================================================= */

/*
 * Temporary identifier for an anonymous assessment user.
 *
 * This token remains stored after assessment submission
 * because it is required to:
 *
 * 1. Retrieve the anonymous result.
 * 2. Attach the result to the user's account after registration.
 */
export const DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY =
  "ally_diagnostic_guest_token";

/*
 * Assessment type expected by:
 *
 * POST /api/diagnostic/submit
 */
export const INITIAL_DIAGNOSTIC_ASSESSMENT_TYPE =
  "initial_diagnostic" as const;

/* =========================================================
   Assessment routes
========================================================= */

export const INITIAL_ASSESSMENT_ROUTE =
  "/onboarding/diagnostic";

export const DIAGNOSTIC_RESULT_ROUTE =
  "/assessment/result";

/* =========================================================
   Local-storage configuration
========================================================= */

/*
 * Stores:
 *
 * - Current assessment page
 * - Selected answers
 * - Completed pages
 * - Last update time
 */
export const ASSESSMENT_STORAGE_KEY =
  "ally.initial-assessment";

/*
 * Version 2 represents the current page-based assessment:
 *
 * - 5 questions per page
 * - 4 frontend pages
 * - No separate review page
 *
 * Changing from version 1 to version 2 prevents old
 * seven-section assessment progress from being restored.
 */
export const ASSESSMENT_STORAGE_VERSION =
  2 as const;

/* =========================================================
   Frontend pagination
========================================================= */

export const ASSESSMENT_QUESTIONS_PER_PAGE =
  5;

export const INITIAL_ASSESSMENT_QUESTION_COUNT =
  20;

export const INITIAL_ASSESSMENT_PAGE_COUNT =
  Math.ceil(
    INITIAL_ASSESSMENT_QUESTION_COUNT /
      ASSESSMENT_QUESTIONS_PER_PAGE,
  );

/* =========================================================
   Shared interface messages
========================================================= */

export const ASSESSMENT_MESSAGES = {
  incompletePage:
    "Please answer all questions before continuing.",

  emptyAssessment:
    "No assessment questions are currently available.",

  loadingError:
    "Unable to load assessment.",

  submissionError:
    "Unable to submit the assessment. Please try again.",

  invalidSubmission:
    "Some assessment answers are missing or invalid.",

  successfulSubmission:
    "Your assessment has been submitted successfully.",

  missingGuestToken:
    "A guest token is required to continue.",

  resultLoadingError:
    "Unable to load your assessment result.",
} as const;