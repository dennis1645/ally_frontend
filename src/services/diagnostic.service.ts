import axios from "axios";

import { axiosClient } from "./axiosClient";

import type {
  DiagnosticAnswerPayload,
  DiagnosticErrorCode,
  DiagnosticErrorDetails,
  DiagnosticOption,
  DiagnosticQuestion,
  DiagnosticQuestionsResponse,
  DiagnosticResultData,
  DiagnosticResultResponse,
  SubmitAssessmentPayload,
  SubmitAssessmentResponse,
} from "../types/diagnostic";

/* =========================================================
   API endpoints
========================================================= */

const DIAGNOSTIC_ENDPOINTS = {
  questions: "/api/diagnostic/questions",
  submit: "/api/diagnostic/submit",
  myResult: "/api/diagnostic/my-result",
} as const;

/* =========================================================
   Internal pagination type
========================================================= */

type DiagnosticPaginationData = {
  currentPage: number;
  lastPage: number;
  questions: unknown[];
};

/* =========================================================
   Service error
========================================================= */

export class DiagnosticServiceError extends Error {
  readonly code: DiagnosticErrorCode;
  readonly status?: number;
  readonly validationErrors?: Record<string, string[]>;
  readonly responseData?: unknown;

  constructor(
    message: string,
    details: DiagnosticErrorDetails,
  ) {
    super(message);

    this.name = "DiagnosticServiceError";
    this.code = details.code;
    this.status = details.status;
    this.validationErrors = details.validationErrors;
    this.responseData = details.responseData;

    Object.setPrototypeOf(
      this,
      DiagnosticServiceError.prototype,
    );
  }
}

/* =========================================================
   Runtime type helpers
========================================================= */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toPositiveInteger(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsedValue = Number(value);

    if (
      Number.isInteger(parsedValue) &&
      parsedValue > 0
    ) {
      return parsedValue;
    }
  }

  return null;
}

function toFiniteNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

function normalizeOptionalDate(
  value: unknown,
): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();
    return normalizedValue || null;
  }

  return undefined;
}

function normalizeNullableString(
  value: unknown,
): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();
    return normalizedValue || null;
  }

  return undefined;
}

function normalizeActiveState(
  value: unknown,
): boolean | 0 | 1 | undefined {
  if (
    value === true ||
    value === false ||
    value === 0 ||
    value === 1
  ) {
    return value;
  }

  if (
    value === "1" ||
    value === "true"
  ) {
    return 1;
  }

  if (
    value === "0" ||
    value === "false"
  ) {
    return 0;
  }

  return undefined;
}

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string",
    )
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/* =========================================================
   Question-option normalization
========================================================= */

function normalizeOption(
  value: unknown,
): DiagnosticOption {
  if (!isRecord(value)) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid question option.",
      {
        code: "invalid_response",
        responseData: value,
      },
    );
  }

  const id = toPositiveInteger(value.id);
  const diagnosticQuestionId = toPositiveInteger(
    value.diagnostic_question_id,
  );
  const optionText =
    typeof value.option_text === "string"
      ? value.option_text.trim()
      : "";

  if (
    id === null ||
    optionText.length === 0
  ) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid question option.",
      {
        code: "invalid_response",
        responseData: value,
      },
    );
  }

  const scoreWeight = toFiniteNumber(
    value.score_weight,
  );
  const weaknessTag = normalizeNullableString(
    value.weakness_tag,
  );
  const strengthTag = normalizeNullableString(
    value.strength_tag,
  );
  const createdAt = normalizeOptionalDate(
    value.created_at,
  );
  const updatedAt = normalizeOptionalDate(
    value.updated_at,
  );

  return {
    id,
    option_text: optionText,

    ...(diagnosticQuestionId !== null
      ? {
          diagnostic_question_id:
            diagnosticQuestionId,
        }
      : {}),

    ...(scoreWeight !== null
      ? {
          score_weight: scoreWeight,
        }
      : {}),

    ...(weaknessTag !== undefined
      ? {
          weakness_tag: weaknessTag,
        }
      : {}),

    ...(strengthTag !== undefined
      ? {
          strength_tag: strengthTag,
        }
      : {}),

    ...(createdAt !== undefined
      ? {
          created_at: createdAt,
        }
      : {}),

    ...(updatedAt !== undefined
      ? {
          updated_at: updatedAt,
        }
      : {}),
  };
}

