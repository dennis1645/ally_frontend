import axios from "axios";

import {
  axiosClient,
} from "./axiosClient";

import type {
  DiagnosticAnswerPayload,
  DiagnosticErrorCode,
  DiagnosticErrorDetails,
  DiagnosticOption,
  DiagnosticQuestion,
  DiagnosticQuestionsResponse,
  SubmitAssessmentPayload,
  SubmitAssessmentResponse,
} from "../types/diagnostic";

/* =========================================================
   API endpoints
========================================================= */

const DIAGNOSTIC_ENDPOINTS = {
  questions:
    "/api/diagnostic/questions",

  submit:
    "/api/diagnostic/submit",
} as const;

/*
 * Request all assessment questions in one response.
 *
 * The backend currently returns a Laravel pagination object:
 *
 * {
 *   status: "success",
 *   data: {
 *     current_page: 1,
 *     data: [...]
 *   }
 * }
 */
const QUESTIONS_PER_REQUEST =
  100;

/* =========================================================
   Service error
========================================================= */

export class DiagnosticServiceError extends Error {
  readonly code:
    DiagnosticErrorCode;

  readonly status?:
    number;

  readonly validationErrors?:
    Record<
      string,
      string[]
    >;

  readonly responseData?:
    unknown;

  constructor(
    message: string,
    details:
      DiagnosticErrorDetails,
  ) {
    super(message);

    this.name =
      "DiagnosticServiceError";

    this.code =
      details.code;

    this.status =
      details.status;

    this.validationErrors =
      details.validationErrors;

    this.responseData =
      details.responseData;

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
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toPositiveInteger(
  value: unknown,
): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isInteger(value) &&
    value > 0
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim() !== ""
  ) {
    const parsedValue =
      Number(value);

    if (
      Number.isInteger(
        parsedValue,
      ) &&
      parsedValue > 0
    ) {
      return parsedValue;
    }
  }

  return null;
}

function normalizeOptionalDate(
  value: unknown,
):
  | string
  | null
  | undefined {
  if (value === null) {
    return null;
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  return undefined;
}

function normalizeActiveState(
  value: unknown,
):
  | boolean
  | 0
  | 1
  | undefined {
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

/* =========================================================
   Question option normalization
========================================================= */

function normalizeOption(
  value: unknown,
): DiagnosticOption {
  if (!isRecord(value)) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid question option.",
      {
        code:
          "invalid_response",

        responseData:
          value,
      },
    );
  }

  const id =
    toPositiveInteger(
      value.id,
    );

  const diagnosticQuestionId =
    toPositiveInteger(
      value.diagnostic_question_id,
    );

  const optionText =
    typeof value.option_text ===
    "string"
      ? value.option_text.trim()
      : "";

  if (
    id === null ||
    optionText.length === 0
  ) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid question option.",
      {
        code:
          "invalid_response",

        responseData:
          value,
      },
    );
  }

  return {
    id,

    option_text:
      optionText,

    ...(diagnosticQuestionId !==
    null
      ? {
          diagnostic_question_id:
            diagnosticQuestionId,
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
        code:
          "invalid_response",

        responseData:
          value,
      },
    );
  }

  const id =
    toPositiveInteger(
      value.id,
    );

  const orderNumber =
    toPositiveInteger(
      value.order_number,
    );

  const questionText =
    typeof value.question_text ===
    "string"
      ? value.question_text.trim()
      : "";

  const category =
    typeof value.category ===
    "string"
      ? value.category.trim()
      : "";

  const rawOptions =
    value.options;

  if (
    id === null ||
    orderNumber === null ||
    questionText.length === 0 ||
    category.length === 0 ||
    !Array.isArray(
      rawOptions,
    )
  ) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid question.",
      {
        code:
          "invalid_response",

        responseData:
          value,
      },
    );
  }

  const options =
    rawOptions.map(
      (
        rawOption: unknown,
      ): DiagnosticOption =>
        normalizeOption(
          rawOption,
        ),
    );

  if (
    options.length === 0
  ) {
    throw new DiagnosticServiceError(
      `Question ${id} does not contain any answer options.`,
      {
        code:
          "invalid_response",

        responseData:
          value,
      },
    );
  }

  const isActive =
    normalizeActiveState(
      value.is_active,
    );

  const createdAt =
    normalizeOptionalDate(
      value.created_at,
    );

  const updatedAt =
    normalizeOptionalDate(
      value.updated_at,
    );

  return {
    id,

    question_text:
      questionText,

    category,

    order_number:
      orderNumber,

    options,

    ...(isActive !==
    undefined
      ? {
          is_active:
            isActive,
        }
      : {}),

    ...(createdAt !==
    undefined
      ? {
          created_at:
            createdAt,
        }
      : {}),

    ...(updatedAt !==
    undefined
      ? {
          updated_at:
            updatedAt,
        }
      : {}),
  };
}

