import {
  API_BASE_URL,
  apiRequest,
} from "./apiClient";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function booleanOrFalse(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function unwrapData(response: unknown): unknown {
  if (isRecord(response) && "data" in response) {
    return response.data;
  }

  return response;
}

function extractList(response: unknown): unknown[] {
  const data = unwrapData(response);

  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];

  const candidates = [
    data.data,
    data.items,
    data.results,
    data.mentees,
    data.availabilities,
    data.documents,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function resolveReturnedUrl(value: unknown): string | null {
  const raw = stringOrNull(value);

  if (!raw) return null;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  try {
    const origin = new URL(API_BASE_URL).origin;
    return `${origin}/${raw.replace(/^\/+/, "")}`;
  } catch {
    return raw;
  }
}

/* =========================================================
   Mentees
========================================================= */

export type MentorMentee = {
  id: string | number;
  name: string;
  email: string;
  status: string;
  readinessScore: number | null;
  undergraduateMajor: string | null;
  targetMajor: string | null;
  primaryScholarshipTarget: string | null;
  headline: string | null;
  profilePictureUrl: string | null;
  level: number | null;
  xpPoints: number | null;
};

function normalizeMentorMentee(value: unknown): MentorMentee | null {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value.user_id ?? value.mentee_id;

  if (typeof rawId !== "string" && typeof rawId !== "number") {
    return null;
  }

  return {
    id: rawId,
    name:
      stringOrNull(value.name ?? value.full_name ?? value.mentee_name) ??
      `Mentee #${String(rawId)}`,
    email: stringOrNull(value.email ?? value.mentee_email) ?? "",
    status: stringOrNull(value.status) ?? "active",
    readinessScore: numberOrNull(
      value.readiness_score ?? value.readinessScore,
    ),
    undergraduateMajor: stringOrNull(
      value.undergraduate_major ?? value.undergraduateMajor,
    ),
    targetMajor: stringOrNull(value.target_major ?? value.targetMajor),
    primaryScholarshipTarget: stringOrNull(
      value.primary_scholarship_target ??
        value.primaryScholarshipTarget ??
        value.target_scholarship,
    ),
    headline: stringOrNull(value.headline),
    profilePictureUrl: resolveReturnedUrl(
      value.profile_picture_url ??
        value.profilePictureUrl ??
        value.profile_picture,
    ),
    level: numberOrNull(value.level ?? value.expedition_level),
    xpPoints: numberOrNull(value.xp_points ?? value.xpPoints),
  };
}

/** GET /api/mentor/mentees */
export async function getMentorMentees(): Promise<MentorMentee[]> {
  const response = await apiRequest<unknown>("/api/mentor/mentees");

  return extractList(response)
    .map(normalizeMentorMentee)
    .filter((mentee): mentee is MentorMentee => mentee !== null);
}

/* =========================================================
   Dossier
========================================================= */

export type MentorDossier = UnknownRecord;

/** GET /api/mentor/dossier/{bookingId} */
export async function getMentorDossier(
  bookingId: string | number,
): Promise<MentorDossier> {
  const response = await apiRequest<unknown>(
    `/api/mentor/dossier/${encodeURIComponent(String(bookingId))}`,
  );

  const data = unwrapData(response);

  if (!isRecord(data)) {
    throw new Error("Invalid mentor dossier response from the server.");
  }

  return data;
}

export type MentorDossierPreReadDocument = {
  label: string;
  filePath: string;
  raw: UnknownRecord;
};

/**
 * The Postman collection documents the signed URL at:
 * document_vault_pre_read.file_path
 *
 * The backend generates the temporary signed route. The frontend
 * must consume file_path exactly as returned.
 */
export function getMentorDossierPreReadDocuments(
  dossier: MentorDossier,
): MentorDossierPreReadDocument[] {
  const rawPreRead = dossier.document_vault_pre_read;

  const entries = Array.isArray(rawPreRead)
    ? rawPreRead
    : isRecord(rawPreRead)
      ? [rawPreRead]
      : [];

  return entries.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];

    const filePath = resolveReturnedUrl(
      entry.file_path ?? entry.filePath,
    );

    if (!filePath) return [];

    return [
      {
        label:
          stringOrNull(
            entry.title ??
              entry.file_name ??
              entry.fileName ??
              entry.name,
          ) ?? `Pre-read document ${index + 1}`,
        filePath,
        raw: entry,
      },
    ];
  });
}

/* =========================================================
   Availability
========================================================= */

