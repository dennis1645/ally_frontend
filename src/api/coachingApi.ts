import {
  API_BASE_URL,
  apiRequest,
} from "./apiClient";

/* =========================================================
   Types
========================================================= */

export type MentorBookingRecord = Record<string, unknown>;

export type MyBookingsResult = {
  bookings: MentorBookingRecord[];
  message: string | null;
};

export type BookMentorPayload = {
  availability_id: number;
};

export type BookMentorResult = {
  message: string | null;
  data: unknown;
};

/* =========================================================
   Helpers
========================================================= */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getResponseMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const message = value.message;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
}

function throwIfApiStatusError(value: unknown, fallback: string): void {
  if (!isRecord(value) || value.status !== "error") {
    return;
  }

  throw new Error(getResponseMessage(value) ?? fallback);
}

/* =========================================================
   GET /api/my-bookings
========================================================= */

export async function getMyBookingsApi(): Promise<MyBookingsResult> {
  const response = await apiRequest<unknown>("/api/my-bookings", {
    method: "GET",
  });

  throwIfApiStatusError(response, "Unable to load your mentor bookings.");

  if (!isRecord(response)) {
    throw new Error("The booking server returned an invalid response.");
  }

  const data = response.data;

  if (data !== undefined && data !== null && !Array.isArray(data)) {
    throw new Error("The booking response did not contain a valid booking list.");
  }

  return {
    bookings: Array.isArray(data)
      ? data.filter((item): item is MentorBookingRecord => isRecord(item))
      : [],
    message: getResponseMessage(response),
  };
}

/* =========================================================
   POST /api/mentor/book
========================================================= */

export async function bookMentorApi(
  payload: BookMentorPayload,
): Promise<BookMentorResult> {
  if (
    !Number.isInteger(payload.availability_id) ||
    payload.availability_id <= 0
  ) {
    throw new Error("Please select a valid mentor availability slot.");
  }

  const response = await apiRequest<unknown>("/api/mentor/book", {
    method: "POST",
    body: JSON.stringify({
      availability_id: payload.availability_id,
    }),
  });

  throwIfApiStatusError(response, "Unable to book the mentor session.");

  return {
    message: getResponseMessage(response),
    data: isRecord(response) && "data" in response ? response.data : response,
  };
}

/* =========================================================
   POST /api/mentor/match

   The backend collection states that the request body may be
   omitted. In that case the backend uses the authenticated
   mentee profile already stored in the database.
========================================================= */

export type MentorMatchResult = {
  id: string | number | null;
  name: string;
  headline: string | null;
  specialization: string | null;
  scholarship: string | null;
  university: string | null;
  field: string | null;
  profilePictureUrl: string | null;
  matchScore: number | null;
  matchReasons: string[];
  message: string | null;
  raw: Record<string, unknown>;
};

