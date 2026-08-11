import { apiRequest } from "./apiClient";

/* =========================================================
   Types
========================================================= */

export type MentorBookingRecord = Record<string, unknown>;

export type MyBookingsResult = {
  bookings: MentorBookingRecord[];
  message: string | null;
};

export type BookMentorPayload = {
  availability_id: number;
};

export type BookMentorResult = {
  message: string | null;
  data: unknown;
};

/* =========================================================
   Helpers
========================================================= */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getResponseMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const message = value.message;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
}

function throwIfApiStatusError(value: unknown, fallback: string): void {
  if (!isRecord(value) || value.status !== "error") {
    return;
  }

  throw new Error(getResponseMessage(value) ?? fallback);
}

/* =========================================================
   GET /api/my-bookings
========================================================= */

export async function getMyBookingsApi(): Promise<MyBookingsResult> {
  const response = await apiRequest<unknown>("/api/my-bookings", {
    method: "GET",
  });

  throwIfApiStatusError(response, "Unable to load your mentor bookings.");

  if (!isRecord(response)) {
    throw new Error("The booking server returned an invalid response.");
  }

  const data = response.data;

  if (data !== undefined && data !== null && !Array.isArray(data)) {
    throw new Error("The booking response did not contain a valid booking list.");
  }

  return {
    bookings: Array.isArray(data)
      ? data.filter((item): item is MentorBookingRecord => isRecord(item))
      : [],
    message: getResponseMessage(response),
  };
}

/* =========================================================
   POST /api/mentor/book
========================================================= */

export async function bookMentorApi(
  payload: BookMentorPayload,
): Promise<BookMentorResult> {
  if (
    !Number.isInteger(payload.availability_id) ||
    payload.availability_id <= 0
  ) {
    throw new Error("Please select a valid mentor availability slot.");
  }

  const response = await apiRequest<unknown>("/api/mentor/book", {
    method: "POST",
    body: JSON.stringify({
      availability_id: payload.availability_id,
    }),
  });

  throwIfApiStatusError(response, "Unable to book the mentor session.");

  return {
    message: getResponseMessage(response),
    data: isRecord(response) && "data" in response ? response.data : response,
  };
}