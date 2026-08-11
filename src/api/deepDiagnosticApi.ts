import {
  apiRequest,
} from "./apiClient";

/* =========================================================
   API models
========================================================= */

export type DeepDiagnosticOption = {
  id:
    number;

  diagnosticQuestionId:
    number;

  optionText:
    string;
};

export type DeepDiagnosticQuestion = {
  id:
    number;

  assessmentType:
    string | null;

  questionText:
    string;

  category:
    string | null;

  isActive:
    boolean;

  orderNumber:
    number | null;

  options:
    DeepDiagnosticOption[];
};

export type DeepDiagnosticPage = {
  currentPage:
    number;

  perPage:
    number;

  total:
    number;

  totalPages:
    number;

  nextPageUrl:
    string | null;

  prevPageUrl:
    string | null;

  questions:
    DeepDiagnosticQuestion[];
};

export type DeepDiagnosticOptionAnswer = {
  question_id:
    number;

  option_id:
    number;
};

export type DeepDiagnosticTextAnswer = {
  question_id:
    number;

  text_value:
    string;
};

export type DeepDiagnosticAnswer =
  | DeepDiagnosticOptionAnswer
  | DeepDiagnosticTextAnswer;

export type SubmitDeepDiagnosticPayload = {
  answers:
    DeepDiagnosticAnswer[];
};

export type SubmitDeepDiagnosticResponse = {
  status:
    string;

  message:
    string | null;
};

export type DeepDiagnosticResult = {
  id:
    number | null;

  userId:
    number | null;

  assessmentType:
    string | null;

  revisedPercentage:
    number | null;

  suggestion:
    string | null;

  createdAt:
    string | null;

  updatedAt:
    string | null;
};

/* =========================================================
   Helpers
========================================================= */

function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

function asString(
  value:
    unknown,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized ||
    null;
}

function asNumber(
  value:
    unknown,
): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    const parsed =
      Number(
        value,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : null;
  }

  return null;
}

function normalizeOption(
  value:
    unknown,
): DeepDiagnosticOption | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  const id =
    asNumber(
      value.id,
    );

  const questionId =
    asNumber(
      value.diagnostic_question_id,
    );

  const optionText =
    asString(
      value.option_text,
    );

  if (
    id ===
      null ||
    questionId ===
      null ||
    !optionText
  ) {
    return null;
  }

  return {
    id,
    diagnosticQuestionId:
      questionId,
    optionText,
  };
}

function normalizeQuestion(
  value:
    unknown,
): DeepDiagnosticQuestion | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  const id =
    asNumber(
      value.id,
    );

  const questionText =
    asString(
      value.question_text,
    );

  if (
    id ===
      null ||
    !questionText
  ) {
    return null;
  }

  const rawOptions =
    Array.isArray(
      value.options,
    )
      ? value.options
      : [];

  const options =
    rawOptions
      .map(
        normalizeOption,
      )
      .filter(
        (
          option,
        ): option is DeepDiagnosticOption =>
          option !==
          null,
      );

  const rawIsActive =
    value.is_active;

  const isActive =
    rawIsActive ===
      undefined
      ? true
      : rawIsActive ===
          true ||
        rawIsActive ===
          1 ||
        rawIsActive ===
          "1";

  return {
    id,
    assessmentType:
      asString(
        value.assessment_type,
      ),
    questionText,
    category:
      asString(
        value.category,
      ),
    isActive,
    orderNumber:
      asNumber(
        value.order_number,
      ),
    options,
  };
}

function unwrapApiData(
  response:
    unknown,
): Record<
  string,
  unknown
> {
  if (
    !isRecord(
      response,
    )
  ) {
    throw new Error(
      "The Deep Diagnostic API returned an unexpected response.",
    );
  }

  const status =
    asString(
      response.status,
    );

  if (
    status?.toLowerCase() ===
      "error"
  ) {
    throw new Error(
      asString(
        response.message,
      ) ??
        "The Deep Diagnostic request could not be completed.",
    );
  }

  const data =
    response.data;

  if (
    !isRecord(
      data,
    )
  ) {
    throw new Error(
      "The Deep Diagnostic API did not return assessment data.",
    );
  }

  return data;
}

