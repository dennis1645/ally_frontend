import {
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
  useSearchParams,
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

import {
  getDeepDiagnosticResult,
} from "../../api/deepDiagnosticApi";

import {
  matchMentorApi,
  type MentorMatchResult,
} from "../../api/coachingApi";

import {
  ApiError,
} from "../../api/apiClient";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import AscentRoadmap from "../../components/quest/AscentRoadmap";
import MentorMatchModal, {
  type MentorMatchModalState,
} from "../../components/quest/MentorMatchModal";
import Assessment2MilestonePopup from "../../components/assessment/Assessment2MilestonePopup";
import RoadmapTaskPanel from "../../components/quest/RoadmapTaskPanel";
import UserLayout from "../../components/layout/UserLayout";
import AllyPopup from "../../components/ui/AllyPopup";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  AuthUser,
} from "../../types/auth";

import {
  ASSESSMENT_2_ROUTE,
} from "../../routes/assessment2.routes";

type QuestTrackerState =
  | "loading"
  | "assessment_required"
  | "missing_scholarship"
  | "ready"
  | "error";

type PremiumGenerationState =
  | "idle"
  | "generating";

const PREMIUM_MENTOR_MATCH_CACHE_PREFIX =
  "ally.premium-mentor-match";

const PREMIUM_MENTOR_MATCH_SEEN_PREFIX =
  "ally.premium-mentor-match-seen";

function getPremiumMentorMatchKey(
  prefix: string,
  user: AuthUser,
  scholarshipId: number,
): string {
  const premiumFingerprint =
    typeof user.premium_until ===
      "string" &&
    user.premium_until.trim()
      ? user.premium_until.trim()
      : "premium-active";

  return [
    prefix,
    String(user.id),
    premiumFingerprint,
    String(scholarshipId),
  ].join(":");
}

