import {
  AlertCircle,
  CalendarDays,
  Flag,
  ListTodo,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getRoadmapAccess,
  parseScholarshipId,
  type RoadmapData,
  type RoadmapEntityId,
} from "../../api/roadmapApi";

import type {
  AuthUser,
} from "../../types/auth";

type UpcomingDeadlinesCardProps = {
  user: AuthUser;
};

type DeadlineKind =
  | "application"
  | "task"
  | "milestone";

type DeadlineTone =
  | "urgent"
  | "soon"
  | "normal";

type DashboardDeadline = {
  id: string;
  sourceId:
    | RoadmapEntityId
    | null;
  title: string;
  context: string;
  targetDate: string;
  kind: DeadlineKind;
  tone: DeadlineTone;
};

type DeadlineState = {
  loading: boolean;
  roadmap: RoadmapData | null;
  error: string | null;
};

const MAX_DEADLINES = 4;

function getUserScholarshipId(
  user: AuthUser,
): number | null {
  const direct =
    parseScholarshipId(
      user.target_scholarship_id,
    );

  if (direct) {
    return direct;
  }

  return parseScholarshipId(
    user.target_scholarship_data
      ?.id,
  );
}

function parseDateOnly(
  value:
    | string
    | null
    | undefined,
): Date | null {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})/.exec(
      value,
    );

  if (!match) {
    return null;
  }

  const year =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const day =
    Number(
      match[3],
    );

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function startOfToday(): Date {
  const now =
    new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
}

function daysUntil(
  value: string,
): number | null {
  const date =
    parseDateOnly(
      value,
    );

  if (!date) {
    return null;
  }

  const difference =
    date.getTime() -
    startOfToday()
      .getTime();

  return Math.ceil(
    difference /
      86_400_000,
  );
}

function deadlineTone(
  value: string,
): DeadlineTone {
  const remaining =
    daysUntil(
      value,
    );

  if (
    remaining !==
      null &&
    remaining <=
      3
  ) {
    return "urgent";
  }

  if (
    remaining !==
      null &&
    remaining <=
      14
  ) {
    return "soon";
  }

  return "normal";
}