/* =========================================================
   Question normalization
========================================================= */

function normalizeQuestion(
  value: unknown,
): DiagnosticQuestion {
  if (!isRecord(value)) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid question.",
      {
        code: "invalid_response",
        responseData: value,
      },
    );
  }

  const id = toPositiveInteger(value.id);
  const orderNumber = toPositiveInteger(
    value.order_number,
  );
  const questionText =
    typeof value.question_text === "string"
      ? value.question_text.trim()
      : "";
  const category =
    typeof value.category === "string"
      ? value.category.trim()
      : "";
  const options = value.options;

  if (
    id === null ||
    orderNumber === null ||
    questionText.length === 0 ||
    category.length === 0 ||
    !Array.isArray(options)
  ) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid question.",
      {
        code: "invalid_response",
        responseData: value,
      },
    );
  }

  const normalizedOptions = options.map(
    (option: unknown): DiagnosticOption =>
      normalizeOption(option),
  );

  if (normalizedOptions.length === 0) {
    throw new DiagnosticServiceError(
      `Question ${id} does not contain any answer options.`,
      {
        code: "invalid_response",
        responseData: value,
      },
    );
  }

  const isActive = normalizeActiveState(
    value.is_active,
  );
  const createdAt = normalizeOptionalDate(
    value.created_at,
  );
  const updatedAt = normalizeOptionalDate(
    value.updated_at,
  );

  return {
    id,
    question_text: questionText,
    category,
    order_number: orderNumber,
    options: normalizedOptions,

    ...(isActive !== undefined
      ? {
          is_active: isActive,
        }
      : {}),

    ...(createdAt !== undefined
      ? {
          created_at: createdAt,
        }
      : {}),

    ...(updatedAt !== undefined
      ? {
          updated_at: updatedAt,
        }
      : {}),
  };
}

/* =========================================================
   Question-array extraction
========================================================= */

function extractQuestionArray(
  response: unknown,
): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response)) {
    throw new DiagnosticServiceError(
      "The assessment server returned data in an unexpected format.",
      {
        code: "invalid_response",
        responseData: response,
      },
    );
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    isRecord(response.data) &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }

  if (Array.isArray(response.questions)) {
    return response.questions;
  }

  if (
    isRecord(response.data) &&
    Array.isArray(response.data.questions)
  ) {
    return response.data.questions;
  }

  throw new DiagnosticServiceError(
    "The assessment server returned data in an unexpected format.",
    {
      code: "invalid_response",
      responseData: response,
    },
  );
}

/* =========================================================
   Laravel-pagination extraction
========================================================= */

function extractPaginationData(
  response: unknown,
): DiagnosticPaginationData | null {
  if (!isRecord(response)) {
    return null;
  }

  const pagination = isRecord(response.data)
    ? response.data
    : response;

  const currentPage = toPositiveInteger(
    pagination.current_page,
  );
  const lastPage = toPositiveInteger(
    pagination.last_page,
  );
  const questions = pagination.data;

  if (
    currentPage === null ||
    lastPage === null ||
    !Array.isArray(questions)
  ) {
    return null;
  }

  return {
    currentPage,
    lastPage,
    questions,
  };
}

/* =========================================================
   Questions-response normalization
========================================================= */

function normalizeQuestionsResponse(
  response: unknown,
): DiagnosticQuestionsResponse {
  const rawQuestions = extractQuestionArray(
    response,
  );

  const normalizedQuestions = rawQuestions
    .map(
      (rawQuestion: unknown): DiagnosticQuestion =>
        normalizeQuestion(rawQuestion),
    )
    .filter(
      (question: DiagnosticQuestion): boolean =>
        question.is_active !== false &&
        question.is_active !== 0,
    );

  const seenQuestionIds = new Set<number>();
  const uniqueQuestions: DiagnosticQuestion[] = [];

  for (const question of normalizedQuestions) {
    if (seenQuestionIds.has(question.id)) {
      continue;
    }

    seenQuestionIds.add(question.id);
    uniqueQuestions.push(question);
  }

  return {
    status: "success",
    data: uniqueQuestions,
  };
}

