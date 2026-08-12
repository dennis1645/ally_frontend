import {
  ApiError,
  apiRequest,
} from "./apiClient";

/* =========================================================
   Shared roadmap models
========================================================= */

export type RoadmapEntityId =
  | number
  | string;

export type RoadmapTask = {
  id: RoadmapEntityId;
  parentId: RoadmapEntityId | null;
  title: string;
  description: string;
  status: string | null;
  completed: boolean;
  xpReward: number;
  depth: number;
  targetDate: string | null;
  isMandatory: boolean;
  isDiscovered: boolean;
};

export type RoadmapMilestoneStatus =
  | "completed"
  | "current"
  | "available"
  | "locked";

export type RoadmapMilestone = {
  id: RoadmapEntityId;
  title: string;
  description: string;
  status: RoadmapMilestoneStatus;
  backendStatus: string | null;
  progress: number;
  completed: boolean;
  isDiscovered: boolean;
  order: number;
  targetDate: string | null;
  xpReward: number;
  tasks: RoadmapTask[];
};

export type RoadmapData = {
  scholarshipId: number;
  milestones: RoadmapMilestone[];
};

export type RoadmapAccessResult = {
  isPremium: boolean;
  hasTimeline: boolean;
  roadmap: RoadmapData | null;
};

export type LoadRoadmapResult = {
  status: "ready";
  roadmap: RoadmapData;
  isPremium: boolean;
  generated: boolean;
};

/* =========================================================
   Submission models
========================================================= */

export type RoadmapReviewStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "revision_requested"
  | "unknown";

