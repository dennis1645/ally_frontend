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

export type RoadmapLoadOptions = {
  /*
   * GET /api/profile is the source used to detect the user's
   * current premium state.
   */
  userId?:
    | number
    | string
    | null;

  isPremium?:
    boolean;

  premiumUntil?:
    | string
    | null;
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
   Premium roadmap expansion state

   Why this exists:
   - a free user can already have a preview/partial roadmap;
   - after GET /api/profile changes to is_premium: true,
     the frontend must call POST /api/milestones/generate again
     once so the backend can create/expand the full premium timeline;
   - simply checking "milestones.length > 0" is not enough because
     those milestones may be the older free-preview version.

   The backend contract currently does not expose a
   "premium_timeline_generated" or timeline-version field, so this
   client remembers a successful premium expansion per user +
   scholarship. The POST should still be implemented idempotently on
   the backend for cross-device safety.
========================================================= */

const PREMIUM_ROADMAP_SYNC_PREFIX =
  "ally.premium-roadmap-sync";

function getPremiumRoadmapSyncKey(
  options: RoadmapLoadOptions,
  scholarshipId: number,
): string | null {
  if (
    options.userId ===
      null ||
    options.userId ===
      undefined
  ) {
    return null;
  }

  return `${PREMIUM_ROADMAP_SYNC_PREFIX}:${String(
    options.userId,
  )}:${String(
    scholarshipId,
  )}`;
}

function getPremiumRoadmapFingerprint(
  options: RoadmapLoadOptions,
): string {
  const premiumUntil =
    options.premiumUntil?.trim();

  return premiumUntil ||
    "premium-active";
}

function hasPremiumRoadmapBeenSynced(
  options: RoadmapLoadOptions,
  scholarshipId: number,
): boolean {
  const key =
    getPremiumRoadmapSyncKey(
      options,
      scholarshipId,
    );

  if (!key) {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(
        key,
      ) ===
      getPremiumRoadmapFingerprint(
        options,
      )
    );
  } catch {
    return false;
  }
}

function markPremiumRoadmapSynced(
  options: RoadmapLoadOptions,
  scholarshipId: number,
): void {
  const key =
    getPremiumRoadmapSyncKey(
      options,
      scholarshipId,
    );

  if (!key) {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      getPremiumRoadmapFingerprint(
        options,
      ),
    );
  } catch {
    /*
     * The roadmap itself is already stored on the backend.
     * Local storage only prevents unnecessary repeat generation.
     */
  }
}

function clearPremiumRoadmapSync(
  options: RoadmapLoadOptions,
  scholarshipId: number,
): void {
  const key =
    getPremiumRoadmapSyncKey(
      options,
      scholarshipId,
    );

  if (!key) {
    return;
  }

  try {
    window.localStorage.removeItem(
      key,
    );
  } catch {
    /*
     * Non-critical cache cleanup.
     */
  }
}

export function hasPremiumTimelineGenerationMarker(
  options: RoadmapLoadOptions,
  scholarshipId: number,
): boolean {
  return hasPremiumRoadmapBeenSynced(
    options,
    scholarshipId,
  );
}

export function clearPremiumTimelineGenerationMarker(
  options: RoadmapLoadOptions,
  scholarshipId: number,
): void {
  clearPremiumRoadmapSync(
    options,
    scholarshipId,
  );
}

function roadmapFingerprint(
  roadmap:
    RoadmapData | null,
): string | null {
  if (!roadmap) {
    return null;
  }

  return JSON.stringify(
    roadmap.milestones.map(
      (
        milestone,
      ) => ({
        id:
          String(
            milestone.id,
          ),
        title:
          milestone.title,
        status:
          milestone.status,
        backendStatus:
          milestone.backendStatus,
        completed:
          milestone.completed,
        targetDate:
          milestone.targetDate,
        tasks:
          milestone.tasks.map(
            (
              task,
            ) => ({
              id:
                String(
                  task.id,
                ),
              parentId:
                task.parentId ===
                null
                  ? null
                  : String(
                      task.parentId,
                    ),
              title:
                task.title,
              status:
                task.status,
              completed:
                task.completed,
              targetDate:
                task.targetDate,
              isMandatory:
                task.isMandatory,
              isDiscovered:
                task.isDiscovered,
            }),
          ),
      }),
    ),
  );
}

/* =========================================================
   AI generation

   Generation is allowed for both free and premium users.
   Premium status only controls whether a user can open/use
   the actual milestone-task workspace.
========================================================= */

const ROADMAP_GENERATION_TIMEOUT_MS =
  120_000;

