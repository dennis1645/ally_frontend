/* =========================================================
   Shared API types
========================================================= */

export type DiagnosticApiStatus =
  | "success"
  | "error";

export type DiagnosticAssessmentType =
  "initial_diagnostic";

/* =========================================================
   Diagnostic question options
========================================================= */

export type DiagnosticOption = {
  id: number;

  diagnostic_question_id?:
    number;

  option_text: string;

  /*
   * These fields may be returned by administrative
   * endpoints, even though the public assessment UI
   * does not need to display them.
   */
  score_weight?: number;

  weakness_tag?:
    string | null;

  strength_tag?:
    string | null;

  created_at?:
    string | null;

  updated_at?:
    string | null;
};

/* =========================================================
   Diagnostic questions
========================================================= */

export type DiagnosticQuestion = {
  id: number;

  question_text: string;

  category: string;

  order_number: number;

  options:
    DiagnosticOption[];

  /*
   * Laravel may return the active state as a boolean
   * or as the numeric values 0 and 1.
   */
  is_active?:
    boolean | 0 | 1;

  created_at?:
    string | null;

  updated_at?:
    string | null;
};

/* =========================================================
   Question API responses
========================================================= */

export type DiagnosticQuestionsResponse = {
  status:
    DiagnosticApiStatus;

  message?: string;

  data:
    DiagnosticQuestion[];
};

/*
 * Shape returned by Laravel when the question endpoint
 * uses pagination.
 */
export type DiagnosticQuestionsPagination = {
  current_page: number;

  data:
    DiagnosticQuestion[];

  first_page_url?:
    string | null;

  from?:
    number | null;

  last_page: number;

  last_page_url?:
    string | null;

  next_page_url?:
    string | null;

  path?:
    string;

  per_page: number;

  prev_page_url?:
    string | null;

  to?:
    number | null;

  total: number;
};

export type PaginatedDiagnosticQuestionsResponse = {
  status:
    DiagnosticApiStatus;

  message?: string;

  data:
    DiagnosticQuestionsPagination;
};

/* =========================================================
   Frontend assessment pages
========================================================= */

/*
 * One page contains five questions in the current
 * frontend assessment.
 */
export type AssessmentPage = {
  key: string;

  title: string;

  description: string;

  speech: string;

  questions:
    DiagnosticQuestion[];
};

/*
 * Kept for compatibility with older components that grouped
 * questions by section instead of frontend pagination.
 */
export type AssessmentSection = {
  key: string;

  title: string;

  description: string;

  speech: string;

  questions:
    DiagnosticQuestion[];
};

/* =========================================================
   Locally stored assessment state
========================================================= */

/*
 * Key:
 *   question ID converted to a string
 *
 * Value:
 *   selected option ID
 *
 * Example:
 * {
 *   "1": 5,
 *   "2": 10
 * }
 */
export type AssessmentAnswers =
  Record<string, number>;

export type PersistedAssessmentState = {
  version: number;

  /*
   * Zero-based frontend page index.
   */
  currentStep: number;

  answers:
    AssessmentAnswers;

  /*
   * Zero-based page indexes that the user has completed.
   */
  completedSteps:
    number[];

  updatedAt: string;
};

/* =========================================================
   Answer validation
========================================================= */

export type AssessmentValidationResult = {
  valid: boolean;

  unansweredQuestionIds:
    number[];
};

/* =========================================================
   Submission payloads
========================================================= */

/*
 * One answer sent to the backend.
 */
export type DiagnosticAnswerPayload = {
  question_id: number;

  option_id: number;
};

/*
 * This is returned by:
 *
 * assessment.buildSubmissionPayload()
 *
 * useAssessment only needs to build the answers. The page
 * component adds assessment_type and guest_token before
 * sending the request.
 */
export type AssessmentAnswersPayload = {
  answers:
    DiagnosticAnswerPayload[];
};

/*
 * Complete payload required by:
 *
 * POST /api/diagnostic/submit
 */
export type SubmitAssessmentPayload = {
  assessment_type:
    DiagnosticAssessmentType;

  guest_token: string;

  answers:
    DiagnosticAnswerPayload[];
};

/* =========================================================
   Diagnostic result
========================================================= */

export type DiagnosticResultData = {
  id: number;

  user_id:
    number | null;

  guest_token: string;

  assessment_type:
    DiagnosticAssessmentType;

  /*
   * Total readiness score from 0 to 100.
   */
  overall_score: number;

  /*
   * Individual diagnostic category scores.
   */
  academic_score: number;

  goals_score: number;

  leadership_experience_score:
    number;

  language_score: number;

  application_readiness_score:
    number;

  /*
   * Backend-generated strength and weakness identifiers.
   */
  weaknesses_mapping:
    string[];

  strengths_mapping:
    string[];

  /*
   * Backend or AI-generated recommendation.
   */
  system_recommendation:
    string;

  created_at: string;

  updated_at: string;
};

/* =========================================================
   Submission API response
========================================================= */

export type SubmitAssessmentResponse = {
  status:
    DiagnosticApiStatus;

  message?: string;

  data?:
    DiagnosticResultData | null;
};

/* =========================================================
   Guest result API response
========================================================= */

export type DiagnosticResultResponse = {
  status:
    DiagnosticApiStatus;

  message?: string;

  data:
    DiagnosticResultData;
};

/* =========================================================
   Backend error types
========================================================= */

export type DiagnosticErrorCode =
  | "network_error"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_error"
  | "invalid_response"
  | "server_error"
  | "unknown";

export type DiagnosticErrorDetails = {
  code:
    DiagnosticErrorCode;

  status?: number;

  validationErrors?:
    Record<string, string[]>;

  responseData?: unknown;
};