export type RoadmapSubmission = {
  id: RoadmapEntityId | null;
  milestoneId: RoadmapEntityId | null;
  reviewStatus: RoadmapReviewStatus;
  textResponse: string | null;
  feedback: string | null;
  rating: number | null;
  documentId: RoadmapEntityId | null;
  documentName: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type RoadmapSubmissionState = {
  status: "success" | "empty";
  message: string | null;
  submission: RoadmapSubmission | null;
};

export type SubmitRoadmapTaskPayload = {
  textResponse?: string | null;
  file?: File | null;
  fileType?: string | null;
};

/* =========================================================
   Runtime helpers
========================================================= */

type UnknownRecord =
  Record<string, unknown>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function asString(
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

function asNumber(
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

function asBoolean(
  value: unknown,
  fallback = false,
): boolean {
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

  return fallback;
}

function normalizeEntityId(
  value: unknown,
  fallback: RoadmapEntityId,
): RoadmapEntityId {
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

  return fallback;
}

function normalizeStatus(
  value: unknown,
): string {
  return (
    asString(value)
      ?.toLowerCase()
      .replace(/[\s_]+/g, "-") ??
    ""
  );
}

function dateOnly(
  value: unknown,
): string | null {
  const raw =
    asString(value);

  if (!raw) {
    return null;
  }

  const match =
    raw.match(
      /^(\d{4}-\d{2}-\d{2})/,
    );

  return match?.[1] ?? raw;
}

function isCompletedStatus(
  status: string,
): boolean {
  return [
    "completed",
    "complete",
    "done",
    "approved",
  ].includes(status);
}

function isInProgressStatus(
  status: string,
): boolean {
  return [
    "current",
    "active",
    "started",
    "in-progress",
    "inprogress",
  ].includes(status);
}

function isLockedStatus(
  status: string,
): boolean {
  return [
    "locked",
    "blocked",
    "unavailable",
  ].includes(status);
}

function assertApiSuccess(
  response: unknown,
  fallbackMessage: string,
): void {
  if (!isRecord(response)) {
    return;
  }

  const status =
    normalizeStatus(
      response.status,
    );

  if (
    status === "error" ||
    status === "failed" ||
    status === "failure"
  ) {
    throw new Error(
      asString(
        response.message,
      ) ??
        fallbackMessage,
    );
  }
}

/* =========================================================
   Scholarship ID
========================================================= */

export function parseScholarshipId(
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
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(normalized);

  return (
    Number.isInteger(parsed) &&
    parsed > 0
  )
    ? parsed
    : null;
}

/* =========================================================
   Saved milestone normalization

   Exact GET /api/milestones schema supplied by backend:
   - id
   - parent_id
   - scholarship_id
   - task_name
   - description
   - step_order
   - start_date
   - target_date
   - status
   - completed_at
   - is_discovered
   - xp_reward
   - is_mandatory
   - sub_tasks[] recursively
========================================================= */

function flattenSubTasks(
  values: unknown,
  depth = 0,
): RoadmapTask[] {
  if (
    !Array.isArray(values)
  ) {
    return [];
  }

  const tasks: RoadmapTask[] = [];

  values.forEach(
    (
      rawTask,
      index,
    ) => {
      if (
        !isRecord(rawTask)
      ) {
        return;
      }

      const id =
        normalizeEntityId(
          rawTask.id,
          `task-${depth}-${index + 1}`,
        );

      const rawParentId =
        rawTask.parent_id;

      const parentId:
        RoadmapEntityId | null =
        typeof rawParentId === "number" ||
        typeof rawParentId === "string"
          ? rawParentId
          : null;

      const backendStatus =
        normalizeStatus(
          rawTask.status,
        );

      const completed =
        Boolean(
          rawTask.completed_at,
        ) ||
        isCompletedStatus(
          backendStatus,
        );

      tasks.push({
        id,
        parentId,
        title:
          asString(
            rawTask.task_name,
          ) ??
          `Task ${index + 1}`,
        description:
          asString(
            rawTask.description,
          ) ??
          "",
        status:
          asString(
            rawTask.status,
          ),
        completed,
        xpReward:
          asNumber(
            rawTask.xp_reward,
          ) ??
          0,
        depth,
        targetDate:
          dateOnly(
            rawTask.target_date ??
              rawTask.target_deadline,
          ),
        isMandatory:
          asBoolean(
            rawTask.is_mandatory,
            false,
          ),
        isDiscovered:
          asBoolean(
            rawTask.is_discovered,
            false,
          ),
      });

      tasks.push(
        ...flattenSubTasks(
          rawTask.sub_tasks,
          depth + 1,
        ),
      );
    },
  );

  return tasks;
}

function calculateMilestoneProgress(
  completed: boolean,
  tasks: RoadmapTask[],
): number {
  if (completed) {
    return 100;
  }

  if (
    tasks.length === 0
  ) {
    return 0;
  }

  const parentIds =
    new Set(
      tasks
        .map(
          (task) =>
            task.parentId,
        )
        .filter(
          (
            value,
          ): value is RoadmapEntityId =>
            value !== null,
        )
        .map(String),
    );

  const leafTasks =
    tasks.filter(
      (task) =>
        !parentIds.has(
          String(task.id),
        ),
    );

  const base =
    leafTasks.length > 0
      ? leafTasks
      : tasks;

  const completedCount =
    base.filter(
      (task) =>
        task.completed,
    ).length;

  return Math.round(
    (completedCount /
      base.length) *
      100,
  );
}

function normalizeSavedMilestones(
  values: unknown[],
): RoadmapMilestone[] {
  const rows =
    values
      .filter(isRecord)
      .slice()
      .sort(
        (
          first,
          second,
        ) =>
          (
            asNumber(
              first.step_order,
            ) ??
            Number.MAX_SAFE_INTEGER
          ) -
          (
            asNumber(
              second.step_order,
            ) ??
            Number.MAX_SAFE_INTEGER
          ),
      );

  const hasExplicitCurrent =
    rows.some(
      (row) =>
        isInProgressStatus(
          normalizeStatus(
            row.status,
          ),
        ),
    );

  let fallbackCurrentAssigned =
    false;

  return rows.map(
    (
      row,
      index,
    ) => {
      const id =
        normalizeEntityId(
          row.id,
          `milestone-${index + 1}`,
        );

      const backendStatus =
        normalizeStatus(
          row.status,
        );

      const completed =
        Boolean(
          row.completed_at,
        ) ||
        isCompletedStatus(
          backendStatus,
        );

      const tasks =
        flattenSubTasks(
          row.sub_tasks,
        );

      let visualStatus:
        RoadmapMilestoneStatus;

      if (completed) {
        visualStatus =
          "completed";
      } else if (
        isLockedStatus(
          backendStatus,
        )
      ) {
        visualStatus =
          "locked";
      } else if (
        isInProgressStatus(
          backendStatus,
        )
      ) {
        visualStatus =
          "current";
      } else if (
        !hasExplicitCurrent &&
        !fallbackCurrentAssigned
      ) {
        visualStatus =
          "current";
        fallbackCurrentAssigned =
          true;
      } else {
        visualStatus =
          "available";
      }

      return {
        id,
        title:
          asString(
            row.task_name,
          ) ??
          `Milestone ${index + 1}`,
        description:
          asString(
            row.description,
          ) ??
          "",
        status:
          visualStatus,
        backendStatus:
          asString(
            row.status,
          ),
        progress:
          calculateMilestoneProgress(
            completed,
            tasks,
          ),
        completed,
        isDiscovered:
          asBoolean(
            row.is_discovered,
            false,
          ),
        order:
          asNumber(
            row.step_order,
          ) ??
          index + 1,
        targetDate:
          dateOnly(
            row.target_date ??
              row.target_deadline,
          ),
        xpReward:
          asNumber(
            row.xp_reward,
          ) ??
          0,
        tasks,
      };
    },
  );
}

/* =========================================================
   GET roadmap access

   Flow source of truth:
   GET /api/milestones?scholarship_id=X
========================================================= */

export async function getRoadmapAccess(
  scholarshipId: number,
): Promise<RoadmapAccessResult> {
  const response =
    await apiRequest<unknown>(
      `/api/milestones?scholarship_id=${encodeURIComponent(
        String(
          scholarshipId,
        ),
      )}`,
      {
        method: "GET",
      },
    );

  assertApiSuccess(
    response,
    "The roadmap could not be loaded.",
  );

  if (
    !isRecord(response) ||
    !isRecord(
      response.data,
    )
  ) {
    throw new Error(
      "The roadmap server returned an invalid response.",
    );
  }

  const data =
    response.data;

  if (
    typeof data.is_user_premium !==
    "boolean"
  ) {
    throw new Error(
      "The roadmap server did not return premium access status.",
    );
  }

  if (
    !Array.isArray(
      data.milestones,
    )
  ) {
    throw new Error(
      "The roadmap server did not return a milestones list.",
    );
  }

  /*
   * Premium controls TASK ACCESS only.
   *
   * Free users are still allowed to:
   * - generate their personalized roadmap;
   * - view the generated valleys/checkpoints/tasks;
   * - see roadmap progress.
   *
   * Therefore we must never discard milestone data simply because
   * is_user_premium is false.
   */
  if (
    data.milestones.length ===
    0
  ) {
    return {
      isPremium:
        data.is_user_premium,
      hasTimeline:
        false,
      roadmap:
        null,
    };
  }

  const milestones =
    normalizeSavedMilestones(
      data.milestones,
    );

  if (
    milestones.length ===
    0
  ) {
    throw new Error(
      "Your roadmap exists, but its milestone data could not be read.",
    );
  }

  return {
    isPremium:
      data.is_user_premium,
    hasTimeline:
      true,
    roadmap: {
      scholarshipId,
      milestones,
    },
  };
}

/* =========================================================
   AI generation

   Generation is allowed for both free and premium users.
   Premium status only controls whether a user can open/use
   the actual milestone-task workspace.
========================================================= */

async function requestRoadmapGeneration(
  scholarshipId: number,
): Promise<void> {
  const response =
    await apiRequest<unknown>(
      "/api/milestones/generate",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            scholarship_id:
              scholarshipId,
          }),
        timeoutMs:
          120_000,
      },
    );

  assertApiSuccess(
    response,
    "Ally could not generate your roadmap.",
  );
}

