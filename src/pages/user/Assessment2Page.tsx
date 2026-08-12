import {
  AlertCircle,
  Compass,
  Loader2,
  Map,
  Sparkles,
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
  chooseDeepDiagnosticRecommendation,
  getDeepDiagnosticQuestions,
  getDeepDiagnosticResult,
  submitDeepDiagnostic,
} from "../../api/deepDiagnosticApi";

import {
  ApiError,
} from "../../api/apiClient";

import type {
  DeepDiagnosticAnswer,
  DeepDiagnosticPage,
  DeepDiagnosticQuestion,
  DeepDiagnosticResult as DeepDiagnosticResultData,
  DeepDiagnosticScholarshipRecommendation,
} from "../../api/deepDiagnosticApi";

import allyMascot from "../../assets/ally-assessment-mascot.png";
import expeditionTerrain from "../../assets/expedition-terrain.png";

import UserLayout from "../../components/layout/UserLayout";

import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

import AllyDialogue from "../../components/assessment/AllyDialogue";
import DeepDiagnosticOption from "../../components/assessment/DeepDiagnosticOption";
import DeepDiagnosticProgress from "../../components/assessment/DeepDiagnosticProgress";
import DeepDiagnosticResult from "../../components/assessment/DeepDiagnosticResult";
import DeepDiagnosticResultLoading from "../../components/assessment/DeepDiagnosticResultLoading";

import {
  useAuth,
} from "../../context/AuthContext";

/* =========================================================
   Conversation configuration
========================================================= */

type ConversationPhase =
  | "intro"
  | "question"
  | "reaction"
  | "loading-page"
  | "submitting"
  | "loading-result"
  | "result";

const neutralReactions = [
  "Got it! That's helpful to know. 🧭",
  "Thanks for sharing that, Explorer!",
  "Interesting! Let's keep going.",
  "Noted. That gives me a clearer view of your trail.",
] as const;

const introMessage =
  "Hey, Explorer! 👋\nBefore we continue our expedition, I want to get to know you a little better. Your answers will help me understand what support you need next.";

const RESULT_POLL_INTERVAL_MS = 2500;
const RESULT_MAX_WAIT_MS = 90000;
const RESULT_MIN_LOADING_MS = 4500;

function wait(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      milliseconds,
    );
  });
}

function isDeepDiagnosticResultReady(
  value: DeepDiagnosticResultData,
): boolean {
  /*
   * Assessment 2 is considered ready when the backend has produced
   * the scored result and the AI guidance text. A score of 0 is valid,
   * so we check against null rather than using truthiness.
   *
   * Scholarship recommendations may legitimately be empty, so they are
   * not required to stop polling.
   */
  return (
    value.id !== null &&
    value.revisedPercentage !== null &&
    Boolean(
      value.suggestion?.trim(),
    )
  );
}

function getNextPageNumber(
  page:
    DeepDiagnosticPage,
): number | null {
  if (
    page.nextPageUrl
  ) {
    try {
      const parsed =
        new URL(
          page.nextPageUrl,
          window.location.origin,
        );

      const fromUrl =
        Number(
          parsed.searchParams.get(
            "page",
          ),
        );

      if (
        Number.isInteger(
          fromUrl,
        ) &&
        fromUrl >
          page.currentPage
      ) {
        return fromUrl;
      }
    } catch {
      /*
       * Fall through to pagination metadata.
       * The request still uses the central Ally API client.
       */
    }
  }

  if (
    page.currentPage <
    page.totalPages
  ) {
    return (
      page.currentPage +
      1
    );
  }

  return null;
}

function getQuestionAnswer(
  answers:
    Record<
      number,
      DeepDiagnosticAnswer
    >,
  questionId:
    number,
): DeepDiagnosticAnswer | null {
  return (
    answers[
      questionId
    ] ??
    null
  );
}

/* =========================================================
   Small UI helpers
========================================================= */

function UserAnswerBubble({
  text,
}: {
  text:
    string;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[86%]">
        <p className="mb-1 text-right text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7a582f]">
          You
        </p>

        <div
          className={[
            "rounded-[20px] rounded-br-md",
            "border-2 border-[#16629b]",
            "bg-[#16629b] px-4 py-3",
            "text-sm font-semibold leading-6 text-white",
            "shadow-[0_4px_0_#0d4d78]",
          ].join(
            " ",
          )}
        >
          {
            text
          }
        </div>
      </div>
    </div>
  );
}

