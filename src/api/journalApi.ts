import { apiRequest } from "./apiClient";

export type JournalEntry = {
  id: number | string;
  date: string;
  reflection: string | null;
  mood: string | null;
  goals: string | null;
  achievements: string | null;
  challenges: string | null;
  progress_notes: string | null;
  blockers: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type JournalPayload = {
  date: string;
  reflection: string;
  mood: string;
  goals: string;
  achievements: string;
  challenges: string;
  progress_notes: string;
  blockers: string | null;
};

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

function toNullableString(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized || null;
}

function normalizeJournal(
  value: unknown,
): JournalEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id;
  const date = value.date;

  if (
    (typeof id !== "number" &&
      typeof id !== "string") ||
    typeof date !== "string"
  ) {
    return null;
  }

  return {
    id,
    date: date.slice(0, 10),

    reflection: toNullableString(
      value.reflection,
    ),

    mood: toNullableString(
      value.mood,
    ),

    goals: toNullableString(
      value.goals,
    ),

    achievements: toNullableString(
      value.achievements,
    ),

    challenges: toNullableString(
      value.challenges,
    ),

    progress_notes:
      toNullableString(
        value.progress_notes,
      ),

    blockers: toNullableString(
      value.blockers,
    ),

    created_at: toNullableString(
      value.created_at,
    ),

    updated_at: toNullableString(
      value.updated_at,
    ),
  };
}

function extractJournalList(
  response: unknown,
): JournalEntry[] {
  if (Array.isArray(response)) {
    return response
      .map(normalizeJournal)
      .filter(
        (
          journal,
        ): journal is JournalEntry =>
          journal !== null,
      );
  }

  if (!isRecord(response)) {
    return [];
  }

  const data = isRecord(response.data)
    ? response.data
    : null;

  const candidates: unknown[] = [
    response.journals,
    response.items,
    response.data,
    data?.journals,
    data?.items,
    data?.data,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    return candidate
      .map(normalizeJournal)
      .filter(
        (
          journal,
        ): journal is JournalEntry =>
          journal !== null,
      );
  }

  return [];
}

function extractSingleJournal(
  response: unknown,
): JournalEntry | null {
  const directJournal =
    normalizeJournal(response);

  if (directJournal) {
    return directJournal;
  }

  if (!isRecord(response)) {
    return null;
  }

  const data = isRecord(response.data)
    ? response.data
    : null;

  const candidates: unknown[] = [
    response.journal,
    response.data,
    data?.journal,
    data?.data,
  ];

  for (const candidate of candidates) {
    const journal =
      normalizeJournal(candidate);

    if (journal) {
      return journal;
    }
  }

  return null;
}

export async function getAllJournalsApi(
  perPage = 100,
): Promise<JournalEntry[]> {
  const response =
    await apiRequest<unknown>(
      `/api/journals?per_page=${perPage}`,
      {
        method: "GET",
      },
    );

  return extractJournalList(response);
}

export async function getJournalApi(
  journalId: number | string,
): Promise<JournalEntry | null> {
  const response =
    await apiRequest<unknown>(
      `/api/journals/${journalId}`,
      {
        method: "GET",
      },
    );

  return extractSingleJournal(response);
}

export async function createOrUpdateJournalApi(
  payload: JournalPayload,
): Promise<JournalEntry | null> {
  const response =
    await apiRequest<unknown>(
      "/api/journals",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return extractSingleJournal(
    response,
  );
}

export async function updateJournalApi(
  journalId: number | string,
  payload: JournalPayload,
): Promise<JournalEntry | null> {
  const response =
    await apiRequest<unknown>(
      `/api/journals/${journalId}`,
      {
        method: "PUT",

        body: JSON.stringify(
          payload,
        ),
      },
    );

  return extractSingleJournal(response);
}

export async function deleteJournalApi(
  journalId: number | string,
): Promise<void> {
  await apiRequest<unknown>(
    `/api/journals/${journalId}`,
    {
      method: "DELETE",
    },
  );
}