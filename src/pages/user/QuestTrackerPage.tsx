import {
  CheckCircle2,
  Compass,
  Loader2,
  LockKeyhole,
  MapPinned,
  RefreshCw,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  clearPremiumTimelineGenerationMarker,
  generateFullPremiumRoadmap,
  getRoadmapAccess,
  hasPremiumTimelineGenerationMarker,
  loadOrGenerateRoadmap,
  parseScholarshipId,
  type RoadmapData,
  type RoadmapEntityId,
  type RoadmapLoadOptions,
  type RoadmapMilestone,
} from "../../api/roadmapApi";

import allyMascot from "../../assets/ally-assessment-mascot.png";

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

type PremiumGenerationState =
  | "idle"
  | "generating";

const PREMIUM_GENERATION_STEPS = [
  "Reviewing your scholarship target",
  "Mapping the full milestone route",
  "Expanding your premium checkpoints",
  "Preparing tasks and deadlines",
] as const;

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

   GET /api/profile:
   target_scholarship_id is the canonical source.
========================================================= */

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

function getRoadmapOptions(
  user: AuthUser,
): RoadmapLoadOptions {
  return {
    userId:
      user.id,
    isPremium:
      user.is_premium ===
      true,
    premiumUntil:
      typeof user.premium_until ===
        "string"
        ? user.premium_until
        : null,
  };
}

/* =========================================================
   Shared states
========================================================= */

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
          Ally is checking your expedition
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          I&apos;m loading your profile, scholarship target, and current milestone map.
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
          Ally needs a scholarship target before your expedition timeline can be created.
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
          onClick={
            onRetry
          }
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

/* =========================================================
   Premium full-timeline CTA
========================================================= */