const ROADMAP_RELOAD_POLL_INTERVAL_MS =
  2_500;

const ROADMAP_RELOAD_MAX_WAIT_MS =
  45_000;

function waitForRoadmapPoll(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      milliseconds,
    );
  });
}

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
          ROADMAP_GENERATION_TIMEOUT_MS,
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
  let generationTimedOut =
    false;

  try {
    await requestRoadmapGeneration(
      scholarshipId,
    );
  } catch (
    error
  ) {
    /*
     * AI generation is a long-running server operation.
     *
     * A browser-side 408 only means apiClient stopped waiting.
     * The backend may still finish and persist the milestones.
     *
     * Do not immediately trigger a second POST. Instead, poll the
     * canonical GET endpoint for the saved roadmap.
     */
    if (
      error instanceof ApiError &&
      error.status ===
        408
    ) {
      generationTimedOut =
        true;

      console.info(
        "[Roadmap] Generation response timed out; checking for saved milestones instead.",
      );
    } else {
      throw error;
    }
  }

  /*
   * Always GET after generation.
   *
   * POST /api/milestones/generate can return AI/string IDs such as
   * "leadership-activities". Those IDs are descriptive output only.
   *
   * GET /api/milestones returns the canonical numeric DB milestone IDs
   * needed by the submission/review endpoints.
   *
   * Poll briefly because persistence can finish a little after the AI
   * response, and especially because a 408 may leave the backend still
   * processing.
   */
  const startedAt =
    Date.now();

  let lastReloadError:
    unknown =
    null;

  while (
    Date.now() -
      startedAt <
    ROADMAP_RELOAD_MAX_WAIT_MS
  ) {
    try {
      const reloaded =
        await getRoadmapAccess(
          scholarshipId,
        );

      if (
        reloaded.hasTimeline &&
        reloaded.roadmap
      ) {
        return reloaded;
      }

      lastReloadError =
        null;
    } catch (
      error
    ) {
      /*
       * Auth failures are definitive and should be surfaced immediately.
       */
      if (
        error instanceof ApiError &&
        (
          error.status ===
            401 ||
          error.status ===
            403
        )
      ) {
        throw error;
      }

      lastReloadError =
        error;
    }

    await waitForRoadmapPoll(
      ROADMAP_RELOAD_POLL_INTERVAL_MS,
    );
  }

  console.error(
    "[Roadmap] Saved milestones did not become available before the reload timeout.",
    lastReloadError,
  );

  throw new Error(
    generationTimedOut
      ? "The roadmap generation request is still processing. Your scholarship is already selected; try opening the Quest Tracker again in a moment."
      : "Ally generated the timeline, but the saved milestones are not available yet.",
  );
}

/* =========================================================
   Explicit Premium full-timeline generator

   This is intentionally different from loadOrGenerateRoadmap().

   It ALWAYS sends:
   POST /api/milestones/generate
   { scholarship_id: X }

   It is designed for the explicit "Generate My Full Timeline"
   button in Quest Tracker.

   Why:
   GET /api/milestones can already contain a free/partial preview.
   The frontend cannot safely infer from "milestones.length > 0"
   that the full premium timeline has already been generated.
========================================================= */

