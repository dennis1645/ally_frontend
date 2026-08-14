import {
  apiRequest,
} from "./apiClient";

/* =========================================================
   Public types
========================================================= */

export type DailyDrillOption = {
  id: number;
  text: string;
};

export type DailyDrillQuestion = {
  id: number;
  text: string;
  category: string | null;
  options: DailyDrillOption[];
};

export type DailyDrillAnswer = {
  question_id: number;
  selected_option_id: number;
};

export type DailyDrillSubmitPayload = {
  answers: DailyDrillAnswer[];
  difficulty_feedback?: string;
  feedback_note?: string | null;
};

export type DailyDrillBadge = {
  id: number | string | null;
  name: string;
  description: string | null;
  icon_url: string | null;
};

export type DailyDrillSubmitResult = {
  id: number | string | null;
  correct_answers: number | null;
  total_questions: number | null;
  total_score: number | null;
  xp_earned: number | null;
  new_badges: DailyDrillBadge[];
  message: string | null;
};

export type DailyDrillHistoryItem = {
  id: number | string;
  date: string | null;
  correct_answers: number | null;
  total_questions: number | null;
  total_score: number | null;
  xp_earned: number | null;
};

export type DailyDrillReviewQuestion = {
  question_id: number;
  question_text: string;
  category: string | null;
  selected_option_id: number | null;
  selected_option_text: string | null;
  correct_option_id: number | null;
  correct_option_text: string | null;
  is_correct: boolean | null;
  explanation: string | null;
  options: DailyDrillOption[];
};

export type DailyDrillDetail = {
  id: number | string;
  date: string | null;
  correct_answers: number | null;
  total_questions: number | null;
  total_score: number | null;
  xp_earned: number | null;
  questions: DailyDrillReviewQuestion[];
};

/* =========================================================
   Internal helpers
========================================================= */

type UnknownRecord = Record<
  string,
  unknown
>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toNumber(
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
    value.trim()
  ) {
    const parsed =
      Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }

  return null;
}

function toId(
  value: unknown,
): number | string | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return null;
}

function toStringValue(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized || null;
}

function toBoolean(
  value: unknown,
): boolean | null {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    value === 1 ||
    value === "1" ||
    value === "true"
  ) {
    return true;
  }

  if (
    value === 0 ||
    value === "0" ||
    value === "false"
  ) {
    return false;
  }

  return null;
}

function getRecord(
  value: unknown,
): UnknownRecord | null {
  return isRecord(value)
    ? value
    : null;
}

function getFirstRecord(
  response: unknown,
  preferredKeys: string[] = [],
): UnknownRecord | null {
  if (!isRecord(response)) {
    return null;
  }

  const candidates: unknown[] = [
    ...preferredKeys.map(
      (key) => response[key],
    ),
    response.data,
    response.result,
    response.drill,
    response.attempt,
    response.session,
  ];

  for (
    const candidate of
    candidates
  ) {
    if (isRecord(candidate)) {
      const nestedCandidates: unknown[] = [
        candidate,
        candidate.data,
        candidate.result,
        candidate.drill,
        candidate.attempt,
        candidate.session,
      ];

      for (
        const nested of
        nestedCandidates
      ) {
        if (isRecord(nested)) {
          return nested;
        }
      }
    }
  }

  return response;
}

function extractArray(
  response: unknown,
  keys: string[] = [],
): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response)) {
    return [];
  }

  const data =
    getRecord(response.data);

  const result =
    getRecord(response.result);

  const candidates: unknown[] = [
    ...keys.map(
      (key) => response[key],
    ),
    response.data,
    response.items,
    response.questions,
    response.history,
    response.drills,
    response.results,
    data?.data,
    data?.items,
    data?.questions,
    data?.history,
    data?.drills,
    data?.results,
    result?.data,
    result?.items,
    result?.questions,
    result?.history,
    result?.drills,
    result?.results,
  ];

  for (
    const candidate of
    candidates
  ) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

/* =========================================================
   Question normalizers
========================================================= */

function normalizeOption(
  value: unknown,
): DailyDrillOption | null {
  if (!isRecord(value)) {
    return null;
  }

  const id =
    toNumber(
      value.id ??
        value.option_id,
    );

  const text =
    toStringValue(
      value.option_text ??
        value.option ??
        value.text ??
        value.label,
    );

  if (
    id === null ||
    !text
  ) {
    return null;
  }

  return {
    id,
    text,
  };
}

function normalizeQuestion(
  value: unknown,
): DailyDrillQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const id =
    toNumber(
      value.id ??
        value.question_id,
    );

  const text =
    toStringValue(
      value.question_text ??
        value.question ??
        value.text,
    );

  if (
    id === null ||
    !text
  ) {
    return null;
  }

  const rawOptions =
    Array.isArray(value.options)
      ? value.options
      : Array.isArray(
          value.answer_options,
        )
        ? value.answer_options
        : [];

  const options =
    rawOptions
      .map(normalizeOption)
      .filter(
        (
          option,
        ): option is DailyDrillOption =>
          option !== null,
      );

  return {
    id,
    text,
    category:
      toStringValue(
        value.category ??
          value.section ??
          value.skill,
      ),
    options,
  };
}

