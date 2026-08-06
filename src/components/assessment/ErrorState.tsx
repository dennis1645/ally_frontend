import { memo } from "react";
import {
  CircleAlert,
  RotateCcw,
} from "lucide-react";

export type ErrorStateProps = {
  title?: string;
  message?: string;
  isRetrying?: boolean;
  onRetry: () => void;
};

function ErrorStateComponent({
  title = "Unable to load assessment",
  message =
    "Something went wrong while loading the assessment. Please try again.",
  isRetrying = false,
  onRetry,
}: ErrorStateProps) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-16">
      <section
        role="alert"
        aria-labelledby="assessment-error-title"
        aria-describedby="assessment-error-message"
        className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-[0_6px_20px_rgba(67,36,22,0.06)]"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
          <CircleAlert
            size={27}
            aria-hidden="true"
          />
        </div>

        <h1
          id="assessment-error-title"
          className="mt-5 text-xl font-bold text-[#331a0e]"
        >
          {title}
        </h1>

        <p
          id="assessment-error-message"
          className="mt-3 text-sm leading-6 text-[#6c5950]"
        >
          {message}
        </p>

        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className={[
            "mt-6 inline-flex h-11 items-center justify-center gap-2",
            "rounded-xl px-6 text-sm font-semibold text-white",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-4",
            "focus-visible:ring-[#1c64a5]/25",
            isRetrying
              ? "cursor-not-allowed bg-[#9bbbd7] opacity-75"
              : "bg-[#1c64a5] shadow-[0_3px_0_#134778] hover:bg-[#134778] active:translate-y-[2px] active:shadow-none",
          ].join(" ")}
        >
          <RotateCcw
            size={16}
            className={
              isRetrying
                ? "animate-spin"
                : undefined
            }
            aria-hidden="true"
          />

          {isRetrying
            ? "Retrying..."
            : "Retry"}
        </button>
      </section>
    </main>
  );
}

export const ErrorState = memo(
  ErrorStateComponent,
);

ErrorState.displayName =
  "ErrorState";