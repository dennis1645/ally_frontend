import { apiRequest } from "./apiClient";

/* =========================================================
   Types
========================================================= */

// 1. Dashboard & Invoices
export type MentorUpcomingSchedule = {
  id: number;
  session_status: string;
  meeting_link: string | null;
  mentee: {
    id: number;
    name: string;
    email: string;
    profile_picture_url: string | null;
  };
};

export type MentorDashboardStats = {
  statistics: {
    total_mentees: number;
    completed_sessions: number;
    upcoming_sessions: number;
    earning_balance: number;
  };
  upcoming_schedules: MentorUpcomingSchedule[];
};

export type MentorInvoiceItem = {
  invoice_id: string;
  booking_id: number;
  mentee_name: string;
  consultation_date: string;
  time_slot: string;
  earned_fee: number;
  payment_status: string;
  completed_at: string;
};

export type MentorInvoicesData = {
  current_earning_balance: number;
  total_invoices: number;
  history: MentorInvoiceItem[];
};

// 2. Mentees & Dossier
export type MenteeItem = {
  mentee_id: number;
  booking_id?: number | string;
  name: string;
  email: string;
  phone_number: string;
  target_scholarship: string;
  target_country: string;
  readiness_score: number;
  total_xp: number;
  progress_summary: {
    total_tasks: number;
    completed_tasks: number;
    progress_percentage: string;
  };
  uploaded_documents_count: number;
};

export type MentorDossierDocument = {
  document_id: number;
  file_name: string;
  file_type: string;
  preview_url: string;
};

export type MenteeMilestoneProgressItem = {
  milestone_id: number;
  parent_id: number | null;
  task_name: string;
  description?: string;
  status: string;
  target_date?: string;
};

export type MentorDossierData = {
  booking_id: number;
  session_status: string;
  meeting_link: string | null;
  mentee_profile: {
    id: number;
    name: string;
    email: string;
    readiness_score: number;
    target_scholarship: string;
  };
  document_vault_pre_read: MentorDossierDocument[];
  milestones_progress?: MenteeMilestoneProgressItem[];
};