export type MentorAvailability = {
  id: string | number | null;
  mentorId: string | number | null;
  availableDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MentorAvailabilityPayload = {
  available_date: string;
  start_time: string;
  end_time: string;
};

function normalizeMentorAvailability(
  value: unknown,
): MentorAvailability | null {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value.availability_id;
  const rawMentorId = value.mentor_id ?? value.mentorId;
  const availableDate = stringOrNull(
    value.available_date ?? value.availableDate,
  );
  const startTime = stringOrNull(value.start_time ?? value.startTime);
  const endTime = stringOrNull(value.end_time ?? value.endTime);

  if (!availableDate || !startTime || !endTime) {
    return null;
  }

  return {
    id:
      typeof rawId === "string" || typeof rawId === "number"
        ? rawId
        : null,
    mentorId:
      typeof rawMentorId === "string" || typeof rawMentorId === "number"
        ? rawMentorId
        : null,
    availableDate,
    startTime,
    endTime,
    isBooked: booleanOrFalse(value.is_booked ?? value.isBooked),
    createdAt: stringOrNull(value.created_at ?? value.createdAt) ?? "",
    updatedAt: stringOrNull(value.updated_at ?? value.updatedAt) ?? "",
  };
}

/** GET /api/mentor/availabilities */
export async function getMentorAvailabilities(): Promise<
  MentorAvailability[]
> {
  const response = await apiRequest<unknown>("/api/mentor/availabilities");

  return extractList(response)
    .map(normalizeMentorAvailability)
    .filter(
      (availability): availability is MentorAvailability =>
        availability !== null,
    );
}

/** POST /api/mentor/availabilities */
export async function createMentorAvailability(
  payload: MentorAvailabilityPayload,
): Promise<unknown> {
  return apiRequest<unknown>("/api/mentor/availabilities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   Action plans
========================================================= */

export type MentorActionPlanPayload = {
  task_description: string;
  deadline: string;
  parent_milestone_id: number;
};

/** POST /api/mentor/bookings/{bookingId}/action-plans */
export async function createMentorActionPlan(
  bookingId: string | number,
  payload: MentorActionPlanPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(
      String(bookingId),
    )}/action-plans`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   Booking actions

   Payloads are aligned to the provided Postman collection.
========================================================= */

export type ConfirmMentorBookingPayload = {
  meeting_link: string;
};

/** PATCH /api/mentor/bookings/{bookingId}/confirm */
export async function confirmMentorBooking(
  bookingId: string | number,
  payload: ConfirmMentorBookingPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/confirm`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export type RejectMentorBookingPayload = {
  reason: string;
};

/** PATCH /api/mentor/bookings/{bookingId}/reject */
export async function rejectMentorBooking(
  bookingId: string | number,
  payload: RejectMentorBookingPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export type RescheduleMentorBookingPayload = {
  new_availability_id: number;
  reason: string;
};

/** PATCH /api/mentor/bookings/{bookingId}/reschedule */
export async function rescheduleMentorBooking(
  bookingId: string | number,
  payload: RescheduleMentorBookingPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(
      String(bookingId),
    )}/reschedule`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   Mentor documents
========================================================= */

export type MentorDocument = {
  id: string | number;
  title: string;
  duration: string | null;
  fileName: string | null;
  mimeType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  previewUrl: string | null;
  raw: UnknownRecord;
};

function normalizeMentorDocument(value: unknown): MentorDocument | null {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value.document_id ?? value.documentId;

  if (typeof rawId !== "string" && typeof rawId !== "number") {
    return null;
  }

  const links = isRecord(value.links) ? value.links : null;

  const previewUrl = resolveReturnedUrl(
    value.signed_url ??
      value.signedUrl ??
      value.preview_url ??
      value.previewUrl ??
      value.download_url ??
      value.downloadUrl ??
      value.temporary_url ??
      value.temporaryUrl ??
      value.url ??
      links?.preview ??
      links?.download ??
      links?.signed,
  );

  return {
    id: rawId,
    title:
      stringOrNull(value.title ?? value.name) ??
      `Document #${String(rawId)}`,
    duration: stringOrNull(value.duration),
    fileName: stringOrNull(
      value.file_name ??
        value.fileName ??
        value.original_name ??
        value.originalName,
    ),
    mimeType: stringOrNull(value.mime_type ?? value.mimeType),
    createdAt: stringOrNull(value.created_at ?? value.createdAt),
    updatedAt: stringOrNull(value.updated_at ?? value.updatedAt),
    previewUrl,
    raw: value,
  };
}

/** GET /api/mentor/documents */
export async function getMentorDocuments(): Promise<MentorDocument[]> {
  const response = await apiRequest<unknown>("/api/mentor/documents");

  return extractList(response)
    .map(normalizeMentorDocument)
    .filter((document): document is MentorDocument => document !== null);
}

export type UploadMentorDocumentPayload = {
  title: string;
  file: File;
  duration: string;
};

/**
 * POST /api/mentor/documents
 * multipart fields: title, file, duration
 */
export async function uploadMentorDocument(
  payload: UploadMentorDocumentPayload,
): Promise<unknown> {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("file", payload.file);
  formData.append("duration", payload.duration);

  return apiRequest<unknown>("/api/mentor/documents", {
    method: "POST",
    body: formData,
  });
}

/** DELETE /api/mentor/documents/{documentId} */
export async function deleteMentorDocument(
  documentId: string | number,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/documents/${encodeURIComponent(String(documentId))}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Only consume a URL already returned by the backend.
 * Never generate expires/signature in the frontend.
 */
export function getMentorDocumentPreviewUrl(
  document: MentorDocument,
): string | null {
  return document.previewUrl;
}