/*
 * Prevent React StrictMode or multiple callers from triggering
 * duplicate AI generation for the same scholarship.
 */
const generationLocks =
  new Map<
    number,
    Promise<RoadmapAccessResult>
  >();

async function generateAndReloadRoadmap(
  scholarshipId: number,
): Promise<RoadmapAccessResult> {
  await requestRoadmapGeneration(
    scholarshipId,
  );

  /*
   * Always GET again after generation.
   *
   * The generator response can contain AI/string IDs, while the saved
   * milestone response returns the canonical numeric database IDs that
   * are required by:
   *
   * POST /api/milestones/{id}/submit
   * GET  /api/milestones/{id}/submission
   */
  const reloaded =
    await getRoadmapAccess(
      scholarshipId,
    );

  if (
    !reloaded.roadmap
  ) {
    throw new Error(
      "Ally generated the timeline, but the saved milestones are not available yet.",
    );
  }

  return reloaded;
}

/* =========================================================
   Main roadmap loader

   Exact flow:

   GET milestones
        ↓
   milestones exist?
      yes → show roadmap
      no  → POST generate → GET milestones again
        ↓
   is_user_premium is returned alongside the roadmap
        ↓
   premium only gates leaf-task interaction in the UI
========================================================= */

export async function loadOrGenerateRoadmap(
  scholarshipId: number,
): Promise<LoadRoadmapResult> {
  const access =
    await getRoadmapAccess(
      scholarshipId,
    );

  if (
    access.hasTimeline &&
    access.roadmap
  ) {
    return {
      status:
        "ready",
      roadmap:
        access.roadmap,
      isPremium:
        access.isPremium,
      generated:
        false,
    };
  }

  const activeGeneration =
    generationLocks.get(
      scholarshipId,
    );

  if (
    activeGeneration
  ) {
    const generatedAccess =
      await activeGeneration;

    if (
      !generatedAccess.roadmap
    ) {
      throw new Error(
        "The generated roadmap is not available yet.",
      );
    }

    return {
      status:
        "ready",
      roadmap:
        generatedAccess.roadmap,
      isPremium:
        generatedAccess.isPremium,
      generated:
        true,
    };
  }

  const generation =
    generateAndReloadRoadmap(
      scholarshipId,
    );

  generationLocks.set(
    scholarshipId,
    generation,
  );

  try {
    const generatedAccess =
      await generation;

    if (
      !generatedAccess.roadmap
    ) {
      throw new Error(
        "The generated roadmap is not available yet.",
      );
    }

    return {
      status:
        "ready",
      roadmap:
        generatedAccess.roadmap,
      isPremium:
        generatedAccess.isPremium,
      generated:
        true,
    };
  } finally {
    generationLocks.delete(
      scholarshipId,
    );
  }
}

