import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import type {
  UpcomingTrail,
} from "../../types/questTracker.ts";

type UpcomingTrailsProps = {
  trails:
    UpcomingTrail[];

  selectedTrailId:
    number | null;

  onSelectTrail: (
    trailId: number,
  ) => void;
};

export default function UpcomingTrails({
  trails,
  selectedTrailId,
  onSelectTrail,
}: UpcomingTrailsProps) {
  return (
    <section
      aria-labelledby="upcoming-trails-title"
    >
      <h2
        id="upcoming-trails-title"
        className="text-2xl font-extrabold text-[#2c1607]"
      >
        Upcoming Trails
      </h2>

      <div className="mt-4 space-y-4">
        {trails.map(
          (
            trail,
          ) => {
            const isSelected =
              selectedTrailId ===
              trail.id;

            const highPriority =
              trail.priority ===
              "High";

            return (
              <button
                key={
                  trail.id
                }
                type="button"
                aria-pressed={
                  isSelected
                }
                onClick={() =>
                  onSelectTrail(
                    trail.id,
                  )
                }
                className={[
                  "group w-full rounded-2xl bg-white p-5 text-left transition",
                  isSelected
                    ? "border-2 border-[#16629b] shadow-md"
                    : "border border-[#bfcbd5] hover:-translate-y-0.5 hover:border-[#6ba8e6] hover:shadow-md",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={[
                      "rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em]",
                      highPriority
                        ? "bg-[#ffe2e2] text-[#bd3131]"
                        : "bg-[#d9ebfb] text-[#16629b]",
                    ].join(" ")}
                  >
                    {trail.priority} Priority
                  </span>

                  <ArrowRight
                    size={20}
                    className="text-[#6f767e] transition-transform group-hover:translate-x-1 group-hover:text-[#16629b]"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-3 text-base font-extrabold text-[#2c1607]">
                  {trail.title}
                </h3>

                <p className="mt-2 flex items-center gap-2 text-xs text-[#777e86]">
                  <CalendarDays
                    size={14}
                    aria-hidden="true"
                  />

                  Due {trail.dueDate}
                </p>

                {isSelected && (
                  <p className="mt-3 text-xs font-bold text-[#16629b]">
                    Trail selected for preview
                  </p>
                )}
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}