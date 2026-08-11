import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
} from "lucide-react";

import type {
  DashboardMentorTask,
  DashboardMentorTaskStatus,
} from "../../mocks/dashboardFallback";

export type MentorTasksCardProps = {
  tasks: DashboardMentorTask[];
  onOpenSessions: () => void;
  usingFallback?: boolean;
};

function formatDate(
  value: string,
): string {
  const date =
    new Date(
      `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  ).format(date);
}

function daysUntil(
  value: string,
): number | null {
  const due =
    new Date(
      `${value}T23:59:59`,
    );

  if (
    Number.isNaN(
      due.getTime(),
    )
  ) {
    return null;
  }

  return Math.ceil(
    (
      due.getTime() -
      Date.now()
    ) /
      86_400_000,
  );
}

function getStatusLabel(
  status: DashboardMentorTaskStatus,
): string {
  switch (status) {
    case "completed":
      return "Completed";

    case "in_progress":
      return "In progress";

    case "pending":
    default:
      return "Pending";
  }
}

function TaskStatusIcon({
  status,
}: {
  status: DashboardMentorTaskStatus;
}) {
  if (
    status === "completed"
  ) {
    return (
      <CheckCircle2
        size={19}
        className="text-emerald-600"
        aria-hidden="true"
      />
    );
  }

  if (
    status === "in_progress"
  ) {
    return (
      <Clock3
        size={19}
        className="text-[#16629b]"
        aria-hidden="true"
      />
    );
  }

  return (
    <Circle
      size={19}
      className="text-slate-400"
      aria-hidden="true"
    />
  );
}

export default function MentorTasksCard({
  tasks,
  onOpenSessions,
  usingFallback = false,
}: MentorTasksCardProps) {
  return (
    <section
      aria-labelledby="mentor-tasks-title"
      className={[
        "rounded-[24px] border border-[#dedfe2]",
        "bg-white p-5 shadow-[0_5px_0_#dfd7cf]",
        "sm:p-6",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#16629b]">
            <Compass
              size={18}
              aria-hidden="true"
            />

            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em]">
              Mentor Tasks
            </p>
          </div>

          <h2
            id="mentor-tasks-title"
            className="mt-1.5 text-xl font-extrabold text-[#2c1607]"
          >
            What your mentor wants you to work on
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Keep these follow-up tasks visible while you move through your scholarship journey.
          </p>
        </div>

        {usingFallback && (
          <span className="rounded-full bg-[#f8f3ee] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Preview data
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#d7dde2] bg-[#fafbfc] p-5 text-center">
          <p className="text-sm font-bold text-[#2c1607]">
            No mentor tasks yet.
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your mentor&apos;s next action items will appear here when they are available.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {tasks.map(
            (
              task,
            ) => {
              const remaining =
                daysUntil(
                  task.dueDate,
                );

              const urgent =
                remaining !== null &&
                remaining >= 0 &&
                remaining <= 3 &&
                task.status !== "completed";

              return (
                <article
                  key={task.id}
                  className={[
                    "rounded-2xl border p-4 transition",
                    urgent
                      ? "border-[#efcab7] bg-[#fff8f3]"
                      : "border-[#e1e6ea] bg-[#fbfcfd]",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <TaskStatusIcon
                        status={task.status}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-extrabold leading-6 text-[#2c1607]">
                          {task.title}
                        </h3>

                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            task.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : task.status === "in_progress"
                                ? "bg-[#eaf5fb] text-[#16629b]"
                                : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {getStatusLabel(
                            task.status,
                          )}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                        <span>
                          Assigned by{" "}
                          <strong className="text-slate-700">
                            {task.assignedBy}
                          </strong>
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays
                            size={14}
                            aria-hidden="true"
                          />

                          Due{" "}
                          {formatDate(
                            task.dueDate,
                          )}
                        </span>

                        {remaining !== null &&
                          task.status !== "completed" && (
                          <span
                            className={
                              urgent
                                ? "font-bold text-[#bf613b]"
                                : ""
                            }
                          >
                            {remaining < 0
                              ? `${Math.abs(
                                  remaining,
                                )}d overdue`
                              : remaining === 0
                                ? "Due today"
                                : `${remaining}d left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end border-t border-[#eef0f2] pt-4">
        <button
          type="button"
          onClick={onOpenSessions}
          className={[
            "inline-flex items-center gap-2 rounded-xl",
            "px-3 py-2 text-sm font-bold text-[#16629b]",
            "transition hover:bg-[#f0f8fd]",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d5ebf8]",
          ].join(" ")}
        >
          Open Mentor Sessions
          <ArrowRight
            size={15}
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}