/* =========================================================
   Task submission

   POST /api/milestones/{id}/submit
   multipart/form-data:
   - text_response
   - file
   - file_type (optional here because backend collection does
     not document it as required)
========================================================= */

export async function submitRoadmapTask(
  milestoneId: RoadmapEntityId,
  payload: SubmitRoadmapTaskPayload,
): Promise<string | null> {
  const textResponse =
    payload.textResponse
      ?.trim() ??
    "";

  const file =
    payload.file ??
    null;

  if (
    !textResponse &&
    !file
  ) {
    throw new Error(
      "Add a written response, a supporting file, or both before submitting this task.",
    );
  }

  const formData =
    new FormData();

  if (textResponse) {
    formData.append(
      "text_response",
      textResponse,
    );
  }

  if (file) {
    formData.append(
      "file",
      file,
    );
  }

  const fileType =
    payload.fileType
      ?.trim();

  if (fileType) {
    formData.append(
      "file_type",
      fileType,
    );
  }

  const response =
    await apiRequest<unknown>(
      `/api/milestones/${encodeURIComponent(
        String(
          milestoneId,
        ),
      )}/submit`,
      {
        method: "POST",
        body: formData,
      },
    );

  assertApiSuccess(
    response,
    "Your task submission could not be sent.",
  );

  return isRecord(response)
    ? asString(
        response.message,
      )
    : null;
}

/* =========================================================
   Submission status / mentor feedback

   GET /api/milestones/{id}/submission

   The backend collection documents the endpoint and review
   states but does not include a saved response example, so this
   normalizer accepts the common nested response shapes without
   fabricating values.
========================================================= */

