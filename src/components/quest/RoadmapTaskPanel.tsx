import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Send,
  Star,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getRoadmapTaskSubmission,
  submitRoadmapTask,
  type RoadmapMilestone,
  type RoadmapReviewStatus,
  type RoadmapSubmission,
  type RoadmapTask,
} from "../../api/roadmapApi";

export type RoadmapTaskPanelProps = {
  milestone: RoadmapMilestone | null;
  isPremium: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onRoadmapRefresh: () => Promise<void>;
};

type SubmissionLoadState =
  | "idle"
  | "loading"
  | "ready"
  | "error";

function normalizeTaskStatus(
  value: string | null,
): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-") ??
    ""
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "";
  }

  const parsed =
    new Date(
      `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(parsed);
}

function taskStatusLabel(
  task: RoadmapTask,
): string {
  if (task.completed) {
    return "Completed";
  }

  const status =
    normalizeTaskStatus(
      task.status,
    );

  if (
    status === "in-progress" ||
    status === "current" ||
    status === "active"
  ) {
    return "In progress";
  }

  return "Open task";
}

function ReviewStatusCard({
  status,
  submission,
  xpReward,
}: {
  status: RoadmapReviewStatus;
  submission: RoadmapSubmission | null;
  xpReward: number;
}) {
  if (
    status === "approved"
  ) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2
            size={19}
            aria-hidden="true"
          />

          <p className="text-xs font-extrabold uppercase tracking-[0.13em]">
            Approved by mentor
          </p>
        </div>

        <p className="mt-2 text-sm leading-6 text-emerald-900">
          This task has been approved and your roadmap can move forward.
        </p>

        {xpReward > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#9b681f] shadow-sm">
            <Star
              size={14}
              fill="currentColor"
              aria-hidden="true"
            />
            +{xpReward} XP
          </div>
        )}

        {submission?.feedback && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-white/80 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
              Mentor feedback
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-700">
              {submission.feedback}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (
    status ===
    "revision_requested"
  ) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle
            size={19}
            aria-hidden="true"
          />

          <p className="text-xs font-extrabold uppercase tracking-[0.13em]">
            Revision requested
          </p>
        </div>

        <p className="mt-2 text-sm leading-6 text-amber-900">
          Review your mentor&apos;s notes, update your response, and submit the task again.
        </p>

        {submission?.feedback && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-white/85 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-700">
              Mentor feedback
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-700">
              {submission.feedback}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (
    status === "pending"
  ) {
    return (
      <div className="rounded-2xl border border-[#c7dce9] bg-[#f1f8fd] p-4">
        <div className="flex items-center gap-2 text-[#16629b]">
          <Clock3
            size={19}
            aria-hidden="true"
          />

          <p className="text-xs font-extrabold uppercase tracking-[0.13em]">
            Awaiting mentor review
          </p>
        </div>

        <p className="mt-2 text-sm leading-6 text-[#52606d]">
          Your submission has been sent. Ally will keep checking for mentor feedback while this task is open.
        </p>

        {submission?.textResponse && (
          <div className="mt-4 rounded-xl border border-[#d5e6f0] bg-white/90 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#16629b]">
              Your submitted response
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {submission.textResponse}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (
    status === "unknown"
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-6 text-slate-600">
          A submission exists, but the backend returned a review status this frontend does not recognize yet. Refresh the status or inspect the backend response before resubmitting.
        </p>
      </div>
    );
  }

  return null;
}

export default function RoadmapTaskPanel({
  milestone,
  isPremium,
  onClose,
  onUpgrade,
  onRoadmapRefresh,
}: RoadmapTaskPanelProps) {
  const [
    selectedTaskId,
    setSelectedTaskId,
  ] =
    useState<
      string | number | null
    >(null);

  const [
    submissionState,
    setSubmissionState,
  ] =
    useState<SubmissionLoadState>(
      "idle",
    );

  const [
    submission,
    setSubmission,
  ] =
    useState<RoadmapSubmission | null>(
      null,
    );

  const [
    reviewStatus,
    setReviewStatus,
  ] =
    useState<RoadmapReviewStatus>(
      "not_submitted",
    );

  const [
    submissionError,
    setSubmissionError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    textResponse,
    setTextResponse,
  ] =
    useState("");

  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const previousReviewStatusRef =
    useRef<RoadmapReviewStatus | null>(
      null,
    );

  const parentIds =
    useMemo(
      () => {
        if (!milestone) {
          return new Set<string>();
        }

        return new Set(
          milestone.tasks
            .map(
              (task) =>
                task.parentId,
            )
            .filter(
              (
                value,
              ): value is
                | string
                | number =>
                value !== null,
            )
            .map(String),
        );
      },
      [milestone],
    );

  const leafTasks =
    useMemo(
      () =>
        milestone?.tasks.filter(
          (task) =>
            !parentIds.has(
              String(task.id),
            ),
        ) ?? [],
      [
        milestone,
        parentIds,
      ],
    );

  const selectedTask =
    useMemo(
      () =>
        milestone?.tasks.find(
          (task) =>
            String(task.id) ===
            String(
              selectedTaskId,
            ),
        ) ?? null,
      [
        milestone,
        selectedTaskId,
      ],
    );

  useEffect(
    () => {
      setSelectedTaskId(
        null,
      );
      setSubmission(
        null,
      );
      setReviewStatus(
        "not_submitted",
      );
      setSubmissionState(
        "idle",
      );
      setSubmissionError(
        null,
      );
      setSuccessMessage(
        null,
      );
      setTextResponse("");
      setFile(null);
      previousReviewStatusRef.current =
        null;
    },
    [milestone?.id],
  );

  useEffect(
    () => {
      setSubmission(null);
      setReviewStatus(
        "not_submitted",
      );
      setSubmissionState(
        selectedTaskId === null ||
        !isPremium
          ? "idle"
          : "loading",
      );
      setSubmissionError(
        null,
      );
      previousReviewStatusRef.current =
        null;
    },
    [
      selectedTaskId,
      isPremium,
    ],
  );

  const loadSubmission =
    useCallback(
      async (
        task: RoadmapTask,
        silent = false,
      ): Promise<void> => {
        if (
          !isPremium
        ) {
          setSubmissionState(
            "idle",
          );
          setSubmission(
            null,
          );
          setReviewStatus(
            "not_submitted",
          );
          return;
        }

        if (!silent) {
          setSubmissionState(
            "loading",
          );
        }

        setSubmissionError(
          null,
        );

        try {
          const result =
            await getRoadmapTaskSubmission(
              task.id,
            );

          const nextSubmission =
            result.submission;

          const nextStatus =
            nextSubmission?.reviewStatus ??
            "not_submitted";

          setSubmission(
            nextSubmission,
          );
          setReviewStatus(
            nextStatus,
          );
          setSubmissionState(
            "ready",
          );

          if (
            nextSubmission?.textResponse &&
            nextStatus ===
              "revision_requested"
          ) {
            setTextResponse(
              nextSubmission.textResponse,
            );
          }

          const previous =
            previousReviewStatusRef.current;

          previousReviewStatusRef.current =
            nextStatus;

          if (
            previous !== null &&
            previous !==
              nextStatus &&
            (
              nextStatus ===
                "approved" ||
              nextStatus ===
                "revision_requested"
            )
          ) {
            await onRoadmapRefresh();
          }
        } catch (error) {
          console.error(
            "[Quest Tracker] Unable to load task submission:",
            error,
          );

          setSubmissionState(
            "error",
          );
          setSubmissionError(
            error instanceof Error
              ? error.message
              : "The submission status could not be loaded.",
          );
        }
      },
      [
        isPremium,
        onRoadmapRefresh,
      ],
    );

  useEffect(
    () => {
      if (
        !selectedTask ||
        !isPremium
      ) {
        return;
      }

      void loadSubmission(
        selectedTask,
      );
    },
    [
      selectedTask,
      isPremium,
      loadSubmission,
    ],
  );

  useEffect(
    () => {
      if (
        !selectedTask ||
        !isPremium ||
        reviewStatus !==
          "pending"
      ) {
        return;
      }

      const intervalId =
        window.setInterval(
          () => {
            void loadSubmission(
              selectedTask,
              true,
            );
          },
          30_000,
        );

      return () => {
        window.clearInterval(
          intervalId,
        );
      };
    },
    [
      selectedTask,
      isPremium,
      reviewStatus,
      loadSubmission,
    ],
  );

  async function handleSubmit(): Promise<void> {
    if (
      !selectedTask ||
      submitting
    ) {
      return;
    }

    if (
      !isPremium
    ) {
      onUpgrade();
      return;
    }

    if (
      !textResponse.trim() &&
      !file
    ) {
      setSubmissionError(
        "Add a written response, a supporting file, or both before submitting.",
      );
      return;
    }

    setSubmitting(true);
    setSubmissionError(
      null,
    );
    setSuccessMessage(
      null,
    );

    try {
      const message =
        await submitRoadmapTask(
          selectedTask.id,
          {
            textResponse,
            file,
          },
        );

      setSuccessMessage(
        message ??
          "Your task has been submitted for mentor review.",
      );
      setFile(null);

      await loadSubmission(
        selectedTask,
      );

      await onRoadmapRefresh();
    } catch (error) {
      console.error(
        "[Quest Tracker] Task submission failed:",
        error,
      );

      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Your task could not be submitted. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!milestone) {
    return null;
  }

  const canSubmit =
    Boolean(
      isPremium &&
      selectedTask &&
      !selectedTask.completed &&
      (
        reviewStatus ===
          "not_submitted" ||
        reviewStatus ===
          "revision_requested"
      ),
    );

  return (
    <div className="fixed inset-0 z-[140] flex justify-end bg-slate-950/35 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Close milestone tasks"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <aside
        aria-label={`${milestone.title} tasks`}
        className="relative z-10 flex h-full w-full max-w-[760px] flex-col overflow-hidden border-l border-[#d8c8b8] bg-[#fffaf6] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#eadfd4] bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7a582f]">
              Expedition milestone
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#2c1607]">
              {milestone.title}
            </h2>

            {milestone.description && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#667085]">
                {milestone.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            aria-label="Close"
          >
            <X
              size={19}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Task list */}
          <section className="min-h-0 overflow-y-auto border-b border-[#eadfd4] bg-[#f8f3ed] p-4 lg:border-b-0 lg:border-r sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#7a582f]">
                  Tasks
                </p>

                <p className="mt-1 text-xs text-[#7d746d]">
                  {leafTasks.filter(
                    (task) =>
                      task.completed,
                  ).length}{" "}
                  / {leafTasks.length} completed
                </p>
              </div>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#16629b] shadow-sm">
                {milestone.progress}%
              </span>
            </div>

            {milestone.tasks.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-[#d8c8b8] bg-white/70 p-4 text-sm leading-6 text-slate-500">
                No sub-tasks were returned for this milestone yet.
              </div>
            ) : (
              <div className="space-y-2">
                {milestone.tasks.map(
                  (task) => {
                    const isParent =
                      parentIds.has(
                        String(
                          task.id,
                        ),
                      );

                    const selected =
                      String(
                        selectedTaskId,
                      ) ===
                      String(
                        task.id,
                      );

                    if (isParent) {
                      return (
                        <div
                          key={
                            String(
                              task.id,
                            )
                          }
                          className="pt-3 first:pt-0"
                          style={{
                            paddingLeft:
                              `${Math.min(
                                task.depth,
                                3,
                              ) * 10}px`,
                          }}
                        >
                          <div className="rounded-xl border border-[#ded2c6] bg-white/80 px-3 py-2.5">
                            <p className="text-xs font-extrabold text-[#5d4037]">
                              {task.title}
                            </p>

                            {task.description && (
                              <p className="mt-1 text-[11px] leading-5 text-[#7d746d]">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={
                          String(
                            task.id,
                          )
                        }
                        type="button"
                        onClick={() => {
                          setSuccessMessage(
                            null,
                          );
                          setSubmissionError(
                            null,
                          );
                          setTextResponse("");
                          setFile(null);
                          setSelectedTaskId(
                            task.id,
                          );
                        }}
                        className={[
                          "flex w-full items-start gap-2 rounded-xl border px-3 py-3 text-left transition",
                          selected
                            ? "border-[#75abd0] bg-[#eef7fd] shadow-sm"
                            : "border-transparent bg-white/75 hover:border-[#d8c8b8] hover:bg-white",
                        ].join(" ")}
                        style={{
                          marginLeft:
                            `${Math.min(
                              task.depth,
                              3,
                            ) * 10}px`,
                          width:
                            `calc(100% - ${Math.min(
                              task.depth,
                              3,
                            ) * 10}px)`,
                        }}
                      >
                        <span className="mt-0.5 shrink-0">
                          {!isPremium ? (
                            <LockKeyhole
                              size={17}
                              className="text-[#b2874f]"
                              aria-hidden="true"
                            />
                          ) : task.completed ? (
                            <CheckCircle2
                              size={17}
                              className="text-emerald-600"
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle
                              size={17}
                              className="text-[#c69c6e]"
                              aria-hidden="true"
                            />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-extrabold leading-5 text-[#3d2514]">
                            {task.title}
                          </span>

                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7a6c]">
                            {isPremium
                              ? taskStatusLabel(
                                  task,
                                )
                              : "Premium task"}
                          </span>
                        </span>

                        <ChevronRight
                          size={15}
                          className="mt-0.5 shrink-0 text-slate-400"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </section>

          {/* Task workspace */}
          <section className="min-h-0 overflow-y-auto bg-white p-5 sm:p-7">
            {!selectedTask ? (
              <div className="grid min-h-[360px] place-items-center text-center">
                <div className="max-w-sm">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf5fb] text-[#16629b]">
                    <FileText
                      size={25}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold text-[#2c1607]">
                    Open a task
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    Choose a leaf task from the milestone list to view its details. Premium unlocks task submissions and mentor feedback.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#16629b]">
                      Task
                    </p>

                    <h3 className="mt-1 text-xl font-extrabold text-[#2c1607]">
                      {selectedTask.title}
                    </h3>

                    {selectedTask.description && (
                      <p className="mt-2 text-sm leading-6 text-[#667085]">
                        {selectedTask.description}
                      </p>
                    )}
                  </div>

                  {selectedTask.xpReward >
                    0 && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#fff6df] px-3 py-1.5 text-xs font-extrabold text-[#9b681f]">
                      <Star
                        size={13}
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      {selectedTask.xpReward} XP
                    </span>
                  )}
                </div>

                {(selectedTask.targetDate ||
                  selectedTask.isMandatory) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTask.targetDate && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        Due {formatDate(
                          selectedTask.targetDate,
                        )}
                      </span>
                    )}

                    {selectedTask.isMandatory && (
                      <span className="rounded-full bg-[#fff1ea] px-3 py-1.5 text-xs font-semibold text-[#9a6735]">
                        Mandatory
                      </span>
                    )}
                  </div>
                )}

                <div className="my-5 h-px bg-slate-100" />

                {!isPremium ? (
                  <div className="rounded-[22px] border-2 border-[#e5c98d] bg-[#fff9e9] p-5 text-center shadow-[0_5px_0_rgba(155,104,31,0.12)]">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#9b681f] shadow-sm">
                      <LockKeyhole
                        size={25}
                        aria-hidden="true"
                      />
                    </div>

                    <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.13em] text-[#9b681f]">
                      Premium quest
                    </p>

                    <h4 className="mt-1 text-xl font-extrabold text-[#2c1607]">
                      Unlock this milestone task
                    </h4>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
                      Your personalized roadmap is free to preview. Upgrade to Ally Premium to answer this task, upload supporting documents, submit it for mentor review, receive feedback, and earn XP.
                    </p>

                    <button
                      type="button"
                      onClick={
                        onUpgrade
                      }
                      className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#0d4773] transition hover:-translate-y-0.5 hover:bg-[#115787]"
                    >
                      <LockKeyhole
                        size={16}
                        aria-hidden="true"
                      />
                      Unlock Premium
                    </button>
                  </div>
                ) : (
                  <>
                {submissionState ===
                  "loading" && (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#d5e6f0] bg-[#f5fafd] p-4 text-sm text-[#52606d]">
                    <Loader2
                      size={18}
                      className="animate-spin text-[#16629b]"
                      aria-hidden="true"
                    />
                    Checking submission status...
                  </div>
                )}

                {submissionError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
                  >
                    {submissionError}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
                    {successMessage}
                  </div>
                )}

                {submissionState !==
                  "loading" && (
                  <ReviewStatusCard
                    status={
                      selectedTask.completed &&
                      reviewStatus ===
                        "not_submitted"
                        ? "approved"
                        : reviewStatus
                    }
                    submission={
                      submission
                    }
                    xpReward={
                      selectedTask.xpReward
                    }
                  />
                )}

                {reviewStatus ===
                  "pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      void loadSubmission(
                        selectedTask,
                      );
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#c7dce9] bg-white px-4 py-2.5 text-sm font-bold text-[#16629b] transition hover:bg-[#f5fafd]"
                  >
                    <RefreshCw
                      size={15}
                      aria-hidden="true"
                    />
                    Refresh review status
                  </button>
                )}

                {canSubmit && (
                  <div className="mt-5 space-y-4">
                    <div>
                      <label
                        htmlFor={`roadmap-task-response-${String(
                          selectedTask.id,
                        )}`}
                        className="block text-xs font-extrabold uppercase tracking-[0.12em] text-[#7a582f]"
                      >
                        {reviewStatus ===
                        "revision_requested"
                          ? "Revised response"
                          : "Your response"}
                      </label>

                      <textarea
                        id={`roadmap-task-response-${String(
                          selectedTask.id,
                        )}`}
                        rows={7}
                        value={
                          textResponse
                        }
                        onChange={(
                          event,
                        ) => {
                          setTextResponse(
                            event.target.value,
                          );
                        }}
                        placeholder="Write your response for this task..."
                        className="mt-2 w-full resize-y rounded-2xl border-2 border-[#d4dee4] bg-white px-4 py-3 text-sm leading-6 text-[#344054] outline-none transition placeholder:text-[#9aa7b2] focus:border-[#70a9cf] focus:ring-4 focus:ring-[#ddecf6]"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#7a582f]">
                        Supporting document
                      </p>

                      <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-[#c8d7df] bg-[#f8fbfc] p-4 transition hover:border-[#70a9cf] hover:bg-[#f1f8fc]">
                        <UploadCloud
                          size={22}
                          className="shrink-0 text-[#16629b]"
                          aria-hidden="true"
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-[#3d2514]">
                            {file
                              ? file.name
                              : "Upload a supporting file"}
                          </span>

                          <span className="mt-0.5 block text-xs text-slate-500">
                            PDF, DOC, DOCX, JPG, JPEG, or PNG
                          </span>
                        </span>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                          className="sr-only"
                          onChange={(
                            event,
                          ) => {
                            setFile(
                              event.target.files?.[0] ??
                                null,
                            );
                          }}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      disabled={
                        submitting ||
                        (
                          !textResponse.trim() &&
                          !file
                        )
                      }
                      onClick={() => {
                        void handleSubmit();
                      }}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#0d4773] transition hover:bg-[#115787] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Send
                          size={17}
                          aria-hidden="true"
                        />
                      )}

                      {reviewStatus ===
                      "revision_requested"
                        ? "Resubmit for Review"
                        : "Submit Task"}
                    </button>

                    <p className="text-center text-xs leading-5 text-slate-400">
                      Uploaded supporting documents are handled by the milestone submission endpoint and stored in the Document Vault by the backend.
                    </p>
                  </div>
                )}
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}