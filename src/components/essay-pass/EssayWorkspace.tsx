import {
  Bold,
  Check,
  History,
  Italic,
  List,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type EssayWorkspaceProps = {
  minimumWords:
    number;

  initialHtml:
    string;

  templateHtml:
    string | null;

  templateRevision:
    number;

  restoredHtml:
    string | null;

  restoredRevision:
    number;

  onDraftStateChange:
    (
      state: {
        hasDraft:
          boolean;

        wordCount:
          number;

        html:
          string;
      },
    ) => void;

  onOpenVersionHistory:
    () => void;

  onNotice:
    (
      message:
        string,
    ) => void;
};

type SaveState =
  | "idle"
  | "saving"
  | "saved";

const STORAGE_KEY =
  "ally.essay-pass.draft";

function htmlToText(
  html:
    string,
): string {
  const element =
    document.createElement(
      "div",
    );

  element.innerHTML =
    html;

  return (
    element.innerText ||
    element.textContent ||
    ""
  );
}

function countWords(
  value:
    string,
): number {
  const trimmed =
    value.trim();

  if (
    !trimmed
  ) {
    return 0;
  }

  return trimmed
    .split(
      /\s+/,
    )
    .filter(
      Boolean,
    )
    .length;
}

export default function EssayWorkspace({
  minimumWords,
  initialHtml,
  templateHtml,
  templateRevision,
  restoredHtml,
  restoredRevision,
  onDraftStateChange,
  onOpenVersionHistory,
  onNotice,
}: EssayWorkspaceProps) {
  const editorRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const autosaveTimerRef =
    useRef<number | null>(
      null,
    );

  const [
    editorHtml,
    setEditorHtml,
  ] =
    useState<string>(
      () => {
        const stored =
          window.localStorage.getItem(
            STORAGE_KEY,
          );

        return (
          stored ??
          initialHtml
        );
      },
    );

  const [
    saveState,
    setSaveState,
  ] =
    useState<SaveState>(
      "idle",
    );

  const [
    lastSavedAt,
    setLastSavedAt,
  ] =
    useState<Date | null>(
      null,
    );

  const plainText =
    useMemo(
      () =>
        htmlToText(
          editorHtml,
        ),
      [
        editorHtml,
      ],
    );

  const wordCount =
    useMemo(
      () =>
        countWords(
          plainText,
        ),
      [
        plainText,
      ],
    );

  const characterCount =
    plainText.length;

  const wordProgress =
    Math.min(
      100,
      Math.round(
        (
          wordCount /
          minimumWords
        ) *
          100,
      ),
    );

  const remainingWords =
    Math.max(
      0,
      minimumWords -
        wordCount,
    );

  const syncEditor =
    useCallback(
      (
        html:
          string,
      ): void => {
        setEditorHtml(
          html,
        );

        if (
          editorRef.current &&
          editorRef.current.innerHTML !==
            html
        ) {
          editorRef.current.innerHTML =
            html;
        }
      },
      [],
    );

  useEffect(
    () => {
      if (
        editorRef.current
      ) {
        editorRef.current.innerHTML =
          editorHtml;
      }
    },
    [],
  );

  useEffect(
    () => {
      if (
        templateHtml ===
          null ||
        templateRevision ===
          0
      ) {
        return;
      }

      syncEditor(
        templateHtml,
      );

      onNotice(
        "Template inserted into your Essay Workspace.",
      );
    },
    [
      onNotice,
      syncEditor,
      templateHtml,
      templateRevision,
    ],
  );

  useEffect(
    () => {
      if (
        restoredHtml ===
          null ||
        restoredRevision ===
          0
      ) {
        return;
      }

      syncEditor(
        restoredHtml,
      );

      onNotice(
        "Version restored into your current draft.",
      );
    },
    [
      onNotice,
      restoredHtml,
      restoredRevision,
      syncEditor,
    ],
  );

  useEffect(
    () => {
      onDraftStateChange({
        hasDraft:
          plainText.trim().length >
          0,

        wordCount,

        html:
          editorHtml,
      });
    },
    [
      editorHtml,
      onDraftStateChange,
      plainText,
      wordCount,
    ],
  );

  useEffect(
    () => {
      if (
        autosaveTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          autosaveTimerRef.current,
        );
      }

      if (
        plainText.trim().length ===
        0
      ) {
        return;
      }

      autosaveTimerRef.current =
        window.setTimeout(
          () => {
            window.localStorage.setItem(
              STORAGE_KEY,
              editorHtml,
            );

            setLastSavedAt(
              new Date(),
            );
          },
          1800,
        );

      return () => {
        if (
          autosaveTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            autosaveTimerRef.current,
          );
        }
      };
    },
    [
      editorHtml,
      plainText,
    ],
  );

  function handleInput():
    void {
    const nextHtml =
      editorRef.current
        ?.innerHTML ??
      "";

    setEditorHtml(
      nextHtml,
    );

    setSaveState(
      "idle",
    );
  }

  function runCommand(
    command:
      "bold"
      | "italic"
      | "insertUnorderedList"
      | "undo"
      | "redo",
  ): void {
    editorRef.current
      ?.focus();

    document.execCommand(
      command,
      false,
    );

    handleInput();
  }

  async function handleSave():
    Promise<void> {
    setSaveState(
      "saving",
    );

    await new Promise<void>(
      (
        resolve,
      ) => {
        window.setTimeout(
          resolve,
          650,
        );
      },
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      editorHtml,
    );

    setLastSavedAt(
      new Date(),
    );

    setSaveState(
      "saved",
    );

    onNotice(
      "Draft saved locally.",
    );

    window.setTimeout(
      () => {
        setSaveState(
          "idle",
        );
      },
      1600,
    );
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-[#d3c5bb] bg-white shadow-sm">
      {/* Header */}

      <div className="flex flex-col gap-4 border-b border-[#f1d9c9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[#2c1607]">
          <Save
            size={19}
            className="text-[#16629b]"
          />

          <h2 className="font-bold">
            Essay Workspace
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={
              onOpenVersionHistory
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-semibold text-[#3f4147] transition hover:border-[#16629b] hover:text-[#16629b]"
          >
            <History
              size={16}
            />

            Version History
          </button>

          <button
            type="button"
            disabled={
              saveState ===
              "saving"
            }
            onClick={() => {
              void handleSave();
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#63a8e5] px-5 text-sm font-bold text-white shadow-[0_4px_0_#3e83bd] transition hover:bg-[#589bd7] active:translate-y-0.5 active:shadow-none disabled:cursor-wait disabled:opacity-70"
          >
            {saveState ===
            "saved" ? (
              <Check
                size={17}
              />
            ) : (
              <Save
                size={17}
              />
            )}

            {saveState ===
            "saving"
              ? "Saving..."
              : saveState ===
                  "saved"
                ? "Draft saved"
                : "Save Draft"}
          </button>
        </div>
      </div>

      {/* Toolbar */}

      <div
        role="toolbar"
        aria-label="Essay formatting"
        className="flex flex-wrap items-center gap-1 border-b border-[#f1d9c9] bg-[#fff0e8] px-4 py-2"
      >
        <button
          type="button"
          aria-label="Bold selected text"
          onClick={() => {
            runCommand(
              "bold",
            );
          }}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#3f4147] transition hover:bg-white"
        >
          <Bold
            size={18}
          />
        </button>

        <button
          type="button"
          aria-label="Italicize selected text"
          onClick={() => {
            runCommand(
              "italic",
            );
          }}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#3f4147] transition hover:bg-white"
        >
          <Italic
            size={18}
          />
        </button>

        <button
          type="button"
          aria-label="Create bullet list"
          onClick={() => {
            runCommand(
              "insertUnorderedList",
            );
          }}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#3f4147] transition hover:bg-white"
        >
          <List
            size={19}
          />
        </button>

        <span
          aria-hidden="true"
          className="mx-1 h-6 w-px bg-[#d8c7bc]"
        />

        <button
          type="button"
          aria-label="Undo"
          onClick={() => {
            runCommand(
              "undo",
            );
          }}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#3f4147] transition hover:bg-white"
        >
          <Undo2
            size={18}
          />
        </button>

        <button
          type="button"
          aria-label="Redo"
          onClick={() => {
            runCommand(
              "redo",
            );
          }}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#3f4147] transition hover:bg-white"
        >
          <Redo2
            size={18}
          />
        </button>
      </div>

      {/* Editor */}

      <div className="relative">
        <div
          ref={
            editorRef
          }
          role="textbox"
          aria-multiline="true"
          aria-label="Scholarship essay editor"
          contentEditable
          suppressContentEditableWarning
          onInput={
            handleInput
          }
          data-placeholder="Begin your expedition story here..."
          className={[
            "essay-pass-editor min-h-[390px] w-full overflow-y-auto px-6 py-6 text-[15px] leading-7 text-[#2c1607] outline-none",

            "empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]",
          ].join(
            " ",
          )}
        />
      </div>

      {/* Stats */}

      <div className="border-t border-[#f1d9c9] bg-[#fff1ea] px-5 py-4">
        <div className="flex flex-col gap-3 text-sm text-[#5f626a] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <span>
              Words:{" "}
              <strong className="text-[#3f4147]">
                {wordCount}
              </strong>
            </span>

            <span>
              Chars:{" "}
              <strong className="text-[#3f4147]">
                {
                  characterCount
                }
              </strong>
            </span>

            <span>
              {wordCount} / {minimumWords} words
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span>
              {lastSavedAt
                ? "Auto-saved just now"
                : "Local auto-save ready"}
            </span>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadfd9]">
          <div
            className="h-full rounded-full bg-[#63a8e5] transition-[width]"
            style={{
              width:
                `${wordProgress}%`,
            }}
          />
        </div>

        <p
          className={[
            "mt-2 text-xs font-semibold",

            remainingWords ===
            0
              ? "text-emerald-600"
              : "text-[#8b623f]",
          ].join(
            " ",
          )}
        >
          {remainingWords ===
          0
            ? "✓ Minimum word requirement met"
            : `Add ${remainingWords} more ${
                remainingWords ===
                1
                  ? "word"
                  : "words"
              } to complete this requirement.`}
        </p>
      </div>
    </section>
  );
}