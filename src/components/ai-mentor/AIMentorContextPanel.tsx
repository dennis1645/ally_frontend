import {
  CalendarCheck2,
  CheckCircle2,
  Circle,
  FileText,
  Flag,
  Lightbulb,
  PenLine,
  UsersRound,
} from "lucide-react";

import type {
  AIMentorQuestTask,
  AIMentorRecentSession,
  AIMentorTool,
  AIMentorToolId,
} from "../../mocks/aiMentorMock";

export type AIMentorContextPanelProps = {
  tools: AIMentorTool[];
  activeToolId: AIMentorToolId | null;
  onSelectTool: (
    toolId: AIMentorToolId,
  ) => void;

  questTitle: string;
  questProgress: number;
  questTasks: AIMentorQuestTask[];
  onToggleQuestTask: (
    taskId: number,
  ) => void;

  recentSessions: AIMentorRecentSession[];
  selectedSessionId: number | null;
  onSelectSession: (
    sessionId: number,
  ) => void;

  proTip: string;
};

function getToolIcon(
  toolId: AIMentorToolId,
) {
  switch (
    toolId
  ) {
    case "essay-reviewer":
      return PenLine;

    case "cv-reviewer":
      return FileText;

    case "interview-simulator":
      return UsersRound;

    case "study-planner":
      return CalendarCheck2;
  }
}

export default function AIMentorContextPanel({
  tools,
  activeToolId,
  onSelectTool,
  questTitle,
  questProgress,
  questTasks,
  onToggleQuestTask,
  recentSessions,
  selectedSessionId,
  onSelectSession,
  proTip,
}: AIMentorContextPanelProps) {
  const groupedSessions =
    recentSessions.reduce<
      Record<
        string,
        AIMentorRecentSession[]
      >
    >(
      (
        groups,
        session,
      ) => {
        if (
          !groups[
            session.category
          ]
        ) {
          groups[
            session.category
          ] = [];
        }

        groups[
          session.category
        ].push(
          session,
        );

        return groups;
      },
      {},
    );

  return (
    <aside className="space-y-6">
      {/* =====================================================
          Expedition tools
      ====================================================== */}

      <section className="rounded-[22px] border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-extrabold text-[#2c1607] sm:text-2xl">
          Expedition Tools
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3.5">
          {tools.map(
            (
              tool,
            ) => {
              const Icon =
                getToolIcon(
                  tool.id,
                );

              const isActive =
                activeToolId ===
                tool.id;

              const iconTone =
                tool.tone ===
                "blue"
                  ? "bg-[#e4eef8] text-ally-primary"
                  : "bg-[#f5e8dc] text-[#8a6545]";

              return (
                <button
                  key={
                    tool.id
                  }
                  type="button"
                  aria-pressed={
                    isActive
                  }
                  onClick={() => {
                    onSelectTool(
                      tool.id,
                    );
                  }}
                  className={[
                    "flex min-h-[124px] flex-col items-center justify-center rounded-2xl border px-3 py-4 text-center transition",
                    isActive
                      ? "border-ally-primary bg-blue-50 shadow-[0_3px_0_#b9d5ea]"
                      : "border-[#efccb8] bg-[#fff1ea] hover:border-[#d9a98d] hover:bg-[#ffe8dc]",
                  ].join(
                    " ",
                  )}
                >
                  <span
                    className={[
                      "grid h-12 w-12 place-items-center rounded-full",
                      iconTone,
                    ].join(
                      " ",
                    )}
                  >
                    <Icon
                      size={23}
                    />
                  </span>

                  <span className="mt-3 text-sm font-semibold leading-5 text-slate-700">
                    {tool.label}
                  </span>
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* =====================================================
          Current quest
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[22px] border border-[#176aa4] bg-[#83c2ee] p-5 text-[#10547e] shadow-sm sm:p-6">
        <Flag
          size={22}
          className="absolute right-5 top-5"
        />

        <h2 className="pr-9 text-xl font-extrabold sm:text-2xl">
          Current Quest
        </h2>

        <div className="mt-5">
          <p className="text-sm font-semibold">
            {questTitle}
          </p>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/55">
            <div
              className="h-full rounded-full bg-[#0f5b8b] transition-all"
              style={{
                width:
                  `${Math.min(
                    100,
                    Math.max(
                      0,
                      questProgress,
                    ),
                  )}%`,
              }}
            />
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {questTasks.map(
            (
              task,
            ) => (
              <li
                key={
                  task.id
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    onToggleQuestTask(
                      task.id,
                    );
                  }}
                  className={[
                    "flex w-full items-center gap-3 text-left text-sm transition",
                    task.completed
                      ? "opacity-70"
                      : "font-medium",
                  ].join(
                    " ",
                  )}
                >
                  {task.completed ? (
                    <CheckCircle2
                      size={17}
                      className="shrink-0"
                    />
                  ) : (
                    <Circle
                      size={17}
                      className="shrink-0"
                    />
                  )}

                  <span
                    className={
                      task.completed
                        ? "line-through"
                        : ""
                    }
                  >
                    {task.label}
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>
      </section>

      {/* =====================================================
          Recent sessions
      ====================================================== */}

      <section className="rounded-[22px] border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-extrabold text-[#2c1607] sm:text-2xl">
          Recent Sessions
        </h2>

        <div className="mt-5 space-y-5">
          {Object.entries(
            groupedSessions,
          ).map(
            ([
              category,
              sessions,
            ]) => (
              <div
                key={
                  category
                }
              >
                <h3 className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                  {category}
                </h3>

                <div className="space-y-2">
                  {sessions.map(
                    (
                      session,
                    ) => {
                      const isSelected =
                        selectedSessionId ===
                        session.id;

                      return (
                        <button
                          key={
                            session.id
                          }
                          type="button"
                          aria-pressed={
                            isSelected
                          }
                          onClick={() => {
                            onSelectSession(
                              session.id,
                            );
                          }}
                          className={[
                            "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-700 transition",
                            isSelected
                              ? "border-ally-primary bg-blue-50"
                              : "border-[#f2d8c8] bg-[#fff1ea] hover:border-[#d9a98d] hover:bg-[#ffe8dc]",
                          ].join(
                            " ",
                          )}
                        >
                          {session.title}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* =====================================================
          Pro tip
      ====================================================== */}

      <section className="rounded-[22px] border border-[#edc5a8] bg-[#ffe4d2] p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-[#8b5e3c]">
          <Lightbulb
            size={18}
          />

          <h2 className="text-sm font-extrabold uppercase tracking-[0.08em]">
            Pro Tip
          </h2>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#3d2514]">
          &ldquo;{proTip}&rdquo;
        </p>
      </section>
    </aside>
  );
}