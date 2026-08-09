import {
  ASSESSMENT_STORAGE_KEY,
} from "./constants";

/**
 * Removes saved answers, completed pages, and the current page
 * for the public initial assessment.
 */
export function resetAssessmentProgress(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    ASSESSMENT_STORAGE_KEY,
  );
}