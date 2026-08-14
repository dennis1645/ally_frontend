import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bookmark,
  Loader2,
  MoreHorizontal,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import {
  sendAIMentorMessageApi,
} from "../../api/aiMentorApi";

type Message = {
  id: number;
  role: "user" | "ally";
  content: string;
  time: string;
};

type AIMentorChatProps = {
  initialMessages: Message[];
  userInitials: string;
  onSaveInsight: (
    content: string,
    category?: string,
  ) => void;
  onConversationActivity?: (
    firstMessage: string,
  ) => void;
};

function getCurrentTime(): string {
  return new Date().toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export default function AIMentorChat({
  initialMessages,
  userInitials,
  onSaveInsight,
  onConversationActivity,
}: AIMentorChatProps) {
  const [messages, setMessages] =
    useState<Message[]>(
      initialMessages || [],
    );

  const [inputValue, setInputValue] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [sendError, setSendError] =
    useState<string | null>(null);

  // Search & Menu Options
  const [isSearchOpen, setIsSearchOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] =
    useState("");
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);
  const menuRef =
    useRef<HTMLDivElement>(null);
  const conversationStartedRef =
    useRef(false);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  // Klik di luar buat nutup menu titik 3
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  async function handleSendMessage(
    text: string,
  ): Promise<void> {
    const normalizedText =
      text.trim();

    if (
      !normalizedText ||
      isSending
    ) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: normalizedText,
      time: getCurrentTime(),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInputValue("");
    setSendError(null);

    if (
      !conversationStartedRef.current
    ) {
      conversationStartedRef.current =
        true;

      onConversationActivity?.(
        normalizedText,
      );
    }

    try {
      setIsSending(true);

      const result =
        await sendAIMentorMessageApi({
          message:
            normalizedText,
        });

      const allyMessage: Message = {
        id: Date.now() + 1,
        role: "ally",
        content:
          result.reply,
        time: getCurrentTime(),
      };

      setMessages((previous) => [
        ...previous,
        allyMessage,
      ]);
    } catch (
      error: unknown
    ) {
      setSendError(
        error instanceof Error &&
          error.message.trim()
          ? error.message
          : "Ally could not answer right now. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  // Logic Fitur Search
  const filteredMessages =
    useMemo(() => {
      if (!searchQuery.trim()) {
        return messages;
      }

      return messages.filter(
        (message) =>
          message.content
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase(),
            ),
      );
    }, [messages, searchQuery]);

  // Daftar Pertanyaan Bantuan (Prompt Starters)
const suggestedQuestions = [
  "How do I know which scholarships I'm eligible for?",
  "What documents are usually required for a scholarship application?",
  "How do I write a strong personal statement or motivation letter?",
  "How should I ask for a recommendation letter?",
  "What should I prepare for a scholarship interview?",
];

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      {/* HEADER: Kiri Aktif, Kanan Search & Titik Tiga */}
      <div className="z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-slate-700">
            Guide is active
          </span>
        </div>

        <div className="relative flex items-center gap-4">
          {/* Tombol Search */}
          {isSearchOpen ? (
            <div className="flex items-center rounded-full bg-slate-100 px-3 py-1.5">
              <Search
                size={14}
                className="mr-2 text-slate-400"
              />

              <input
                type="text"
                autoFocus
                placeholder="Search chat..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                className="w-32 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X
                  size={14}
                  className="text-slate-400 hover:text-slate-600"
                />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                setIsSearchOpen(true)
              }
              className="text-slate-400 hover:text-slate-700"
            >
              <Search size={20} />
            </button>
          )}

          {/* Tombol Titik Tiga */}
          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (current) =>
                    !current,
                )
              }
              className="text-slate-400 hover:text-slate-700"
            >
              <MoreHorizontal size={22} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setSendError(null);
                    setIsMenuOpen(false);
                    conversationStartedRef.current =
                      false;
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AREA CHAT BUBBLE DENGAN BACKGROUND TITIK-TITIK */}
      <div
        className="flex-1 space-y-6 overflow-y-auto p-5"
        style={{
          backgroundImage:
            "radial-gradient(#e2e8f0 1.5px, transparent 1.5px)",
          backgroundSize:
            "24px 24px",
          backgroundColor:
            "#ffffff",
        }}
      >
        {filteredMessages.map(
          (message) => {
            const isAlly =
              message.role ===
              "ally";

            return (
              <div
                key={message.id}
                className={`flex w-full ${
                  isAlly
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`flex max-w-[85%] gap-3 ${
                    isAlly
                      ? "flex-row"
                      : "flex-row-reverse"
                  }`}
                >
                  {/* AVATAR */}
                  <div className="mt-1 shrink-0">
                    {isAlly ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-blue-50">
                        <img
                          src={allyMascot}
                          alt="Ally"
                          className="h-8 w-8"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5b9bd5] text-white">
                        <span className="text-sm font-bold">
                          {userInitials}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* BUBBLE & TOMBOL SAVE */}
                  <div
                    className={`flex flex-col ${
                      isAlly
                        ? "items-start"
                        : "items-end"
                    }`}
                  >
                    <div className="group relative">
                      <div
                        className={`whitespace-pre-wrap px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                          isAlly
                            ? "rounded-2xl rounded-tl-sm border border-[#f1d9c8] bg-[#fdf6f2] text-slate-800"
                            : "rounded-2xl rounded-tr-sm bg-[#5b9bd5] text-white"
                        }`}
                      >
                        {message.content}
                      </div>

                      {/* TOMBOL SAVE */}
                      {isAlly && (
                        <button
                          type="button"
                          onClick={() =>
                            onSaveInsight(
                              message.content,
                              "AI Advice",
                            )
                          }
                          className="absolute -right-10 bottom-0 rounded-full p-2 text-slate-400 opacity-50 transition-all hover:bg-orange-50 hover:text-[#b17a39] hover:opacity-100 group-hover:opacity-100"
                          title="Save to Insights"
                        >
                          <Bookmark size={18} />
                        </button>
                      )}
                    </div>

                    <span
                      className={`mt-1.5 text-[11px] text-slate-400 ${
                        isAlly
                          ? "ml-1"
                          : "mr-1"
                      }`}
                    >
                      {message.time ||
                        "Just now"}
                    </span>
                  </div>
                </div>
              </div>
            );
          },
        )}

        {isSending &&
          !searchQuery.trim() && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] gap-3">
                <div className="mt-1 shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-blue-50">
                    <img
                      src={allyMascot}
                      alt="Ally"
                      className="h-8 w-8"
                    />
                  </div>
                </div>

                <div className="rounded-2xl rounded-tl-sm border border-[#f1d9c8] bg-[#fdf6f2] px-5 py-3.5 text-slate-500 shadow-sm">
                  <Loader2
                    size={18}
                    className="animate-spin"
                    aria-label="Ally is thinking"
                  />
                </div>
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>

      {/* PERTANYAAN BANTUAN (SUGGESTED QUESTIONS) */}
      <div className="flex w-full gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/50 px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {suggestedQuestions.map(
          (question) => (
            <button
              key={question}
              type="button"
              disabled={isSending}
              onClick={() => {
                void handleSendMessage(
                  question,
                );
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={12} />
              {question}
            </button>
          ),
        )}
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-slate-200 bg-white p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSendMessage(
              inputValue,
            );
          }}
          className="flex items-end gap-3"
        >
          <textarea
            value={inputValue}
            disabled={isSending}
            onChange={(event) =>
              setInputValue(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                void handleSendMessage(
                  inputValue,
                );
              }
            }}
            placeholder="Type your message here..."
            className="max-h-[120px] min-h-[50px] flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            rows={1}
          />

          <button
            type="submit"
            disabled={
              isSending ||
              !inputValue.trim()
            }
            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#5b9bd5] text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {isSending ? (
              <Loader2
                size={20}
                className="animate-spin"
              />
            ) : (
              <Send
                size={20}
                className="ml-1"
              />
            )}
          </button>
        </form>

        {sendError && (
          <p
            role="alert"
            className="mt-2 text-xs font-medium text-red-600"
          >
            {sendError}
          </p>
        )}
      </div>
    </div>
  );
}