/* =========================================================
   Extract question array from backend response
========================================================= */

function extractQuestionArray(
  response: unknown,
): unknown[] {
  /*
   * Format 1:
   *
   * [
   *   { question }
   * ]
   */
  if (
    Array.isArray(
      response,
    )
  ) {
    return response;
  }

  if (!isRecord(response)) {
    throw new DiagnosticServiceError(
      "The assessment server returned data in an unexpected format.",
      {
        code:
          "invalid_response",

        responseData:
          response,
      },
    );
  }

  /*
   * Detect an explicit backend error response.
   */
  if (
    response.status ===
    "error"
  ) {
    const backendMessage =
      typeof response.message ===
      "string"
        ? response.message
        : "The assessment server returned an error.";

    throw new DiagnosticServiceError(
      backendMessage,
      {
        code:
          "server_error",

        responseData:
          response,
      },
    );
  }

  /*
   * Format 2:
   *
   * {
   *   status: "success",
   *   data: [...]
   * }
   */
  if (
    Array.isArray(
      response.data,
    )
  ) {
    return response.data;
  }

  /*
   * Format 3 — current Laravel pagination response:
   *
   * {
   *   status: "success",
   *   data: {
   *     current_page: 1,
   *     data: [...]
   *   }
   * }
   */
  if (
    isRecord(
      response.data,
    ) &&
    Array.isArray(
      response.data.data,
    )
  ) {
    return response.data.data;
  }

  /*
   * Format 4:
   *
   * {
   *   questions: [...]
   * }
   */
  if (
    Array.isArray(
      response.questions,
    )
  ) {
    return response.questions;
  }

  /*
   * Format 5:
   *
   * {
   *   data: {
   *     questions: [...]
   *   }
   * }
   */
  if (
    isRecord(
      response.data,
    ) &&
    Array.isArray(
      response.data.questions,
    )
  ) {
    return response.data.questions;
  }

  throw new DiagnosticServiceError(
    "The assessment server returned data in an unexpected format.",
    {
      code:
        "invalid_response",

      responseData:
        response,
    },
  );
}

/* =========================================================
   Normalize questions response
========================================================= */

function normalizeQuestionsResponse(
  response: unknown,
): DiagnosticQuestionsResponse {
  const rawQuestions =
    extractQuestionArray(
      response,
    );

  /*
   * Preserve the order returned by the backend.
   *
   * This is important because order_number may restart inside
   * each category. The UI will paginate this array into groups
   * of five questions without grouping it by category.
   */
  const questions =
    rawQuestions
      .map(
        (
          rawQuestion: unknown,
        ): DiagnosticQuestion =>
          normalizeQuestion(
            rawQuestion,
          ),
      )
      .filter(
        (
          question,
        ): boolean =>
          question.is_active !==
            false &&
          question.is_active !==
            0,
      );

  return {
    status:
      "success",

    data:
      questions,
  };
}

/* =========================================================
   Submission response normalization
========================================================= */

function normalizeSubmissionResponse(
  response: unknown,
): SubmitAssessmentResponse {
  /*
   * Some successful APIs return no JSON body.
   */
  if (
    response === undefined ||
    response === null ||
    response === ""
  ) {
    return {
      status:
        "success",

      message:
        "Assessment submitted successfully.",
    };
  }

  if (!isRecord(response)) {
    throw new DiagnosticServiceError(
      "The assessment server returned an invalid submission response.",
      {
        code:
          "invalid_response",

        responseData:
          response,
      },
    );
  }

  const rawStatus =
    response.status;

  const status =
    rawStatus === "error"
      ? "error"
      : "success";

  const message =
    typeof response.message ===
    "string"
      ? response.message.trim()
      : undefined;

  return {
    status,

    ...(message
      ? {
          message,
        }
      : {}),

    ...(
      "data" in response
        ? {
            data:
              response.data,
          }
        : {}
    ),
  };
}

