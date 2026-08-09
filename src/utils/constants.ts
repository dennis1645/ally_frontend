/* =========================================================
   Diagnostic guest token
========================================================= */

export const DIAGNOSTIC_GUEST_TOKEN_STORAGE_KEY =
  "ally_diagnostic_guest_token";

/* =========================================================
   Diagnostic assessment type
========================================================= */

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
   Assessment local storage
========================================================= */

export const ASSESSMENT_STORAGE_KEY =
  "ally.initial-assessment";

export const ASSESSMENT_STORAGE_VERSION =
  2 as const;

/* =========================================================
   Local-storage synchronization
========================================================= */

export const LOCAL_STORAGE_RESET_EVENT =
  "ally:local-storage-reset";

/*
 * Used by AssessmentResetOnExit so route-exit detection
 * still works across normal React Router navigation and
 * full-page navigation inside the same browser tab.
 */
export const LAST_ROUTE_STORAGE_KEY =
  "ally:last-route-pathname";

/* =========================================================
   Assessment pagination
========================================================= */

export const ASSESSMENT_QUESTIONS_PER_PAGE =
  5;

export const INITIAL_ASSESSMENT_QUESTION_COUNT =
  20;