function stringOrNull(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

function numberOrNull(
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

function entityIdOrNull(
  value: unknown,
): string | number | null {
  return typeof value === "string" ||
    typeof value === "number"
    ? value
    : null;
}

function resolveReturnedUrl(
  value: unknown,
): string | null {
  const raw =
    stringOrNull(value);

  if (!raw) {
    return null;
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  try {
    const origin =
      new URL(
        API_BASE_URL,
      ).origin;

    return `${origin}/${raw.replace(/^\/+/, "")}`;
  } catch {
    return raw;
  }
}

function collectMatchRecords(
  response: unknown,
): Record<string, unknown>[] {
  const collected: Record<string, unknown>[] = [];
  const seen = new Set<Record<string, unknown>>();

  function visit(
    value: unknown,
    depth: number,
  ): void {
    if (
      depth > 3
    ) {
      return;
    }

    if (
      Array.isArray(value)
    ) {
      value
        .slice(
          0,
          5,
        )
        .forEach(
          (item) => {
            visit(
              item,
              depth + 1,
            );
          },
        );

      return;
    }

    if (
      !isRecord(value) ||
      seen.has(value)
    ) {
      return;
    }

    seen.add(value);
    collected.push(value);

    const nestedKeys = [
      "data",
      "mentor",
      "matched_mentor",
      "recommended_mentor",
      "best_match",
      "match",
      "result",
      "user",
      "profile",
      "scholarship",
      "university",
    ];

    for (
      const key of nestedKeys
    ) {
      visit(
        value[key],
        depth + 1,
      );
    }
  }

  visit(
    response,
    0,
  );

  return collected;
}

function firstMatchString(
  records: Record<string, unknown>[],
  keys: string[],
): string | null {
  for (
    const record of records
  ) {
    for (
      const key of keys
    ) {
      const value =
        stringOrNull(
          record[key],
        );

      if (value) {
        return value;
      }
    }
  }

  return null;
}

function firstMatchNumber(
  records: Record<string, unknown>[],
  keys: string[],
): number | null {
  for (
    const record of records
  ) {
    for (
      const key of keys
    ) {
      const value =
        numberOrNull(
          record[key],
        );

      if (
        value !== null
      ) {
        return value;
      }
    }
  }

  return null;
}

function firstMatchId(
  records: Record<string, unknown>[],
): string | number | null {
  const preferredKeys = [
    "mentor_id",
    "matched_mentor_id",
    "recommended_mentor_id",
    "id",
  ];

  for (
    const record of records
  ) {
    for (
      const key of preferredKeys
    ) {
      const value =
        entityIdOrNull(
          record[key],
        );

      if (
        value !== null
      ) {
        return value;
      }
    }
  }

  return null;
}

function normalizeMatchScore(
  value: number | null,
): number | null {
  if (
    value === null
  ) {
    return null;
  }

  const percentage =
    value >= 0 &&
    value <= 1
      ? value * 100
      : value;

  return Math.max(
    0,
    Math.min(
      100,
      percentage,
    ),
  );
}

function collectMatchReasons(
  records: Record<string, unknown>[],
): string[] {
  const values: string[] = [];

  const arrayKeys = [
    "match_reasons",
    "matching_reasons",
    "reasons",
    "why_matched",
  ];

  const stringKeys = [
    "match_reason",
    "matching_reason",
    "reason",
    "explanation",
    "rationale",
  ];

  for (
    const record of records
  ) {
    for (
      const key of arrayKeys
    ) {
      const candidate =
        record[key];

      if (
        Array.isArray(candidate)
      ) {
        for (
          const item of candidate
        ) {
          if (
            typeof item === "string" &&
            item.trim()
          ) {
            values.push(
              item.trim(),
            );
          } else if (
            isRecord(item)
          ) {
            const reason =
              stringOrNull(
                item.reason ??
                  item.text ??
                  item.description ??
                  item.label,
              );

            if (reason) {
              values.push(
                reason,
              );
            }
          }
        }
      }
    }

    for (
      const key of stringKeys
    ) {
      const candidate =
        stringOrNull(
          record[key],
        );

      if (candidate) {
        values.push(
          candidate,
        );
      }
    }
  }

  return Array.from(
    new Set(values),
  ).slice(
    0,
    3,
  );
}

function normalizeMentorMatch(
  response: unknown,
): MentorMatchResult {
  throwIfApiStatusError(
    response,
    "Unable to match you with a mentor.",
  );

  const records =
    collectMatchRecords(
      response,
    );

  if (
    records.length === 0
  ) {
    throw new Error(
      "The mentor matcher returned an invalid response.",
    );
  }

  const root =
    records[0];

  const name =
    firstMatchString(
      records,
      [
        "mentor_name",
        "full_name",
        "name",
      ],
    ) ??
    "Your Ally Mentor";

  const profilePicture =
    firstMatchString(
      records,
      [
        "profile_picture_url",
        "profile_picture",
        "photo_url",
        "photo",
        "avatar_url",
        "avatar",
        "image_url",
      ],
    );

  return {
    id:
      firstMatchId(
        records,
      ),

    name,

    headline:
      firstMatchString(
        records,
        [
          "headline",
          "mentor_title",
          "title",
          "role_title",
        ],
      ),

    specialization:
      firstMatchString(
        records,
        [
          "specialization",
          "speciality",
          "specialty",
          "expertise",
          "focus_area",
          "mentor_specialization",
        ],
      ),

    scholarship:
      firstMatchString(
        records,
        [
          "scholarship_name",
          "target_scholarship",
          "primary_scholarship_target",
        ],
      ),

    university:
      firstMatchString(
        records,
        [
          "university_name",
          "institution_name",
          "institution",
          "alma_mater",
          "current_university",
        ],
      ),

    field:
      firstMatchString(
        records,
        [
          "study_direction",
          "field_of_study",
          "field",
          "major",
          "target_major",
        ],
      ),

    profilePictureUrl:
      resolveReturnedUrl(
        profilePicture,
      ),

    matchScore:
      normalizeMatchScore(
        firstMatchNumber(
          records,
          [
            "match_score",
            "match_percentage",
            "confidence_score",
            "confidence",
            "score",
          ],
        ),
      ),

    matchReasons:
      collectMatchReasons(
        records,
      ),

    message:
      getResponseMessage(
        response,
      ) ??
      firstMatchString(
        records,
        [
          "match_message",
          "summary",
        ],
      ),

    raw:
      root,
  };
}

/**
 * Ask the backend to find the authenticated Premium user's mentor.
 *
 * No frontend-generated profile body is sent. The current backend
 * contract explicitly supports an empty body and uses the mentee
 * profile stored in the database automatically.
 */
export async function matchMentorApi(): Promise<MentorMatchResult> {
  const response =
    await apiRequest<unknown>(
      "/api/mentor/match",
      {
        method: "POST",
        timeoutMs: 60_000,
      },
    );

  return normalizeMentorMatch(
    response,
  );
}