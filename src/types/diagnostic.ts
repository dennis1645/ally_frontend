/* =========================================================
   API primitives
========================================================= */

export type DiagnosticApiStatus =
  | "success"
  | "error";

export type DiagnosticCategory =
  | "academic"
  | "scholarship"
  | "leadership"
  | "experience"
  | "language"
  | "motivation"
  | "documents"
  | string;

/* =========================================================
   Question and option models
========================================================= */

export interface DiagnosticOption {
  id: number;

  /**
   * Some backend responses may include this field.
   */
  diagnostic_question_id?: number;

  option_text: string;
}

export interface DiagnosticQuestion {
  id: number;
  question_text: string;
  category: DiagnosticCategory;
  order_number: number;
  options: DiagnosticOption[];

  /**
   * Optional backend fields.
   */
  is_active?: boolean | 0 | 1;
  created_at?: string | null;
  updated_at?: string | null;
}

/* =========================================================
   Questions API response
========================================================= */

export interface DiagnosticQuestionsResponse {
  status: DiagnosticApiStatus;
  data: DiagnosticQuestion[];
}

/**
 * The API specification has appeared in two forms:
 *
 * Direct array:
 * [
 *   { question... }
 * ]
 *
 * Wrapped response:
 * {
 *   status: "success",
 *   data: [...]
 * }
 */
export type DiagnosticQuestionsApiResponse =
  | DiagnosticQuestion[]
  | DiagnosticQuestionsResponse;

/* =========================================================
   Assessment answers
========================================================= */

/**
 * The key is the question ID converted to a string.
 *
 * Example:
 * {
 *   "1": 3,
 *   "2": 8
 * }
 */
export type AssessmentAnswers =
  Record<string, number>;

export interface DiagnosticAnswerPayload {
  question_id: number;
  option_id: number;
}

/* =========================================================
   Assessment submission
========================================================= */

export interface SubmitAssessmentPayload {
  answers: DiagnosticAnswerPayload[];
}

export interface SubmitAssessmentResponse {
  status: DiagnosticApiStatus;
  message?: string;
  data?: unknown;
}

/* =========================================================
   Assessment sections
========================================================= */

export type AssessmentSectionKey =
  | "academic"
  | "scholarship"
  | "leadership"
  | "experience"
  | "language"
  | "motivation"
  | "documents"
  | "review";

export interface AssessmentSectionDefinition {
  key: AssessmentSectionKey;
  title: string;
  description: string;
  speech: string;
  questionRange: readonly [
    number,
    number,
  ] | null;
}

export interface AssessmentSection {
  key: AssessmentSectionKey;
  title: string;
  description: string;
  speech: string;
  questions: DiagnosticQuestion[];
}

/* =========================================================
   Local persistence
========================================================= */

export interface PersistedAssessmentState {
  version: 1;
  currentStep: number;
  answers: AssessmentAnswers;
  completedSteps: number[];
  updatedAt: string;
}

/* =========================================================
   Validation
========================================================= */

export interface AssessmentValidationResult {
  valid: boolean;
  unansweredQuestionIds: number[];
}

/* =========================================================
   Service errors
========================================================= */

export type DiagnosticErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_error"
  | "server_error"
  | "network_error"
  | "timeout"
  | "invalid_response"
  | "unknown";

export interface DiagnosticErrorDetails {
  code: DiagnosticErrorCode;
  status?: number;
  validationErrors?: Record<
    string,
    string[]
  >;
  responseData?: unknown;
}