// 3. Availability
export type MentorAvailabilitySlot = {
  id: number;
  mentor_id: number;
  available_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

export type CreateAvailabilityInput = {
  available_date: string;
  start_time: string;
  end_time: string;
};

// 4. Session Actions
export type RescheduleBookingInput = {
  available_date: string;
  start_time: string;
  end_time: string;
  reason: string;
};

export type ReviewMenteeInput = {
  rating: number;
  feedback: string;
};

// 5. Action Plans & Submissions
export type ActionPlanItemInput = {
  task_title: string;
  task_description: string;
  mentor_note?: string;
  deadline: string;
};

export type CreateActionPlanPayload = {
  parent_milestone_id?: number;
  action_plans: ActionPlanItemInput[];
};

export type MenteeSubmission = {
  submission_id: number;
  milestone_id: number;
  task_name: string;
  mentee: {
    id: number;
    name: string;
    email: string;
  };
  submission_type: string;
  text_response: string;
  file_name: string;
  file_url: string;
  review_status: "pending" | "approved" | "revision_requested";
  submitted_at: string;
};

export type ReviewSubmissionPayload = {
  status: "approved" | "revision_requested";
  feedback: string;
  rating?: number;
};

// 6. Shared Documents
export type SharedDocumentItem = {
  id: number;
  mentor_id?: number;
  title: string;
  file_name?: string;
  file_url: string;
  created_at?: string;
};

// Generic API response structure
export type ApiResponse<T> = {
  status: string;
  message?: string;
  data: T;
};

/* =========================================================
   1. Dashboard & Keuangan Mentor
========================================================= */

/** GET /api/mentor/dashboard/stats */
export async function getMentorDashboardStatsApi(): Promise<ApiResponse<MentorDashboardStats>> {
  return await apiRequest<ApiResponse<MentorDashboardStats>>("/api/mentor/dashboard/stats", {
    method: "GET",
  });
}

/** GET /api/mentor/invoices */
export async function getMentorInvoicesApi(): Promise<ApiResponse<MentorInvoicesData>> {
  return await apiRequest<ApiResponse<MentorInvoicesData>>("/api/mentor/invoices", {
    method: "GET",
  });
}

/* =========================================================
   2. Manajemen Mentee & Berkas
========================================================= */

/** GET /api/mentor/mentees */
export async function getMentorMenteesApi(): Promise<ApiResponse<MenteeItem[]>> {
  return await apiRequest<ApiResponse<MenteeItem[]>>("/api/mentor/mentees", {
    method: "GET",
  });
}

/** GET /api/mentor/dossier/{bookingId} */
export async function getMentorDossierApi(bookingId: number | string): Promise<ApiResponse<MentorDossierData>> {
  return await apiRequest<ApiResponse<MentorDossierData>>(`/api/mentor/dossier/${bookingId}`, {
    method: "GET",
  });
}

/* =========================================================
   3. Kalender & Manajemen Slot Ketersediaan
========================================================= */

/** GET /api/mentor/availabilities */
export async function getMentorAvailabilitiesApi(): Promise<ApiResponse<MentorAvailabilitySlot[]>> {
  return await apiRequest<ApiResponse<MentorAvailabilitySlot[]>>("/api/mentor/availabilities", {
    method: "GET",
  });
}

/** POST /api/mentor/availabilities */
export async function createMentorAvailabilitiesApi(
  availabilities: CreateAvailabilityInput[]
): Promise<ApiResponse<MentorAvailabilitySlot[]>> {
  return await apiRequest<ApiResponse<MentorAvailabilitySlot[]>>("/api/mentor/availabilities", {
    method: "POST",
    body: JSON.stringify({ availabilities }),
  });
}

/* =========================================================
   4. Tindakan Sesi Konsultasi
========================================================= */

/** PATCH /api/mentor/bookings/{bookingId}/confirm */
export async function confirmBookingApi(
  bookingId: number | string,
  meetingLink: string
): Promise<ApiResponse<{ id: number; session_status: string; meeting_link: string }>> {
  return await apiRequest<ApiResponse<{ id: number; session_status: string; meeting_link: string }>>(
    `/api/mentor/bookings/${bookingId}/confirm`,
    {
      method: "PATCH",
      body: JSON.stringify({ meeting_link: meetingLink }),
    }
  );
}

/** PATCH /api/mentor/bookings/{bookingId}/reject */
export async function rejectBookingApi(
  bookingId: number | string
): Promise<ApiResponse<null | Record<string, unknown>>> {
  return await apiRequest<ApiResponse<null | Record<string, unknown>>>(
    `/api/mentor/bookings/${bookingId}/reject`,
    {
      method: "PATCH",
    }
  );
}

/** PATCH /api/mentor/bookings/{bookingId}/reschedule */
export async function rescheduleBookingApi(
  bookingId: number | string,
  input: RescheduleBookingInput
): Promise<ApiResponse<{ reschedule_reason: string; pop_up_indicator: boolean }>> {
  return await apiRequest<ApiResponse<{ reschedule_reason: string; pop_up_indicator: boolean }>>(
    `/api/mentor/bookings/${bookingId}/reschedule`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

/** POST /api/mentor/bookings/{bookingId}/complete (multipart/form-data) */
export async function completeBookingApi(
  bookingId: number | string,
  sessionProofFile: File
): Promise<ApiResponse<{ booking_id: number; session_status: string; earned_fee: number; new_earning_balance: number }>> {
  const formData = new FormData();
  formData.append("session_proof", sessionProofFile);

  return await apiRequest<ApiResponse<{ booking_id: number; session_status: string; earned_fee: number; new_earning_balance: number }>>(
    `/api/mentor/bookings/${bookingId}/complete`,
    {
      method: "POST",
      body: formData,
    }
  );
}

/** POST /api/mentor/bookings/{bookingId}/review */
export async function reviewMenteeApi(
  bookingId: number | string,
  input: ReviewMenteeInput
): Promise<ApiResponse<{ id: number; rating: number; feedback: string }>> {
  return await apiRequest<ApiResponse<{ id: number; rating: number; feedback: string }>>(
    `/api/mentor/bookings/${bookingId}/review`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

/* =========================================================
   5. Penugasan & Audit Tugas Mentee
========================================================= */

/** POST /api/mentor/bookings/{bookingId}/action-plans */
export async function createActionPlanApi(
  bookingId: number | string,
  payload: CreateActionPlanPayload
): Promise<ApiResponse<{ action_plans: unknown[]; user_milestones: unknown[] }>> {
  return await apiRequest<ApiResponse<{ action_plans: unknown[]; user_milestones: unknown[] }>>(
    `/api/mentor/bookings/${bookingId}/action-plans`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/** GET /api/mentor/submissions */
export async function getMentorSubmissionsApi(
  reviewStatus?: "pending" | "approved" | "revision_requested"
): Promise<ApiResponse<MenteeSubmission[]>> {
  const queryParam = reviewStatus ? `?review_status=${reviewStatus}` : "";
  return await apiRequest<ApiResponse<MenteeSubmission[]>>(`/api/mentor/submissions${queryParam}`, {
    method: "GET",
  });
}

/** POST /api/mentor/submissions/{submissionId}/review */
export async function reviewSubmissionApi(
  submissionId: number | string,
  payload: ReviewSubmissionPayload
): Promise<ApiResponse<{ submission_id: number; review_status: string; mentor_feedback: string; xp_awarded: number; updated_readiness_score: number }>> {
  return await apiRequest<ApiResponse<{ submission_id: number; review_status: string; mentor_feedback: string; xp_awarded: number; updated_readiness_score: number }>>(
    `/api/mentor/submissions/${submissionId}/review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =========================================================
   6. Dokumen Berbagi Mentor (Shared Mentor Documents)
========================================================= */

/** GET /api/mentor/documents */
export async function getMentorDocumentsApi(): Promise<ApiResponse<SharedDocumentItem[]>> {
  return await apiRequest<ApiResponse<SharedDocumentItem[]>>("/api/mentor/documents", {
    method: "GET",
  });
}

/** POST /api/mentor/documents (multipart: file, title) */
export async function uploadMentorDocumentApi(
  title: string,
  file: File
): Promise<ApiResponse<SharedDocumentItem>> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  return await apiRequest<ApiResponse<SharedDocumentItem>>("/api/mentor/documents", {
    method: "POST",
    body: formData,
  });
}

/** DELETE /api/mentor/documents/{id} */
export async function deleteMentorDocumentApi(
  id: number | string
): Promise<ApiResponse<null | Record<string, unknown>>> {
  return await apiRequest<ApiResponse<null | Record<string, unknown>>>(`/api/mentor/documents/${id}`, {
    method: "DELETE",
  });
}