export async function generateFullPremiumRoadmap(
  scholarshipId: number,
  options: RoadmapLoadOptions = {},
): Promise<LoadRoadmapResult> {
  const before =
    await getRoadmapAccess(
      scholarshipId,
    );

  const beforeFingerprint =
    roadmapFingerprint(
      before.roadmap,
    );

  let requestTimedOut =
    false;

  try {
    await requestRoadmapGeneration(
      scholarshipId,
    );
  } catch (
    error
  ) {
    /*
     * The AI request can outlive the browser timeout. If apiClient
     * returns 408, do NOT send another generation POST. Poll the
     * canonical GET endpoint and wait for the saved roadmap to change.
     */
    if (
      error instanceof ApiError &&
      error.status ===
        408
    ) {
      requestTimedOut =
        true;

      console.info(
        "[Roadmap] Full timeline generation timed out in the browser; waiting for the backend result.",
      );
    } else {
      throw error;
    }
  }

  const startedAt =
    Date.now();

  let latestAccess =
    before;

  let lastReloadError:
    unknown =
    null;

  while (
    Date.now() -
      startedAt <
    ROADMAP_RELOAD_MAX_WAIT_MS
  ) {
    try {
      latestAccess =
        await getRoadmapAccess(
          scholarshipId,
        );

      const latestFingerprint =
        roadmapFingerprint(
          latestAccess.roadmap,
        );

      const roadmapAppeared =
        beforeFingerprint ===
          null &&
        latestFingerprint !==
          null;

      const roadmapChanged =
        beforeFingerprint !==
          null &&
        latestFingerprint !==
          null &&
        latestFingerprint !==
          beforeFingerprint;

      /*
       * If the POST completed normally and there was no baseline roadmap,
       * any saved roadmap is enough.
       *
       * If a partial roadmap existed before generation, wait for the
       * canonical milestone tree to actually change. This prevents the
       * UI from immediately re-rendering the same partial timeline.
       */
      if (
        roadmapAppeared ||
        roadmapChanged
      ) {
        markPremiumRoadmapSynced(
          options,
          scholarshipId,
        );

        return {
          status:
            "ready",
          roadmap:
            latestAccess.roadmap!,
          isPremium:
            options.isPremium ??
            latestAccess.isPremium,
          generated:
            true,
        };
      }

      /*
       * If POST returned normally and GET already has a roadmap, give the
       * database a short window to expose any expanded records before
       * checking again.
       */
      lastReloadError =
        null;
    } catch (
      error
    ) {
      if (
        error instanceof ApiError &&
        (
          error.status ===
            401 ||
          error.status ===
            403
        )
      ) {
        throw error;
      }

      lastReloadError =
        error;
    }

    await waitForRoadmapPoll(
      ROADMAP_RELOAD_POLL_INTERVAL_MS,
    );
  }

  console.error(
    "[Roadmap] Full timeline generation finished/continued, but the canonical milestone tree did not change before timeout.",
    {
      requestTimedOut,
      lastReloadError,
      scholarshipId,
    },
  );

  throw new Error(
    requestTimedOut
      ? "Ally is still building your premium timeline. Your generation request was sent successfully, but the saved milestone tree has not updated yet. Try reloading the Quest Tracker in a moment."
      : "The generator responded, but the saved milestone tree did not change. Please check the backend generation response and milestone persistence.",
  );
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
  options: RoadmapLoadOptions = {},
): Promise<LoadRoadmapResult> {
  const profilePremium =
    options.isPremium ===
    true;

  /*
   * If GET /api/profile currently says the user is not premium,
   * remove the local premium-expansion marker. If the account is
   * upgraded again later, the next premium profile load can trigger
   * a fresh expansion.
   */
  if (
    options.isPremium ===
    false
  ) {
    clearPremiumRoadmapSync(
      options,
      scholarshipId,
    );
  }

  const access =
    await getRoadmapAccess(
      scholarshipId,
    );

  /*
   * CRITICAL PREMIUM-UPGRADE CASE
   *
   * A free user may already have milestones, so this cannot be:
   *
   *   if (milestones exist) return
   *
   * when GET /api/profile has changed to is_premium: true.
   *
   * On the first premium load for this user + scholarship, generate
   * once even if an older roadmap already exists. This is the call
   * that expands/rebuilds the full premium milestone timeline.
   */
  const premiumExpansionRequired =
    profilePremium &&
    !hasPremiumRoadmapBeenSynced(
      options,
      scholarshipId,
    );

  if (
    !premiumExpansionRequired &&
    access.hasTimeline &&
    access.roadmap
  ) {
    return {
      status:
        "ready",
      roadmap:
        access.roadmap,

      /*
       * The profile flag is authoritative for UI task unlocking
       * when it was explicitly supplied by the caller.
       */
      isPremium:
        options.isPremium ??
        access.isPremium,
      generated:
        false,
    };
  }

  const activeGeneration =
    generationLocks.get(
      scholarshipId,
    );

  let generatedAccess:
    RoadmapAccessResult;

  if (
    activeGeneration
  ) {
    generatedAccess =
      await activeGeneration;
  } else {
    const generation =
      generateAndReloadRoadmap(
        scholarshipId,
      );

    generationLocks.set(
      scholarshipId,
      generation,
    );

    try {
      generatedAccess =
        await generation;
    } finally {
      generationLocks.delete(
        scholarshipId,
      );
    }
  }

  if (
    !generatedAccess.roadmap
  ) {
    throw new Error(
      "The generated roadmap is not available yet.",
    );
  }

  if (
    profilePremium
  ) {
    markPremiumRoadmapSynced(
      options,
      scholarshipId,
    );
  }

  return {
    status:
      "ready",
    roadmap:
      generatedAccess.roadmap,
    isPremium:
      options.isPremium ??
      generatedAccess.isPremium,
    generated:
      true,
  };
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