function FriendlyError({
  message,
  onRetry,
}: {
  message:
    string;

  onRetry:
    () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[560px] w-full max-w-[850px] place-items-center px-4 py-10">
      <div className="grid w-full gap-6 rounded-[28px] border border-[#e4d4bf] bg-white/90 p-6 shadow-lg backdrop-blur sm:p-8 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
        <img
          src={
            allyMascot
          }
          alt="Ally expedition guide"
          className="mx-auto h-36 w-36 object-contain"
        />

        <div>
          <div className="flex items-center gap-2 text-[#b96f45]">
            <AlertCircle
              size={19}
              aria-hidden="true"
            />

            <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
              Trail temporarily foggy
            </p>
          </div>

          <h2 className="mt-3 text-2xl font-extrabold text-[#2c1607]">
            Looks like the trail is a little foggy right now. 🌫️
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#667085] sm:text-base">
            {
              message
            }
          </p>

          <PrimaryButton
            className="mt-5"
            onClick={
              onRetry
            }
          >
            Try Again
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Page
========================================================= */

export default function Assessment2Page() {
  const navigate =
    useNavigate();

  const {
    user,
    refreshProfile,
  } =
    useAuth();

  const [
    pageData,
    setPageData,
  ] =
    useState<DeepDiagnosticPage | null>(
      null,
    );

  const [
    questionIndex,
    setQuestionIndex,
  ] =
    useState(
      0,
    );

  const [
    answers,
    setAnswers,
  ] =
    useState<
      Record<
        number,
        DeepDiagnosticAnswer
      >
    >({});

  const [
    phase,
    setPhase,
  ] =
    useState<ConversationPhase>(
      "intro",
    );

  const [
    dialogueComplete,
    setDialogueComplete,
  ] =
    useState(
      false,
    );

  const [
    userAnswerText,
    setUserAnswerText,
  ] =
    useState<string | null>(
      null,
    );

  const [
    textDraft,
    setTextDraft,
  ] =
    useState(
      "",
    );

  const [
    initialLoading,
    setInitialLoading,
  ] =
    useState(
      true,
    );

  const [
    pageError,
    setPageError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    submissionError,
    setSubmissionError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    result,
    setResult,
  ] =
    useState<DeepDiagnosticResultData | null>(
      null,
    );

  const [
    resultError,
    setResultError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    choosingScholarshipId,
    setChoosingScholarshipId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    recommendationError,
    setRecommendationError,
  ] =
    useState<string | null>(
      null,
    );

  const seenQuestionIdsRef =
    useRef<
      Set<number>
    >(
      new Set(),
    );

  const transitionTimerRef =
    useRef<number | null>(
      null,
    );

  const resultRequestVersionRef =
    useRef(
      0,
    );

  const retryPageNumberRef =
    useRef(
      1,
    );

  const currentQuestion:
    DeepDiagnosticQuestion | null =
    pageData?.questions[
      questionIndex
    ] ??
    null;

  const currentAnswer =
    currentQuestion
      ? getQuestionAnswer(
          answers,
          currentQuestion.id,
        )
      : null;

  const selectedOptionId =
    currentAnswer &&
    "option_id" in
      currentAnswer
      ? currentAnswer.option_id
      : null;

  const currentQuestionHasOptions =
    Boolean(
      currentQuestion &&
      currentQuestion.options.length >
        0,
    );

  const remainingQuestions =
    pageData
      ? Math.max(
          0,
          pageData.questions.length -
            questionIndex -
            1,
        )
      : 0;

  const answeredCount =
    Object.keys(
      answers,
    ).length;

  const currentReaction =
    neutralReactions[
      Math.max(
        0,
        answeredCount -
          1,
      ) %
        neutralReactions.length
    ];

  const loadQuestionPage =
    useCallback(
      async (
        pageNumber:
          number,
        mode:
          | "initial"
          | "next",
      ): Promise<void> => {
        retryPageNumberRef.current =
          pageNumber;

        if (
          mode ===
          "initial"
        ) {
          setInitialLoading(
            true,
          );
        } else {
          setPhase(
            "loading-page",
          );
        }

        setPageError(
          null,
        );

        try {
          const nextPage =
            await getDeepDiagnosticQuestions(
              pageNumber,
            );

          if (
            nextPage.questions.length ===
            0
          ) {
            throw new Error(
              "Ally couldn't find any active questions at this checkpoint.",
            );
          }

          nextPage.questions.forEach(
            (
              question,
            ) => {
              seenQuestionIdsRef.current.add(
                question.id,
              );
            },
          );

          setPageData(
            nextPage,
          );

          setQuestionIndex(
            0,
          );

          setUserAnswerText(
            null,
          );

          setTextDraft(
            "",
          );

          setDialogueComplete(
            false,
          );

          setPhase(
            mode ===
              "initial"
              ? "intro"
              : "question",
          );
        } catch (
          error
        ) {
          console.error(
            "[Deep Diagnostic] Unable to load questions:",
            error,
          );

          setPageError(
            "I couldn't reach the next part of your assessment trail. Please check your connection and try again.",
          );
        } finally {
          setInitialLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      void loadQuestionPage(
        1,
        "initial",
      );

      return () => {
        /*
         * Invalidate any in-flight result polling loop when this page
         * unmounts or the effect is cleaned up.
         */
        resultRequestVersionRef.current +=
          1;

        if (
          transitionTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            transitionTimerRef.current,
          );
        }
      };
    },
    [
      loadQuestionPage,
    ],
  );

  const storeAnswerAndReact =
    useCallback(
      (
        answer:
          DeepDiagnosticAnswer,
        displayText:
          string,
      ): void => {
        if (
          !currentQuestion
        ) {
          return;
        }

        setAnswers(
          (
            current,
          ) => ({
            ...current,
            [
              currentQuestion.id
            ]:
              answer,
          }),
        );

        setUserAnswerText(
          displayText,
        );

        setDialogueComplete(
          false,
        );

        if (
          transitionTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            transitionTimerRef.current,
          );
        }

        transitionTimerRef.current =
          window.setTimeout(
            () => {
              setPhase(
                "reaction",
              );

              transitionTimerRef.current =
                null;
            },
            260,
          );
      },
      [
        currentQuestion,
      ],
    );

  function handleSelectOption(
    optionId:
      number,
    optionText:
      string,
  ): void {
    if (
      !currentQuestion ||
      phase !==
        "question" ||
      !dialogueComplete ||
      currentAnswer
    ) {
      return;
    }

    storeAnswerAndReact(
      {
        question_id:
          currentQuestion.id,
        option_id:
          optionId,
      },
      optionText,
    );
  }

  function handleTextAnswer(): void {
    if (
      !currentQuestion ||
      phase !==
        "question" ||
      !dialogueComplete ||
      currentAnswer
    ) {
      return;
    }

    const normalized =
      textDraft.trim();

    if (
      !normalized
    ) {
      return;
    }

    storeAnswerAndReact(
      {
        question_id:
          currentQuestion.id,
        text_value:
          normalized,
      },
      normalized,
    );
  }

  async function retrieveResult(): Promise<void> {
    const requestVersion =
      resultRequestVersionRef.current +
      1;

    resultRequestVersionRef.current =
      requestVersion;

    setResultError(
      null,
    );

    setResult(
      null,
    );

    setPhase(
      "loading-result",
    );

    const startedAt =
      Date.now();

    let lastError:
      unknown =
      null;

    while (
      Date.now() -
        startedAt <
      RESULT_MAX_WAIT_MS
    ) {
      /*
       * A newer retry or route change invalidates this polling loop.
       */
      if (
        resultRequestVersionRef.current !==
        requestVersion
      ) {
        return;
      }

      try {
        const nextResult =
          await getDeepDiagnosticResult();

        if (
          resultRequestVersionRef.current !==
          requestVersion
        ) {
          return;
        }

        if (
          isDeepDiagnosticResultReady(
            nextResult,
          )
        ) {
          /*
           * Keep the transition visible for a short minimum time so
           * the result does not flash abruptly on very fast responses.
           * This never delays a slow API response; it only smooths fast ones.
           */
          const elapsed =
            Date.now() -
            startedAt;

          const remainingMinimum =
            RESULT_MIN_LOADING_MS -
            elapsed;

          if (
            remainingMinimum >
            0
          ) {
            await wait(
              remainingMinimum,
            );
          }

          if (
            resultRequestVersionRef.current !==
            requestVersion
          ) {
            return;
          }

          setResult(
            nextResult,
          );

          setPhase(
            "result",
          );

          return;
        }

        /*
         * The result endpoint responded, but the AI analysis is not yet
         * complete. Keep the loading experience open and ask again.
         */
        lastError =
          null;
      } catch (
        error
      ) {
        lastError =
          error;

        /*
         * Authentication/authorization failures are not "still processing".
         * Surface them immediately rather than making the user wait 90 seconds.
         */
        if (
          error instanceof ApiError &&
          (
            error.status === 401 ||
            error.status === 403
          )
        ) {
          console.error(
            "[Deep Diagnostic] Result request is not authorized:",
            error,
          );

          setResultError(
            "Your session could not be used to retrieve the analysis. Please sign in again and retry.",
          );

          setPhase(
            "result",
          );

          return;
        }

        console.info(
          "[Deep Diagnostic] Result is not ready yet; retrying shortly.",
          error,
        );
      }

      await wait(
        RESULT_POLL_INTERVAL_MS,
      );
    }

    if (
      resultRequestVersionRef.current !==
      requestVersion
    ) {
      return;
    }

    console.error(
      "[Deep Diagnostic] Result did not become ready before the polling timeout.",
      lastError,
    );

    setResult(
      null,
    );

    setResultError(
      "Your answers are safely submitted, but Ally is taking longer than expected to finish the analysis. Try loading the result again in a moment.",
    );

    setPhase(
      "result",
    );
  }

  async function handleChooseRecommendation(
    recommendation:
      DeepDiagnosticScholarshipRecommendation,
  ): Promise<void> {
    if (
      choosingScholarshipId !==
      null
    ) {
      return;
    }

    if (!user) {
      setRecommendationError(
        "Your account session is not available. Please sign in again before choosing a scholarship.",
      );

      return;
    }

    const scholarshipId =
      recommendation.scholarshipId;

    setRecommendationError(
      null,
    );

    setChoosingScholarshipId(
      scholarshipId,
    );

    try {
      /*
       * Persist the user's explicit recommendation choice first.
       *
       * POST /api/deep-diagnostic/choose-recommendation
       * {
       *   accept: true,
       *   scholarship_id: scholarshipId
       * }
       */
      await chooseDeepDiagnosticRecommendation(
        scholarshipId,
        true,
      );

      /*
       * Refresh the canonical profile so target_scholarship_id and
       * is_premium are current before Quest Tracker opens.
       *
       * Timeline generation itself is intentionally handled on /quests.
       * Premium users get an explicit "Generate My Full Timeline" CTA
       * there instead of silently relying on a background POST.
       */
      try {
        await refreshProfile();
      } catch (
        profileError
      ) {
        console.warn(
          "[Deep Diagnostic] Scholarship was accepted, but profile refresh failed:",
          profileError,
        );
      }

      navigate(
        "/quests",
      );
    } catch (
      error
    ) {
      console.error(
        "[Deep Diagnostic] Unable to accept scholarship recommendation:",
        error,
      );

      setRecommendationError(
        error instanceof Error
          ? error.message
          : "That scholarship could not be selected yet. Please try again.",
      );
    } finally {
      setChoosingScholarshipId(
        null,
      );
    }
  }

  async function completeExpedition(): Promise<void> {
    const unansweredSeenIds =
      Array.from(
        seenQuestionIdsRef.current,
      ).filter(
        (
          questionId,
        ) =>
          !answers[
            questionId
          ],
      );

    if (
      unansweredSeenIds.length >
      0
    ) {
      setSubmissionError(
        "One or more assessment answers are missing. Please complete the current checkpoint before submitting.",
      );

      return;
    }

    const collectedAnswers =
      Object.values(
        answers,
      );

    if (
      collectedAnswers.length ===
      0
    ) {
      setSubmissionError(
        "No assessment answers are ready to submit yet.",
      );

      return;
    }

    setSubmissionError(
      null,
    );

    setPhase(
      "submitting",
    );

    try {
      await submitDeepDiagnostic(
        collectedAnswers,
      );

      await retrieveResult();
    } catch (
      error
    ) {
      /*
       * apiClient converts its AbortController timeout into ApiError(408).
       *
       * A timeout does NOT prove the backend failed. For this endpoint the
       * server may continue the AI analysis after the browser stops waiting
       * and can still save /api/deep-diagnostic/my-result successfully.
       *
       * Therefore never ask the user to submit the same assessment again
       * after a 408. Move into the result-loading flow and poll the canonical
       * GET endpoint instead.
       */
      if (
        error instanceof ApiError &&
        error.status ===
          408
      ) {
        console.info(
          "[Deep Diagnostic] Submission response timed out; checking for the completed result instead.",
        );

        setSubmissionError(
          null,
        );

        await retrieveResult();

        return;
      }

      console.error(
        "[Deep Diagnostic] Submission failed:",
        error,
      );

      setSubmissionError(
        "I couldn't safely send your answers yet. Your current choices are still here, so you can try again.",
      );

      setPhase(
        "reaction",
      );
    }
  }

  function handleChangeCurrentAnswer(): void {
    if (
      !currentQuestion
    ) {
      return;
    }

    /*
     * If the user presses Change Answer while Ally is still
     * typing the reaction, cancel any pending transition timer.
     */
    if (
      transitionTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        transitionTimerRef.current,
      );

      transitionTimerRef.current =
        null;
    }

    const previousAnswer =
      answers[
        currentQuestion.id
      ];

    /*
     * For text-response questions, restore the previous answer
     * so the user can edit it instead of starting from scratch.
     */
    if (
      previousAnswer &&
      "text_value" in
        previousAnswer
    ) {
      setTextDraft(
        previousAnswer.text_value,
      );
    } else {
      setTextDraft(
        "",
      );
    }

    /*
     * Remove ONLY the current question's answer.
     * Every answer from earlier questions remains untouched.
     */
    setAnswers(
      (
        current,
      ) => {
        const next = {
          ...current,
        };

        delete next[
          currentQuestion.id
        ];

        return next;
      },
    );

    setUserAnswerText(
      null,
    );

    setSubmissionError(
      null,
    );

    /*
     * Return to the same question.
     * Ally asks it again before the answer controls unlock.
     */
    setDialogueComplete(
      false,
    );

    setPhase(
      "question",
    );
  }

  function moveAfterReaction(): void {
    if (
      !pageData ||
      !currentQuestion ||
      !dialogueComplete
    ) {
      return;
    }

    setSubmissionError(
      null,
    );

    if (
      questionIndex <
      pageData.questions.length -
        1
    ) {
      setQuestionIndex(
        (
          current,
        ) =>
          current +
          1,
      );

      setUserAnswerText(
        null,
      );

      setTextDraft(
        "",
      );

      setDialogueComplete(
        false,
      );

      setPhase(
        "question",
      );

      return;
    }

    const nextPage =
      getNextPageNumber(
        pageData,
      );

    if (
      nextPage !==
      null
    ) {
      void loadQuestionPage(
        nextPage,
        "next",
      );

      return;
    }

    void completeExpedition();
  }

  const continueLabel =
    useMemo(
      () => {
        if (
          !pageData
        ) {
          return "Continue";
        }

        if (
          questionIndex <
          pageData.questions.length -
            1
        ) {
          return "Continue →";
        }

        if (
          getNextPageNumber(
            pageData,
          ) !==
          null
        ) {
          return "Reach Next Checkpoint →";
        }

        return "Complete Expedition ⭐";
      },
      [
        pageData,
        questionIndex,
      ],
    );

  const retryCurrentLoad =
    useCallback(
      (): void => {
        void loadQuestionPage(
          retryPageNumberRef.current,
          pageData
            ? "next"
            : "initial",
        );
      },
      [
        loadQuestionPage,
        pageData,
      ],
    );

  /* =======================================================
     Global page states
  ======================================================= */

  if (
    initialLoading
  ) {
    return (
      <UserLayout
        title="Assessment 2"
        subtitle="Research Trail · Deep Diagnostic"
        topbarProps={{
          showSearch:
            false,
        }}
      >
        <section className="relative grid min-h-[calc(100vh-80px)] place-items-center overflow-hidden bg-ally-background px-4">
          <img
            src={
              expeditionTerrain
            }
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />

          <div className="absolute inset-0 bg-[#fff8f1]/75 backdrop-blur-[2px]" />

          <div className="relative z-10 text-center">
            <img
              src={
                allyMascot
              }
              alt="Ally checking the expedition trail"
              className="mx-auto h-36 w-36 object-contain"
            />

            <Loader2
              className="mx-auto mt-4 animate-spin text-[#16629b]"
              size={28}
            />

            <p className="mt-4 text-sm font-bold text-[#2c1607]">
              Hold on, Explorer... 🧭
            </p>

            <p className="mt-1 text-sm text-[#667085]">
              I&apos;m checking the next part of our trail.
            </p>
          </div>
        </section>
      </UserLayout>
    );
  }

  if (
    pageError
  ) {
    return (
      <UserLayout
        title="Assessment 2"
        subtitle="Research Trail · Deep Diagnostic"
        topbarProps={{
          showSearch:
            false,
        }}
      >
        <section className="min-h-[calc(100vh-80px)] bg-ally-background">
          <FriendlyError
            message={
              pageError
            }
            onRetry={
              retryCurrentLoad
            }
          />
        </section>
      </UserLayout>
    );
  }

  /* =======================================================
     Main conversation
  ======================================================= */

  return (
    <UserLayout
      title="Assessment 2"
      subtitle="Research Trail · Deep Diagnostic"
      topbarProps={{
        showSearch:
          false,

        actions: (
          <SecondaryButton
            size="sm"
            onClick={() =>
              navigate(
                "/quests",
              )
            }
          >
            Back to Expedition
          </SecondaryButton>
        ),
      }}
    >
      <section
        aria-label="Deep Diagnostic scholarship expedition dialogue"
        className={[
          "relative min-h-[calc(100vh-80px)] overflow-hidden",
          "bg-[#eef4f0]",
          "px-4 py-6",
          "sm:px-6 sm:py-8",
          "lg:px-8",
        ].join(
          " ",
        )}
      >
        <img
          src={
            expeditionTerrain
          }
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#f6fbf8]/80 via-[#fff9f2]/88 to-[#f7efe5]/94"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1120px]">
          {phase !==
            "result" && (
            <>
              <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#7a582f]">
                    <Map
                      size={17}
                      aria-hidden="true"
                    />

                    <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] sm:text-xs">
                      Research Trail
                    </p>
                  </div>

                  <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#2c1607] sm:text-3xl">
                    Deep Diagnostic
                  </h1>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-[#667085]">
                    A scholarship expedition dialogue with Ally — not a test sheet.
                  </p>
                </div>

                {pageData && (
                  <div className="w-full sm:max-w-[440px]">
                    <DeepDiagnosticProgress
                      currentPage={
                        pageData.currentPage
                      }
                      totalPages={
                        pageData.totalPages
                      }
                      remainingQuestions={
                        remainingQuestions
                      }
                    />
                  </div>
                )}
              </header>

              <div
                className={[
                  "overflow-hidden rounded-[30px]",
                  "border border-[#d7c8b8]",
                  "bg-white/74",
                  "shadow-[0_8px_0_rgba(122,88,47,0.12),0_20px_55px_rgba(44,22,7,0.10)]",
                  "backdrop-blur-md",
                ].join(
                  " ",
                )}
              >
                <div className="grid min-h-[610px] lg:grid-cols-[250px_minmax(0,1fr)]">
                  {/* Ally guide column */}

                  <aside
                    className={[
                      "relative flex items-start justify-center overflow-hidden",
                      "border-b border-[#e7d9cb]",
                      "bg-gradient-to-b from-[#dcecec]/60 via-[#f0eee4]/65 to-[#e8d8c5]/70]",
                      "px-5 py-6",
                      "lg:border-b-0 lg:border-r",
                    ].join(
                      " ",
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-white/35 blur-3xl"
                    />

                    <div className="relative z-10 text-center">
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#16629b] backdrop-blur">
                        <Compass
                          size={13}
                          aria-hidden="true"
                        />
                        Ally · Expedition Guide
                      </div>

                      <img
                        src={
                          allyMascot
                        }
                        alt="Ally, your scholarship expedition guide"
                        className={[
                          "mx-auto h-[200px] w-[200px] object-contain object-top",
                          "drop-shadow-[0_10px_8px_rgba(44,22,7,0.14)]",
                          "lg:h-[250px] lg:w-[220px]",
                          phase === "submitting" ||
                          phase === "loading-result"
                            ? "ally-mascot-float ally-mascot-shadow"
                            : "",
                        ].join(" ")}
                      />
                    </div>
                  </aside>

                  {/* Conversation column */}

                  <main className="flex min-w-0 flex-col px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
                    {phase ===
                      "intro" && (
                      <div className="my-auto space-y-6">
                        <div className="max-w-[680px]">
                          <AllyDialogue
                            key="intro-dialogue"
                            text={
                              introMessage
                            }
                            typingSpeed={
                              24
                            }
                            onComplete={() =>
                              setDialogueComplete(
                                true,
                              )
                            }
                          />
                        </div>

                        <div className="flex justify-end">
                          <PrimaryButton
                            disabled={
                              !dialogueComplete
                            }
                            onClick={() => {
                              setDialogueComplete(
                                false,
                              );

                              setPhase(
                                "question",
                              );
                            }}
                          >
                            Begin Checkpoint
                          </PrimaryButton>
                        </div>
                      </div>
                    )}

                    {phase ===
                      "question" &&
                      currentQuestion && (
                      <div className="flex flex-1 flex-col">
                        <div className="max-w-[700px]">
                          <AllyDialogue
                            key={`question-${currentQuestion.id}`}
                            text={
                              currentQuestion.questionText
                            }
                            typingSpeed={
                              23
                            }
                            onComplete={() =>
                              setDialogueComplete(
                                true,
                              )
                            }
                            label="Ally asks a Deep Diagnostic question"
                          />
                        </div>

                        <div className="mt-7">
                          {currentQuestionHasOptions ? (
                            <div
                              className={[
                                "grid gap-3",
                                currentQuestion.options.length >
                                  4
                                  ? "md:grid-cols-2"
                                  : "",
                              ].join(
                                " ",
                              )}
                            >
                              {currentQuestion.options.map(
                                (
                                  option,
                                  optionIndex,
                                ) => (
                                  <DeepDiagnosticOption
                                    key={
                                      option.id
                                    }
                                    index={
                                      optionIndex
                                    }
                                    text={
                                      option.optionText
                                    }
                                    selected={
                                      selectedOptionId ===
                                      option.id
                                    }
                                    disabled={
                                      !dialogueComplete ||
                                      currentAnswer !==
                                        null
                                    }
                                    onSelect={() =>
                                      handleSelectOption(
                                        option.id,
                                        option.optionText,
                                      )
                                    }
                                  />
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label
                                htmlFor={`deep-diagnostic-text-${currentQuestion.id}`}
                                className="block text-xs font-extrabold uppercase tracking-[0.12em] text-[#7a582f]"
                              >
                                Your reply to Ally
                              </label>

                              <textarea
                                id={`deep-diagnostic-text-${currentQuestion.id}`}
                                rows={5}
                                value={
                                  textDraft
                                }
                                disabled={
                                  !dialogueComplete ||
                                  currentAnswer !==
                                    null
                                }
                                placeholder="Tell Ally your story..."
                                onChange={(
                                  event,
                                ) =>
                                  setTextDraft(
                                    event.target.value,
                                  )
                                }
                                className={[
                                  "w-full resize-y rounded-2xl border-2",
                                  "border-[#d4dee4] bg-white/92",
                                  "px-4 py-3 text-sm leading-6 text-[#344054]",
                                  "outline-none transition",
                                  "placeholder:text-[#9aa7b2]",
                                  "focus:border-[#70a9cf] focus:ring-4 focus:ring-[#ddecf6]",
                                  "disabled:cursor-not-allowed disabled:opacity-60",
                                ].join(
                                  " ",
                                )}
                              />

                              <div className="flex justify-end">
                                <PrimaryButton
                                  disabled={
                                    !dialogueComplete ||
                                    !textDraft.trim() ||
                                    currentAnswer !==
                                      null
                                  }
                                  onClick={
                                    handleTextAnswer
                                  }
                                >
                                  Continue Expedition
                                </PrimaryButton>
                              </div>
                            </div>
                          )}
                        </div>

                        {!dialogueComplete && (
                          <p className="mt-5 text-center text-xs font-medium text-[#7d8c94]">
                            Listen to Ally before choosing your next step.
                          </p>
                        )}
                      </div>
                    )}

                    {phase ===
                      "reaction" &&
                      currentQuestion &&
                      userAnswerText && (
                      <div className="flex flex-1 flex-col justify-center space-y-6">
                        <UserAnswerBubble
                          text={
                            userAnswerText
                          }
                        />

                        <div className="max-w-[680px]">
                          <AllyDialogue
                            key={`reaction-${currentQuestion.id}`}
                            text={
                              currentReaction
                            }
                            typingSpeed={
                              22
                            }
                            onComplete={() =>
                              setDialogueComplete(
                                true,
                              )
                            }
                          />
                        </div>

                        {submissionError && (
                          <div
                            role="alert"
                            className="flex items-start gap-2 rounded-xl border border-[#efc7b2] bg-[#fff2eb] p-3 text-sm leading-6 text-[#9b4c2f]"
                          >
                            <AlertCircle
                              size={18}
                              className="mt-0.5 shrink-0"
                              aria-hidden="true"
                            />

                            {
                              submissionError
                            }
                          </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <SecondaryButton
                            onClick={
                              handleChangeCurrentAnswer
                            }
                          >
                            ← Change Answer
                          </SecondaryButton>

                          <PrimaryButton
                            disabled={
                              !dialogueComplete
                            }
                            onClick={
                              moveAfterReaction
                            }
                          >
                            {
                              continueLabel
                            }
                          </PrimaryButton>
                        </div>
                      </div>
                    )}

                    {phase ===
                      "loading-page" && (
                      <div className="my-auto text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#bad6e7] bg-[#eaf5fb] text-[#16629b]">
                          <Loader2
                            size={25}
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        </div>

                        <h2 className="mt-5 text-xl font-extrabold text-[#2c1607]">
                          Hold on, Explorer... 🧭
                        </h2>

                        <p className="mt-2 text-sm text-[#667085]">
                          I&apos;m checking the next part of our trail.
                        </p>
                      </div>
                    )}

                    {phase ===
                      "submitting" && (
                      <div className="my-auto text-center">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#e3c78d] bg-[#fff6df] text-[#9b681f]">
                          <Sparkles
                            size={27}
                            className="animate-pulse"
                            aria-hidden="true"
                          />
                        </div>

                        <h2 className="mt-5 text-xl font-extrabold text-[#2c1607]">
                          Mapping your answers...
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#667085]">
                          I&apos;m safely sending your completed Deep Diagnostic
                          before checking your new expedition insight.
                        </p>
                      </div>
                    )}

                    {phase ===
                      "loading-result" && (
                      <DeepDiagnosticResultLoading />
                    )}
                  </main>
                </div>
              </div>
            </>
          )}

          {phase ===
            "result" && (
            <div
              className={[
                "rounded-[30px] border border-[#dccdbd]",
                "bg-white/82 px-5 py-10",
                "shadow-[0_8px_0_rgba(122,88,47,0.12)]",
                "backdrop-blur-md",
                "sm:px-8 sm:py-12",
              ].join(
                " ",
              )}
            >
              <DeepDiagnosticResult
                result={
                  result
                }
                resultError={
                  resultError
                }
                recommendationError={
                  recommendationError
                }
                choosingScholarshipId={
                  choosingScholarshipId
                }
                onChooseRecommendation={(
                  recommendation: DeepDiagnosticScholarshipRecommendation,
                ) => {
                  void handleChooseRecommendation(
                    recommendation,
                  );
                }}
                onRetry={() => {
                  void retrieveResult();
                }}
                onReturnToExpedition={() =>
                  navigate(
                    "/quests",
                  )
                }
                onDashboard={() =>
                  navigate(
                    "/dashboard",
                  )
                }
              />
            </div>
          )}
        </div>
      </section>
    </UserLayout>
  );
}