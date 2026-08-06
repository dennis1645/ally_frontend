import { memo } from "react";

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse bg-[#eadfd9]",
        className,
      ].join(" ")}
    />
  );
}

function QuestionSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-6 w-3/4 rounded-lg" />

      <div className="space-y-3">
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <SkeletonBlock className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

function LoadingSkeletonComponent() {
  return (
    <div
      className="min-h-screen bg-[#fff8f5]"
      aria-label="Loading assessment"
      aria-live="polite"
      aria-busy="true"
    >
      <header className="border-b border-[#eadfd9] bg-white">
        <div className="mx-auto flex min-h-20 w-full max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-36 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-4 sm:gap-6">
          <SkeletonBlock className="h-20 w-20 shrink-0 rounded-2xl sm:h-24 sm:w-24" />

          <SkeletonBlock className="h-20 flex-1 rounded-2xl sm:h-24" />
        </div>

        <div className="mt-10 space-y-3">
          <SkeletonBlock className="h-4 w-28 rounded-full" />

          <SkeletonBlock className="h-10 w-72 max-w-full rounded-lg" />

          <SkeletonBlock className="h-5 w-[28rem] max-w-full rounded-lg" />
        </div>

        <div className="mt-7 rounded-2xl border border-[#eee4df] bg-white p-6 shadow-[0_6px_20px_rgba(67,36,22,0.06)] sm:p-8">
          <QuestionSkeleton />

          <div className="my-8 h-px bg-[#eee4df]" />

          <QuestionSkeleton />
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-[#eadfd9] bg-white">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-11 w-12 rounded-xl sm:w-28" />

          <div className="flex justify-center gap-2">
            {Array.from(
              { length: 8 },
              (_, index) => (
                <SkeletonBlock
                  key={index}
                  className="h-8 w-8 rounded-full"
                />
              ),
            )}
          </div>

          <SkeletonBlock className="h-11 w-12 rounded-xl sm:w-24" />
        </div>
      </footer>

      <span className="sr-only">
        Loading assessment questions.
      </span>
    </div>
  );
}

export const LoadingSkeleton = memo(
  LoadingSkeletonComponent,
);

LoadingSkeleton.displayName =
  "LoadingSkeleton";