/* =========================================================
   Diagnostic-result normalization
========================================================= */

function normalizeResultData(
  value: unknown,
): DiagnosticResultData {
  if (!isRecord(value)) {
    throw new DiagnosticServiceError(
      "The assessment server returned invalid result data.",
      {
        code: "invalid_response",
        responseData: value,
      },
    );
  }

  const id = toPositiveInteger(value.id);
  const guestToken =
    typeof value.guest_token === "string"
      ? value.guest_token.trim()
      : "";
  const assessmentType =
    typeof value.assessment_type === "string"
      ? value.assessment_type.trim()
      : "";
  const overallScore = toFiniteNumber(
    value.overall_score,
  );
  const academicScore = toFiniteNumber(
    value.academic_score,
  );
  const goalsScore = toFiniteNumber(
    value.goals_score,
  );
  const leadershipExperienceScore =
    toFiniteNumber(
      value.leadership_experience_score,
    );
  const languageScore = toFiniteNumber(
    value.language_score,
  );
  const applicationReadinessScore =
    toFiniteNumber(
      value.application_readiness_score,
    );
  const systemRecommendation =
    typeof value.system_recommendation === "string"
      ? value.system_recommendation.trim()
      : "";
  const createdAt =
    typeof value.created_at === "string"
      ? value.created_at.trim()
      : "";
  const updatedAt =
    typeof value.updated_at === "string"
      ? value.updated_at.trim()
      : "";

  if (
    id === null ||
    guestToken.length === 0 ||
    assessmentType !== "initial_diagnostic" ||
    overallScore === null ||
    academicScore === null ||
    goalsScore === null ||
    leadershipExperienceScore === null ||
    languageScore === null ||
    applicationReadinessScore === null ||
    systemRecommendation.length === 0 ||
    createdAt.length === 0 ||
    updatedAt.length === 0
  ) {
    throw new DiagnosticServiceError(
      "The assessment server returned incomplete result data.",
      {
        code: "invalid_response",
        responseData: value,
      },
    );
  }

  let userId: number | null = null;

  if (
    value.user_id !== null &&
    value.user_id !== undefined
  ) {
    const normalizedUserId = toPositiveInteger(
      value.user_id,
    );

    if (normalizedUserId === null) {
      throw new DiagnosticServiceError(
        "The assessment result contains an invalid user ID.",
        {
          code: "invalid_response",
          responseData: value,
        },
      );
    }

    userId = normalizedUserId;
  }

  return {
    id,
    user_id: userId,
    guest_token: guestToken,
    assessment_type: "initial_diagnostic",
    overall_score: overallScore,
    academic_score: academicScore,
    goals_score: goalsScore,
    leadership_experience_score:
      leadershipExperienceScore,
    language_score: languageScore,
    application_readiness_score:
      applicationReadinessScore,
    weaknesses_mapping: normalizeStringArray(
      value.weaknesses_mapping,
    ),
    strengths_mapping: normalizeStringArray(
      value.strengths_mapping,
    ),
    system_recommendation: systemRecommendation,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function hasCompleteResultShape(
  value: unknown,
): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.id !== undefined &&
    value.guest_token !== undefined &&
    value.assessment_type !== undefined &&
    value.overall_score !== undefined &&
    value.academic_score !== undefined &&
    value.goals_score !== undefined &&
    value.leadership_experience_score !==
      undefined &&
    value.language_score !== undefined &&
    value.application_readiness_score !==
      undefined &&
    value.system_recommendation !== undefined &&
    value.created_at !== undefined &&
    value.updated_at !== undefined
  );
}

/* =========================================================
   Submission-response normalization
========================================================= */

