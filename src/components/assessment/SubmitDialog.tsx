import {
  memo,
  useEffect,
  useRef,
} from "react";

import {
  Compass,
  LoaderCircle,
  Send,
  X,
} from "lucide-react";

export type SubmitDialogProps = {
  open: boolean;

  isSubmitting: boolean;

  errorMessage:
    string | null;

  onOpenChange: (
    open: boolean,
  ) => void;

  onConfirm:
    () => void | Promise<void>;
};

function SubmitDialogComponent({
  open,
  isSubmitting,
  errorMessage,
  onOpenChange,
  onConfirm,
}: SubmitDialogProps) {
  const dialogRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const confirmButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const focusTimer =
      window.setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 0);

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        onOpenChange(false);
      }

      if (
        event.key !== "Tab" ||
        !dialogRef.current
      ) {
        return;
      }

      const focusableElements =
        dialogRef.current.querySelectorAll<HTMLElement>(
          [
            "button:not([disabled])",
            "[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
        );

      if (
        focusableElements.length === 0
      ) {
        return;
      }

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement ===
          firstElement
      ) {
        event.preventDefault();

        lastElement.focus();

        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement ===
          lastElement
      ) {
        event.preventDefault();

        firstElement.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.clearTimeout(
        focusTimer,
      );

      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isSubmitting,
    onOpenChange,
    open,
  ]);

  if (!open) {
    return null;
  }

  function handleClose(): void {
    if (isSubmitting) {
      return;
    }

    onOpenChange(false);
  }

  function handleBackdropClick(): void {
    handleClose();
  }

  function handleDialogClick(
    event:
      React.MouseEvent<HTMLDivElement>,
  ): void {
    event.stopPropagation();
  }

  return (
    <div
      className={[
        "fixed inset-0 z-[100]",
        "flex items-center justify-center",
        "bg-black/40 p-4",
        "backdrop-blur-[2px]",
      ].join(" ")}
      onMouseDown={
        handleBackdropClick
      }
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-dialog-title"
        aria-describedby="submit-dialog-description"
        onMouseDown={
          handleDialogClick
        }
        className={[
          "relative w-full max-w-lg",
          "rounded-[28px]",
          "border border-[#eadfd9]",
          "bg-white px-6 py-7",
          "shadow-[0_24px_70px_rgba(45,25,14,0.25)]",
          "sm:px-9 sm:py-9",
        ].join(" ")}
      >
        {/* Close button */}

        <button
          type="button"
          aria-label="Close submission dialog"
          disabled={
            isSubmitting
          }
          onClick={
            handleClose
          }
          className={[
            "absolute right-4 top-4",
            "grid h-10 w-10 place-items-center",
            "rounded-full text-[#79675d]",
            "transition-colors",
            "hover:bg-[#f7f2ef]",
            "hover:text-[#3d2514]",
            "focus-visible:outline-none",
            "focus-visible:ring-4",
            "focus-visible:ring-[#6ba8e6]/25",
            "disabled:cursor-not-allowed",
            "disabled:opacity-40",
          ].join(" ")}
        >
          <X
            size={21}
            aria-hidden="true"
          />
        </button>

        {/* Dialog content */}

        <div className="flex flex-col items-center text-center">
          <div
            className={[
              "grid h-16 w-16",
              "place-items-center rounded-full",
              "bg-[#e7f2fc]",
              "text-[#1c64a5]",
            ].join(" ")}
          >
            <Compass
              size={29}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </div>

          <h2
            id="submit-dialog-title"
            className={[
              "mt-5 text-2xl",
              "font-extrabold tracking-tight",
              "text-[#331a0e]",
              "sm:text-[28px]",
            ].join(" ")}
          >
            Calculate your readiness?
          </h2>

          <p
            id="submit-dialog-description"
            className={[
              "mx-auto mt-3 max-w-md",
              "text-sm leading-7",
              "text-[#6c5950]",
              "sm:text-base",
            ].join(" ")}
          >
            Your assessment answers
            will be submitted and used
            to calculate your
            scholarship readiness.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className={[
                "mt-5 w-full rounded-xl",
                "border border-[#f0b8b8]",
                "bg-[#fff3f3]",
                "px-4 py-3",
                "text-sm font-medium",
                "leading-6 text-[#ba1a1a]",
              ].join(" ")}
            >
              {errorMessage}
            </div>
          )}
        </div>

        {/* Dialog buttons */}

        <div
          className={[
            "mt-7 grid grid-cols-1",
            "gap-3 sm:grid-cols-2",
          ].join(" ")}
        >
          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={
              handleClose
            }
            className={[
              "inline-flex min-h-14 w-full",
              "items-center justify-center",
              "rounded-2xl",
              "border border-[#dbcac1]",
              "bg-white px-5",
              "text-center text-base",
              "font-bold leading-none",
              "text-[#68564c]",
              "transition-colors",
              "hover:bg-[#faf6f3]",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#6ba8e6]/20",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
            ].join(" ")}
          >
            <span className="whitespace-nowrap">
              Continue Reviewing
            </span>
          </button>

          <button
            ref={
              confirmButtonRef
            }
            type="button"
            disabled={
              isSubmitting
            }
            onClick={() => {
              void onConfirm();
            }}
            className={[
              "inline-flex min-h-14 w-full",
              "items-center justify-center",
              "gap-2 rounded-2xl",
              "border-b-4",
              "border-[#174e7c]",
              "bg-[#1c64a5] px-5",
              "text-center text-base",
              "font-bold leading-none",
              "text-white",
              "transition-all",
              "hover:bg-[#17598f]",
              "active:translate-y-[2px]",
              "active:border-b-2",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#6ba8e6]/30",
              "disabled:cursor-not-allowed",
              "disabled:opacity-65",
            ].join(" ")}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle
                  size={19}
                  className="shrink-0 animate-spin"
                  aria-hidden="true"
                />

                <span className="whitespace-nowrap">
                  Submitting...
                </span>
              </>
            ) : (
              <>
                <Send
                  size={18}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <span className="whitespace-nowrap">
                  Submit Assessment
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export const SubmitDialog =
  memo(
    SubmitDialogComponent,
  );

SubmitDialog.displayName =
  "SubmitDialog";