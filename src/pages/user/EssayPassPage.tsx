import {
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import allyMascot from "../../assets/ally-assessment-mascot.png";
import essayPassHero from "../../assets/essay-pass-hero.png";

import EssayPassSupportRail from "../../components/essay-pass/EssayPassSupportRail";
import {
  AIReportModal,
  DeadlineModal,
  GearDetailsModal,
  LanguageProgressModal,
  ReadingPracticeModal,
  TemplatePreviewModal,
  VersionHistoryModal,
  VersionPreviewModal,
} from "../../components/essay-pass/EssayPassModals";
import EssayWorkspace from "../../components/essay-pass/EssayWorkspace";
import ExpeditionSupplies from "../../components/essay-pass/ExpeditionSupplies";

import UserLayout from "../../components/layout/UserLayout";

import {
  essayAnalysisScores,
  essayGear,
  essayPassData,
  essayRecommendations,
  essayTemplates,
  essayVersions,
  initialDailyObjectives,
  languageProgress,
} from "../../mocks/essayPassMock";

import type {
  DailyObjective,
  EssayGear,
  EssayPassRequirements,
  EssayTemplate,
  EssayTemplateId,
  EssayVersion,
} from "../../types/essayPass";

function plainTextToHtml(
  text:
    string,
): string {
  return text
    .split(
      "\n",
    )
    .map(
      (
        line,
      ) =>
        line.trim()
          ? `<p>${line.replaceAll(
              "&",
              "&amp;",
            ).replaceAll(
              "<",
              "&lt;",
            ).replaceAll(
              ">",
              "&gt;",
            )}</p>`
          : "<p><br></p>",
    )
    .join(
      "",
    );
}

export default function EssayPassPage() {
  const navigate =
    useNavigate();

  const [
    templatePreview,
    setTemplatePreview,
  ] =
    useState<EssayTemplate | null>(
      null,
    );

  const [
    versionPreview,
    setVersionPreview,
  ] =
    useState<EssayVersion | null>(
      null,
    );

  const [
    showVersionHistory,
    setShowVersionHistory,
  ] =
    useState(
      false,
    );

  const [
    showReport,
    setShowReport,
  ] =
    useState(
      false,
    );

  const [
    showLanguageProgress,
    setShowLanguageProgress,
  ] =
    useState(
      false,
    );

  const [
    showReadingPractice,
    setShowReadingPractice,
  ] =
    useState(
      false,
    );

  const [
    showDeadline,
    setShowDeadline,
  ] =
    useState(
      false,
    );

  const [
    selectedGear,
    setSelectedGear,
  ] =
    useState<EssayGear | null>(
      null,
    );

  const [
    dailyObjectives,
    setDailyObjectives,
  ] =
    useState<DailyObjective[]>(
      () =>
        initialDailyObjectives.map(
          (
            objective,
          ) => ({
            ...objective,
          }),
        ),
    );

  const [
    isAnalyzing,
    setIsAnalyzing,
  ] =
    useState(
      false,
    );

  const [
    analysisCompleted,
    setAnalysisCompleted,
  ] =
    useState(
      true,
    );

  const [
    languagePracticeCompleted,
    setLanguagePracticeCompleted,
  ] =
    useState(
      false,
    );

  const [
    draftState,
    setDraftState,
  ] =
    useState({
      hasDraft:
        false,

      wordCount:
        0,

      html:
        "",
    });

  const [
    templateInsert,
    setTemplateInsert,
  ] =
    useState<{
      html:
        string | null;

      revision:
        number;
    }>({
      html:
        null,

      revision:
        0,
    });

  const [
    restoredVersion,
    setRestoredVersion,
  ] =
    useState<{
      html:
        string | null;

      revision:
        number;
    }>({
      html:
        null,

      revision:
        0,
    });

  const [
    notice,
    setNotice,
  ] =
    useState<string | null>(
      null,
    );

  const showNotice =
    useCallback(
      (
        message:
          string,
      ): void => {
        setNotice(
          message,
        );

        window.setTimeout(
          () => {
            setNotice(
              (
                current,
              ) =>
                current ===
                message
                  ? null
                  : current,
            );
          },
          3200,
        );
      },
      [],
    );

  const dailyObjectivesComplete =
    dailyObjectives.every(
      (
        objective,
      ) =>
        objective.completed,
    );

  const requirements:
    EssayPassRequirements =
    useMemo(
      () => ({
        essayDraft:
          draftState.hasDraft,

        minimumWordCount:
          draftState.wordCount >=
          essayPassData.minimumWords,

        aiAnalysis:
          analysisCompleted,

        languagePractice:
          languagePracticeCompleted,

        dailyObjectives:
          dailyObjectivesComplete,
      }),
      [
        analysisCompleted,
        dailyObjectivesComplete,
        draftState.hasDraft,
        draftState.wordCount,
        languagePracticeCompleted,
      ],
    );

  function handleUseTemplate(
    templateId:
      EssayTemplateId,
  ): void {
    const template =
      essayTemplates.find(
        (
          candidate,
        ) =>
          candidate.id ===
          templateId,
      );

    if (
      !template
    ) {
      return;
    }

    setTemplateInsert(
      (
        current,
      ) => ({
        html:
          plainTextToHtml(
            template.content,
          ),

        revision:
          current.revision +
          1,
      }),
    );

    setTemplatePreview(
      null,
    );
  }

  function handleRestoreVersion(
    version:
      EssayVersion,
  ): void {
    setRestoredVersion(
      (
        current,
      ) => ({
        html:
          plainTextToHtml(
            version.content,
          ),

        revision:
          current.revision +
          1,
      }),
    );

    setShowVersionHistory(
      false,
    );

    setVersionPreview(
      null,
    );
  }

  async function handleAnalyze():
    Promise<void> {
    setIsAnalyzing(
      true,
    );

    setAnalysisCompleted(
      false,
    );

    await new Promise<void>(
      (
        resolve,
      ) => {
        window.setTimeout(
          resolve,
          1200,
        );
      },
    );

    setAnalysisCompleted(
      true,
    );

    setIsAnalyzing(
      false,
    );

    showNotice(
      "Analysis complete. Mock feedback has been refreshed.",
    );
  }

  function handleDownloadReport():
    void {
    const reportText = [
      "Ally - Essay Analysis Report",
      "",
      ...essayAnalysisScores.map(
        (
          score,
        ) =>
          `${score.label}: ${score.value}`,
      ),
      "",
      "Recommendations:",
      ...essayRecommendations.map(
        (
          recommendation,
        ) =>
          `- ${recommendation.text}`,
      ),
    ].join(
      "\n",
    );

    const blob =
      new Blob(
        [
          reportText,
        ],
        {
          type:
            "text/plain;charset=utf-8",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href =
      url;

    anchor.download =
      "ally-essay-analysis-report.txt";

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      url,
    );

    showNotice(
      "Frontend-only report downloaded.",
    );
  }

  function handleContinue():
    void {
    window.localStorage.setItem(
      "ally.essay-pass.completed",
      "true",
    );

    showNotice(
      "Essay Pass complete. Interview Summit is now ready in this frontend prototype.",
    );

    window.setTimeout(
      () => {
        navigate(
          "/quests",
        );
      },
      650,
    );
  }

  return (
    <UserLayout
      title="Essay Pass"
    >
      <section className="min-h-[calc(100vh-80px)] bg-[#fff8f5] px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        <div className="mx-auto w-full max-w-[1180px]">
          <button
            type="button"
            onClick={() => {
              navigate(
                "/quests",
              );
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#16629b] transition hover:text-[#0f4c79]"
          >
            <ArrowLeft
              size={16}
            />

            Back
          </button>

          <header className="mt-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2c1607] sm:text-4xl">
              Continue your Journey!
            </h1>

            <p className="mt-2 text-base leading-7 text-slate-600 sm:text-lg">
              Strengthen your story and language skills before reaching Interview Summit.
            </p>
          </header>

          <div className="mt-5 overflow-hidden rounded-[28px] border border-[#ead3bd] bg-white p-3 shadow-[0_5px_0_#d8c6ae] sm:p-4">
            <img
              src={
                essayPassHero
              }
              alt="A mountain path leading toward a summit flag"
              className="h-[230px] w-full rounded-[22px] object-cover object-center sm:h-[280px]"
            />
          </div>

          <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.78fr)] xl:items-start">
            <div className="space-y-8">
              <EssayWorkspace
                minimumWords={
                  essayPassData.minimumWords
                }
                initialHtml=""
                templateHtml={
                  templateInsert.html
                }
                templateRevision={
                  templateInsert.revision
                }
                restoredHtml={
                  restoredVersion.html
                }
                restoredRevision={
                  restoredVersion.revision
                }
                onDraftStateChange={
                  setDraftState
                }
                onOpenVersionHistory={() => {
                  setShowVersionHistory(
                    true,
                  );
                }}
                onNotice={
                  showNotice
                }
              />

              <ExpeditionSupplies
                templates={
                  essayTemplates
                }
                language={
                  languageProgress
                }
                onPreviewTemplate={(
                  templateId,
                ) => {
                  setTemplatePreview(
                    essayTemplates.find(
                      (
                        template,
                      ) =>
                        template.id ===
                        templateId,
                    ) ??
                    null,
                  );
                }}
                onUseTemplate={
                  handleUseTemplate
                }
                onViewLanguage={() => {
                  setShowLanguageProgress(
                    true,
                  );
                }}
                onStartReadingPractice={() => {
                  setShowReadingPractice(
                    true,
                  );
                }}
              />

              <div className="flex items-end gap-4 pt-3">
                <img
                  src={
                    allyMascot
                  }
                  alt="Ally explorer mascot"
                  className="h-24 w-24 shrink-0 object-contain drop-shadow-md"
                />

                <div className="relative max-w-xl rounded-2xl border-2 border-[#c69c6e] bg-white px-5 py-4 shadow-lg">
                  <span
                    aria-hidden="true"
                    className="absolute bottom-5 -left-2 h-4 w-4 rotate-45 border-b-2 border-l-2 border-[#c69c6e] bg-white"
                  />

                  <p className="text-sm leading-6 text-[#3f4147] sm:text-base">
                    &ldquo;Every explorer has a story to tell. Let&apos;s craft yours and prepare for the journey ahead!&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <EssayPassSupportRail
              expeditionProgress={
                essayPassData.progress
              }
              completedMilestones={
                essayPassData.completedMilestones
              }
              totalMilestones={
                essayPassData.totalMilestones
              }
              nextMilestone={
                essayPassData.nextMilestone
              }
              daysRemaining={
                essayPassData.daysRemaining
              }
              analysisScores={
                essayAnalysisScores
              }
              recommendations={
                essayRecommendations
              }
              isAnalyzing={
                isAnalyzing
              }
              analysisCompleted={
                analysisCompleted
              }
              dailyObjectives={
                dailyObjectives
              }
              requirements={
                requirements
              }
              deadlineTitle={
                essayPassData.deadline.scholarship
              }
              deadlineText={`closes in ${essayPassData.deadline.remaining}.`}
              gear={
                essayGear
              }
              onAnalyze={() => {
                void handleAnalyze();
              }}
              onOpenReport={() => {
                setShowReport(
                  true,
                );
              }}
              onToggleObjective={(
                objectiveId,
              ) => {
                setDailyObjectives(
                  (
                    current,
                  ) =>
                    current.map(
                      (
                        objective,
                      ) =>
                        objective.id ===
                        objectiveId
                          ? {
                              ...objective,

                              completed:
                                !objective.completed,
                            }
                          : objective,
                    ),
                );
              }}
              onOpenDeadline={() => {
                setShowDeadline(
                  true,
                );
              }}
              onOpenGear={(
                gearId,
              ) => {
                setSelectedGear(
                  essayGear.find(
                    (
                      item,
                    ) =>
                      item.id ===
                      gearId,
                  ) ??
                  null,
                );
              }}
              onContinue={
                handleContinue
              }
            />
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-[110] max-w-sm rounded-2xl border border-[#c8dfef] bg-white px-5 py-4 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf7ff] text-[#16629b]">
                <CheckCircle2
                  size={18}
                />
              </div>

              <div>
                <p className="font-bold text-[#2c1607]">
                  Essay Pass
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {notice}
                </p>
              </div>
            </div>
          </div>
        )}

        {showVersionHistory && (
          <VersionHistoryModal
            versions={
              essayVersions
            }
            onClose={() => {
              setShowVersionHistory(
                false,
              );
            }}
            onView={(
              version,
            ) => {
              setVersionPreview(
                version,
              );
            }}
            onRestore={
              handleRestoreVersion
            }
          />
        )}

        {versionPreview && (
          <VersionPreviewModal
            version={
              versionPreview
            }
            onClose={() => {
              setVersionPreview(
                null,
              );
            }}
          />
        )}

        {templatePreview && (
          <TemplatePreviewModal
            template={
              templatePreview
            }
            onClose={() => {
              setTemplatePreview(
                null,
              );
            }}
            onUse={() => {
              handleUseTemplate(
                templatePreview.id,
              );
            }}
          />
        )}

        {showReport && (
          <AIReportModal
            scores={
              essayAnalysisScores
            }
            recommendations={
              essayRecommendations
            }
            onClose={() => {
              setShowReport(
                false,
              );
            }}
            onDownload={
              handleDownloadReport
            }
          />
        )}

        {showLanguageProgress && (
          <LanguageProgressModal
            skills={
              languageProgress
            }
            onClose={() => {
              setShowLanguageProgress(
                false,
              );
            }}
            onReadingPractice={() => {
              setShowLanguageProgress(
                false,
              );

              setShowReadingPractice(
                true,
              );
            }}
          />
        )}

        {showReadingPractice && (
          <ReadingPracticeModal
            completed={
              languagePracticeCompleted
            }
            onClose={() => {
              setShowReadingPractice(
                false,
              );
            }}
            onComplete={() => {
              setLanguagePracticeCompleted(
                true,
              );

              showNotice(
                "Reading practice completed.",
              );
            }}
          />
        )}

        {showDeadline && (
          <DeadlineModal
            scholarship={
              essayPassData.deadline.scholarship
            }
            date={
              essayPassData.deadline.date
            }
            remaining={
              essayPassData.deadline.remaining
            }
            onClose={() => {
              setShowDeadline(
                false,
              );
            }}
            onAction={
              showNotice
            }
          />
        )}

        {selectedGear && (
          <GearDetailsModal
            gear={
              selectedGear
            }
            onClose={() => {
              setSelectedGear(
                null,
              );
            }}
          />
        )}
      </section>
    </UserLayout>
  );
}