/* =========================================================
   Submission answer validation
========================================================= */

function validateAnswer(
  answer: unknown,
): DiagnosticAnswerPayload {
  if (!isRecord(answer)) {
    throw new DiagnosticServiceError(
      "The assessment contains an invalid answer.",
      {
        code:
          "validation_error",

        responseData:
          answer,
      },
    );
  }

  const questionId =
    toPositiveInteger(
      answer.question_id,
    );

  const optionId =
    toPositiveInteger(
      answer.option_id,
    );

  if (
    questionId === null ||
    optionId === null
  ) {
    throw new DiagnosticServiceError(
      "The assessment contains an invalid answer.",
      {
        code:
          "validation_error",

        responseData:
          answer,
      },
    );
  }

  return {
    question_id:
      questionId,

    option_id:
      optionId,
  };
}

/* =========================================================
   Submission payload validation
========================================================= */

function validateSubmissionPayload(
  payload:
    SubmitAssessmentPayload,
): SubmitAssessmentPayload {
  if (
    !Array.isArray(
      payload.answers,
    ) ||
    payload.answers.length ===
      0
  ) {
    throw new DiagnosticServiceError(
      "At least one assessment answer is required.",
      {
        code:
          "validation_error",

        responseData:
          payload,
      },
    );
  }

  const validatedAnswers =
    payload.answers.map(
      (
        answer,
      ): DiagnosticAnswerPayload =>
        validateAnswer(
          answer,
        ),
    );

  const questionIds =
    new Set<number>();

  for (
    const answer of
      validatedAnswers
  ) {
    if (
      questionIds.has(
        answer.question_id,
      )
    ) {
      throw new DiagnosticServiceError(
        `Question ${answer.question_id} appears more than once in the assessment submission.`,
        {
          code:
            "validation_error",

          responseData:
            payload,
        },
      );
    }

    questionIds.add(
      answer.question_id,
    );
  }

  return {
    answers:
      validatedAnswers,
  };
}

/* =========================================================
   Backend validation-error normalization
========================================================= */

function normalizeValidationErrors(
  value: unknown,
): Record<
  string,
  string[]
> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const errors:
    Record<
      string,
      string[]
    > = {};

  for (
    const [
      field,
      fieldErrors,
    ] of Object.entries(
      value,
    )
  ) {
    if (
      Array.isArray(
        fieldErrors,
      )
    ) {
      const normalizedMessages =
        fieldErrors
          .filter(
            (
              item,
            ): item is string =>
              typeof item ===
              "string",
          )
          .map(
            (
              item,
            ) =>
              item.trim(),
          )
          .filter(Boolean);

      if (
        normalizedMessages.length >
        0
      ) {
        errors[field] =
          normalizedMessages;
      }

      continue;
    }

    if (
      typeof fieldErrors ===
      "string" &&
      fieldErrors.trim()
        .length > 0
    ) {
      errors[field] = [
        fieldErrors.trim(),
      ];
    }
  }

  return Object.keys(
    errors,
  ).length > 0
    ? errors
    : undefined;
}

/* =========================================================
   Backend message extraction
========================================================= */

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

  for (
    const possibleMessage of
      possibleMessages
  ) {
    if (
      typeof possibleMessage ===
        "string" &&
      possibleMessage.trim()
        .length > 0
    ) {
      return possibleMessage.trim();
    }
  }

  return fallbackMessage;
}

/* =========================================================
   Error-code mapping
========================================================= */