function formatDate(
  value: string,
): string {
  const date =
    parseDateOnly(
      value,
    );

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function deadlineDetail(
  value: string,
): string {
  const remaining =
    daysUntil(
      value,
    );

  const formatted =
    formatDate(
      value,
    );

  if (
    remaining ===
    null
  ) {
    return formatted;
  }

  if (
    remaining ===
    0
  ) {
    return `Due today · ${formatted}`;
  }

  if (
    remaining ===
    1
  ) {
    return `Due tomorrow · ${formatted}`;
  }

  if (
    remaining >
    1
  ) {
    return `Due in ${remaining} days · ${formatted}`;
  }

  return `Overdue by ${Math.abs(
    remaining,
  )} ${
    Math.abs(
      remaining,
    ) ===
    1
      ? "day"
      : "days"
  } · ${formatted}`;
}

function buildRoadmapDeadlines(
  roadmap:
    RoadmapData | null,
): DashboardDeadline[] {
  if (!roadmap) {
    return [];
  }

  const deadlines:
    DashboardDeadline[] =
    [];

  roadmap.milestones.forEach(
    (
      milestone,
    ) => {
      const incompleteTasks =
        milestone.tasks.filter(
          (
            task,
          ) =>
            !task.completed,
        );

      /*
       * roadmapApi flattens nested sub_tasks. Keep the leaf tasks
       * so the dashboard shows the most actionable deadlines rather
       * than both a parent task and all of its children.
       */
      const parentIds =
        new Set(
          incompleteTasks
            .map(
              (
                task,
              ) =>
                task.parentId,
            )
            .filter(
              (
                value,
              ): value is RoadmapEntityId =>
                value !==
                null,
            )
            .map(
              (
                value,
              ) =>
                String(
                  value,
                ),
            ),
        );

      const datedLeafTasks =
        incompleteTasks.filter(
          (
            task,
          ) =>
            Boolean(
              task.targetDate,
            ) &&
            !parentIds.has(
              String(
                task.id,
              ),
            ),
        );

      datedLeafTasks.forEach(
        (
          task,
        ) => {
          if (
            !task.targetDate
          ) {
            return;
          }

          deadlines.push({
            id:
              `task-${String(
                task.id,
              )}`,
            sourceId:
              task.id,
            title:
              task.title,
            context:
              milestone.title,
            targetDate:
              task.targetDate,
            kind:
              "task",
            tone:
              deadlineTone(
                task.targetDate,
              ),
          });
        },
      );

      /*
       * If a milestone has no dated actionable child task, fall back
       * to its own target date instead of hiding the deadline.
       */
      if (
        datedLeafTasks.length ===
          0 &&
        !milestone.completed &&
        milestone.targetDate
      ) {
        deadlines.push({
          id:
            `milestone-${String(
              milestone.id,
            )}`,
          sourceId:
            milestone.id,
          title:
            milestone.title,
          context:
            "Milestone target",
          targetDate:
            milestone.targetDate,
          kind:
            "milestone",
          tone:
            deadlineTone(
              milestone.targetDate,
            ),
        });
      }
    },
  );

  return deadlines;
}

function deadlineIcon(
  kind:
    DeadlineKind,
  tone:
    DeadlineTone,
) {
  if (
    tone ===
    "urgent"
  ) {
    return (
      <AlertCircle
        size={14}
        aria-hidden="true"
      />
    );
  }

  if (
    kind ===
    "task"
  ) {
    return (
      <ListTodo
        size={14}
        aria-hidden="true"
      />
    );
  }

  return (
    <Flag
      size={14}
      aria-hidden="true"
    />
  );
}

export default function UpcomingDeadlinesCard({
  user,
}: UpcomingDeadlinesCardProps) {
  const scholarshipId =
    getUserScholarshipId(
      user,
    );

  const scholarshipName =
    user
      .target_scholarship_data
      ?.name
      ?.trim() ||
    user
      .primary_scholarship_target
      ?.trim() ||
    "Target scholarship";

  const scholarshipDeadline =
    typeof user
      .target_scholarship_data
      ?.deadline_date ===
      "string"
      ? user
          .target_scholarship_data
          .deadline_date
      : null;

  const [
    state,
    setState,
  ] =
    useState<DeadlineState>({
      loading:
        scholarshipId !==
        null,
      roadmap:
        null,
      error:
        null,
    });

  async function loadDeadlines():
    Promise<void> {
    if (!scholarshipId) {
      setState({
        loading:
          false,
        roadmap:
          null,
        error:
          null,
      });

      return;
    }

    try {
      setState(
        (
          current,
        ) => ({
          ...current,
          loading:
            true,
          error:
            null,
        }),
      );

      const result =
        await getRoadmapAccess(
          scholarshipId,
        );

      setState({
        loading:
          false,
        roadmap:
          result.roadmap,
        error:
          null,
      });
    } catch (
      error: unknown
    ) {
      console.error(
        "[Dashboard] Unable to load upcoming roadmap deadlines:",
        error,
      );

      setState({
        loading:
          false,
        roadmap:
          null,
        error:
          error instanceof
            Error &&
          error.message
            .trim()
            ? error.message
            : "Unable to load roadmap deadlines.",
      });
    }
  }

  useEffect(
    () => {
      let active =
        true;

      if (!scholarshipId) {
        setState({
          loading:
            false,
          roadmap:
            null,
          error:
            null,
        });

        return () => {
          active =
            false;
        };
      }

      async function load():
        Promise<void> {
        try {
          setState(
            (
              current,
            ) => ({
              ...current,
              loading:
                true,
              error:
                null,
            }),
          );

          const result =
            await getRoadmapAccess(
              scholarshipId!,
            );

          if (!active) {
            return;
          }

          setState({
            loading:
              false,
            roadmap:
              result.roadmap,
            error:
              null,
          });
        } catch (
          error: unknown
        ) {
          if (!active) {
            return;
          }

          console.error(
            "[Dashboard] Unable to load upcoming roadmap deadlines:",
            error,
          );

          setState({
            loading:
              false,
            roadmap:
              null,
            error:
              error instanceof
                Error &&
              error.message
                .trim()
                ? error.message
                : "Unable to load roadmap deadlines.",
          });
        }
      }

      void load();

      return () => {
        active =
          false;
      };
    },
    [
      scholarshipId,
    ],
  );

  const deadlines =
    useMemo(
      () => {
        const items =
          buildRoadmapDeadlines(
            state.roadmap,
          );

        /*
         * The selected scholarship's application deadline is already
         * part of the authenticated profile. Add it to the personalized
         * roadmap deadlines without making another catalogue request.
         */
        if (
          scholarshipDeadline
        ) {
          items.push({
            id:
              `application-${scholarshipId ?? "target"}`,
            sourceId:
              scholarshipId,
            title:
              `${scholarshipName} application`,
            context:
              "Scholarship deadline",
            targetDate:
              scholarshipDeadline,
            kind:
              "application",
            tone:
              deadlineTone(
                scholarshipDeadline,
              ),
          });
        }

        const today =
          startOfToday()
            .getTime();

        return items
          .filter(
            (
              item,
            ) => {
              const date =
                parseDateOnly(
                  item.targetDate,
                );

              /*
               * Keep today and future dates. The dashboard is for
               * upcoming deadlines; completed/past roadmap work does
               * not belong in this card.
               */
              return (
                date !==
                  null &&
                date.getTime() >=
                  today
              );
            },
          )
          .sort(
            (
              left,
              right,
            ) =>
              (
                parseDateOnly(
                  left.targetDate,
                )
                  ?.getTime() ??
                Number.MAX_SAFE_INTEGER
              ) -
              (
                parseDateOnly(
                  right.targetDate,
                )
                  ?.getTime() ??
                Number.MAX_SAFE_INTEGER
              ),
          )
          .filter(
            (
              item,
              index,
              all,
            ) =>
              all.findIndex(
                (
                  candidate,
                ) =>
                  candidate.title ===
                    item.title &&
                  candidate.targetDate ===
                    item.targetDate,
              ) ===
              index,
          )
          .slice(
            0,
            MAX_DEADLINES,
          );
      },
      [
        scholarshipDeadline,
        scholarshipId,
        scholarshipName,
        state.roadmap,
      ],
    );

  return (
    <section
      aria-labelledby="upcoming-deadlines-title"
      className={[
        "rounded-[24px]",
        "border border-orange-200",
        "bg-[#fff0e5] p-6",
        "shadow-[0_4px_18px_rgba(0,0,0,0.03)]",
      ].join(
        " ",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays
            size={20}
            className="text-[#493426]"
            aria-hidden="true"
          />

          <h2
            id="upcoming-deadlines-title"
            className="text-lg font-bold text-[#39281c]"
          >
            Upcoming Deadlines
          </h2>
        </div>

        {state.error &&
          scholarshipId && (
            <button
              type="button"
              onClick={() => {
                void loadDeadlines();
              }}
              aria-label="Retry loading deadlines"
              className={[
                "grid h-8 w-8 place-items-center rounded-full",
                "text-[#9a633e] transition",
                "hover:bg-white/70",
                "focus-visible:outline-none",
                "focus-visible:ring-4 focus-visible:ring-orange-200",
              ].join(
                " ",
              )}
            >
              <RefreshCw
                size={15}
                aria-hidden="true"
              />
            </button>
          )}
      </div>

      {state.loading ? (
        <div className="mt-6 flex min-h-28 items-center justify-center">
          <div className="text-center">
            <Loader2
              size={22}
              className="mx-auto animate-spin text-[#a76d45]"
              aria-hidden="true"
            />

            <p className="mt-2 text-xs font-semibold text-[#8a684f]">
              Checking your expedition timeline...
            </p>
          </div>
        </div>
      ) : !scholarshipId ? (
        <div className="mt-5 rounded-2xl border border-white/80 bg-white/55 p-4">
          <p className="text-sm font-bold text-[#493426]">
            No scholarship target yet
          </p>

          <p className="mt-1 text-xs leading-5 text-[#856a57]">
            Choose your primary scholarship to see personalized deadlines.
          </p>
        </div>
      ) : deadlines.length ===
        0 ? (
        <div className="mt-5 rounded-2xl border border-white/80 bg-white/55 p-4">
          <p className="text-sm font-bold text-[#493426]">
            No upcoming deadlines
          </p>

          <p className="mt-1 text-xs leading-5 text-[#856a57]">
            {state.error
              ? "Your roadmap deadlines could not be loaded right now."
              : "There are no dated roadmap tasks coming up yet."}
          </p>
        </div>
      ) : (
        <div className="relative ml-2 mt-6 space-y-5 border-l-2 border-[#e1d4ca] pb-1">
          {deadlines.map(
            (
              deadline,
            ) => (
              <article
                key={
                  deadline.id
                }
                className="relative pl-7"
              >
                <div
                  className={[
                    "absolute -left-[11px] top-0.5",
                    "grid h-5 w-5 place-items-center rounded-full",
                    "border-2 border-[#fff0e5] text-white",
                    deadline.tone ===
                      "urgent"
                      ? "bg-red-600"
                      : "",
                    deadline.tone ===
                      "soon"
                      ? "bg-[#df873a]"
                      : "",
                    deadline.tone ===
                      "normal"
                      ? "bg-[#69ace1]"
                      : "",
                  ].join(
                    " ",
                  )}
                >
                  {deadlineIcon(
                    deadline.kind,
                    deadline.tone,
                  )}
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#9a745a]">
                  {deadline.context}
                </p>

                <h3 className="mt-0.5 text-sm font-bold leading-5 text-slate-900">
                  {deadline.title}
                </h3>

                <p
                  className={[
                    "mt-1 text-xs",
                    deadline.tone ===
                      "urgent"
                      ? "font-bold text-red-600"
                      : deadline.tone ===
                          "soon"
                        ? "font-semibold text-[#b66729]"
                        : "text-slate-500",
                  ].join(
                    " ",
                  )}
                >
                  {deadlineDetail(
                    deadline.targetDate,
                  )}
                </p>
              </article>
            ),
          )}
        </div>
      )}

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a07050]">
        Based on your scholarship roadmap
      </p>
    </section>
  );
}