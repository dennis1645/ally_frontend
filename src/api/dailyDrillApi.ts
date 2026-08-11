import {
  apiRequest,
} from "./apiClient";

export type DailyDrillOption = {
  id:
    number;

  text:
    string;
};

export type DailyDrillQuestion = {
  id:
    number;

  text:
    string;

  category:
    string | null;

  options:
    DailyDrillOption[];
};

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

function toNumber(
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

function toStringValue(
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

function extractArray(
  response:
    unknown,
): unknown[] {
  if (
    Array.isArray(
      response,
    )
  ) {
    return response;
  }

  if (
    !isRecord(
      response,
    )
  ) {
    return [];
  }

  if (
    Array.isArray(
      response.data,
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response.questions,
    )
  ) {
    return response.questions;
  }

  if (
    isRecord(
      response.data,
    )
  ) {
    if (
      Array.isArray(
        response.data.questions,
      )
    ) {
      return response.data.questions;
    }

    if (
      Array.isArray(
        response.data.data,
      )
    ) {
      return response.data.data;
    }
  }

  return [];
}

function normalizeOption(
  value:
    unknown,
): DailyDrillOption | null {
  if (
    !isRecord(
      value,
    )
  ) {
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
    id ===
      null ||
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
  value:
    unknown,
): DailyDrillQuestion | null {
  if (
    !isRecord(
      value,
    )
  ) {
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
    id ===
      null ||
    !text
  ) {
    return null;
  }

  const rawOptions =
    Array.isArray(
      value.options,
    )
      ? value.options
      : Array.isArray(
          value.answer_options,
        )
        ? value.answer_options
        : [];

  const options =
    rawOptions
      .map(
        normalizeOption,
      )
      .filter(
        (
          option,
        ): option is DailyDrillOption =>
          option !==
          null,
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

/**
 * Uses the documented authenticated Ally endpoint:
 * GET /api/daily-drills/generate
 *
 * The Postman collection does not include an example response body, so the
 * normalizer accepts the common wrapper shapes already used by the Ally API.
 */
export async function generateDailyDrill(): Promise<
  DailyDrillQuestion[]
> {
  const response =
    await apiRequest<unknown>(
      "/api/daily-drills/generate",
      {
        method:
          "GET",
      },
    );

  const questions =
    extractArray(
      response,
    )
      .map(
        normalizeQuestion,
      )
      .filter(
        (
          question,
        ): question is DailyDrillQuestion =>
          question !==
          null &&
          question.options.length >
            0,
      );

  if (
    questions.length ===
    0
  ) {
    throw new Error(
      "No practice questions were returned.",
    );
  }

  return questions;
}