import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Play,
  RefreshCcw,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  generateDailyDrill,
} from "../../api/dailyDrillApi";

import type {
  DailyDrillQuestion,
} from "../../api/dailyDrillApi";

type QuizState =
  | "idle"
  | "loading"
  | "active"
  | "complete"
  | "error";

export default function IELTSPracticeQuizCard() {
  const [
    state,
    setState,
  ] =
    useState<QuizState>(
      "idle",
    );

  const [
    questions,
    setQuestions,
  ] =
    useState<
      DailyDrillQuestion[]
    >([]);

  const [
    currentIndex,
    setCurrentIndex,
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
        number
      >
    >({});

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(
      false,
    );

  const currentQuestion =
    questions[
      currentIndex
    ] ??
    null;

  const selectedOptionId =
    currentQuestion
      ? answers[
          currentQuestion.id
        ] ??
        null
      : null;

  const answeredCount =
    Object.keys(
      answers,
    ).length;

  const progress =
    useMemo(
      () =>
        questions.length >
        0
          ? Math.round(
              (
                answeredCount /
                questions.length
              ) *
                100,
            )
          : 0,
      [
        answeredCount,
        questions.length,
      ],
    );

  async function startPractice():
    Promise<void> {
    setIsOpen(
      true,
    );

    setState(
      "loading",
    );

    setErrorMessage(
      null,
    );

    setAnswers(
      {},
    );

    setCurrentIndex(
      0,
    );

    try {
      const nextQuestions =
        await generateDailyDrill();

      setQuestions(
        nextQuestions,
      );

      setState(
        "active",
      );
    } catch (
      error
    ) {
      console.error(
        "[IELTS Practice] Unable to generate daily drill:",
        error,
      );

      setQuestions(
        [],
      );

      setErrorMessage(
        "The practice trail is unavailable right now. Please try again.",
      );

      setState(
        "error",
      );
    }
  }

  function closeModal():
    void {
    setIsOpen(
      false,
    );
  }

  function selectOption(
    questionId:
      number,
    optionId:
      number,
  ): void {
    setAnswers(
      (
        current,
      ) => ({
        ...current,
        [
          questionId
        ]:
          optionId,
      }),
    );
  }

  function goNext():
    void {
    if (
      !currentQuestion ||
      selectedOptionId ===
        null
    ) {
      return;
    }

    if (
      currentIndex >=
      questions.length -
        1
    ) {
      setState(
        "complete",
      );

      return;
    }

    setCurrentIndex(
      (
        current,
      ) =>
        current +
        1,
    );
  }

  function goBack():
    void {
    setCurrentIndex(
      (
        current,
      ) =>
        Math.max(
          0,
          current -
            1,
        ),
    );
  }

  return (
    <>
      <section
        aria-labelledby="ielts-practice-title"
        className={[
          "relative h-full overflow-hidden rounded-[24px]",
          "border border-[#cfe0ec] bg-white",
          "p-5 shadow-[0_5px_0_#d7e5ee]",
          "sm:p-6",
        ].join(
          " ",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#e8f5ff] blur-2xl"
        />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eaf5fb] text-[#16629b]">
              <BookOpen
                size={22}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7a582f]">
                Language Training
              </p>

              <h2
                id="ielts-practice-title"
                className="mt-0.5 text-lg font-extrabold text-[#2c1607]"
              >
                IELTS Practice Quiz
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Sharpen your English skills with today&apos;s short practice drill.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#f5f9fc] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Format
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#2c1607]">
                Quick Quiz
              </p>
            </div>

            <div className="rounded-xl bg-[#fff8ed] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Focus
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#2c1607]">
                IELTS / English
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void startPractice();
            }}
            className={[
              "mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2",
              "rounded-xl bg-[#16629b] px-4 py-3",
              "pt-3 text-sm font-bold text-white",
              "shadow-[0_4px_0_#0d4773]",
              "transition hover:-translate-y-0.5 hover:bg-[#115787]",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b6ddf5]",
            ].join(
              " ",
            )}
          >
            <Play
              size={17}
              fill="currentColor"
              aria-hidden="true"
            />
            Start Practice
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ielts-quiz-modal-title"
          className={[
            "fixed inset-0 z-[120]",
            "flex items-center justify-center",
            "bg-[#13212c]/45 p-4 backdrop-blur-sm",
          ].join(
            " ",
          )}
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className={[
              "max-h-[92vh] w-full max-w-[720px] overflow-y-auto",
              "rounded-[28px] border border-[#d5e2e9]",
              "bg-[#fffdf9] shadow-2xl",
            ].join(
              " ",
            )}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#e5ebef] bg-[#fffdf9]/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16629b]">
                  Daily Language Drill
                </p>

                <h2
                  id="ielts-quiz-modal-title"
                  className="mt-1 text-xl font-extrabold text-[#2c1607]"
                >
                  IELTS Practice Quiz
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                aria-label="Close IELTS practice quiz"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d5ebf8]"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </header>

            <div className="p-5 sm:p-6">
              {state ===
                "loading" && (
                <div className="grid min-h-[320px] place-items-center text-center">
                  <div>
                    <Loader2
                      size={32}
                      className="mx-auto animate-spin text-[#16629b]"
                      aria-hidden="true"
                    />

                    <h3 className="mt-5 text-lg font-extrabold text-[#2c1607]">
                      Preparing today&apos;s practice...
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Ally is loading your English drill.
                    </p>
                  </div>
                </div>
              )}

              {state ===
                "error" && (
                <div className="grid min-h-[320px] place-items-center text-center">
                  <div className="max-w-md">
                    <h3 className="text-xl font-extrabold text-[#2c1607]">
                      The practice trail is a little foggy.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {
                        errorMessage
                      }
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        void startPractice();
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#16629b] px-4 py-3 text-sm font-bold text-white"
                    >
                      <RefreshCcw
                        size={16}
                        aria-hidden="true"
                      />
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {state ===
                "active" &&
                currentQuestion && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-slate-500">
                      Question{" "}
                      {
                        currentIndex +
                        1
                      }{" "}
                      of{" "}
                      {
                        questions.length
                      }
                    </p>

                    <p className="text-xs font-bold text-[#16629b]">
                      {
                        progress
                      }
                      % complete
                    </p>
                  </div>

                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7edf1]"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-[#16629b] transition-[width] duration-300"
                      style={{
                        width:
                          `${progress}%`,
                      }}
                    />
                  </div>

                  {currentQuestion.category && (
                    <span className="mt-5 inline-flex rounded-full bg-[#eef6fb] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#16629b]">
                      {
                        currentQuestion.category
                      }
                    </span>
                  )}

                  <h3 className="mt-4 text-lg font-extrabold leading-7 text-[#2c1607] sm:text-xl">
                    {
                      currentQuestion.text
                    }
                  </h3>

                  <div className="mt-5 space-y-3">
                    {currentQuestion.options.map(
                      (
                        option,
                        optionIndex,
                      ) => {
                        const selected =
                          selectedOptionId ===
                          option.id;

                        return (
                          <button
                            key={
                              option.id
                            }
                            type="button"
                            aria-pressed={
                              selected
                            }
                            onClick={() =>
                              selectOption(
                                currentQuestion.id,
                                option.id,
                              )
                            }
                            className={[
                              "flex w-full items-start gap-3 rounded-2xl border-2",
                              "px-4 py-3.5 text-left text-sm font-semibold leading-6",
                              "transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d3eafa]",
                              selected
                                ? "border-[#16629b] bg-[#edf7fd] text-[#104e78]"
                                : "border-[#dde5ea] bg-white text-slate-700 hover:border-[#9ec7df] hover:bg-[#f8fcff]",
                            ].join(
                              " ",
                            )}
                          >
                            <span
                              className={[
                                "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold",
                                selected
                                  ? "bg-[#16629b] text-white"
                                  : "bg-[#f2f5f7] text-slate-500",
                              ].join(
                                " ",
                              )}
                            >
                              {
                                String.fromCharCode(
                                  65 +
                                    optionIndex,
                                )
                              }
                            </span>

                            <span className="pt-0.5">
                              {
                                option.text
                              }
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#e8edf0] pt-5">
                    <button
                      type="button"
                      disabled={
                        currentIndex ===
                        0
                      }
                      onClick={
                        goBack
                      }
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowLeft
                        size={16}
                        aria-hidden="true"
                      />
                      Back
                    </button>

                    <button
                      type="button"
                      disabled={
                        selectedOptionId ===
                        null
                      }
                      onClick={
                        goNext
                      }
                      className={[
                        "inline-flex items-center gap-2 rounded-xl",
                        "bg-[#16629b] px-4 py-2.5 text-sm font-bold text-white",
                        "transition hover:bg-[#115787]",
                        "disabled:cursor-not-allowed disabled:opacity-40",
                      ].join(
                        " ",
                      )}
                    >
                      {currentIndex ===
                      questions.length -
                        1
                        ? "Finish Practice"
                        : "Next Question"}

                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </>
              )}

              {state ===
                "complete" && (
                <div className="grid min-h-[320px] place-items-center text-center">
                  <div className="max-w-md">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2
                        size={32}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-5 text-2xl font-extrabold text-[#2c1607]">
                      Practice complete! 🎉
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      You completed{" "}
                      {
                        questions.length
                      }{" "}
                      practice questions. Keep building your language confidence one drill at a time.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={
                          closeModal
                        }
                        className="rounded-xl border border-[#d7e0e6] bg-white px-4 py-2.5 text-sm font-bold text-slate-600"
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void startPractice();
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#16629b] px-4 py-2.5 text-sm font-bold text-white"
                      >
                        <RefreshCcw
                          size={16}
                          aria-hidden="true"
                        />
                        New Practice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}