function getCachedMentorMatch(
  user: AuthUser,
  scholarshipId: number,
): MentorMatchResult | null {
  try {
    const raw =
      window.localStorage.getItem(
        getPremiumMentorMatchKey(
          PREMIUM_MENTOR_MATCH_CACHE_PREFIX,
          user,
          scholarshipId,
        ),
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(raw) as unknown;

    if (
      !isRecord(parsed) ||
      typeof parsed.name !==
        "string" ||
      !parsed.name.trim()
    ) {
      return null;
    }

    return {
      id:
        typeof parsed.id === "string" ||
        typeof parsed.id === "number"
          ? parsed.id
          : null,
      name:
        parsed.name.trim(),
      headline:
        typeof parsed.headline === "string"
          ? parsed.headline
          : null,
      specialization:
        typeof parsed.specialization === "string"
          ? parsed.specialization
          : null,
      scholarship:
        typeof parsed.scholarship === "string"
          ? parsed.scholarship
          : null,
      university:
        typeof parsed.university === "string"
          ? parsed.university
          : null,
      field:
        typeof parsed.field === "string"
          ? parsed.field
          : null,
      profilePictureUrl:
        typeof parsed.profilePictureUrl === "string"
          ? parsed.profilePictureUrl
          : null,
      matchScore:
        typeof parsed.matchScore === "number" &&
        Number.isFinite(parsed.matchScore)
          ? parsed.matchScore
          : null,
      matchReasons:
        Array.isArray(parsed.matchReasons)
          ? parsed.matchReasons.filter(
              (
                reason,
              ): reason is string =>
                typeof reason === "string" &&
                Boolean(reason.trim()),
            )
          : [],
      message:
        typeof parsed.message === "string"
          ? parsed.message
          : null,
      raw:
        isRecord(parsed.raw)
          ? parsed.raw
          : {},
    };
  } catch {
    return null;
  }
}

function storeCachedMentorMatch(
  user: AuthUser,
  scholarshipId: number,
  match: MentorMatchResult,
): void {
  try {
    window.localStorage.setItem(
      getPremiumMentorMatchKey(
        PREMIUM_MENTOR_MATCH_CACHE_PREFIX,
        user,
        scholarshipId,
      ),
      JSON.stringify(match),
    );
  } catch {
    /*
     * The backend match still succeeded. Local cache is only used to
     * avoid repeating the celebration request after a quick reload.
     */
  }
}

function hasSeenPremiumMentorMatch(
  user: AuthUser,
  scholarshipId: number,
): boolean {
  try {
    return (
      window.localStorage.getItem(
        getPremiumMentorMatchKey(
          PREMIUM_MENTOR_MATCH_SEEN_PREFIX,
          user,
          scholarshipId,
        ),
      ) === "1"
    );
  } catch {
    return false;
  }
}

function markPremiumMentorMatchSeen(
  user: AuthUser,
  scholarshipId: number,
): void {
  try {
    window.localStorage.setItem(
      getPremiumMentorMatchKey(
        PREMIUM_MENTOR_MATCH_SEEN_PREFIX,
        user,
        scholarshipId,
      ),
      "1",
    );
  } catch {
    /*
     * Non-critical. The popup may appear again on a later visit if
     * browser storage is unavailable.
     */
  }
}

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
   Assessment 2 completion

   GET /api/deep-diagnostic/my-result is the backend source
   of truth for whether the authenticated user has completed
   the Deep Diagnostic.

   A missing result (404) means the Quest Tracker should send
   the user to Assessment 2 instead of asking them to choose
   a scholarship manually.
========================================================= */

async function hasCompletedAssessment2():
  Promise<boolean> {
  try {
    const result =
      await getDeepDiagnosticResult();

    return Boolean(
      result.id !==
        null ||
      result.revisedPercentage !==
        null ||
      result.recommendations.length >
        0 ||
      result.suggestion?.trim() ||
      result.assessmentType?.trim(),
    );
  } catch (
    caughtError
  ) {
    if (
      caughtError instanceof
        ApiError &&
      caughtError.status ===
        404
    ) {
      return false;
    }

    throw caughtError;
  }
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

function AssessmentRequiredState({
  onStartAssessment,
}: {
  onStartAssessment: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-ally-background px-4 py-8">
      <div className="w-full max-w-2xl rounded-[28px] border border-[#ead8c8] bg-white p-6 shadow-[0_7px_0_#dfcdbb] sm:p-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <img
              src={
                allyMascot
              }
              alt="Ally, your scholarship expedition guide"
              className="h-36 w-36 object-contain drop-shadow-sm sm:h-40 sm:w-40"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative rounded-[22px] border border-[#d9e9f6] bg-[#f4f9fd] p-5 sm:p-6">
              <div
                aria-hidden="true"
                className="absolute -left-2.5 top-10 hidden h-5 w-5 rotate-45 border-b border-l border-[#d9e9f6] bg-[#f4f9fd] sm:block"
              />

              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#16629b]">
                Ally&apos;s next checkpoint
              </p>

              <h2 className="mt-2 text-xl font-extrabold leading-tight text-[#2c1607] sm:text-2xl">
                Complete Assessment 2 before we map your expedition
              </h2>

              <button
                type="button"
                onClick={
                  onStartAssessment
                }
                className={[
                  "mt-5 inline-flex items-center justify-center gap-2",
                  "rounded-xl bg-[#16629b] px-5 py-3",
                  "text-sm font-extrabold text-white",
                  "shadow-[0_4px_0_#0d4773]",
                  "transition",
                  "hover:-translate-y-0.5 hover:bg-[#115787]",
                  "active:translate-y-0 active:shadow-none",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4 focus-visible:ring-[#9bcaff]",
                ].join(
                  " ",
                )}
              >
                <Sparkles
                  size={17}
                  aria-hidden="true"
                />

                Take Assessment 2
              </button>
            </div>
          </div>
        </div>
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

function PremiumTimelinePopup({
  isGenerating,
  error,
  onGenerate,
}: {
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  return (
    <AllyPopup
      isOpen
      badge="Premium Expedition"
      badgeIcon={
        <WandSparkles
          size={14}
          aria-hidden="true"
        />
      }
      mascotSrc={
        allyMascot
      }
      mascotAlt="Ally preparing your Premium timeline"
      mascotAnimated={
        isGenerating
      }
      title={
        isGenerating
          ? "Building your timeline..."
          : "Unlock your full timeline"
      }
      description={
        isGenerating
          ? "Ally is preparing your complete scholarship roadmap."
          : "Reveal all checkpoints, tasks, and deadlines for your scholarship journey."
      }
    >
      {isGenerating ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#d6e7f2] bg-[#f4f9fc] px-4 py-3 text-sm font-bold text-[#16629b]">
          <Loader2
            size={17}
            className="animate-spin"
            aria-hidden="true"
          />

          Generating your roadmap...
        </div>
      ) : (
        <button
          type="button"
          onClick={
            onGenerate
          }
          className="squishy-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16629b] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_#0d4773] transition hover:-translate-y-0.5 hover:bg-[#115787] active:translate-y-0 active:shadow-none"
        >
          <WandSparkles
            size={17}
            aria-hidden="true"
          />

          Generate Full Timeline
        </button>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-[#efc8bd] bg-[#fff5f1] px-4 py-3 text-left text-sm leading-5 text-[#9a4c38]">
          {error}
        </div>
      )}
    </AllyPopup>
  );
}

/* =========================================================
   Quest Tracker
========================================================= */

export default function QuestTrackerPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();

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
    assessment2Complete,
    setAssessment2Complete,
  ] =
    useState<boolean | null>(
      null,
    );

  const [
    assessment2PopupOpen,
    setAssessment2PopupOpen,
  ] =
    useState(
      false,
    );

  const [
    mentorMatchModalOpen,
    setMentorMatchModalOpen,
  ] =
    useState(
      false,
    );

  const [
    mentorMatchState,
    setMentorMatchState,
  ] =
    useState<MentorMatchModalState>(
      "matching",
    );

  const [
    mentorMatch,
    setMentorMatch,
  ] =
    useState<MentorMatchResult | null>(
      null,
    );

  const [
    mentorMatchError,
    setMentorMatchError,
  ] =
    useState<string | null>(
      null,
    );

  const mentorMatchRequestRef =
    useRef<Promise<MentorMatchResult> | null>(
      null,
    );

  const mentorMatchAutoAttemptedRef =
    useRef(
      false,
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

          try {
            const assessment2Finished =
              await hasCompletedAssessment2();

            setAssessment2Complete(
              assessment2Finished,
            );

            setPageState(
              assessment2Finished
                ? "missing_scholarship"
                : "assessment_required",
            );
          } catch (
            assessmentError
          ) {
            console.error(
              "[Quest Tracker] Unable to check Deep Diagnostic status:",
              assessmentError,
            );

            setError(
              assessmentError instanceof
                Error
                ? assessmentError.message
                : "Ally could not verify your Assessment 2 status right now.",
            );

            setPageState(
              "error",
            );
          }

          return;
        }

        try {
          const assessment2Finished =
            await hasCompletedAssessment2();

          setAssessment2Complete(
            assessment2Finished,
          );
        } catch (
          assessmentStatusError
        ) {
          console.warn(
            "[Quest Tracker] Assessment 2 status could not be loaded:",
            assessmentStatusError,
          );

          setAssessment2Complete(
            null,
          );
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

  useEffect(
    () => {
      mentorMatchAutoAttemptedRef.current =
        false;
    },
    [
      scholarshipId,
    ],
  );

  const startMentorMatching =
    useCallback(
      async (
        profile: AuthUser,
        targetScholarshipId: number,
        force = false,
      ): Promise<void> => {
        if (
          profile.is_premium !==
          true
        ) {
          return;
        }

        if (
          !force &&
          hasSeenPremiumMentorMatch(
            profile,
            targetScholarshipId,
          )
        ) {
          return;
        }

        if (!force) {
          mentorMatchAutoAttemptedRef.current =
            true;

          const cachedMatch =
            getCachedMentorMatch(
              profile,
              targetScholarshipId,
            );

          if (cachedMatch) {
            setMentorMatch(
              cachedMatch,
            );

            setMentorMatchError(
              null,
            );

            setMentorMatchState(
              "matched",
            );

            setMentorMatchModalOpen(
              true,
            );

            return;
          }
        }

        if (
          mentorMatchRequestRef.current
        ) {
          return;
        }

        setMentorMatch(
          null,
        );

        setMentorMatchError(
          null,
        );

        setMentorMatchState(
          "matching",
        );

        setMentorMatchModalOpen(
          true,
        );

        const request =
          matchMentorApi();

        mentorMatchRequestRef.current =
          request;

        try {
          const matchedMentor =
            await request;

          storeCachedMentorMatch(
            profile,
            targetScholarshipId,
            matchedMentor,
          );

          setMentorMatch(
            matchedMentor,
          );

          setMentorMatchState(
            "matched",
          );
        } catch (
          caughtError
        ) {
          console.error(
            "[Quest Tracker] Mentor matching failed:",
            caughtError,
          );

          setMentorMatchError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Ally could not finish your mentor match yet. Please try again.",
          );

          setMentorMatchState(
            "error",
          );
        } finally {
          mentorMatchRequestRef.current =
            null;
        }
      },
      [],
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

  /*
   * The mentor-match celebration is the second Premium unlock moment.
   *
   * It only begins after:
   * - the user is Premium;
   * - Quest Tracker has finished loading;
   * - the full Premium timeline no longer needs generation;
   * - a scholarship target exists.
   *
   * That keeps it from competing with the existing Premium timeline CTA.
   */
  useEffect(
    () => {
      if (
        status !==
          "authenticated" ||
        pageState !==
          "ready" ||
        !activeProfile ||
        !isPremium ||
        !scholarshipId ||
        needsFullTimelineGeneration ||
        generationState ===
          "generating" ||
        mentorMatchAutoAttemptedRef.current ||
        hasSeenPremiumMentorMatch(
          activeProfile,
          scholarshipId,
        )
      ) {
        return;
      }

      const timerId =
        window.setTimeout(
          () => {
            void startMentorMatching(
              activeProfile,
              scholarshipId,
            );
          },
          850,
        );

      return () => {
        window.clearTimeout(
          timerId,
        );
      };
    },
    [
      activeProfile,
      generationState,
      isPremium,
      needsFullTimelineGeneration,
      pageState,
      scholarshipId,
      startMentorMatching,
      status,
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

  const handleCloseMentorMatch =
    useCallback(
      (): void => {
        if (
          mentorMatchState ===
            "matched" &&
          activeProfile &&
          scholarshipId
        ) {
          markPremiumMentorMatchSeen(
            activeProfile,
            scholarshipId,
          );
        }

        setMentorMatchModalOpen(
          false,
        );
      },
      [
        activeProfile,
        mentorMatchState,
        scholarshipId,
      ],
    );

  const handleRetryMentorMatch =
    useCallback(
      (): void => {
        if (
          !activeProfile ||
          !scholarshipId
        ) {
          return;
        }

        void startMentorMatching(
          activeProfile,
          scholarshipId,
          true,
        );
      },
      [
        activeProfile,
        scholarshipId,
        startMentorMatching,
      ],
    );

  useEffect(
    () => {
      if (
        pageState !==
          "ready" ||
        !roadmap
      ) {
        return;
      }

      const requestedMilestone =
        Number(
          searchParams.get(
            "milestone",
          ),
        );

      if (
        !Number.isInteger(
          requestedMilestone,
        ) ||
        requestedMilestone <=
          0
      ) {
        return;
      }

      const requestedIndex =
        requestedMilestone -
        1;

      const milestone =
        roadmap.milestones[
          requestedIndex
        ];

      if (!milestone) {
        const nextParams =
          new URLSearchParams(
            searchParams,
          );

        nextParams.delete(
          "milestone",
        );

        nextParams.delete(
          "open",
        );

        setSearchParams(
          nextParams,
          {
            replace:
              true,
          },
        );

        return;
      }

      /*
       * Wait until Assessment 2 status is known before deciding
       * what Milestone 2 should do.
       */
      if (
        requestedIndex ===
          1 &&
        assessment2Complete ===
          null
      ) {
        return;
      }

      setSelectedMilestoneId(
        milestone.id,
      );

      if (
        requestedIndex ===
          1 &&
        assessment2Complete ===
          false
      ) {
        setAssessment2PopupOpen(
          true,
        );
      }

      const nextParams =
        new URLSearchParams(
          searchParams,
        );

      nextParams.delete(
        "milestone",
      );

      nextParams.delete(
        "open",
      );

      setSearchParams(
        nextParams,
        {
          replace:
            true,
        },
      );
    },
    [
      assessment2Complete,
      pageState,
      roadmap,
      searchParams,
      setSearchParams,
    ],
  );

  function handleMilestoneSelect(
    milestone: RoadmapMilestone,
  ): void {
    const milestoneIndex =
      roadmap?.milestones.findIndex(
        (
          candidate,
        ) =>
          String(
            candidate.id,
          ) ===
          String(
            milestone.id,
          ),
      ) ??
      -1;

    /*
     * Milestone 2 is the Assessment 2 checkpoint.
     * It remains interactive even if the roadmap marks the
     * milestone as locked, because the assessment is how the
     * user progresses from this checkpoint.
     */
    if (
      milestoneIndex ===
        1 &&
      assessment2Complete ===
        false
    ) {
      setSelectedMilestoneId(
        milestone.id,
      );

      setAssessment2PopupOpen(
        true,
      );

      return;
    }

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

  const assessmentMilestoneId =
    assessment2Complete ===
      false
      ? roadmap?.milestones[
          1
        ]?.id ??
        null
      : null;

  const mentorScholarshipName =
    activeProfile?.target_scholarship_data?.name ??
    activeProfile?.primary_scholarship_target ??
    null;

  return (
    <>
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
        "assessment_required" ? (
        <AssessmentRequiredState
          onStartAssessment={() => {
            navigate(
              ASSESSMENT_2_ROUTE,
            );
          }}
        />
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
        <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-ally-background">
          <PremiumTimelinePopup
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
              <PremiumTimelinePopup
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
            specialSelectableMilestoneId={
              assessmentMilestoneId
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

      <MentorMatchModal
        isOpen={
          mentorMatchModalOpen
        }
        state={
          mentorMatchState
        }
        match={
          mentorMatch
        }
        error={
          mentorMatchError
        }
        scholarshipName={
          mentorScholarshipName
        }
        onClose={
          handleCloseMentorMatch
        }
        onRetry={
          handleRetryMentorMatch
        }
      />

      <Assessment2MilestonePopup
        isOpen={
          assessment2PopupOpen
        }
        onClose={() => {
          setAssessment2PopupOpen(
            false,
          );

          setSelectedMilestoneId(
            null,
          );
        }}
        onStartAssessment={() => {
          navigate(
            ASSESSMENT_2_ROUTE,
          );
        }}
      />
    </>
  );
}