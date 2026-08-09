import {
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import documentValleyHero from "../../assets/document-valley-hero.png";

import DigitalBackpack from "../../components/document-valley/DigitalBackpack";
import DocumentChecklist from "../../components/document-valley/DocumentChecklist";
import DocumentUploadZone from "../../components/document-valley/DocumentUploadZone";
import DocumentValleySupportRail from "../../components/document-valley/DocumentValleySupportRail";

import UserLayout from "../../components/layout/UserLayout";

import {
  documentValleyBackpack,
  documentValleyBadges,
  documentValleyChecklist,
  documentValleyMentorCheck,
  documentValleyMilestone,
  documentValleyReminders,
} from "../../mocks/documentValleyMock";

import type {
  BackpackSection,
  DocumentValleyChecklistItem,
} from "../../types/documentValley";

function formatFileSize(
  bytes:
    number,
): string {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(
      0,
    )} KB`;
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1,
  )} MB`;
}

export default function DocumentValleyPage() {
  const navigate =
    useNavigate();

  const [
    checklist,
    setChecklist,
  ] =
    useState<
      DocumentValleyChecklistItem[]
    >(
      () =>
        documentValleyChecklist.map(
          (
            item,
          ) => ({
            ...item,
          }),
        ),
    );

  const [
    backpack,
    setBackpack,
  ] =
    useState<
      BackpackSection[]
    >(
      () =>
        documentValleyBackpack.map(
          (
            section,
          ) => ({
            ...section,

            files:
              section.files.map(
                (
                  file,
                ) => ({
                  ...file,
                }),
              ),
          }),
        ),
    );

  const [
    notice,
    setNotice,
  ] =
    useState<string | null>(
      null,
    );

  const completedVisibleDocuments =
    useMemo(
      () =>
        checklist.filter(
          (
            item,
          ) =>
            item.status ===
            "complete",
        ).length,
      [
        checklist,
      ],
    );

  const readyCount =
    Math.min(
      documentValleyMilestone.totalCount,
      documentValleyMilestone.readyCount +
        Math.max(
          0,
          completedVisibleDocuments -
            documentValleyChecklist.filter(
              (
                item,
              ) =>
                item.status ===
                "complete",
            ).length,
        ),
    );

  function showNotice(
    message:
      string,
  ): void {
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
  }

  function handleChecklistAction(
    item:
      DocumentValleyChecklistItem,
  ): void {
    if (
      item.status ===
      "missing"
    ) {
      setChecklist(
        (
          current,
        ) =>
          current.map(
            (
              checklistItem,
            ) =>
              checklistItem.id ===
              item.id
                ? {
                    ...checklistItem,

                    status:
                      "complete",

                    statusText:
                      "Uploaded just now",

                    actionLabel:
                      undefined,
                  }
                : checklistItem,
          ),
      );

      showNotice(
        `${item.title} marked as uploaded for this frontend prototype.`,
      );

      return;
    }

    showNotice(
      `Reminder sent for ${item.title} in local mock state.`,
    );
  }

  function handleFilesAccepted(
    files:
      File[],
  ): void {
    setBackpack(
      (
        current,
      ) =>
        current.map(
          (
            section,
            sectionIndex,
          ) => {
            if (
              sectionIndex !==
              0
            ) {
              return section;
            }

            const nextFiles =
              files.map(
                (
                  file,
                  index,
                ) => ({
                  id:
                    Date.now() +
                    index,

                  name:
                    file.name,

                  size:
                    formatFileSize(
                      file.size,
                    ),
                }),
              );

            return {
              ...section,

              files: [
                ...section.files,
                ...nextFiles,
              ],
            };
          },
        ),
    );

    showNotice(
      `${files.length} ${
        files.length ===
        1
          ? "file"
          : "files"
      } added to your local Digital Backpack.`,
    );
  }

  return (
    <UserLayout
      title="Document Valley">
      <section
        aria-label="Document Valley"
        className="min-h-[calc(100vh-80px)] bg-[#fff8f5] px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9"
      >
        <div className="mx-auto w-full max-w-[1160px]">
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

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(285px,0.95fr)] xl:items-start">
            {/* Main column */}

            <div className="space-y-8">
              <div className="overflow-hidden rounded-2xl border-2 border-[#dfc9a8] bg-white shadow-[0_4px_0_#d1c0aa]">
                <img
                  src={
                    documentValleyHero
                  }
                  alt="Mountain trail leading toward the Document Valley summit with a treasure chest in the foreground"
                  className="h-auto w-full object-cover"
                />
              </div>

              <header>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#2c1607] sm:text-4xl">
                  Continue your Journey!
                </h1>

                <p className="mt-2 text-base leading-7 text-slate-600 sm:text-lg">
                  &ldquo;Gather every essential document before continuing your expedition.&rdquo;
                </p>
              </header>

              <DocumentChecklist
                items={
                  checklist
                }
                readyCount={
                  readyCount
                }
                totalCount={
                  documentValleyMilestone.totalCount
                }
                onAction={
                  handleChecklistAction
                }
              />

              <DigitalBackpack
                sections={
                  backpack
                }
              />

              <div className="pb-16 lg:pb-24">
                <DocumentUploadZone
                  onFilesAccepted={
                    handleFilesAccepted
                  }
                  onScanWithMobile={() => {
                    showNotice(
                      "Mobile scanning is represented as a frontend-only action for now.",
                    );
                  }}
                />
              </div>
            </div>

            {/* Support rail */}

            <DocumentValleySupportRail
              title={
                documentValleyMilestone.title
              }
              progress={
                documentValleyMilestone.progress
              }
              dueDate={
                documentValleyMilestone.dueDate
              }
              mentorInsight={
                documentValleyMentorCheck.insight
              }
              mentorAlert={
                documentValleyMentorCheck.alert
              }
              reminders={
                documentValleyReminders
              }
              badges={
                documentValleyBadges
              }
              onAnalyze={() => {
                showNotice(
                  "Mock document analysis complete. No AI or backend request was made.",
                );
              }}
              onQuickAction={(
                action,
              ) => {
                showNotice(
                  action ===
                  "generate-cv"
                    ? "Generate CV selected. This action is frontend-only for now."
                    : "Template download selected. No backend file is connected yet.",
                );
              }}
            />
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-[80] max-w-sm rounded-2xl border border-[#c8dfef] bg-white px-5 py-4 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf7ff] text-[#16629b]">
                <CheckCircle2
                  size={18}
                />
              </div>

              <div>
                <p className="font-bold text-[#2c1607]">
                  Document Valley
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {notice}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}