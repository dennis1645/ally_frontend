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

function entityIdOrNull(value: unknown): string | number | null {
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function booleanOrFalse(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function unwrapData(response: unknown): unknown {
  if (isRecord(response) && "data" in response) return response.data;
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
    data.submissions,
    data.invoices,
    data.bookings,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function firstRecord(record: UnknownRecord | null, keys: string[]): UnknownRecord | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (isRecord(value)) return value;
  }
  return null;
}

function firstString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = stringOrNull(record[key]);
    if (value) return value;
  }
  return null;
}

function firstNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = numberOrNull(record[key]);
    if (value !== null) return value;
  }
  return null;
}

function firstEntityId(record: UnknownRecord | null, keys: string[]): string | number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = entityIdOrNull(record[key]);
    if (value !== null) return value;
  }
  return null;
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
   Mentees — GET /api/mentor/mentees
========================================================= */

export type MentorMentee = {
  id: string | number;
  name: string;
  email: string;
  status: string;
  readinessScore: number | null;
  undergraduateMajor: string | null;
  targetMajor: string | null;
  targetUniversity: string | null;
  primaryScholarshipTarget: string | null;
  headline: string | null;
  profilePictureUrl: string | null;
  level: number | null;
  xpPoints: number | null;
  currentStage: string | null;
  lastSessionAt: string | null;
  completedAt: string | null;
  assessmentSummary: string | null;
  documentsSubmitted: string[];
  bookingId: string | number | null;
  parentMilestoneId: number | null;
  raw: UnknownRecord;
};

function normalizeMentorMentee(value: unknown): MentorMentee | null {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value.user_id ?? value.mentee_id;
  if (typeof rawId !== "string" && typeof rawId !== "number") return null;

  const booking = firstRecord(value, [
    "current_booking",
    "latest_booking",
    "upcoming_booking",
    "booking",
  ]);

  const university = firstRecord(value, [
    "target_university_data",
    "target_university",
    "university",
  ]);

  const assessment = firstRecord(value, [
    "deep_diagnostic_result",
    "assessment_result",
    "assessment",
  ]);

  const rawDocuments = Array.isArray(value.documents)
    ? value.documents
    : Array.isArray(value.document_vault)
      ? value.document_vault
      : [];

  const documentsSubmitted = rawDocuments.flatMap((document) => {
    if (typeof document === "string") return [document];
    if (!isRecord(document)) return [];

    const name = firstString(document, [
      "file_name",
      "original_name",
      "name",
      "title",
    ]);

    return name ? [name] : [];
  });

  const bookingId =
    firstEntityId(value, ["booking_id", "current_booking_id", "latest_booking_id"]) ??
    firstEntityId(booking, ["id", "booking_id"]);

  return {
    id: rawId,
    name:
      firstString(value, ["name", "full_name", "mentee_name"]) ??
      `Mentee #${String(rawId)}`,
    email: firstString(value, ["email", "mentee_email"]) ?? "",
    status: firstString(value, ["status", "mentee_status"]) ?? "active",
    readinessScore: firstNumber(value, ["readiness_score", "readinessScore"]),
    undergraduateMajor: firstString(value, [
      "undergraduate_major",
      "undergraduateMajor",
    ]),
    targetMajor: firstString(value, ["target_major", "targetMajor"]),
    targetUniversity:
      firstString(value, [
        "target_university_name",
        "university_name",
        "target_university",
      ]) ?? firstString(university, ["name", "university_name"]),
    primaryScholarshipTarget: firstString(value, [
      "primary_scholarship_target",
      "primaryScholarshipTarget",
      "target_scholarship",
      "scholarship_name",
    ]),
    headline: firstString(value, ["headline"]),
    profilePictureUrl: resolveReturnedUrl(
      value.profile_picture_url ?? value.profilePictureUrl ?? value.profile_picture,
    ),
    level: firstNumber(value, ["level", "expedition_level"]),
    xpPoints: firstNumber(value, ["xp_points", "xpPoints"]),
    currentStage: firstString(value, [
      "current_stage",
      "stage",
      "milestone_name",
      "current_milestone",
    ]),
    lastSessionAt:
      firstString(value, ["last_session_at", "last_session", "last_booking_at"]) ??
      firstString(booking, ["completed_at", "session_at", "scheduled_at"]),
    completedAt: firstString(value, ["completed_at", "program_completed_at"]),
    assessmentSummary:
      firstString(value, ["assessment_summary", "assessment_note", "ai_summary"]) ??
      firstString(assessment, ["summary", "suggestion", "ai_suggestion"]),
    documentsSubmitted,
    bookingId,
    parentMilestoneId:
      firstNumber(value, ["parent_milestone_id", "current_milestone_id", "milestone_id"]) ??
      firstNumber(booking, ["parent_milestone_id", "milestone_id"]),
    raw: value,
  };
}

