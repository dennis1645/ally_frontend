import {
  apiRequest,
} from "./apiClient";

export type AIMentorChatPayload = {
  message: string;
};

export type AIMentorChatResult = {
  reply: string;
  raw: unknown;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function asNonEmptyString(
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

function readReplyFromRecord(
  record: UnknownRecord,
  includeGenericMessage = false,
): string | null {
  const preferredKeys = [
    "reply",
    "response",
    "answer",
    "ai_response",
    "assistant_response",
    "content",
    "text",
  ] as const;

  for (
    const key of preferredKeys
  ) {
    const value =
      asNonEmptyString(
        record[key],
      );

    if (value) {
      return value;
    }
  }

  if (
    includeGenericMessage
  ) {
    return asNonEmptyString(
      record.message,
    );
  }

  return null;
}

function extractAssistantReply(
  response: unknown,
): string {
  const directString =
    asNonEmptyString(
      response,
    );

  if (directString) {
    return directString;
  }

  if (!isRecord(response)) {
    throw new Error(
      "The AI mentor returned an unreadable response.",
    );
  }

  const status =
    asNonEmptyString(
      response.status,
    )?.toLowerCase();

  if (
    status === "error" ||
    status === "failed" ||
    status === "failure"
  ) {
    throw new Error(
      asNonEmptyString(
        response.message,
      ) ??
        "The AI mentor could not answer your message.",
    );
  }

  const data =
    response.data;

  const directDataString =
    asNonEmptyString(
      data,
    );

  if (directDataString) {
    return directDataString;
  }

  if (isRecord(data)) {
    const dataReply =
      readReplyFromRecord(
        data,
        true,
      );

    if (dataReply) {
      return dataReply;
    }

    if (
      isRecord(
        data.data,
      )
    ) {
      const nestedReply =
        readReplyFromRecord(
          data.data,
          true,
        );

      if (nestedReply) {
        return nestedReply;
      }
    }
  }

  const topLevelReply =
    readReplyFromRecord(
      response,
      false,
    );

  if (topLevelReply) {
    return topLevelReply;
  }

  const message =
    asNonEmptyString(
      response.message,
    );

  if (message) {
    return message;
  }

  throw new Error(
    "The AI mentor response did not include a readable message.",
  );
}

export async function sendAIMentorMessageApi(
  payload: AIMentorChatPayload,
): Promise<AIMentorChatResult> {
  const message =
    payload.message.trim();

  if (!message) {
    throw new Error(
      "Enter a message before sending it to Ally.",
    );
  }

  const response =
    await apiRequest<unknown>(
      "/api/ai-mentor/chat",
      {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
        timeoutMs: 60_000,
      },
    );

  return {
    reply:
      extractAssistantReply(
        response,
      ),
    raw:
      response,
  };
}