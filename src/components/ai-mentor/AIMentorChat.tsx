import {
  ImageIcon,
  Mic,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
} from "lucide-react";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import type {
  AIMentorMessage,
} from "../../mocks/aiMentorMock";

export type AIMentorChatProps = {
  milestoneName: string;
  readiness: number;
  initialMessages: AIMentorMessage[];
  quickPrompts: string[];
  userInitials?: string;
};

function createLocalMentorReply(
  message: string,
): string {
  const normalizedMessage =
    message.toLowerCase();

  if (
    normalizedMessage.includes(
      "essay",
    )
  ) {
    return "I can help you review the structure, clarity, evidence, and scholarship fit of your essay. Paste a section here and we can work through it together.";
  }

  if (
    normalizedMessage.includes(
      "interview",
    )
  ) {
    return "Let's practice. I can give you a scholarship interview question, let you answer, and then provide structured feedback on clarity and impact.";
  }

  if (
    normalizedMessage.includes(
      "scholarship",
    )
  ) {
    return "I can help you organize your scholarship search around eligibility, deadline, funding coverage, and how closely each opportunity matches your profile.";
  }

  if (
    normalizedMessage.includes(
      "study plan",
    ) ||
    normalizedMessage.includes(
      "plan",
    )
  ) {
    return "We can turn your next milestone into a simple weekly plan with priority tasks, target dates, and buffer time before each deadline.";
  }

  if (
    normalizedMessage.includes(
      "recommendation",
    ) ||
    normalizedMessage.includes(
      "professor",
    )
  ) {
    return "A strong recommendation request should briefly explain the scholarship, why you are applying, the deadline, and why you are asking that specific professor. You can also attach your latest CV and a short achievements summary.";
  }

  return "Got it. For this frontend prototype, I can simulate guidance using local responses. Tell me which scholarship task you want to work on next.";
}

function getCurrentTimeLabel(): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(),
  );
}

