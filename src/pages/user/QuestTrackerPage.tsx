import {
  Compass,
  Loader2,
  LockKeyhole,
  MapPinned,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  getRoadmapAccess,
  loadOrGenerateRoadmap,
  parseScholarshipId,
  type RoadmapData,
  type RoadmapEntityId,
  type RoadmapMilestone,
} from "../../api/roadmapApi";

import AscentRoadmap from "../../components/quest/AscentRoadmap";
import RoadmapTaskPanel from "../../components/quest/RoadmapTaskPanel";
import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  AuthUser,
} from "../../types/auth";

type QuestTrackerState =
  | "loading"
  | "missing_scholarship"
  | "ready"
  | "error";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/* =========================================================
   Scholarship ID resolution

   The roadmap uses scholarship_id directly.
   It does NOT require primary_scholarship_target text.
========================================================= */

function getUserScholarshipId(
  user: AuthUser,
): number | null {
  /*
   * GET /api/profile now exposes:
   *
   * target_scholarship_id: 1
   * target_scholarship_data: { id: 1, ... }
   *
   * target_scholarship_id is the canonical source of truth.
   * The nested object is only a defensive fallback.
   */
  const direct =
    parseScholarshipId(
      user.target_scholarship_id,
    );

  if (direct) {
    return direct;
  }

  if (
    isRecord(
      user.target_scholarship_data,
    )
  ) {
    return parseScholarshipId(
      user.target_scholarship_data.id,
    );
  }

  return null;
}

function RoadmapLoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-ally-background px-4">
      <div className="w-full max-w-md rounded-[24px] border border-[#ead8c8] bg-white p-7 text-center shadow-[0_6px_0_#dfcdbb]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f3fc] text-[#16629b]">
          <Sparkles
            size={26}
            className="animate-pulse"
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-[#2c1607]">
          Ally is mapping your expedition
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          I&apos;m checking your selected scholarship and saved milestones.
        </p>

        <Loader2
          size={22}
          aria-hidden="true"
          className="mx-auto mt-5 animate-spin text-[#16629b]"
        />
      </div>
    </div>
  );
}