function PremiumTimelineGenerator({
  compact = false,
  isGenerating,
  error,
  onGenerate,
}: {
  compact?: boolean;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  const [
    stepIndex,
    setStepIndex,
  ] =
    useState(
      0,
    );

  useEffect(
    () => {
      if (
        !isGenerating
      ) {
        setStepIndex(
          0,
        );

        return;
      }

      const intervalId =
        window.setInterval(
          () => {
            setStepIndex(
              (
                current,
              ) =>
                Math.min(
                  current + 1,
                  PREMIUM_GENERATION_STEPS.length -
                    1,
                ),
            );
          },
          3500,
        );

      return () => {
        window.clearInterval(
          intervalId,
        );
      };
    },
    [
      isGenerating,
    ],
  );

  return (
    <div
      className={[
        "overflow-hidden border border-[#cbdceb] bg-white/95",
        "shadow-[0_7px_0_rgba(22,98,155,0.10)] backdrop-blur",
        compact
          ? "rounded-[24px] p-5 sm:p-6"
          : "mx-auto w-full max-w-3xl rounded-[28px] p-6 sm:p-8",
      ].join(
        " ",
      )}
    >
      <div
        className={[
          "grid items-center gap-6",
          compact
            ? "md:grid-cols-[120px_minmax(0,1fr)]"
            : "md:grid-cols-[180px_minmax(0,1fr)]",
        ].join(
          " ",
        )}
      >
        <div className="relative mx-auto">
          <div
            aria-hidden="true"
            className="absolute inset-x-3 bottom-0 h-6 rounded-full bg-[#7f6a55]/15 blur-md"
          />

          <img
            src={
              allyMascot
            }
            alt="Ally preparing the premium expedition timeline"
            className={[
              "relative z-10 object-contain",
              compact
                ? "h-28 w-28"
                : "h-40 w-40",
              isGenerating
                ? "ally-mascot-float"
                : "",
            ].join(
              " ",
            )}
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bad6e7] bg-[#eaf5fb] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#16629b]">
            <WandSparkles
              size={14}
              aria-hidden="true"
            />
            Premium Expedition
          </div>

          <h2
            className={[
              "mt-3 font-extrabold tracking-tight text-[#2c1607]",
              compact
                ? "text-xl"
                : "text-2xl sm:text-3xl",
            ].join(
              " ",
            )}
          >
            {isGenerating
              ? "Ally is building your full timeline"
              : "Generate your full Premium timeline"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isGenerating
              ? "Keep this page open while Ally expands your scholarship journey into the complete milestone, checkpoint, task, and deadline map."
              : "Your Premium account is active. Generate the complete milestone map for your selected scholarship so the rest of your checkpoints and tasks can appear in Quest Tracker."}
          </p>

          {isGenerating ? (
            <div className="mt-5 space-y-2.5">
              {PREMIUM_GENERATION_STEPS.map(
                (
                  step,
                  index,
                ) => {
                  const complete =
                    index <
                    stepIndex;

                  const active =
                    index ===
                    stepIndex;

                  return (
                    <div
                      key={
                        step
                      }
                      className={[
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                        active
                          ? "border-[#9fc5de] bg-[#edf7fd]"
                          : complete
                            ? "border-[#d5e6dc] bg-[#f2f8f4]"
                            : "border-slate-100 bg-slate-50/70",
                      ].join(
                        " ",
                      )}
                    >
                      <div
                        className={[
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                          active
                            ? "bg-[#16629b] text-white"
                            : complete
                              ? "bg-[#dcefe3] text-[#3f7254]"
                              : "bg-white text-slate-400",
                        ].join(
                          " ",
                        )}
                      >
                        {active ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : complete ? (
                          <CheckCircle2
                            size={14}
                            aria-hidden="true"
                          />
                        ) : (
                          <Compass
                            size={14}
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <span className="text-sm font-bold text-[#4f5e66]">
                        {step}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={
                onGenerate
              }
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#0d4773] transition hover:-translate-y-0.5 hover:bg-[#115787] active:translate-y-0 active:shadow-none"
            >
              <WandSparkles
                size={17}
                aria-hidden="true"
              />
              Generate My Full Timeline
            </button>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-[#efc8bd] bg-[#fff5f1] px-4 py-3 text-sm leading-5 text-[#9a4c38]">
              {error}
            </div>
          )}

          {!isGenerating && (
            <p className="mt-3 text-xs leading-5 text-slate-400">
              This button sends the timeline generator once, then reloads the canonical saved milestones from the backend.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Quest Tracker
========================================================= */

export default function QuestTrackerPage() {
  const navigate =
    useNavigate();

  const {
    user,
    status,
    refreshProfile,
  } =
    useAuth();

  /*
   * Prevent an infinite bootstrap loop:
   *
   * refreshProfile()
   *   -> AuthContext.setUser(newProfile)
   *   -> `user` object changes
   *   -> component re-renders
   *
   * The first Quest Tracker bootstrap should run once per mounted page,
   * not every time AuthContext.user receives a fresh object.
   */
  const initialBootstrapStartedRef =
    useRef(
      false,
    );

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
    activeProfile,
    setActiveProfile,
  ] =
    useState<AuthUser | null>(
      null,
    );

  const [
    isPremium,
    setIsPremium,
  ] =
    useState(
      false,
    );

  const [
    roadmap,
    setRoadmap,
  ] =
    useState<RoadmapData | null>(
      null,
    );

  const [
    needsFullTimelineGeneration,
    setNeedsFullTimelineGeneration,
  ] =
    useState(
      false,
    );

  const [
    generationState,
    setGenerationState,
  ] =
    useState<PremiumGenerationState>(
      "idle",
    );

  const [
    generationError,
    setGenerationError,
  ] =
    useState<string | null>(
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
          (
            milestone,
          ) =>
            String(
              milestone.id,
            ) ===
            String(
              selectedMilestoneId,
            ),
        ) ??
        null,
      [
        roadmap,
        selectedMilestoneId,
      ],
    );

  const loadQuestTracker =
    useCallback(
      async (
        profile: AuthUser,
      ): Promise<void> => {
        setPageState(
          "loading",
        );

        setError(
          null,
        );

        setGenerationError(
          null,
        );

        setSelectedMilestoneId(
          null,
        );

        const resolvedScholarshipId =
          getUserScholarshipId(
            profile,
          );

        setActiveProfile(
          profile,
        );

        if (
          !resolvedScholarshipId
        ) {
          setScholarshipId(
            null,
          );

          setRoadmap(
            null,
          );

          setIsPremium(
            profile.is_premium ===
              true,
          );

          setNeedsFullTimelineGeneration(
            false,
          );

          setPageState(
            "missing_scholarship",
          );

          return;
        }

        const options =
          getRoadmapOptions(
            profile,
          );

        setScholarshipId(
          resolvedScholarshipId,
        );

        const profilePremium =
          profile.is_premium ===
          true;

        setIsPremium(
          profilePremium,
        );

        try {
          /*
           * Premium:
           * Only GET the existing canonical roadmap here.
           * Do not silently generate the full timeline.
           *
           * Free:
           * Preserve the existing preview behavior. If no preview exists,
           * loadOrGenerateRoadmap() can create the preview.
           */
          if (
            profilePremium
          ) {
            const access =
              await getRoadmapAccess(
                resolvedScholarshipId,
              );

            setRoadmap(
              access.roadmap,
            );

            setNeedsFullTimelineGeneration(
              !hasPremiumTimelineGenerationMarker(
                options,
                resolvedScholarshipId,
              ),
            );
          } else {
            clearPremiumTimelineGenerationMarker(
              options,
              resolvedScholarshipId,
            );

            const access =
              await getRoadmapAccess(
                resolvedScholarshipId,
              );

            if (
              access.roadmap
            ) {
              setRoadmap(
                access.roadmap,
              );
            } else {
              const preview =
                await loadOrGenerateRoadmap(
                  resolvedScholarshipId,
                  options,
                );

              setRoadmap(
                preview.roadmap,
              );
            }

            setNeedsFullTimelineGeneration(
              false,
            );
          }

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

  const bootstrapQuestTracker =
    useCallback(
      async (
        fallbackUser:
          AuthUser | null,
      ): Promise<void> => {
        try {
          const latestProfile =
            await refreshProfile();

          await loadQuestTracker(
            latestProfile,
          );
        } catch (
          profileError
        ) {
          console.warn(
            "[Quest Tracker] Could not refresh profile before loading roadmap:",
            profileError,
          );

          if (
            fallbackUser
          ) {
            await loadQuestTracker(
              fallbackUser,
            );

            return;
          }

          setError(
            profileError instanceof
              Error
              ? profileError.message
              : "Your profile could not be loaded.",
          );

          setPageState(
            "error",
          );
        }
      },
      [
        loadQuestTracker,
        refreshProfile,
      ],
    );

  useEffect(
    () => {
      if (
        status ===
        "authenticated"
      ) {
        /*
         * IMPORTANT:
         * refreshProfile() updates AuthContext.user. That re-render must
         * not start this bootstrap again.
         */
        if (
          initialBootstrapStartedRef.current
        ) {
          return;
        }

        initialBootstrapStartedRef.current =
          true;

        void bootstrapQuestTracker(
          user,
        );

        return;
      }

      if (
        status ===
        "guest"
      ) {
        initialBootstrapStartedRef.current =
          false;

        navigate(
          "/login",
          {
            replace: true,
          },
        );
      }
    },
    [
      bootstrapQuestTracker,
      navigate,
      status,
      user,
    ],
  );

  const refreshRoadmap =
    useCallback(
      async (): Promise<void> => {
        const latestProfile =
          await refreshProfile();

        const latestScholarshipId =
          getUserScholarshipId(
            latestProfile,
          ) ??
          scholarshipId;

        if (
          !latestScholarshipId
        ) {
          return;
        }

        const options =
          getRoadmapOptions(
            latestProfile,
          );

        const access =
          await getRoadmapAccess(
            latestScholarshipId,
          );

        setActiveProfile(
          latestProfile,
        );

        setScholarshipId(
          latestScholarshipId,
        );

        setIsPremium(
          latestProfile.is_premium ===
          true,
        );

        if (
          access.roadmap
        ) {
          setRoadmap(
            access.roadmap,
          );
        }

        setNeedsFullTimelineGeneration(
          latestProfile.is_premium ===
            true &&
          !hasPremiumTimelineGenerationMarker(
            options,
            latestScholarshipId,
          ),
        );
      },
      [
        refreshProfile,
        scholarshipId,
      ],
    );

  /*
   * Keep task/submission state fresh. This GET-only refresh never
   * silently fires the premium generation POST.
   */
  useEffect(
    () => {
      if (
        pageState !==
          "ready" ||
        !scholarshipId ||
        generationState ===
          "generating"
      ) {
        return;
      }

      const intervalId =
        window.setInterval(
          () => {
            void refreshRoadmap().catch(
              (
                caughtError,
              ) => {
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
      generationState,
      pageState,
      refreshRoadmap,
      scholarshipId,
    ],
  );

  const handleGenerateFullTimeline =
    useCallback(
      async (): Promise<void> => {
        if (
          generationState ===
            "generating"
        ) {
          return;
        }

        setGenerationError(
          null,
        );

        try {
          /*
           * Re-read GET /api/profile immediately before the expensive
           * generator call. A stale AuthContext premium flag should not
           * be enough to trigger the POST.
           */
          const latestProfile =
            await refreshProfile();

          const latestScholarshipId =
            getUserScholarshipId(
              latestProfile,
            ) ??
            scholarshipId;

          if (
            !latestScholarshipId
          ) {
            setPageState(
              "missing_scholarship",
            );

            return;
          }

          if (
            latestProfile.is_premium !==
            true
          ) {
            setIsPremium(
              false,
            );

            setNeedsFullTimelineGeneration(
              false,
            );

            setGenerationError(
              "Premium is not active on your profile yet. Refresh your account after the upgrade is confirmed.",
            );

            return;
          }

          setActiveProfile(
            latestProfile,
          );

          setScholarshipId(
            latestScholarshipId,
          );

          setIsPremium(
            true,
          );

          setGenerationState(
            "generating",
          );

          /*
           * EXPLICIT POST:
           *
           * POST /api/milestones/generate
           * {
           *   scholarship_id: latestScholarshipId
           * }
           *
           * This does not first short-circuit because milestones already
           * exist. That is the important difference from the old flow.
           */
          const generated =
            await generateFullPremiumRoadmap(
              latestScholarshipId,
              getRoadmapOptions(
                latestProfile,
              ),
            );

          setRoadmap(
            generated.roadmap,
          );

          setNeedsFullTimelineGeneration(
            false,
          );

          setSelectedMilestoneId(
            null,
          );

          setPageState(
            "ready",
          );
        } catch (
          caughtError
        ) {
          console.error(
            "[Quest Tracker] Full premium timeline generation failed:",
            caughtError,
          );

          setGenerationError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Ally could not generate the full Premium timeline yet. Please try again.",
          );

          setNeedsFullTimelineGeneration(
            true,
          );
        } finally {
          setGenerationState(
            "idle",
          );
        }
      },
      [
        generationState,
        refreshProfile,
        scholarshipId,
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

  const isGenerating =
    generationState ===
    "generating";

  return (
    <UserLayout
      title="Quest Tracker"
      topbarProps={{
        showSearch:
          false,
      }}
    >
      {status ===
        "loading" ||
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
            void bootstrapQuestTracker(
              user,
            );
          }}
        />
      ) : isPremium &&
        needsFullTimelineGeneration &&
        !roadmap ? (
        <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-ally-background px-4 py-8">
          <PremiumTimelineGenerator
            isGenerating={
              isGenerating
            }
            error={
              generationError
            }
            onGenerate={() => {
              void handleGenerateFullTimeline();
            }}
          />
        </section>
      ) : roadmap ? (
        <section
          aria-label="Quest Tracker milestone expedition"
          className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-ally-background"
        >
          {isPremium &&
            needsFullTimelineGeneration && (
              <div className="relative z-40 mx-auto w-full max-w-[1180px] px-4 pt-5 sm:px-6">
                <PremiumTimelineGenerator
                  compact
                  isGenerating={
                    isGenerating
                  }
                  error={
                    generationError
                  }
                  onGenerate={() => {
                    void handleGenerateFullTimeline();
                  }}
                />
              </div>
            )}

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
            roadmap={
              roadmap
            }
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
          message={
            activeProfile?.is_premium
              ? "Your Premium account is active, but no timeline has been loaded yet."
              : "Your expedition map could not be loaded."
          }
          onRetry={() => {
            void bootstrapQuestTracker(
              user,
            );
          }}
        />
      )}
    </UserLayout>
  );
}