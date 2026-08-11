import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type AllyDialogueProps = {
  text:
    string;

  typingSpeed?:
    number;

  onComplete?:
    () => void;

  label?:
    string;
};

export default function AllyDialogue({
  text,
  typingSpeed = 25,
  onComplete,
  label = "Ally says",
}: AllyDialogueProps) {
  const [
    visibleText,
    setVisibleText,
  ] =
    useState("");

  const [
    isTyping,
    setIsTyping,
  ] =
    useState(true);

  const completedRef =
    useRef(false);

  const intervalRef =
    useRef<number | null>(
      null,
    );

  const onCompleteRef =
    useRef(
      onComplete,
    );

  useEffect(
    () => {
      onCompleteRef.current =
        onComplete;
    },
    [
      onComplete,
    ],
  );

  const finishTyping =
    useCallback(
      (): void => {
        if (
          completedRef.current
        ) {
          return;
        }

        completedRef.current =
          true;

        if (
          intervalRef.current !==
          null
        ) {
          window.clearInterval(
            intervalRef.current,
          );

          intervalRef.current =
            null;
        }

        setVisibleText(
          text,
        );

        setIsTyping(
          false,
        );

        onCompleteRef.current?.();
      },
      [
        text,
      ],
    );

  useEffect(
    () => {
      completedRef.current =
        false;

      setVisibleText(
        "",
      );

      setIsTyping(
        Boolean(
          text,
        ),
      );

      if (
        !text
      ) {
        finishTyping();

        return;
      }

      let index =
        0;

      const intervalId =
        window.setInterval(
          () => {
            index +=
              1;

            setVisibleText(
              text.slice(
                0,
                index,
              ),
            );

            if (
              index >=
              text.length
            ) {
              window.clearInterval(
                intervalId,
              );

              intervalRef.current =
                null;

              finishTyping();
            }
          },
          Math.max(
            10,
            typingSpeed,
          ),
        );

      intervalRef.current =
        intervalId;

      return () => {
        window.clearInterval(
          intervalId,
        );

        if (
          intervalRef.current ===
          intervalId
        ) {
          intervalRef.current =
            null;
        }
      };
    },
    [
      finishTyping,
      text,
      typingSpeed,
    ],
  );

  return (
    <div className="relative">
      <div
        aria-live="polite"
        aria-label={
          label
        }
        className={[
          "relative rounded-[22px]",
          "border-2 border-[#b89467]",
          "bg-[#fff8e9]/96 px-5 py-4",
          "text-left text-[#3d2514]",
          "shadow-[0_6px_0_rgba(122,88,47,0.20),0_16px_35px_rgba(44,22,7,0.12)]",
          "backdrop-blur-sm",
          "sm:px-6 sm:py-5",
        ].join(
          " ",
        )}
      >
        <span
          aria-hidden="true"
          className={[
            "absolute -left-[10px] bottom-7",
            "h-[18px] w-[18px] rotate-45",
            "border-b-2 border-l-2 border-[#b89467]",
            "bg-[#fff8e9]",
          ].join(
            " ",
          )}
        />

        <p className="min-h-[48px] whitespace-pre-line text-sm font-semibold leading-6 sm:text-base sm:leading-7">
          {
            visibleText
          }

          {isTyping && (
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-[#16629b] align-middle"
            />
          )}
        </p>

        {isTyping && (
          <div className="mt-3 flex items-center justify-between gap-4">
            <div
              aria-label="Ally is typing"
              className="flex items-center gap-1"
            >
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#16629b]" />

              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#16629b]"
                style={{
                  animationDelay:
                    "100ms",
                }}
              />

              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#16629b]"
                style={{
                  animationDelay:
                    "200ms",
                }}
              />
            </div>

            <button
              type="button"
              onClick={
                finishTyping
              }
              className={[
                "rounded-lg px-2 py-1",
                "text-[10px] font-bold uppercase tracking-[0.12em]",
                "text-[#7a582f]",
                "transition hover:bg-white/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bcaff]",
              ].join(
                " ",
              )}
            >
              Reveal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}