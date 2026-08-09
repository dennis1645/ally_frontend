import {
  Backpack,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  BackpackSection,
} from "../../types/documentValley";

export type DigitalBackpackProps = {
  sections:
    BackpackSection[];
};

export default function DigitalBackpack({
  sections,
}: DigitalBackpackProps) {
  const [
    openSectionId,
    setOpenSectionId,
  ] =
    useState<string>(
      sections[0]?.id ??
        "",
    );

  return (
    <section className="rounded-2xl border border-[#ead3bd] bg-[#fff1ea] p-5 shadow-[0_3px_0_#d8c6ae] sm:p-6">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold text-[#2c1607]">
        <Backpack
          size={24}
          className="text-[#16629b]"
        />

        Digital Backpack
      </h2>

      <div className="mt-6 space-y-3">
        {sections.map(
          (
            section,
          ) => {
            const Icon =
              section.icon;

            const isOpen =
              openSectionId ===
              section.id;

            const statusText =
              section.status ===
              "done"
                ? "100% DONE"
                : "IN PROGRESS";

            return (
              <div
                key={
                  section.id
                }
                className="overflow-hidden rounded-xl border border-[#ead3bd] bg-white"
              >
                <button
                  type="button"
                  aria-expanded={
                    isOpen
                  }
                  onClick={() => {
                    setOpenSectionId(
                      (
                        current,
                      ) =>
                        current ===
                        section.id
                          ? ""
                          : section.id,
                    );
                  }}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-[#fffaf7]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon
                      size={20}
                      className="shrink-0 text-[#16629b]"
                    />

                    <span className="truncate text-sm font-extrabold text-[#3e2a1e]">
                      {
                        section.title
                      }
                    </span>

                    <span
                      className={[
                        "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold sm:inline-flex",

                        section.status ===
                        "done"
                          ? "bg-[#cfeeff] text-[#16629b]"
                          : "bg-[#ffe0ca] text-[#8c5d38]",
                      ].join(
                        " ",
                      )}
                    >
                      {
                        section.files.length
                      }{" "}
                      {section.files.length ===
                      1
                        ? "FILE"
                        : "FILES"}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-3">
                    <span
                      className={[
                        "hidden text-[10px] font-extrabold sm:inline",

                        section.status ===
                        "done"
                          ? "text-emerald-600"
                          : "text-[#8c5d38]",
                      ].join(
                        " ",
                      )}
                    >
                      {
                        statusText
                      }
                    </span>

                    {isOpen ? (
                      <ChevronUp
                        size={18}
                        className="text-slate-500"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-slate-500"
                      />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-[#f0ddd2] bg-[#fffaf7] p-3">
                    {section.files.length >
                    0 ? (
                      <div className="space-y-1">
                        {section.files.map(
                          (
                            file,
                          ) => (
                            <div
                              key={
                                file.id
                              }
                              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <FileText
                                  size={16}
                                  className="shrink-0 text-slate-500"
                                />

                                <span className="truncate text-[#4d5560]">
                                  {
                                    file.name
                                  }
                                </span>
                              </span>

                              <span className="shrink-0 text-xs text-slate-400">
                                {
                                  file.size
                                }
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="px-3 py-3 text-sm text-slate-500">
                        No files in this section yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}