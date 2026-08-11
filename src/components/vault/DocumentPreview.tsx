import {
  AlertCircle,
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getVaultDocumentAccessUrl,
  type VaultDocument,
} from "../../api/vaultApi";

import {
  PrimaryButton,
  SecondaryButton,
} from "../ui";

export type DocumentPreviewProps = {
  document:
    VaultDocument | null;

  onClose:
    () => void;

  onDelete:
    (
      document:
        VaultDocument,
    ) => void;
};

type PreviewKind =
  | "pdf"
  | "image"
  | "unsupported";

function previewKind(
  document:
    VaultDocument,
): PreviewKind {
  const mime =
    document.mimeType
      ?.toLowerCase() ??
    "";

  const name =
    document.fileName
      .toLowerCase();

  if (
    mime.includes(
      "pdf",
    ) ||
    name.endsWith(
      ".pdf",
    )
  ) {
    return "pdf";
  }

  if (
    mime.startsWith(
      "image/",
    ) ||
    /\.(png|jpe?g|gif|webp)$/.test(
      name,
    )
  ) {
    return "image";
  }

  return "unsupported";
}

function formatDate(
  value:
    string | null,
): string | null {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function typeLabel(
  document:
    VaultDocument,
): string {
  const extension =
    document.fileName
      .split(
        ".",
      )
      .pop()
      ?.toUpperCase();

  return (
    document.documentType ??
    extension ??
    document.mimeType ??
    "Document"
  );
}

function LargeFileIcon({
  document,
}: {
  document:
    VaultDocument;
}) {
  const label =
    typeLabel(
      document,
    ).toUpperCase();

  if (
    label.includes(
      "PDF",
    ) ||
    label.includes(
      "DOC",
    )
  ) {
    return (
      <FileText
        size={48}
        aria-hidden="true"
      />
    );
  }

  if (
    label.includes(
      "XLS",
    ) ||
    label.includes(
      "SPREAD",
    )
  ) {
    return (
      <FileSpreadsheet
        size={48}
        aria-hidden="true"
      />
    );
  }

  if (
    label.includes(
      "PNG",
    ) ||
    label.includes(
      "JPG",
    ) ||
    label.includes(
      "JPEG",
    ) ||
    label.includes(
      "IMAGE",
    )
  ) {
    return (
      <FileImage
        size={48}
        aria-hidden="true"
      />
    );
  }

  return (
    <File
      size={48}
      aria-hidden="true"
    />
  );
}

export default function DocumentPreview({
  document,
  onClose,
  onDelete,
}: DocumentPreviewProps) {
  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    downloading,
    setDownloading,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(
    () => {
      if (
        !document
      ) {
        return;
      }

      /*
       * Capture the narrowed prop before entering the nested
       * async function. TypeScript does not preserve a nullable
       * prop narrowing across async/nested closures.
       */
      const activeDocument =
        document;

      const kind =
        previewKind(
          activeDocument,
        );

      setPreviewUrl(
        null,
      );

      setError(
        null,
      );

      if (
        kind ===
        "unsupported"
      ) {
        return;
      }

      let cancelled =
        false;

      async function loadPreview():
        Promise<void> {
        setLoading(
          true,
        );

        try {
          const url =
            await getVaultDocumentAccessUrl(
              activeDocument,
              "preview",
            );

          if (
            !cancelled
          ) {
            setPreviewUrl(
              url,
            );
          }
        } catch (
          previewError
        ) {
          console.error(
            "[Document Vault] Preview failed:",
            previewError,
          );

          if (
            !cancelled
          ) {
            setError(
              "A signed preview is not available for this item. You can still try downloading it.",
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false,
            );
          }
        }
      }

      void loadPreview();

      return () => {
        cancelled =
          true;
      };
    },
    [
      document,
    ],
  );

  useEffect(
    () => {
      if (
        !document
      ) {
        return;
      }

      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.key ===
            "Escape"
          ) {
            onClose();
          }
        };

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      document,
      onClose,
    ],
  );

  if (
    !document
  ) {
    return null;
  }

  /*
   * From this point onward the selected document is guaranteed
   * to exist. Capturing it keeps that guarantee intact inside
   * handleDownload() and other nested callbacks.
   */
  const activeDocument =
    document;

  const kind =
    previewKind(
      activeDocument,
    );

  const uploadedAt =
    formatDate(
      activeDocument.uploadedAt,
    );

  async function handleDownload():
    Promise<void> {
    setDownloading(
      true,
    );

    setError(
      null,
    );

    try {
      const url =
        await getVaultDocumentAccessUrl(
          activeDocument,
          "download",
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (
      downloadError
    ) {
      console.error(
        "[Document Vault] Download failed:",
        downloadError,
      );

      setError(
        "A signed download link is not available for this item right now.",
      );
    } finally {
      setDownloading(
        false,
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-[#152331]/60 p-3 backdrop-blur-sm sm:p-5">
      <button
        type="button"
        aria-label="Close document preview"
        onClick={
          onClose
        }
        className="absolute inset-0 cursor-default"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        className={[
          "relative z-10 flex max-h-[calc(100vh-1.5rem)]",
          "w-full max-w-[920px] flex-col overflow-hidden",
          "rounded-[28px] border-2 border-[#c8b59b] bg-[#fffaf1]",
          "shadow-[0_28px_90px_rgba(20,32,45,0.32),0_7px_0_rgba(91,66,42,0.14)]",
        ].join(
          " ",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#e2d3bf] bg-white/75 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a582f]">
              Inspect Item
            </p>

            <h2
              id="document-preview-title"
              className="mt-1 truncate text-lg font-extrabold text-[#2c1607] sm:text-xl"
            >
              {
                activeDocument.fileName
              }
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              {[
                typeLabel(
                  activeDocument,
                ),
                uploadedAt
                  ? `Uploaded ${uploadedAt}`
                  : null,
              ]
                .filter(
                  Boolean,
                )
                .join(
                  " · ",
                )}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close document preview"
            onClick={
              onClose
            }
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-800"
          >
            <X
              size={19}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {(activeDocument.scholarshipName ||
            activeDocument.universityName ||
            activeDocument.status) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeDocument.scholarshipName && (
                <span className="rounded-full bg-[#e8f3fa] px-3 py-1.5 text-[10px] font-extrabold text-[#16629b]">
                  {
                    activeDocument.scholarshipName
                  }
                </span>
              )}

              {activeDocument.universityName && (
                <span className="rounded-full bg-[#edf5e9] px-3 py-1.5 text-[10px] font-extrabold text-emerald-700">
                  {
                    activeDocument.universityName
                  }
                </span>
              )}

              {activeDocument.status && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-slate-600">
                  {
                    activeDocument.status
                  }
                </span>
              )}
            </div>
          )}

          <div
            className={[
              "min-h-[360px] overflow-hidden rounded-[22px]",
              "border-2 border-[#c9b79e] bg-[#e7dbc8]",
              "shadow-[inset_0_4px_0_rgba(255,255,255,0.25)]",
              "sm:min-h-[500px]",
            ].join(
              " ",
            )}
          >
            {loading ? (
              <div className="grid min-h-[360px] place-items-center sm:min-h-[500px]">
                <div className="text-center">
                  <Loader2
                    size={30}
                    className="mx-auto animate-spin text-[#16629b]"
                    aria-hidden="true"
                  />

                  <p className="mt-3 text-sm font-extrabold text-[#2c1607]">
                    Inspecting document...
                  </p>
                </div>
              </div>
            ) : kind ===
                "image" &&
              previewUrl ? (
              <div className="grid min-h-[360px] place-items-center bg-[#f3ecdf] p-4 sm:min-h-[500px]">
                <img
                  src={
                    previewUrl
                  }
                  alt={`Preview of ${activeDocument.fileName}`}
                  className="max-h-[68vh] max-w-full rounded-xl object-contain shadow-lg"
                />
              </div>
            ) : kind ===
                "pdf" &&
              previewUrl ? (
              <iframe
                src={
                  previewUrl
                }
                title={`Preview of ${activeDocument.fileName}`}
                className="h-[60vh] min-h-[500px] w-full bg-white"
              />
            ) : (
              <div className="grid min-h-[360px] place-items-center px-6 text-center sm:min-h-[500px]">
                <div className="max-w-sm">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-[22px] border-2 border-[#c9b79e] bg-[#f8f1e4] text-[#765632] shadow-[inset_0_-4px_0_rgba(91,66,42,0.08)]">
                    <LargeFileIcon
                      document={
                        activeDocument
                      }
                    />
                  </div>

                  <h3 className="mt-4 font-extrabold text-[#2c1607]">
                    This item cannot be previewed safely in the browser.
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Download the original document to inspect it with the appropriate application.
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800"
            >
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span>
                {
                  error
                }
              </span>
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-[#e2d3bf] bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={() => {
              onClose();

              onDelete(
                activeDocument,
              );
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            <Trash2
              size={16}
              aria-hidden="true"
            />
            Delete
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <SecondaryButton
              onClick={
                onClose
              }
            >
              Close
            </SecondaryButton>

            <PrimaryButton
              isLoading={
                downloading
              }
              loadingText="Preparing download..."
              leftIcon={
                <Download
                  size={16}
                />
              }
              onClick={() => {
                void handleDownload();
              }}
            >
              Download
            </PrimaryButton>
          </div>
        </footer>
      </section>
    </div>
  );
}