export async function getMentorMentees(): Promise<MentorMentee[]> {
  const response = await apiRequest<unknown>("/api/mentor/mentees");

  return extractList(response)
    .map(normalizeMentorMentee)
    .filter((mentee): mentee is MentorMentee => mentee !== null);
}

/* =========================================================
   Dashboard stats — GET /api/mentor/dashboard/stats
========================================================= */

export type MentorDashboardStats = {
  assignedMentees: number | null;
  openAvailability: number | null;
  bookedSessions: number | null;
  pendingReviews: number | null;
  raw: UnknownRecord;
};

function normalizeMentorDashboardStats(response: unknown): MentorDashboardStats {
  const data = unwrapData(response);
  if (!isRecord(data)) {
    throw new Error("Invalid mentor dashboard stats response from the server.");
  }

  const statsSource = isRecord(data.stats) ? data.stats : data;

  return {
    assignedMentees: firstNumber(statsSource, [
      "active_mentees",
      "assigned_mentees",
      "total_mentees",
      "mentees_count",
      "mentees",
    ]),
    openAvailability: firstNumber(statsSource, [
      "open_availability",
      "available_slots",
      "open_slots",
      "available_sessions",
    ]),
    bookedSessions: firstNumber(statsSource, [
      "booked_slots",
      "booked_sessions",
      "confirmed_sessions",
      "upcoming_sessions",
      "open_sessions",
    ]),
    pendingReviews: firstNumber(statsSource, [
      "pending_submissions",
      "pending_reviews",
      "submissions_pending",
      "tasks_pending_review",
      "review_queue",
    ]),
    raw: statsSource,
  };
}

export async function getMentorDashboardStats(): Promise<MentorDashboardStats> {
  const response = await apiRequest<unknown>("/api/mentor/dashboard/stats");
  return normalizeMentorDashboardStats(response);
}

/* =========================================================
   Dossier — GET /api/mentor/dossier/{bookingId}
========================================================= */

export type MentorDossier = UnknownRecord;

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

export function getMentorDossierPreReadDocuments(
  dossier: MentorDossier,
): MentorDossierPreReadDocument[] {
  const rawPreRead =
    dossier.document_vault_pre_read ?? dossier.pre_read_documents ?? dossier.documents;

  const entries = Array.isArray(rawPreRead)
    ? rawPreRead
    : isRecord(rawPreRead)
      ? [rawPreRead]
      : [];

  return entries.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];

    const filePath = resolveReturnedUrl(
      entry.file_path ?? entry.file_url ?? entry.signed_url ?? entry.url,
    );

    if (!filePath) return [];

    return [
      {
        label:
          firstString(entry, ["title", "file_name", "name", "original_name"]) ??
          `Pre-read document ${index + 1}`,
        filePath,
        raw: entry,
      },
    ];
  });
}

/* =========================================================
   Availability — GET/POST /api/mentor/availabilities
========================================================= */

export type MentorAvailability = {
  id: string | number | null;
  mentorId: string | number | null;
  availableDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingId: string | number | null;
  bookingStatus: string | null;
  menteeName: string | null;
  topic: string | null;
  meetingLink: string | null;
  createdAt: string;
  updatedAt: string;
  raw: UnknownRecord;
};

export type MentorAvailabilityPayload = {
  available_date: string;
  start_time: string;
  end_time: string;
};

function normalizeMentorAvailability(value: unknown): MentorAvailability | null {
  if (!isRecord(value)) return null;

  const booking = firstRecord(value, [
    "booking",
    "mentor_booking",
    "consultation_booking",
  ]);

  const mentee =
    firstRecord(booking, ["mentee", "user", "explorer"]) ??
    firstRecord(value, ["mentee", "user", "explorer"]);

  const rawId = value.id ?? value.availability_id;
  const availableDate = firstString(value, ["available_date", "date"]);
  const startTime = firstString(value, ["start_time", "startTime"]);
  const endTime = firstString(value, ["end_time", "endTime"]);

  if (!availableDate || !startTime || !endTime) return null;

  const bookingId =
    firstEntityId(value, ["booking_id"]) ??
    firstEntityId(booking, ["id", "booking_id"]);

  return {
    id: entityIdOrNull(rawId),
    mentorId: entityIdOrNull(value.mentor_id ?? value.mentorId),
    availableDate,
    startTime,
    endTime,
    isBooked: booleanOrFalse(value.is_booked ?? value.isBooked) || bookingId !== null,
    bookingId,
    bookingStatus:
      firstString(booking, ["status", "booking_status"]) ??
      firstString(value, ["booking_status", "status"]),
    menteeName:
      firstString(value, ["mentee_name", "user_name"]) ??
      firstString(mentee, ["name", "full_name"]),
    topic:
      firstString(booking, ["topic", "session_topic", "purpose", "notes"]) ??
      firstString(value, ["topic", "session_topic"]),
    meetingLink: resolveReturnedUrl(
      booking?.meeting_link ??
        booking?.meeting_url ??
        value.meeting_link ??
        value.meeting_url,
    ),
    createdAt: firstString(value, ["created_at", "createdAt"]) ?? "",
    updatedAt: firstString(value, ["updated_at", "updatedAt"]) ?? "",
    raw: value,
  };
}

