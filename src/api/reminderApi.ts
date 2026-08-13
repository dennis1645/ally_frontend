import {
  apiRequest,
} from "./apiClient";

type UnknownRecord =
  Record<
    string,
    unknown
  >;

export type ReminderKind =
  | "mentor_task"
  | "milestone"
  | "scholarship"
  | "other";

export type Reminder = {
  id: string;
  title: string;
  description:
    | string
    | null;
  deadline:
    | string
    | null;
  daysRemaining:
    | number
    | null;
  priority:
    | string
    | null;
  kind:
    ReminderKind;
  status:
    | string
    | null;
  isCompleted:
    boolean;
  raw:
    UnknownRecord;
};

function isRecord(
  value: unknown,
): value is UnknownRecord {
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

function asText(
  value: unknown,
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
  value: unknown,
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

function firstText(
  record:
    | UnknownRecord
    | null,
  keys: string[],
): string | null {
  if (!record) {
    return null;
  }

  for (
    const key of keys
  ) {
    const value =
      asText(
        record[
          key
        ],
      );

    if (value) {
      return value;
    }
  }

  return null;
}

function firstNumber(
  record:
    | UnknownRecord
    | null,
  keys: string[],
): number | null {
  if (!record) {
    return null;
  }

  for (
    const key of keys
  ) {
    const value =
      asNumber(
        record[
          key
        ],
      );

    if (
      value !==
      null
    ) {
      return value;
    }
  }

  return null;
}

function extractList(
  response: unknown,
): unknown[] {
  let data =
    response;

  if (
    isRecord(
      response,
    ) &&
    "data" in
      response
  ) {
    data =
      response.data;
  }

  if (
    Array.isArray(
      data,
    )
  ) {
    return data;
  }

  if (
    !isRecord(
      data,
    )
  ) {
    return [];
  }

  const candidates = [
    data.reminders,
    data.items,
    data.results,
    data.data,
  ];

  for (
    const candidate of
    candidates
  ) {
    if (
      Array.isArray(
        candidate,
      )
    ) {
      return candidate;
    }
  }

  return [];
}

function parseDateOnly(
  value:
    | string
    | null,
): Date | null {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})/.exec(
      value,
    );

  if (!match) {
    const parsed =
      new Date(
        value,
      );

    return Number.isNaN(
      parsed.getTime(),
    )
      ? null
      : new Date(
          parsed.getFullYear(),
          parsed.getMonth(),
          parsed.getDate(),
        );
  }

  const date =
    new Date(
      Number(
        match[1],
      ),
      Number(
        match[2],
      ) -
        1,
      Number(
        match[3],
      ),
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function localDaysUntil(
  deadline:
    | string
    | null,
): number | null {
  const date =
    parseDateOnly(
      deadline,
    );

  if (!date) {
    return null;
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

  return Math.round(
    (
      date.getTime() -
      today.getTime()
    ) /
      86_400_000,
  );
}

function recordText(
  record: UnknownRecord,
  key: string,
): string | null {
  const value =
    record[
      key
    ];

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    isRecord(
      value,
    )
  ) {
    return firstText(
      value,
      [
        "type",
        "name",
        "label",
        "category",
      ],
    );
  }

  return null;
}

function classifyReminder(
  record: UnknownRecord,
  title: string,
  description:
    | string
    | null,
): ReminderKind {
  const typeText =
    [
      recordText(
        record,
        "reminder_type",
      ),
      recordText(
        record,
        "type",
      ),
      recordText(
        record,
        "category",
      ),
      recordText(
        record,
        "source_type",
      ),
      recordText(
        record,
        "source",
      ),
      recordText(
        record,
        "entity_type",
      ),
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      )
      .toLowerCase();

  const contentText =
    `${title} ${description ?? ""}`
      .toLowerCase();

  const hasActionPlanId =
    record.action_plan_id !==
      undefined ||
    record.mentor_action_plan_id !==
      undefined ||
    isRecord(
      record.action_plan,
    );

  if (
    hasActionPlanId ||
    typeText.includes(
      "mentor",
    ) ||
    typeText.includes(
      "action_plan",
    ) ||
    typeText.includes(
      "action plan",
    ) ||
    contentText.includes(
      "mentor task",
    ) ||
    contentText.includes(
      "action plan",
    )
  ) {
    return "mentor_task";
  }

  if (
    typeText.includes(
      "scholar",
    ) ||
    contentText.includes(
      "scholarship deadline",
    ) ||
    contentText.includes(
      "application deadline",
    )
  ) {
    return "scholarship";
  }

  if (
    typeText.includes(
      "milestone",
    ) ||
    typeText.includes(
      "task",
    )
  ) {
    return "milestone";
  }

  return "other";
}

function normalizeReminder(
  value: unknown,
  index: number,
): Reminder | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  const title =
    firstText(
      value,
      [
        "task_title",
        "title",
        "name",
        "label",
        "subject",
        "message",
      ],
    ) ??
    "Upcoming reminder";

  const description =
    firstText(
      value,
      [
        "description",
        "mentor_note",
        "detail",
        "message",
        "note",
      ],
    );

  const deadline =
    firstText(
      value,
      [
        "deadline",
        "due_date",
        "dueDate",
        "target_date",
        "targetDate",
        "date",
        "deadline_date",
      ],
    );

  const backendDaysRemaining =
    firstNumber(
      value,
      [
        "days_remaining",
        "days_until",
        "days_left",
        "remaining_days",
        "h_minus",
      ],
    );

  const status =
    firstText(
      value,
      [
        "status",
        "task_status",
        "review_status",
      ],
    );

  const isCompleted =
    value.is_completed ===
      true ||
    value.completed ===
      true ||
    [
      "completed",
      "done",
      "approved",
    ].includes(
      status
        ?.toLowerCase() ??
        "",
    );

  const kind =
    classifyReminder(
      value,
      title,
      description,
    );

  const rawId =
    value.id ??
    value.reminder_id ??
    value.action_plan_id ??
    value.mentor_action_plan_id ??
    value.milestone_id ??
    value.scholarship_id;

  const id =
    (
      typeof rawId ===
        "string" ||
      typeof rawId ===
        "number"
    )
      ? String(
          rawId,
        )
      : `${kind}-${deadline ?? "no-date"}-${index}-${title}`;

  return {
    id,
    title,
    description:
      description ===
      title
        ? null
        : description,
    deadline,
    daysRemaining:
      backendDaysRemaining ??
      localDaysUntil(
        deadline,
      ),
    priority:
      firstText(
        value,
        [
          "priority",
          "urgency",
          "severity",
        ],
      ),
    kind,
    status,
    isCompleted,
    raw:
      value,
  };
}

/**
 * GET /api/reminders/upcoming?days={days}
 *
 * The updated backend documents this as the Smart Reminders endpoint
 * for milestone tasks, scholarship deadlines, and mentor tasks.
 */
export async function getUpcomingReminders(
  days = 7,
): Promise<Reminder[]> {
  const normalizedDays =
    Number.isFinite(
      days,
    )
      ? Math.max(
          0,
          Math.trunc(
            days,
          ),
        )
      : 7;

  const response =
    await apiRequest<unknown>(
      `/api/reminders/upcoming?days=${normalizedDays}`,
    );

  return extractList(
    response,
  )
    .map(
      normalizeReminder,
    )
    .filter(
      (
        reminder,
      ): reminder is Reminder =>
        reminder !==
          null &&
        !reminder.isCompleted,
    );
}

export function isMentorTaskReminder(
  reminder: Reminder,
): boolean {
  return (
    reminder.kind ===
    "mentor_task"
  );
}

export function isH1MentorTaskReminder(
  reminder: Reminder,
): boolean {
  return (
    isMentorTaskReminder(
      reminder,
    ) &&
    reminder.daysRemaining ===
      1 &&
    !reminder.isCompleted
  );
}