export default function AIMentorChat({
  milestoneName,
  readiness,
  initialMessages,
  quickPrompts,
  userInitials = "EX",
}: AIMentorChatProps) {
  const [
    messages,
    setMessages,
  ] =
    useState<AIMentorMessage[]>(
      initialMessages,
    );

  const [
    inputValue,
    setInputValue,
  ] =
    useState(
      "",
    );

  const [
    isTyping,
    setIsTyping,
  ] =
    useState(
      true,
    );

  const normalizedInitials =
    useMemo(
      () =>
        userInitials
          .trim()
          .slice(
            0,
            2,
          )
          .toUpperCase() ||
        "EX",
      [
        userInitials,
      ],
    );

  function submitMessage(
    rawMessage?: string,
  ): void {
    const message =
      (
        rawMessage ??
        inputValue
      ).trim();

    if (
      !message
    ) {
      return;
    }

    const userMessage:
      AIMentorMessage = {
      id:
        Date.now(),

      role:
        "user",

      text:
        message,

      time:
        getCurrentTimeLabel(),
    };

    setMessages(
      (
        currentMessages,
      ) => [
        ...currentMessages,
        userMessage,
      ],
    );

    setInputValue(
      "",
    );

    setIsTyping(
      true,
    );

    window.setTimeout(
      () => {
        const mentorMessage:
          AIMentorMessage = {
          id:
            Date.now() +
            1,

          role:
            "assistant",

          text:
            createLocalMentorReply(
              message,
            ),

          time:
            getCurrentTimeLabel(),
        };

        setMessages(
          (
            currentMessages,
          ) => [
            ...currentMessages,
            mentorMessage,
          ],
        );

        setIsTyping(
          false,
        );
      },
      800,
    );
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    submitMessage();
  }

  return (
    <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[22px] border border-slate-300 bg-white shadow-sm">
      {/* Chat header */}

      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

          <span className="text-sm font-medium text-slate-700">
            Guide is active
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button
            type="button"
            aria-label="Search conversation"
            className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-slate-100 hover:text-slate-800"
          >
            <Search
              size={19}
            />
          </button>

          <button
            type="button"
            aria-label="More chat options"
            className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-slate-100 hover:text-slate-800"
          >
            <MoreHorizontal
              size={21}
            />
          </button>
        </div>
      </header>

      {/* Conversation */}

      <div
        aria-live="polite"
        className="relative flex min-h-[360px] flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-6"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.16) 1px, transparent 0)",

          backgroundSize:
            "22px 22px",
        }}
      >
        <div className="relative z-10 flex justify-center">
          <div className="rounded-full border border-[#efd0bd] bg-[#fff1ea] px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            Milestone:{" "}
            <span className="font-semibold text-ally-primary">
              {milestoneName}
            </span>

            {" • "}

            Readiness:{" "}
            <span className="font-semibold text-ally-primary">
              {readiness}%
            </span>
          </div>
        </div>

        {messages.map(
          (
            message,
          ) => {
            const isAssistant =
              message.role ===
              "assistant";

            if (
              isAssistant
            ) {
              return (
                <div
                  key={
                    message.id
                  }
                  className="relative z-10 flex items-start gap-3 sm:gap-4"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-sky-200 bg-sky-100 p-1">
                    <img
                      src={
                        allyMascot
                      }
                      alt="Ally"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="max-w-[82%]">
                    <div className="rounded-2xl rounded-tl-sm border border-[#efd0bd] bg-[#fff1ea] px-4 py-3.5 text-sm leading-6 text-[#3d2514] shadow-sm sm:text-[15px]">
                      {
                        message.text
                      }
                    </div>

                    <p className="mt-1 px-1 text-[10px] text-slate-400">
                      {
                        message.time
                      }
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={
                  message.id
                }
                className="relative z-10 flex items-start justify-end gap-3 sm:gap-4"
              >
                <div className="flex max-w-[82%] flex-col items-end">
                  <div className="rounded-2xl rounded-tr-sm bg-[#69a9e6] px-4 py-3.5 text-sm leading-6 text-white shadow-sm sm:text-[15px]">
                    {
                      message.text
                    }
                  </div>

                  <p className="mt-1 px-1 text-[10px] text-slate-400">
                    {
                      message.time
                    }
                  </p>
                </div>

                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5f9fdd] text-xs font-bold text-white shadow-sm">
                  {
                    normalizedInitials
                  }
                </div>
              </div>
            );
          },
        )}

        {isTyping && (
          <div className="relative z-10 flex items-start gap-3 sm:gap-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-sky-200 bg-sky-100 p-1">
              <img
                src={
                  allyMascot
                }
                alt="Ally"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full border border-[#efd0bd] bg-[#fff1ea] px-4 py-3 shadow-sm">
              {[0, 1, 2].map(
                (
                  dot,
                ) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                    style={{
                      animationDelay:
                        `${dot * 100}ms`,
                    }}
                  />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}

      <div className="border-t border-slate-200 bg-white px-5 py-5 sm:px-6">
        <form
          onSubmit={
            handleSubmit
          }
          className="flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-3 py-2 transition focus-within:border-ally-primary focus-within:ring-4 focus-within:ring-blue-100"
        >
          <input
            type="text"
            value={
              inputValue
            }
            onChange={(
              event,
            ) => {
              setInputValue(
                event.target.value,
              );
            }}
            placeholder="Message your guide..."
            className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-base"
          />

          <div className="flex shrink-0 items-center border-l border-slate-200 pl-2 text-slate-500">
            <button
              type="button"
              aria-label="Voice input"
              className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-slate-100 hover:text-ally-primary"
            >
              <Mic
                size={18}
              />
            </button>

            <button
              type="button"
              aria-label="Attach a file"
              className="hidden h-9 w-9 place-items-center rounded-lg transition hover:bg-slate-100 hover:text-ally-primary sm:grid"
            >
              <Paperclip
                size={18}
              />
            </button>

            <button
              type="button"
              aria-label="Attach an image"
              className="hidden h-9 w-9 place-items-center rounded-lg transition hover:bg-slate-100 hover:text-ally-primary sm:grid"
            >
              <ImageIcon
                size={18}
              />
            </button>

            <button
              type="submit"
              aria-label="Send message"
              disabled={
                !inputValue.trim()
              }
              className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-ally-primary text-white shadow-sm transition hover:bg-[#124f82] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send
                size={18}
              />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickPrompts.map(
            (
              prompt,
            ) => (
              <button
                key={
                  prompt
                }
                type="button"
                onClick={() => {
                  setInputValue(
                    prompt,
                  );
                }}
                className="rounded-full border border-[#efccb8] bg-[#fff1ea] px-4 py-2 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#d9a98d] hover:bg-[#ffe7da] sm:text-sm"
              >
                {prompt}
              </button>
            ),
          )}
        </div>
      </div>
    </section>
  );
}