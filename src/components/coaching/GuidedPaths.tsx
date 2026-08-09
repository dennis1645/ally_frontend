import {
  ArrowRight,
} from "lucide-react";

import type {
  CoachingGuidedPath,
  CoachingPathId,
} from "../../types/coaching";

export type GuidedPathsProps = {
  paths:
    CoachingGuidedPath[];

  selectedPath:
    CoachingPathId | null;

  onSelect:
    (
      pathId:
        CoachingPathId,
    ) => void;
};

export default function GuidedPaths({
  paths,
  selectedPath,
  onSelect,
}: GuidedPathsProps) {
  return (
    <section>
      <h2 className="mb-5 text-xl font-extrabold text-[#2c1607] sm:text-2xl">
        Guided Paths
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {paths.map(
          (
            path,
          ) => {
            const Icon =
              path.icon;

            const isSelected =
              selectedPath ===
              path.id;

            const iconClass =
              path.tone ===
              "blue"
                ? "bg-[#e9f5ff] text-[#2584bf]"
                : "bg-[#f7eadc] text-[#9a7049]";

            return (
              <article
                key={
                  path.id
                }
                className={[
                  "flex min-h-[230px] flex-col rounded-[18px] border bg-white p-6 shadow-sm transition",

                  isSelected
                    ? "border-[#5fa9e8] shadow-[0_8px_24px_rgba(22,98,155,0.12)]"
                    : "border-[#ead3bd] hover:-translate-y-0.5 hover:shadow-md",
                ].join(
                  " ",
                )}
              >
                <div
                  className={[
                    "grid h-11 w-11 place-items-center rounded-xl",
                    iconClass,
                  ].join(
                    " ",
                  )}
                >
                  <Icon
                    size={22}
                  />
                </div>

                <h3 className="mt-5 text-[15px] font-extrabold leading-5 text-[#2c1607]">
                  {
                    path.title
                  }
                </h3>

                <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">
                  {
                    path.description
                  }
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onSelect(
                      path.id,
                    );
                  }}
                  className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-bold text-[#16629b] transition hover:text-[#0f4c79]"
                >
                  {
                    path.actionLabel
                  }

                  <ArrowRight
                    size={14}
                  />
                </button>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}