export async function getMentorAvailabilities(): Promise<MentorAvailability[]> {
  const response = await apiRequest<unknown>("/api/mentor/availabilities");

  return extractList(response)
    .map(normalizeMentorAvailability)
    .filter(
      (availability): availability is MentorAvailability => availability !== null,
    );
}

export async function createMentorAvailability(
  payload: MentorAvailabilityPayload,
): Promise<unknown> {
  return apiRequest<unknown>("/api/mentor/availabilities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   Action plans — POST /api/mentor/bookings/{bookingId}/action-plans
========================================================= */

export type MentorActionPlanPayload = {
  task_description: string;
  deadline: string;
  parent_milestone_id: number;
};

export async function createMentorActionPlan(
  bookingId: string | number,
  payload: MentorActionPlanPayload,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/action-plans`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   Booking actions
========================================================= */

export async function confirmMentorBooking(
  bookingId: string | number,
  payload: { meeting_link: string },
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/confirm`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function rejectMentorBooking(
  bookingId: string | number,
  payload: { reason: string },
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/reject`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function rescheduleMentorBooking(
  bookingId: string | number,
  payload: { new_availability_id: number; reason: string },
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/reschedule`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function completeMentorBooking(
  bookingId: string | number,
  sessionProof: File,
): Promise<unknown> {
  const formData = new FormData();
  formData.append("session_proof", sessionProof);

  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/complete`,
    { method: "POST", body: formData },
  );
}

export async function reviewMentorBooking(
  bookingId: string | number,
  payload: { rating: number; feedback: string },
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/bookings/${encodeURIComponent(String(bookingId))}/review`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

/* =========================================================
   Submission queue
========================================================= */

export type MentorSubmission = {
  id: string | number;
  reviewStatus: string | null;
  menteeName: string | null;
  taskName: string | null;
  submittedAt: string | null;
  textResponse: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: string | null;
  milestoneId: number | null;
  deadline: string | null;
  feedback: string | null;
  rating: number | null;
  raw: UnknownRecord;
};

function normalizeMentorSubmission(value: unknown): MentorSubmission | null {
  if (!isRecord(value)) return null;

  const rawId = value.id ?? value.submission_id;
  if (typeof rawId !== "string" && typeof rawId !== "number") return null;

  const user = firstRecord(value, ["user", "mentee", "explorer"]);
  const milestone = firstRecord(value, ["milestone", "task"]);
  const document = firstRecord(value, [
    "document",
    "vault_document",
    "file",
    "attachment",
  ]);

  return {
    id: rawId,
    reviewStatus: firstString(value, ["review_status", "status"]),
    menteeName:
      firstString(value, ["mentee_name", "user_name"]) ??
      firstString(user, ["name", "full_name"]),
    taskName:
      firstString(value, ["task_name", "milestone_name", "title"]) ??
      firstString(milestone, ["task_name", "name", "title"]),
    submittedAt: firstString(value, ["submitted_at", "created_at"]),
    textResponse: firstString(value, [
      "text_response",
      "response_text",
      "answer",
      "text",
    ]),
    fileName:
      firstString(value, ["file_name", "original_name", "document_name"]) ??
      firstString(document, ["file_name", "original_name", "name", "title"]),
    fileUrl: resolveReturnedUrl(
      value.file_url ??
        value.file_path ??
        value.signed_url ??
        value.download_url ??
        document?.file_url ??
        document?.file_path ??
        document?.signed_url ??
        document?.download_url ??
        document?.url,
    ),
    fileType:
      firstString(value, ["file_type", "document_type"]) ??
      firstString(document, ["file_type", "document_type", "mime_type", "type"]),
    fileSize:
      firstString(value, ["file_size", "size"]) ??
      firstString(document, ["file_size", "size"]),
    milestoneId:
      firstNumber(value, ["milestone_id", "parent_milestone_id"]) ??
      firstNumber(milestone, ["id", "milestone_id", "parent_id"]),
    deadline:
      firstString(value, ["deadline", "target_date"]) ??
      firstString(milestone, ["target_date", "deadline"]),
    feedback: firstString(value, ["feedback", "mentor_feedback"]),
    rating: firstNumber(value, ["rating", "mentor_rating"]),
    raw: value,
  };
}

export async function getMentorSubmissions(
  reviewStatus = "pending",
): Promise<MentorSubmission[]> {
  const response = await apiRequest<unknown>(
    `/api/mentor/submissions?review_status=${encodeURIComponent(reviewStatus)}`,
  );

  return extractList(response)
    .map(normalizeMentorSubmission)
    .filter((submission): submission is MentorSubmission => submission !== null);
}

export async function reviewMentorSubmission(
  submissionId: string | number,
  payload: {
    status: "approved" | "revision_requested";
    feedback?: string;
    rating?: number;
  },
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/mentor/submissions/${encodeURIComponent(String(submissionId))}/review`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export type MentorSubmissionDocument = {
  id: string;
  name: string;
  menteeName: string;
  fileType: string | null;
  size: string | null;
  updatedAt: string | null;
  url: string | null;
  reviewStatus: string | null;
  submissionId: string | number;
};

function readDocumentEntries(
  submission: MentorSubmission,
): MentorSubmissionDocument[] {
  const documents: MentorSubmissionDocument[] = [];

  if (submission.fileName || submission.fileUrl) {
    documents.push({
      id: `submission-${String(submission.id)}`,
      name: submission.fileName ?? `Submission ${String(submission.id)}`,
      menteeName: submission.menteeName ?? "Unknown mentee",
      fileType: submission.fileType,
      size: submission.fileSize,
      updatedAt: submission.submittedAt,
      url: submission.fileUrl,
      reviewStatus: submission.reviewStatus,
      submissionId: submission.id,
    });
  }

  const listCandidates = [
    submission.raw.attachments,
    submission.raw.files,
    submission.raw.documents,
  ];

  listCandidates.forEach((candidate, listIndex) => {
    if (!Array.isArray(candidate)) return;

    candidate.forEach((entry, entryIndex) => {
      if (!isRecord(entry)) return;

      const name = firstString(entry, [
        "file_name",
        "original_name",
        "name",
        "title",
      ]);

      const url = resolveReturnedUrl(
        entry.file_url ??
          entry.file_path ??
          entry.signed_url ??
          entry.download_url ??
          entry.url,
      );

      if (!name && !url) return;

      documents.push({
        id: `submission-${String(submission.id)}-${listIndex}-${entryIndex}`,
        name: name ?? `Attachment ${entryIndex + 1}`,
        menteeName: submission.menteeName ?? "Unknown mentee",
        fileType: firstString(entry, [
          "file_type",
          "document_type",
          "mime_type",
          "type",
        ]),
        size: firstString(entry, ["file_size", "size"]),
        updatedAt:
          firstString(entry, ["updated_at", "created_at"]) ?? submission.submittedAt,
        url,
        reviewStatus: submission.reviewStatus,
        submissionId: submission.id,
      });
    });
  });

  return documents;
}

export function getMentorSubmissionDocuments(
  submissions: MentorSubmission[],
): MentorSubmissionDocument[] {
  const documents = submissions.flatMap(readDocumentEntries);
  const seen = new Set<string>();

  return documents.filter((document) => {
    const key = `${document.name}|${document.menteeName}|${document.url ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* =========================================================
   Invoices — GET /api/mentor/invoices
========================================================= */

export type MentorInvoice = {
  id: string | number;
  amount: number | null;
  status: string | null;
  issuedAt: string | null;
  raw: UnknownRecord;
};

function normalizeMentorInvoice(value: unknown): MentorInvoice | null {
  if (!isRecord(value)) return null;

  const id = entityIdOrNull(value.id ?? value.invoice_id);
  if (id === null) return null;

  return {
    id,
    amount: firstNumber(value, ["amount", "total", "fee"]),
    status: firstString(value, ["status", "payment_status"]),
    issuedAt: firstString(value, ["issued_at", "created_at", "paid_at"]),
    raw: value,
  };
}

export async function getMentorInvoices(): Promise<MentorInvoice[]> {
  const response = await apiRequest<unknown>("/api/mentor/invoices");

  return extractList(response)
    .map(normalizeMentorInvoice)
    .filter((invoice): invoice is MentorInvoice => invoice !== null);
}
