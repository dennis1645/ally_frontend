import {
  Flame,
} from "lucide-react";

export type StreakStatusCardProps = {
  count: number;
  isFallback?: boolean;
};

export default function StreakStatusCard({
  count,
  isFallback = false,
}: StreakStatusCardProps) {
  const safeCount =
    Math.max(
      0,
      Math.floor(count),
    );

  return (
    <section
      aria-label="Daily expedition streak"
      className={[
        "relative h-full overflow-hidden rounded-[22px]",
        "border border-[#f0d8ca] bg-white",
        "p-5 shadow-[0_5px_0_#e7d6c9]",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#fff1df] blur-2xl"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7a582f]">
            Streak
          </p>

          {isFallback && (
            <span className="rounded-full bg-[#f8f3ee] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Preview
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff0e4] text-[#e46f35]">
            <Flame
              size={25}
              fill="currentColor"
              aria-hidden="true"
            />
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-[#2c1607]">
                {safeCount}
              </span>

              <span className="text-sm font-bold text-slate-500">
                {safeCount === 1
                  ? "day"
                  : "days"}
              </span>
            </div>

            <p className="mt-0.5 text-xs font-semibold text-[#16629b]">
              Day Streak
            </p>
          </div>
        </div>

        <p className="mt-auto pt-4 text-sm leading-5 text-slate-500">
          {safeCount > 0
            ? "You're on a roll, Explorer! Keep your expedition moving."
            : "Start a new streak by making one meaningful step today."}
        </p>
      </div>
    </section>
  );
}