function normalizeSubmissionResponse(
  response: unknown,
): SubmitAssessmentResponse {
  if (
    response === undefined ||
    response === null ||
    response === ""
  ) {
    return {
      status: "success",
      message:
        "Assessment submitted successfully.",
    };
  }

  if (!isRecord(response)) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid submission response.",
      {
        code: "invalid_response",
        responseData: response,
      },
    );
  }

  const status =
    response.status === "error"
      ? "error"
      : "success";
  const message =
    typeof response.message === "string" &&
    response.message.trim()
      ? response.message.trim()
      : undefined;

  const normalizedResponse: SubmitAssessmentResponse = {
    status,
  };

  if (message) {
    normalizedResponse.message = message;
  }

  /*
   * The result page retrieves the authoritative result from
   * GET /api/diagnostic/my-result. A successful submit response
   * is therefore allowed to omit data or return partial data.
   */
  if (hasCompleteResultShape(response.data)) {
    normalizedResponse.data = normalizeResultData(
      response.data,
    );
  }

  return normalizedResponse;
}

/* =========================================================
   Guest-result response normalization
========================================================= */

function normalizeResultResponse(
  response: unknown,
): DiagnosticResultResponse {
  if (!isRecord(response)) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid result response.",
      {
        code: "invalid_response",
        responseData: response,
      },
    );
  }

  if (response.status !== "success") {
    const errorMessage =
      typeof response.message === "string" &&
      response.message.trim().length > 0
        ? response.message.trim()
        : "The assessment result could not be loaded.";

    throw new DiagnosticServiceError(
      errorMessage,
      {
        code: "server_error",
        responseData: response,
      },
    );
  }

  const normalizedResponse: DiagnosticResultResponse = {
    status: "success",
    data: normalizeResultData(response.data),
  };

  if (
    typeof response.message === "string" &&
    response.message.trim().length > 0
  ) {
    normalizedResponse.message =
      response.message.trim();
  }

  return normalizedResponse;
}

/* =========================================================
   Submission-answer validation
========================================================= */

function validateAnswer(
  answer: unknown,
): DiagnosticAnswerPayload {
  if (!isRecord(answer)) {
    throw new DiagnosticServiceError(
      "The assessment contains an invalid answer.",
      {
        code: "validation_error",
        responseData: answer,
      },
    );
  }

  const questionId = toPositiveInteger(
    answer.question_id,
  );
  const optionId = toPositiveInteger(
    answer.option_id,
  );

  if (
    questionId === null ||
    optionId === null
  ) {
    throw new DiagnosticServiceError(
      "The assessment contains an invalid answer.",
      {
        code: "validation_error",
        responseData: answer,
      },
    );
  }

  return {
    question_id: questionId,
    option_id: optionId,
  };
}

/* =========================================================
   Submission-payload validation
========================================================= */

function validateSubmissionPayload(
  payload: SubmitAssessmentPayload,
): SubmitAssessmentPayload {
  if (
    payload.assessment_type !==
      "initial_diagnostic"
  ) {
    throw new DiagnosticServiceError(
      "The assessment type is invalid.",
      {
        code: "validation_error",
        responseData: payload,
      },
    );
  }

  const guestToken =
    typeof payload.guest_token === "string"
      ? payload.guest_token.trim()
      : "";

  if (guestToken.length === 0) {
    throw new DiagnosticServiceError(
      "A guest token is required to submit the assessment.",
      {
        code: "validation_error",
        responseData: payload,
      },
    );
  }

  if (
    !Array.isArray(payload.answers) ||
    payload.answers.length === 0
  ) {
    throw new DiagnosticServiceError(
      "At least one assessment answer is required.",
      {
        code: "validation_error",
        responseData: payload,
      },
    );
  }

  const validatedAnswers = payload.answers.map(
    (
      answer: DiagnosticAnswerPayload,
    ): DiagnosticAnswerPayload =>
      validateAnswer(answer),
  );

  const questionIds = new Set<number>();

  for (const answer of validatedAnswers) {
    if (questionIds.has(answer.question_id)) {
      throw new DiagnosticServiceError(
        `Question ${answer.question_id} appears more than once in the assessment submission.`,
        {
          code: "validation_error",
          responseData: payload,
        },
      );
    }

    questionIds.add(answer.question_id);
  }

  return {
    assessment_type: "initial_diagnostic",
    guest_token: guestToken,
    answers: validatedAnswers,
  };
}