/* =========================================================
   Submit result normalizers
========================================================= */

function normalizeBadge(
  value: unknown,
): DailyDrillBadge | null {
  if (!isRecord(value)) {
    return null;
  }

  const name =
    toStringValue(
      value.name ??
        value.badge_name ??
        value.title,
    );

  if (!name) {
    return null;
  }

  return {
    id:
      toId(
        value.id ??
          value.badge_id,
      ),
    name,
    description:
      toStringValue(
        value.description,
      ),
    icon_url:
      toStringValue(
        value.icon_url ??
          value.icon,
      ),
  };
}

function extractBadges(
  response: unknown,
  resultRecord: UnknownRecord | null,
): DailyDrillBadge[] {
  const responseRecord =
    getRecord(response);

  const candidates: unknown[] = [
    resultRecord?.new_badges,
    resultRecord?.unlocked_badges,
    resultRecord?.badges,
    responseRecord?.new_badges,
    responseRecord?.unlocked_badges,
    responseRecord?.badges,
  ];

  for (
    const candidate of
    candidates
  ) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    return candidate
      .map(normalizeBadge)
      .filter(
        (
          badge,
        ): badge is DailyDrillBadge =>
          badge !== null,
      );
  }

  return [];
}

function normalizeSubmitResult(
  response: unknown,
): DailyDrillSubmitResult {
  const record =
    getFirstRecord(
      response,
      [
        "submission",
        "daily_drill",
      ],
    );

  const responseRecord =
    getRecord(response);

  const id =
    toId(
      record?.id ??
        record?.drill_id ??
        record?.daily_drill_id ??
        record?.attempt_id ??
        record?.session_id ??
        responseRecord?.drill_id ??
        responseRecord?.attempt_id ??
        responseRecord?.id,
    );

  return {
    id,

    correct_answers:
      toNumber(
        record?.correct_answers ??
          record?.correct_count ??
          responseRecord?.correct_answers,
      ),

    total_questions:
      toNumber(
        record?.total_questions ??
          record?.question_count ??
          responseRecord?.total_questions,
      ),

    total_score:
      toNumber(
        record?.total_score ??
          record?.score ??
          responseRecord?.total_score ??
          responseRecord?.score,
      ),

    xp_earned:
      toNumber(
        record?.xp_earned ??
          record?.earned_xp ??
          record?.xp_reward ??
          responseRecord?.xp_earned,
      ),

    new_badges:
      extractBadges(
        response,
        record,
      ),

    message:
      toStringValue(
        responseRecord?.message ??
          record?.message,
      ),
  };
}

/* =========================================================
   History normalizers
========================================================= */

function normalizeHistoryItem(
  value: unknown,
): DailyDrillHistoryItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id =
    toId(
      value.id ??
        value.drill_id ??
        value.daily_drill_id ??
        value.attempt_id ??
        value.session_id,
    );

  if (id === null) {
    return null;
  }

  return {
    id,

    date:
      toStringValue(
        value.date ??
          value.drill_date ??
          value.created_at,
      ),

    correct_answers:
      toNumber(
        value.correct_answers ??
          value.correct_count,
      ),

    total_questions:
      toNumber(
        value.total_questions ??
          value.question_count,
      ),

    total_score:
      toNumber(
        value.total_score ??
          value.score,
      ),

    xp_earned:
      toNumber(
        value.xp_earned ??
          value.earned_xp ??
          value.xp_reward,
      ),
  };
}

/* =========================================================
   Detail / review normalizers
========================================================= */

function normalizeReviewQuestion(
  value: unknown,
): DailyDrillReviewQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const questionRecord =
    getRecord(value.question);

  const questionId =
    toNumber(
      value.question_id ??
        value.id ??
        questionRecord?.id,
    );

  const questionText =
    toStringValue(
      value.question_text ??
        value.text ??
        questionRecord?.question_text ??
        questionRecord?.text,
    );

  if (
    questionId === null ||
    !questionText
  ) {
    return null;
  }

  const rawOptions =
    Array.isArray(value.options)
      ? value.options
      : Array.isArray(
          questionRecord?.options,
        )
        ? questionRecord.options
        : [];

  const options =
    rawOptions
      .map(normalizeOption)
      .filter(
        (
          option,
        ): option is DailyDrillOption =>
          option !== null,
      );

  const selectedOptionRecord =
    getRecord(
      value.selected_option,
    );

  const correctOptionRecord =
    getRecord(
      value.correct_option,
    );

  const selectedOptionId =
    toNumber(
      value.selected_option_id ??
        selectedOptionRecord?.id,
    );

  const correctOptionId =
    toNumber(
      value.correct_option_id ??
        value.answer_option_id ??
        correctOptionRecord?.id,
    );

  const selectedOptionFromList =
    selectedOptionId === null
      ? null
      : options.find(
          (option) =>
            option.id ===
            selectedOptionId,
        ) ?? null;

  const correctOptionFromList =
    correctOptionId === null
      ? null
      : options.find(
          (option) =>
            option.id ===
            correctOptionId,
        ) ?? null;

  return {
    question_id:
      questionId,

    question_text:
      questionText,

    category:
      toStringValue(
        value.category ??
          value.section ??
          questionRecord?.category ??
          questionRecord?.section,
      ),

    selected_option_id:
      selectedOptionId,

    selected_option_text:
      toStringValue(
        value.selected_option_text ??
          selectedOptionRecord?.option_text ??
          selectedOptionRecord?.text,
      ) ??
      selectedOptionFromList?.text ??
      null,

    correct_option_id:
      correctOptionId,

    correct_option_text:
      toStringValue(
        value.correct_option_text ??
          value.correct_answer ??
          correctOptionRecord?.option_text ??
          correctOptionRecord?.text,
      ) ??
      correctOptionFromList?.text ??
      null,

    is_correct:
      toBoolean(
        value.is_correct ??
          value.correct,
      ),

    explanation:
      toStringValue(
        value.explanation ??
          value.discussion ??
          value.rationale ??
          value.pembahasan,
      ),

    options,
  };
}

