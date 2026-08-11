import {
  Compass,
} from "lucide-react";

export type DeepDiagnosticProgressProps = {
  currentPage:
    number;

  totalPages:
    number;

  remainingQuestions:
    number;
};

export default function DeepDiagnosticProgress({
  currentPage,
  totalPages,
  remainingQuestions,
}: DeepDiagnosticProgressProps) {
  const safeTotal =
    Math.max(
      1,
      totalPages,
    );

  const safeCurrent =
    Math.min(
      safeTotal,
      Math.max(
        1,
        currentPage,
      ),
    );

  return (
    <section
      aria-label={`Expedition checkpoint ${safeCurrent} of ${safeTotal}`}
      className={[
        "rounded-2xl border border-[#c9dce8]",
        "bg-white/86 p-4",
        "shadow-sm backdrop-blur",
        "sm:p-5",
      ].join(
        " ",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#16629b]">
            <Compass
              size={16}
              aria-hidden="true"
            />

            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] sm:text-xs">
              Expedition checkpoint
            </p>
          </div>

          <p className="mt-1.5 text-lg font-extrabold text-[#2c1607]">
            Checkpoint {safeCurrent} of {safeTotal}
          </p>
        </div>

        <p className="rounded-full bg-[#fff6df] px-3 py-1.5 text-[11px] font-bold text-[#8a622d]">
          {remainingQuestions >
            0
            ? `${remainingQuestions} ${
                remainingQuestions ===
                1
                  ? "question"
                  : "questions"
              } remaining here`
            : "Checkpoint ready"}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="mt-4 flex items-center gap-1.5"
      >
        {Array.from(
          {
            length:
              safeTotal,
          },
          (
            _,
            index,
          ) => {
            const step =
              index +
              1;

            const isReached =
              step <=
              safeCurrent;

            return (
              <div
                key={
                  step
                }
                className="flex flex-1 items-center gap-1.5"
              >
                <span
                  className={[
                    "h-2.5 w-2.5 shrink-0 rounded-full border-2 transition",
                    isReached
                      ? "border-[#16629b] bg-[#16629b]"
                      : "border-[#b9c9d4] bg-white",
                  ].join(
                    " ",
                  )}
                />

                {step <
                  safeTotal && (
                  <span
                    className={[
                      "h-0.5 flex-1 rounded-full",
                      step <
                      safeCurrent
                        ? "bg-[#16629b]"
                        : "bg-[#cbd6de]",
                    ].join(
                      " ",
                    )}
                  />
                )}
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}