/* =========================================================
   Guest-token validation
========================================================= */

function validateGuestToken(
  guestToken: string,
): string {
  const normalizedGuestToken = guestToken.trim();

  if (normalizedGuestToken.length === 0) {
    throw new DiagnosticServiceError(
      "A guest token is required to load the assessment result.",
      {
        code: "validation_error",
        responseData: {
          guest_token: guestToken,
        },
      },
    );
  }

  return normalizedGuestToken;
}

/* =========================================================
   Backend-validation error normalization
========================================================= */

function normalizeValidationErrors(
  value: unknown,
): Record<string, string[]> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const errors: Record<string, string[]> = {};

  for (const [field, fieldErrors] of Object.entries(value)) {
    if (Array.isArray(fieldErrors)) {
      const normalizedFieldErrors = fieldErrors
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      if (normalizedFieldErrors.length > 0) {
        errors[field] = normalizedFieldErrors;
      }

      continue;
    }

    if (typeof fieldErrors === "string") {
      const normalizedError = fieldErrors.trim();

      if (normalizedError) {
        errors[field] = [normalizedError];
      }
    }
  }

  return Object.keys(errors).length > 0
    ? errors
    : undefined;
}

function getBackendMessage(
  responseData: unknown,
  fallbackMessage: string,
): string {
  if (!isRecord(responseData)) {
    return fallbackMessage;
  }

  const possibleMessages = [
    responseData.message,
    responseData.error,
    responseData.detail,
  ];

  for (const possibleMessage of possibleMessages) {
    if (
      typeof possibleMessage === "string" &&
      possibleMessage.trim().length > 0
    ) {
      return possibleMessage.trim();
    }
  }

  return fallbackMessage;
}

function getErrorCode(
  status?: number,
): DiagnosticErrorCode {
  if (status === undefined) {
    return "network_error";
  }

  if (status === 401) {
    return "unauthorized";
  }

  if (status === 403) {
    return "forbidden";
  }

  if (status === 404) {
    return "not_found";
  }

  if (
    status === 400 ||
    status === 409 ||
    status === 422
  ) {
    return "validation_error";
  }

  if (status >= 500) {
    return "server_error";
  }

  return "unknown";
}

function normalizeServiceError(
  error: unknown,
  fallbackMessage: string,
): DiagnosticServiceError {
  if (error instanceof DiagnosticServiceError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (
      error.code === "ERR_CANCELED" ||
      error.name === "CanceledError"
    ) {
      return new DiagnosticServiceError(
        "The assessment request was cancelled.",
        {
          code: "unknown",
          responseData: error,
        },
      );
    }

    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      return new DiagnosticServiceError(
        "The assessment server took too long to respond.",
        {
          code: "timeout",
          responseData: error,
        },
      );
    }

    if (!error.response) {
      return new DiagnosticServiceError(
        "Unable to connect to the assessment server.",
        {
          code: "network_error",
          responseData: error,
        },
      );
    }

    const status = error.response.status;
    const responseData = error.response.data;
    const validationErrors = isRecord(responseData)
      ? normalizeValidationErrors(
          responseData.errors,
        )
      : undefined;

    return new DiagnosticServiceError(
      getBackendMessage(
        responseData,
        fallbackMessage,
      ),
      {
        code: getErrorCode(status),
        status,
        validationErrors,
        responseData,
      },
    );
  }

  return new DiagnosticServiceError(
    error instanceof Error
      ? error.message
      : fallbackMessage,
    {
      code: "unknown",
      responseData: error,
    },
  );
}

/* =========================================================
   Load all paginated questions
========================================================= */