function MissingScholarshipState({
  onChooseScholarship,
}: {
  onChooseScholarship: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-ally-background px-4">
      <div className="w-full max-w-md rounded-[24px] border border-[#ead8c8] bg-white p-7 text-center shadow-[0_6px_0_#dfcdbb]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f3fc] text-[#16629b]">
          <Compass
            size={26}
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-[#2c1607]">
          Choose your scholarship destination
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ally needs a scholarship ID before the expedition can be loaded or generated.
        </p>

        <button
          type="button"
          onClick={
            onChooseScholarship
          }
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#16629b] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#0d4773] transition hover:-translate-y-0.5 hover:bg-[#115787]"
        >
          Choose Scholarship
        </button>
      </div>
    </div>
  );
}

function RoadmapErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-ally-background px-4">
      <div className="w-full max-w-md rounded-[24px] border border-[#ead8c8] bg-white p-7 text-center shadow-[0_6px_0_#dfcdbb]">
        <MapPinned
          size={32}
          aria-hidden="true"
          className="mx-auto text-[#16629b]"
        />

        <h2 className="mt-4 text-xl font-extrabold text-[#2c1607]">
          The trail is a little foggy
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#16629b] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#0d4773] transition hover:bg-[#115787]"
        >
          <RefreshCw
            size={15}
            aria-hidden="true"
          />
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function QuestTrackerPage() {
  const navigate =
    useNavigate();


  const {
    user,
    status,
  } =
    useAuth();

  const [
    pageState,
    setPageState,
  ] =
    useState<QuestTrackerState>(
      "loading",
    );

  const [
    scholarshipId,
    setScholarshipId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    isPremium,
    setIsPremium,
  ] =
    useState(false);

  const [
    roadmap,
    setRoadmap,
  ] =
    useState<RoadmapData | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    selectedMilestoneId,
    setSelectedMilestoneId,
  ] =
    useState<RoadmapEntityId | null>(
      null,
    );

  const selectedMilestone =
    useMemo(
      () =>
        roadmap?.milestones.find(
          (milestone) =>
            String(
              milestone.id,
            ) ===
            String(
              selectedMilestoneId,
            ),
        ) ?? null,
      [
        roadmap,
        selectedMilestoneId,
      ],
    );

  const loadQuestTracker =
    useCallback(
      async (
        activeUser: AuthUser,
      ): Promise<void> => {
        setPageState(
          "loading",
        );
        setRoadmap(
          null,
        );
        setError(
          null,
        );
        setSelectedMilestoneId(
          null,
        );

        const resolvedScholarshipId =
          getUserScholarshipId(
            activeUser,
          );

        if (
          !resolvedScholarshipId
        ) {
          setScholarshipId(
            null,
          );
          setIsPremium(
            false,
          );
          setPageState(
            "missing_scholarship",
          );
          return;
        }

        setScholarshipId(
          resolvedScholarshipId,
        );

        try {
          const result =
            await loadOrGenerateRoadmap(
              resolvedScholarshipId,
            );

          setRoadmap(
            result.roadmap,
          );
          setIsPremium(
            result.isPremium,
          );
          setPageState(
            "ready",
          );
        } catch (
          caughtError
        ) {
          console.error(
            "[Quest Tracker] Unable to load roadmap:",
            caughtError,
          );

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Your expedition map could not be loaded right now.",
          );
          setPageState(
            "error",
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      if (
        status ===
          "authenticated" &&
        user
      ) {
        void loadQuestTracker(
          user,
        );
        return;
      }

      if (
        status === "guest"
      ) {
        navigate(
          "/login",
          {
            replace: true,
          },
        );
      }
    },
    [
      loadQuestTracker,
      navigate,
      status,
      user,
    ],
  );

  const refreshRoadmap =
    useCallback(
      async (): Promise<void> => {
        if (
          !scholarshipId
        ) {
          return;
        }

        const access =
          await getRoadmapAccess(
            scholarshipId,
          );

        setIsPremium(
          access.isPremium,
        );

        if (
          access.roadmap
        ) {
          setRoadmap(
            access.roadmap,
          );
          return;
        }

        const reloaded =
          await loadOrGenerateRoadmap(
            scholarshipId,
          );

        setRoadmap(
          reloaded.roadmap,
        );
        setIsPremium(
          reloaded.isPremium,
        );
      },
      [
        scholarshipId,
      ],
    );

  /*
   * Keep the visible roadmap synchronized with mentor approvals
   * even when the task drawer remains open for a while.
   */
  useEffect(
    () => {
      if (
        pageState !== "ready" ||
        !scholarshipId
      ) {
        return;
      }

      const intervalId =
        window.setInterval(
          () => {
            void refreshRoadmap().catch(
              (caughtError) => {
                console.warn(
                  "[Quest Tracker] Background roadmap refresh failed:",
                  caughtError,
                );
              },
            );
          },
          60_000,
        );

      return () => {
        window.clearInterval(
          intervalId,
        );
      };
    },
    [
      pageState,
      scholarshipId,
      refreshRoadmap,
    ],
  );

  function handleMilestoneSelect(
    milestone: RoadmapMilestone,
  ): void {
    if (
      milestone.status ===
      "locked"
    ) {
      return;
    }

    setSelectedMilestoneId(
      milestone.id,
    );
  }

  return (
    <UserLayout
      title="Quest Tracker"
      topbarProps={{
        showSearch: false,
      }}
    >
      {status === "loading" ||
      pageState ===
        "loading" ? (
        <RoadmapLoadingState />
      ) : pageState ===
        "missing_scholarship" ? (
        <MissingScholarshipState
          onChooseScholarship={() => {
            navigate(
              "/scholarships",
            );
          }}
        />
      ) : pageState ===
        "error" ? (
        <RoadmapErrorState
          message={
            error ??
            "Your expedition map could not be loaded."
          }
          onRetry={() => {
            if (user) {
              void loadQuestTracker(
                user,
              );
            }
          }}
        />
      ) : roadmap ? (
        <section
          aria-label="Quest Tracker milestone expedition"
          className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-ally-background"
        >
          {!isPremium && (
            <div className="absolute right-4 top-4 z-40 max-w-sm rounded-2xl border border-[#e4c98e] bg-[#fff9e9]/95 px-4 py-3 shadow-lg backdrop-blur sm:right-6 sm:top-6">
              <div className="flex items-start gap-3">
                <LockKeyhole
                  size={18}
                  className="mt-0.5 shrink-0 text-[#9b681f]"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#9b681f]">
                    Roadmap preview
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#5d5149]">
                    Your AI roadmap is ready. Upgrade to Premium to open milestone tasks, submit work, and receive mentor feedback.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/billing",
                      );
                    }}
                    className="mt-2 text-sm font-extrabold text-[#16629b] hover:underline"
                  >
                    Unlock tasks
                  </button>
                </div>
              </div>
            </div>
          )}

          <AscentRoadmap
            roadmap={roadmap}
            selectedMilestoneId={
              selectedMilestoneId
            }
            onMilestoneSelect={
              handleMilestoneSelect
            }
          />

          <RoadmapTaskPanel
            milestone={
              selectedMilestone
            }
            isPremium={
              isPremium
            }
            onUpgrade={() => {
              navigate(
                "/billing",
              );
            }}
            onClose={() => {
              setSelectedMilestoneId(
                null,
              );
            }}
            onRoadmapRefresh={
              refreshRoadmap
            }
          />
        </section>
      ) : (
        <RoadmapErrorState
          message="Your expedition map could not be loaded."
          onRetry={() => {
            if (user) {
              void loadQuestTracker(
                user,
              );
            }
          }}
        />
      )}
    </UserLayout>
  );
}