function normalizeReviewStatus(
  value: unknown,
): RoadmapReviewStatus {
  const status =
    normalizeStatus(value);

  if (
    status === "pending" ||
    status === "submitted" ||
    status === "awaiting-review" ||
    status === "under-review"
  ) {
    return "pending";
  }

  if (
    status === "approved" ||
    status === "completed" ||
    status === "complete"
  ) {
    return "approved";
  }

  if (
    status === "revision-requested" ||
    status === "revision" ||
    status === "needs-revision" ||
    status === "rejected"
  ) {
    return "revision_requested";
  }

  return status
    ? "unknown"
    : "not_submitted";
}

function getSubmissionRecord(
  data: unknown,
): UnknownRecord | null {
  if (!isRecord(data)) {
    return null;
  }

  const candidates = [
    data.submission,
    data.task_submission,
    data.taskSubmission,
    data.data,
  ];

  for (
    const candidate
    of candidates
  ) {
    if (
      isRecord(candidate)
    ) {
      return candidate;
    }
  }

  return data;
}

function getNestedDocument(
  record: UnknownRecord,
): UnknownRecord | null {
  const candidates = [
    record.document,
    record.vault_document,
    record.vaultDocument,
    record.file,
  ];

  for (
    const candidate
    of candidates
  ) {
    if (
      isRecord(candidate)
    ) {
      return candidate;
    }
  }

  return null;
}

function normalizeSubmissionResponse(
  response: unknown,
): RoadmapSubmissionState {
  assertApiSuccess(
    response,
    "The task submission status could not be loaded.",
  );

  if (
    !isRecord(response)
  ) {
    return {
      status: "empty",
      message: null,
      submission: null,
    };
  }

  const data =
    response.data;

  if (
    data === null ||
    data === undefined
  ) {
    return {
      status: "empty",
      message:
        asString(
          response.message,
        ),
      submission: null,
    };
  }

  const record =
    getSubmissionRecord(
      data,
    );

  if (!record) {
    return {
      status: "empty",
      message:
        asString(
          response.message,
        ),
      submission: null,
    };
  }

  const review =
    isRecord(
      record.review,
    )
      ? record.review
      : null;

  const document =
    getNestedDocument(
      record,
    );

  const reviewStatus =
    normalizeReviewStatus(
      record.review_status ??
        record.reviewStatus ??
        review?.status ??
        record.status,
    );

  return {
    status: "success",
    message:
      asString(
        response.message,
      ),
    submission: {
      id:
        record.id !== undefined
          ? normalizeEntityId(
              record.id,
              "submission",
            )
          : null,
      milestoneId:
        record.milestone_id !== undefined
          ? normalizeEntityId(
              record.milestone_id,
              "milestone",
            )
          : record.milestoneId !== undefined
            ? normalizeEntityId(
                record.milestoneId,
                "milestone",
              )
            : null,
      reviewStatus,
      textResponse:
        asString(
          record.text_response ??
            record.textResponse ??
            record.response_text,
        ),
      feedback:
        asString(
          record.feedback ??
            record.mentor_feedback ??
            record.mentorFeedback ??
            review?.feedback ??
            review?.notes,
        ),
      rating:
        asNumber(
          record.rating ??
            review?.rating,
        ),
      documentId:
        document?.id !== undefined
          ? normalizeEntityId(
              document.id,
              "document",
            )
          : record.document_id !== undefined
            ? normalizeEntityId(
                record.document_id,
                "document",
              )
            : null,
      documentName:
        asString(
          document?.name ??
            document?.file_name ??
            document?.filename ??
            record.file_name ??
            record.filename,
        ),
      submittedAt:
        asString(
          record.submitted_at ??
            record.created_at,
        ),
      reviewedAt:
        asString(
          record.reviewed_at ??
            review?.reviewed_at ??
            review?.updated_at,
        ),
    },
  };
}

export async function getRoadmapTaskSubmission(
  milestoneId: RoadmapEntityId,
): Promise<RoadmapSubmissionState> {
  try {
    const response =
      await apiRequest<unknown>(
        `/api/milestones/${encodeURIComponent(
          String(
            milestoneId,
          ),
        )}/submission`,
        {
          method: "GET",
        },
      );

    return normalizeSubmissionResponse(
      response,
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return {
        status: "empty",
        message: null,
        submission: null,
      };
    }

    throw error;
  }
}