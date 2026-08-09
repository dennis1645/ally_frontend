import {
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";

import type {
  DocumentValleyChecklistItem,
} from "../../types/documentValley";

export type DocumentChecklistProps = {
  items:
    DocumentValleyChecklistItem[];

  readyCount:
    number;

  totalCount:
    number;

  onAction:
    (
      item:
        DocumentValleyChecklistItem,
    ) => void;
};

export default function DocumentChecklist({
  items,
  readyCount,
  totalCount,
  onAction,
}: DocumentChecklistProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 border-b border-[#d7dce3] pb-3">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-[#2c1607]">
          <CheckCircle2
            size={23}
            className="text-[#63a8e5]"
          />

          Checklist
        </h2>

        <p className="text-xs font-semibold text-slate-500 sm:text-sm">
          {readyCount} of {totalCount} Documents Ready
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(
          (
            item,
          ) => {
            const Icon =
              item.icon;

            const isComplete =
              item.status ===
              "complete";

            const isMissing =
              item.status ===
              "missing";

            return (
              <article
                key={
                  item.id
                }
                className={[
                  "flex min-h-[158px] flex-col rounded-xl bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md",

                  isMissing
                    ? "border-2 border-dashed border-[#ead3bd]"
                    : "border border-[#ead3bd]",
                ].join(
                  " ",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={[
                      "grid h-10 w-10 place-items-center rounded-lg",

                      isComplete
                        ? "bg-[#fff0e7] text-[#16629b]"
                        : "bg-slate-200 text-slate-600",
                    ].join(
                      " ",
                    )}
                  >
                    <Icon
                      size={20}
                    />
                  </div>

                  {isComplete ? (
                    <CheckCircle2
                      size={20}
                      className="text-emerald-500"
                      fill="currentColor"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <MoreHorizontal
                      size={21}
                      className="text-slate-500"
                    />
                  )}
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-extrabold text-[#3e2a1e]">
                    {item.title}
                  </h3>

                  <p
                    className={[
                      "mt-1 text-xs",

                      isMissing
                        ? "font-semibold text-red-500"
                        : item.status ===
                            "pending"
                          ? "font-semibold text-[#b76f50]"
                          : "text-slate-500",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      item.statusText
                    }
                  </p>
                </div>

                {item.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      onAction(
                        item,
                      );
                    }}
                    className={[
                      "mt-auto min-h-8 rounded-lg px-3 text-xs font-bold transition",

                      isMissing
                        ? "bg-[#edf6ff] text-[#69a8e5] hover:bg-[#dfeeff]"
                        : "bg-[#fff1ea] text-[#69a8e5] hover:bg-[#ffe4d7]",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      item.actionLabel
                    }
                  </button>
                )}
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}