function normalizeDetail(
  response: unknown,
): DailyDrillDetail | null {
  const record =
    getFirstRecord(
      response,
      [
        "daily_drill",
        "drill",
        "attempt",
      ],
    );

  if (!record) {
    return null;
  }

  const id =
    toId(
      record.id ??
        record.drill_id ??
        record.daily_drill_id ??
        record.attempt_id ??
        record.session_id,
    );

  if (id === null) {
    return null;
  }

  const rawQuestions =
    extractArray(
      record,
      [
        "details",
        "answers",
        "review",
      ],
    );

  return {
    id,

    date:
      toStringValue(
        record.date ??
          record.drill_date ??
          record.created_at,
      ),

    correct_answers:
      toNumber(
        record.correct_answers ??
          record.correct_count,
      ),

    total_questions:
      toNumber(
        record.total_questions ??
          record.question_count,
      ),

    total_score:
      toNumber(
        record.total_score ??
          record.score,
      ),

    xp_earned:
      toNumber(
        record.xp_earned ??
          record.earned_xp ??
          record.xp_reward,
      ),

    questions:
      rawQuestions
        .map(
          normalizeReviewQuestion,
        )
        .filter(
          (
            question,
          ): question is DailyDrillReviewQuestion =>
            question !== null,
        ),
  };
}

/* =========================================================
   API
========================================================= */

/**
 * Latest backend:
 * GET /api/daily-drills/generate
 *
 * Newer Postman collections also support:
 * GET /api/daily-drills/generate?section=reading
 */
export async function generateDailyDrill(
  section?: string,
): Promise<
  DailyDrillQuestion[]
> {
  const normalizedSection =
    section?.trim();

  const query =
    normalizedSection
      ? `?section=${encodeURIComponent(
          normalizedSection,
        )}`
      : "";

  const response =
    await apiRequest<unknown>(
      `/api/daily-drills/generate${query}`,
      {
        method: "GET",
      },
    );

  const questions =
    extractArray(
      response,
      [
        "questions",
      ],
    )
      .map(normalizeQuestion)
      .filter(
        (
          question,
        ): question is DailyDrillQuestion =>
          question !== null &&
          question.options.length >
            0,
      );

  if (
    questions.length === 0
  ) {
    throw new Error(
      "No practice questions were returned.",
    );
  }

  return questions;
}

/**
 * Latest backend:
 * POST /api/daily-drills/submit
 *
 * Backend calculates:
 * - correct_answers
 * - total_score
 * - xp_earned
 * - badge unlocks
 */
export async function submitDailyDrill(
  payload: DailyDrillSubmitPayload,
): Promise<
  DailyDrillSubmitResult
> {
  if (
    payload.answers.length ===
    0
  ) {
    throw new Error(
      "At least one answer is required.",
    );
  }

  const response =
    await apiRequest<unknown>(
      "/api/daily-drills/submit",
      {
        method: "POST",
        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  return normalizeSubmitResult(
    response,
  );
}

/**
 * Latest backend:
 * GET /api/daily-drills/history
 */
export async function getDailyDrillHistory(): Promise<
  DailyDrillHistoryItem[]
> {
  const response =
    await apiRequest<unknown>(
      "/api/daily-drills/history",
      {
        method: "GET",
      },
    );

  return extractArray(
    response,
    [
      "history",
      "drills",
    ],
  )
    .map(
      normalizeHistoryItem,
    )
    .filter(
      (
        item,
      ): item is DailyDrillHistoryItem =>
        item !== null,
    );
}

/**
 * Latest backend:
 * GET /api/daily-drills/{id}
 *
 * Returns the per-question review, including selected option,
 * is_correct and explanation when supplied by the backend.
 */
export async function getDailyDrillDetail(
  drillId: number | string,
): Promise<
  DailyDrillDetail | null
> {
  const response =
    await apiRequest<unknown>(
      `/api/daily-drills/${drillId}`,
      {
        method: "GET",
      },
    );

  return normalizeDetail(
    response,
  );
}