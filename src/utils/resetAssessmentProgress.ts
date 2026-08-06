import {
  ASSESSMENT_STORAGE_KEY,
} from "./constants";

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