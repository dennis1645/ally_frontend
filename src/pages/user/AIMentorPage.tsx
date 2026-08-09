import {
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import AIMentorChat from "../../components/ai-mentor/AIMentorChat";
import AIMentorContextPanel from "../../components/ai-mentor/AIMentorContextPanel";
import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  aiMentorMock,
  type AIMentorQuestTask,
  type AIMentorToolId,
} from "../../mocks/aiMentorMock";

function getInitials(
  name:
    string | null | undefined,
): string {
  if (
    !name
  ) {
    return "EX";
  }

  const words =
    name
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );

  if (
    words.length ===
    0
  ) {
    return "EX";
  }

  if (
    words.length ===
    1
  ) {
    return words[0]
      .slice(
        0,
        2,
      )
      .toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function calculateQuestProgress(
  tasks:
    AIMentorQuestTask[],
): number {
  if (
    tasks.length ===
    0
  ) {
    return 0;
  }

  const completedCount =
    tasks.filter(
      (
        task,
      ) =>
        task.completed,
    ).length;

  /*
   * Mock-only progression chosen so the initial reference state
   * remains at 45% with one completed item while still reacting
   * when the local checklist is toggled.
   */
  const progressByCompletedCount = [
    18,
    45,
    72,
    100,
  ];

  return (
    progressByCompletedCount[
      Math.min(
        completedCount,
        3,
      )
    ] ??
    Math.round(
      (
        completedCount /
        tasks.length
      ) *
        100,
    )
  );
}

export default function AIMentorPage() {
  const {
    user,
  } =
    useAuth();

  const [
    activeToolId,
    setActiveToolId,
  ] =
    useState<AIMentorToolId | null>(
      null,
    );

  const [
    selectedSessionId,
    setSelectedSessionId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    questTasks,
    setQuestTasks,
  ] =
    useState<AIMentorQuestTask[]>(
      () =>
        aiMentorMock.currentQuest.tasks.map(
          (
            task,
          ) => ({
            ...task,
          }),
        ),
    );

  const [
    notice,
    setNotice,
  ] =
    useState<string | null>(
      null,
    );

  const userInitials =
    useMemo(
      () =>
        getInitials(
          user?.name,
        ),
      [
        user?.name,
      ],
    );

  const questProgress =
    useMemo(
      () =>
        calculateQuestProgress(
          questTasks,
        ),
      [
        questTasks,
      ],
    );

  const activeTool =
    aiMentorMock.tools.find(
      (
        tool,
      ) =>
        tool.id ===
        activeToolId,
    ) ??
    null;

  const selectedSession =
    aiMentorMock.recentSessions.find(
      (
        session,
      ) =>
        session.id ===
        selectedSessionId,
    ) ??
    null;

  function handleSelectTool(
    toolId:
      AIMentorToolId,
  ): void {
    setActiveToolId(
      (
        currentToolId,
      ) =>
        currentToolId ===
        toolId
          ? null
          : toolId,
    );
  }

  function handleToggleQuestTask(
    taskId:
      number,
  ): void {
    setQuestTasks(
      (
        currentTasks,
      ) =>
        currentTasks.map(
          (
            task,
          ) =>
            task.id ===
            taskId
              ? {
                  ...task,
                  completed:
                    !task.completed,
                }
              : task,
        ),
    );
  }

  return (
    <UserLayout title="AI Mentor">
      <section className="min-h-[calc(100vh-80px)] bg-ally-background px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        <div className="mx-auto w-full max-w-[1220px]">
          {/* =================================================
              Page introduction
          ================================================== */}

          <p className="max-w-3xl text-lg font-semibold leading-7 text-slate-700 sm:text-xl sm:leading-8">
            {
              aiMentorMock.introduction
            }
          </p>

          {notice && (
            <div
              role="status"
              className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#24577d]"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {notice}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNotice(
                    null,
                  );
                }}
                className="font-bold"
                aria-label="Dismiss notice"
              >
                ×
              </button>
            </div>
          )}

          {/* =================================================
              Responsive two-column mentor workspace
          ================================================== */}

          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.8fr)_minmax(285px,0.78fr)] xl:items-start">
            <div className="space-y-6">
              {/* =============================================
                  Ally welcome card
              ============================================== */}

              <section className="rounded-[22px] border border-[#efccb8] bg-[#fff1ea] p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-2 shadow-sm">
                    <img
                      src={
                        allyMascot
                      }
                      alt="Ally expedition companion"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="relative flex-1 rounded-2xl border-2 border-slate-300 bg-white px-5 py-5 text-[#3d2514] shadow-sm sm:px-6">
                    <div
                      aria-hidden="true"
                      className="absolute -left-2.5 top-8 hidden h-5 w-5 rotate-45 border-b-2 border-l-2 border-slate-300 bg-white sm:block"
                    />

                    <p className="relative text-sm leading-6 sm:text-base sm:leading-7">
                      {
                        aiMentorMock.welcomeMessage
                      }
                    </p>
                  </div>
                </div>
              </section>

              {/* =============================================
                  Local chat prototype
              ============================================== */}

              <AIMentorChat
                milestoneName={
                  aiMentorMock.milestone.name
                }
                readiness={
                  aiMentorMock.milestone.readiness
                }
                initialMessages={
                  aiMentorMock.messages
                }
                quickPrompts={
                  aiMentorMock.quickPrompts
                }
                userInitials={
                  userInitials
                }
              />
            </div>

            {/* ===============================================
                Right-side tools and context
            ================================================ */}

            <div>
              {(activeTool ||
                selectedSession) && (
                <div className="mb-5 rounded-2xl border border-[#efccb8] bg-[#fff1ea] p-4 text-sm leading-6 text-[#6a4a35] shadow-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles
                      size={18}
                      className="mt-0.5 shrink-0 text-ally-primary"
                    />

                    <p>
                      {activeTool
                        ? `${activeTool.label} selected. This is a frontend-only placeholder until its workflow is connected.`
                        : `Opened mock session: ${selectedSession?.title}.`}
                    </p>
                  </div>
                </div>
              )}

              <AIMentorContextPanel
                tools={
                  aiMentorMock.tools
                }
                activeToolId={
                  activeToolId
                }
                onSelectTool={
                  handleSelectTool
                }
                questTitle={
                  aiMentorMock.currentQuest.title
                }
                questProgress={
                  questProgress
                }
                questTasks={
                  questTasks
                }
                onToggleQuestTask={
                  handleToggleQuestTask
                }
                recentSessions={
                  aiMentorMock.recentSessions
                }
                selectedSessionId={
                  selectedSessionId
                }
                onSelectSession={
                  setSelectedSessionId
                }
                proTip={
                  aiMentorMock.proTip
                }
              />
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}