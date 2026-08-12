import {
  parseScholarshipId,
} from "../api/roadmapApi";

function storageKey(
  userId:
    | string
    | number,
): string {
  return `ally_selected_scholarship_id:${String(
    userId,
  )}`;
}

export function storeSelectedScholarshipId(
  userId:
    | string
    | number,
  scholarshipId:
    number,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    storageKey(userId),
    String(
      scholarshipId,
    ),
  );
}

export function getStoredSelectedScholarshipId(
  userId:
    | string
    | number,
): number | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return parseScholarshipId(
    window.localStorage.getItem(
      storageKey(userId),
    ),
  );
}

export function clearStoredSelectedScholarshipId(
  userId:
    | string
    | number,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    storageKey(userId),
  );
}