function normalizeQuestionPage(
  response:
    unknown,
): DeepDiagnosticPage {
  const data =
    unwrapApiData(
      response,
    );

  const currentPage =
    Math.max(
      1,
      asNumber(
        data.current_page,
      ) ??
        1,
    );

  const rawQuestions =
    Array.isArray(
      data.data,
    )
      ? data.data
      : [];

  const questions =
    rawQuestions
      .map(
        normalizeQuestion,
      )
      .filter(
        (
          question,
        ): question is DeepDiagnosticQuestion =>
          question !==
            null &&
          question.isActive,
      );

  const perPage =
    Math.max(
      1,
      asNumber(
        data.per_page,
      ) ??
        Math.max(
          questions.length,
          1,
        ),
    );

  const total =
    Math.max(
      questions.length,
      asNumber(
        data.total,
      ) ??
        questions.length,
    );

  const explicitLastPage =
    asNumber(
      data.last_page,
    );

  const calculatedPages =
    Math.max(
      1,
      Math.ceil(
        total /
          perPage,
      ),
    );

  const totalPages =
    Math.max(
      currentPage,
      explicitLastPage ??
        calculatedPages,
    );

  return {
    currentPage,
    perPage,
    total,
    totalPages,
    nextPageUrl:
      asString(
        data.next_page_url,
      ),
    prevPageUrl:
      asString(
        data.prev_page_url,
      ),
    questions,
  };
}

function normalizeSubmitResponse(
  response:
    unknown,
): SubmitDeepDiagnosticResponse {
  if (
    !isRecord(
      response,
    )
  ) {
    return {
      status:
        "success",
      message:
        null,
    };
  }

  const status =
    asString(
      response.status,
    ) ??
    "success";

  const message =
    asString(
      response.message,
    );

  if (
    status.toLowerCase() ===
      "error"
  ) {
    throw new Error(
      message ??
        "The Deep Diagnostic could not be submitted.",
    );
  }

  return {
    status,
    message,
  };
}

function normalizeResult(
  response:
    unknown,
): DeepDiagnosticResult {
  const data =
    unwrapApiData(
      response,
    );

  return {
    id:
      asNumber(
        data.id,
      ),
    userId:
      asNumber(
        data.user_id,
      ),
    assessmentType:
      asString(
        data.assessment_type,
      ),
    revisedPercentage:
      asNumber(
        data.revised_percentage,
      ),
    suggestion:
      asString(
        data.suggestion,
      ),
    createdAt:
      asString(
        data.created_at,
      ),
    updatedAt:
      asString(
        data.updated_at,
      ),
  };
}

/* =========================================================
   Public API
========================================================= */

export async function getDeepDiagnosticQuestions(
  page:
    number,
): Promise<DeepDiagnosticPage> {
  const safePage =
    Math.max(
      1,
      Math.floor(
        page,
      ),
    );

  const response =
    await apiRequest<unknown>(
      `/api/deep-diagnostic/questions?page=${safePage}`,
      {
        method:
          "GET",
      },
    );

  return normalizeQuestionPage(
    response,
  );
}

export async function submitDeepDiagnostic(
  answers:
    DeepDiagnosticAnswer[],
): Promise<SubmitDeepDiagnosticResponse> {
  if (
    answers.length ===
    0
  ) {
    throw new Error(
      "There are no Deep Diagnostic answers to submit.",
    );
  }

  const payload: SubmitDeepDiagnosticPayload =
    {
      answers,
    };

  const response =
    await apiRequest<unknown>(
      "/api/deep-diagnostic/submit",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  return normalizeSubmitResponse(
    response,
  );
}

export async function getDeepDiagnosticResult(): Promise<DeepDiagnosticResult> {
  const response =
    await apiRequest<unknown>(
      "/api/deep-diagnostic/my-result",
      {
        method:
          "GET",
      },
    );

  return normalizeResult(
    response,
  );
}