async function getQuestions(
  signal?: AbortSignal,
): Promise<DiagnosticQuestion[]> {
  try {
    const firstResponse =
      await axiosClient.get<unknown>(
        DIAGNOSTIC_ENDPOINTS.questions,
        {
          signal,
        },
      );

    const firstPagination =
      extractPaginationData(
        firstResponse.data,
      );

    let rawQuestions: unknown[];
    let backendPagesFetched = 1;

    if (
      firstPagination &&
      firstPagination.lastPage > 1
    ) {
      const remainingPageNumbers = Array.from(
        {
          length: firstPagination.lastPage,
        },
        (_, index) => index + 1,
      ).filter(
        (pageNumber) =>
          pageNumber !==
          firstPagination.currentPage,
      );

      const remainingResponses =
        await Promise.all(
          remainingPageNumbers.map(
            async (pageNumber) => {
              const response =
                await axiosClient.get<unknown>(
                  DIAGNOSTIC_ENDPOINTS.questions,
                  {
                    signal,
                    params: {
                      page: pageNumber,
                    },
                  },
                );

              return {
                pageNumber,
                data: response.data,
              };
            },
          ),
        );

      remainingResponses.sort(
        (first, second) =>
          first.pageNumber -
          second.pageNumber,
      );

      rawQuestions = [
        ...firstPagination.questions,
      ];

      for (const pageResponse of remainingResponses) {
        const pagination = extractPaginationData(
          pageResponse.data,
        );

        if (pagination) {
          rawQuestions.push(
            ...pagination.questions,
          );
        } else {
          rawQuestions.push(
            ...extractQuestionArray(
              pageResponse.data,
            ),
          );
        }
      }

      backendPagesFetched =
        1 + remainingResponses.length;
    } else if (firstPagination) {
      rawQuestions = firstPagination.questions;
    } else {
      rawQuestions = extractQuestionArray(
        firstResponse.data,
      );
    }

    const normalizedResponse =
      normalizeQuestionsResponse(rawQuestions);

    if (import.meta.env.DEV) {
      console.info(
        `[Diagnostic] Backend pages fetched: ${backendPagesFetched}`,
      );

      console.info(
        `[Diagnostic] Total questions loaded: ${normalizedResponse.data.length}`,
      );
    }

    return normalizedResponse.data;
  } catch (error: unknown) {
    throw normalizeServiceError(
      error,
      "Unable to load assessment.",
    );
  }
}

/* =========================================================
   Submit guest assessment
========================================================= */

async function submitAssessment(
  payload: SubmitAssessmentPayload,
  signal?: AbortSignal,
): Promise<SubmitAssessmentResponse> {
  try {
    const validatedPayload =
      validateSubmissionPayload(payload);

    const response =
      await axiosClient.post<unknown>(
        DIAGNOSTIC_ENDPOINTS.submit,
        validatedPayload,
        {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

    const normalizedResponse =
      normalizeSubmissionResponse(
        response.data,
      );

    if (normalizedResponse.status === "error") {
      throw new DiagnosticServiceError(
        normalizedResponse.message ??
          "The assessment could not be submitted.",
        {
          code: "server_error",
          status: response.status,
          responseData: response.data,
        },
      );
    }

    return normalizedResponse;
  } catch (error: unknown) {
    throw normalizeServiceError(
      error,
      "Unable to submit the assessment.",
    );
  }
}

/* =========================================================
   Retrieve guest assessment result
========================================================= */

async function getMyResult(
  guestToken: string,
  signal?: AbortSignal,
): Promise<DiagnosticResultResponse> {
  try {
    const normalizedGuestToken =
      validateGuestToken(guestToken);

    const response =
      await axiosClient.get<unknown>(
        DIAGNOSTIC_ENDPOINTS.myResult,
        {
          signal,
          params: {
            guest_token: normalizedGuestToken,
          },
        },
      );

    return normalizeResultResponse(
      response.data,
    );
  } catch (error: unknown) {
    throw normalizeServiceError(
      error,
      "Unable to load your assessment result.",
    );
  }
}

/* =========================================================
   Public service
========================================================= */

export const diagnosticService = {
  getQuestions,
  submitAssessment,
  getMyResult,
} as const;