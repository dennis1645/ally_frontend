import {
  BookOpen,
  BrainCircuit,
  Globe2,
  PlayCircle,
} from "lucide-react";

import type {
  EssayTemplate,
  EssayTemplateId,
  LanguageSkillProgress,
} from "../../types/essayPass";

export type ExpeditionSuppliesProps = {
  templates:
    EssayTemplate[];

  language:
    LanguageSkillProgress[];

  onPreviewTemplate:
    (
      templateId:
        EssayTemplateId,
    ) => void;

  onUseTemplate:
    (
      templateId:
        EssayTemplateId,
    ) => void;

  onViewLanguage:
    () => void;

  onStartReadingPractice:
    () => void;
};

export default function ExpeditionSupplies({
  templates,
  language,
  onPreviewTemplate,
  onUseTemplate,
  onViewLanguage,
  onStartReadingPractice,
}: ExpeditionSuppliesProps) {
  const reading =
    language.find(
      (
        skill,
      ) =>
        skill.id ===
        "reading",
    ) ??
    language[0];

  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#2c1607]">
        <BookOpen
          size={21}
          className="text-[#8b623f]"
        />

        Expedition Supplies
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {templates.map(
          (
            template,
          ) => {
            const isPersonal =
              template.id ===
              "personal-statement";

            return (
              <article
                key={
                  template.id
                }
                className="flex min-h-[170px] flex-col rounded-2xl border border-[#d8c7bc] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl",

                      isPersonal
                        ? "bg-[#dceeff] text-[#16629b]"
                        : "bg-[#ffe0cd] text-[#8b623f]",
                    ].join(
                      " ",
                    )}
                  >
                    {isPersonal ? (
                      <BookOpen
                        size={24}
                      />
                    ) : (
                      <BrainCircuit
                        size={24}
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[#2c1607]">
                      {
                        template.title
                      }
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        template.description
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      onPreviewTemplate(
                        template.id,
                      );
                    }}
                    className="min-h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-[#3f4147] transition hover:border-[#16629b] hover:text-[#16629b]"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUseTemplate(
                        template.id,
                      );
                    }}
                    className="min-h-10 flex-1 rounded-lg bg-[#a8d7fb] px-3 text-xs font-bold text-[#064f7e] transition hover:bg-[#96cdf7]"
                  >
                    Use Template
                  </button>
                </div>
              </article>
            );
          },
        )}
      </div>

      <article className="mt-4 rounded-2xl border border-[#d8c7bc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#6caee4] text-[#064f7e]">
            <Globe2
              size={27}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-[#2c1607]">
                  Language Gear Check
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Active training sessions
                </p>
              </div>

              <button
                type="button"
                onClick={
                  onViewLanguage
                }
                className="shrink-0 text-sm font-bold text-[#16629b] hover:underline"
              >
                View All
              </button>
            </div>

            {reading && (
              <button
                type="button"
                onClick={
                  onStartReadingPractice
                }
                className="mt-4 flex w-full items-center gap-3 rounded-xl bg-[#fff0e8] p-3 text-left transition hover:bg-[#ffe6d8]"
              >
                <BookOpen
                  size={17}
                  className="shrink-0 text-[#63a8e5]"
                />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3 text-xs font-semibold text-[#3f4147]">
                    <span>
                      Reading Drills
                    </span>

                    <span>
                      Band {reading.band}
                    </span>
                  </span>

                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-300">
                    <span
                      className="block h-full rounded-full bg-[#63a8e5]"
                      style={{
                        width:
                          `${reading.progress}%`,
                      }}
                    />
                  </span>
                </span>

                <PlayCircle
                  size={22}
                  className="shrink-0 text-[#16629b]"
                />
              </button>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}