function getErrorCode(
  status?: number,
): DiagnosticErrorCode {
  if (
    status === undefined
  ) {
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

/* =========================================================
   Service-error normalization
========================================================= */

function normalizeServiceError(
  error: unknown,
  fallbackMessage: string,
): DiagnosticServiceError {
  if (
    error instanceof
    DiagnosticServiceError
  ) {
    return error;
  }

  if (
    axios.isAxiosError(
      error,
    )
  ) {
    if (
      error.code ===
        "ERR_CANCELED" ||
      error.name ===
        "CanceledError"
    ) {
      return new DiagnosticServiceError(
        "The assessment request was cancelled.",
        {
          code:
            "unknown",

          responseData:
            error,
        },
      );
    }

    if (
      error.code ===
        "ECONNABORTED" ||
      error.code ===
        "ETIMEDOUT"
    ) {
      return new DiagnosticServiceError(
        "The assessment server took too long to respond.",
        {
          code:
            "timeout",

          responseData:
            error,
        },
      );
    }

    if (!error.response) {
      return new DiagnosticServiceError(
        "Unable to connect to the assessment server.",
        {
          code:
            "network_error",

          responseData:
            error,
        },
      );
    }

    const status =
      error.response.status;

    const responseData =
      error.response.data;

    const validationErrors =
      isRecord(
        responseData,
      )
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
        code:
          getErrorCode(
            status,
          ),

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
      code:
        "unknown",

      responseData:
        error,
    },
  );
}

type DiagnosticPaginationData = {
  currentPage: number;
  lastPage: number;
  questions: unknown[];
};

function extractPaginationData(
  response: unknown,
): DiagnosticPaginationData | null {
  if (
    !isRecord(response) ||
    !isRecord(response.data)
  ) {
    return null;
  }

  const pagination =
    response.data;

  const currentPage =
    toPositiveInteger(
      pagination.current_page,
    );

  const lastPage =
    toPositiveInteger(
      pagination.last_page,
    );

  const questions =
    pagination.data;

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
   GET assessment questions
========================================================= */

async function getQuestions(
  signal?: AbortSignal,
): Promise<DiagnosticQuestion[]> {
  try {
    /*
     * First request:
     * GET /api/diagnostic/questions?page=1
     */
    const firstResponse =
      await axiosClient.get<unknown>(
        DIAGNOSTIC_ENDPOINTS.questions,
        {
          signal,

          params: {
            page: 1,
          },
        },
      );

    const firstPage =
      extractPaginationData(
        firstResponse.data,
      );

    /*
     * Fallback for a non-paginated response.
     */
    if (!firstPage) {
      return normalizeQuestionsResponse(
        firstResponse.data,
      ).data;
    }

    const allRawQuestions: unknown[] = [
      ...firstPage.questions,
    ];

    /*
     * Fetch pages 2, 3, and 4.
     */
    for (
      let pageNumber = 2;
      pageNumber <=
      firstPage.lastPage;
      pageNumber += 1
    ) {
      const pageResponse =
        await axiosClient.get<unknown>(
          DIAGNOSTIC_ENDPOINTS.questions,
          {
            signal,

            params: {
              page:
                pageNumber,
            },
          },
        );

      const pageData =
        extractPaginationData(
          pageResponse.data,
        );

      if (!pageData) {
        throw new DiagnosticServiceError(
          `Assessment page ${pageNumber} returned an unexpected response format.`,
          {
            code:
              "invalid_response",

            responseData:
              pageResponse.data,
          },
        );
      }

      allRawQuestions.push(
        ...pageData.questions,
      );
    }

    /*
     * Combine the four backend pages into one normal response.
     */
    const normalizedResponse =
      normalizeQuestionsResponse({
        status:
          "success",

        data:
          allRawQuestions,
      });

    if (import.meta.env.DEV) {
      console.log(
        "[Diagnostic] Backend pages fetched:",
        firstPage.lastPage,
      );

      console.log(
        "[Diagnostic] Total questions loaded:",
        normalizedResponse.data.length,
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
   POST assessment submission
========================================================= */

async function submitAssessment(
  payload:
    SubmitAssessmentPayload,
  signal?: AbortSignal,
): Promise<
  SubmitAssessmentResponse
> {
  try {
    const validatedPayload =
      validateSubmissionPayload(
        payload,
      );

    const response =
      await axiosClient.post<unknown>(
        DIAGNOSTIC_ENDPOINTS.submit,
        validatedPayload,
        {
          signal,

          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );

    const normalizedResponse =
      normalizeSubmissionResponse(
        response.data,
      );

    if (
      normalizedResponse.status ===
      "error"
    ) {
      throw new DiagnosticServiceError(
        normalizedResponse.message ??
          "The assessment could not be submitted.",
        {
          code:
            "server_error",

          status:
            response.status,

          responseData:
            response.data,
        },
      );
    }

    return normalizedResponse;
  } catch (
    error: unknown
  ) {
    throw normalizeServiceError(
      error,
      "Unable to submit the assessment.",
    );
  }
}

/* =========================================================
   Public service
========================================================= */

export const diagnosticService = {
  getQuestions,
  submitAssessment,
} as const;