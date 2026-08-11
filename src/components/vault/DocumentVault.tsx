import {
  AlertCircle,
  Backpack,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import {
  deleteVaultDocument,
  getVaultDocumentAccessUrl,
  getVaultDocuments,
  type VaultDocument,
} from "../../api/vaultApi";

import {
  PrimaryButton,
} from "../ui";

import DocumentInventory, {
  type InventoryBusyState,
} from "./DocumentInventory";

import DocumentPreview from "./DocumentPreview";
import DocumentUpload from "./DocumentUpload";

export type DocumentVaultProps = {
  open:
    boolean;

  onClose:
    () => void;

  scholarshipId?:
    string | number | null;

  universityId?:
    string | number | null;
};

export default function DocumentVault({
  open,
  onClose,
  scholarshipId = null,
  universityId = null,
}: DocumentVaultProps) {
  const [
    documents,
    setDocuments,
  ] =
    useState<
      VaultDocument[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    refreshing,
    setRefreshing,
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

  const [
    feedback,
    setFeedback,
  ] =
    useState<string | null>(
      null,
    );

  const [
    uploadOpen,
    setUploadOpen,
  ] =
    useState(
      false,
    );

  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<VaultDocument | null>(
      null,
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<VaultDocument | null>(
      null,
    );

  const [
    busy,
    setBusy,
  ] =
    useState<InventoryBusyState>(
      null,
    );

  const loadDocuments =
    useCallback(
      async (
        mode:
          "initial" |
          "refresh" =
          "initial",
      ): Promise<void> => {
        if (
          mode ===
          "initial"
        ) {
          setLoading(
            true,
          );
        } else {
          setRefreshing(
            true,
          );
        }

        setError(
          null,
        );

        try {
          const nextDocuments =
            await getVaultDocuments();

          setDocuments(
            nextDocuments,
          );
        } catch (
          requestError
        ) {
          console.error(
            "[Document Vault] Unable to load backpack:",
            requestError,
          );

          setError(
            "Something went wrong while accessing your backpack. Please try again.",
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      setFeedback(
        null,
      );

      setError(
        null,
      );

      void loadDocuments(
        "initial",
      );
    },
    [
      open,
      loadDocuments,
    ],
  );

  useEffect(
    () => {
      if (
        !open
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
            "Escape" &&
            !uploadOpen &&
            !selectedDocument &&
            !deleteTarget
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
      open,
      uploadOpen,
      selectedDocument,
      deleteTarget,
      onClose,
    ],
  );

  if (
    !open
  ) {
    return null;
  }

  async function handleDownload(
    document:
      VaultDocument,
  ): Promise<void> {
    setBusy({
      id:
        document.id,
      action:
        "download",
    });

    setError(
      null,
    );

    try {
      const url =
        await getVaultDocumentAccessUrl(
          document,
          "download",
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (
      requestError
    ) {
      console.error(
        "[Document Vault] Download failed:",
        requestError,
      );

      setError(
        "A signed download link is not available for that item right now.",
      );
    } finally {
      setBusy(
        null,
      );
    }
  }

  async function confirmDelete():
    Promise<void> {
    if (
      !deleteTarget
    ) {
      return;
    }

    const target =
      deleteTarget;

    setBusy({
      id:
        target.id,
      action:
        "delete",
    });

    setError(
      null,
    );

    try {
      await deleteVaultDocument(
        target.id,
      );

      setDocuments(
        (
          current,
        ) =>
          current.filter(
            (
              document,
            ) =>
              String(
                document.id,
              ) !==
              String(
                target.id,
              ),
          ),
      );

      setSelectedDocument(
        (
          current,
        ) =>
          current &&
          String(
            current.id,
          ) ===
            String(
              target.id,
            )
            ? null
            : current,
      );

      setDeleteTarget(
        null,
      );

      setFeedback(
        "Document removed from your backpack.",
      );
    } catch (
      requestError
    ) {
      console.error(
        "[Document Vault] Delete failed:",
        requestError,
      );

      setError(
        "Something went wrong while removing that item. Please try again.",
      );
    } finally {
      setBusy(
        null,
      );
    }
  }

  return (
    <div
      className={[
        "absolute right-0 top-[calc(100%+10px)] z-[95]",
        "w-[min(520px,calc(100vw-1.5rem))]",
      ].join(
        " ",
      )}
    >
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="expedition-backpack-title"
        className={[
          "flex max-h-[min(74vh,720px)] flex-col overflow-hidden",
          "rounded-[24px] border-2 border-[#bda789]",
          "bg-[#f7efe2]",
          "shadow-[0_22px_60px_rgba(20,32,45,0.24),0_5px_0_rgba(88,64,39,0.12)]",
          "animate-[allyVaultPopoverIn_160ms_ease-out]",
        ].join(
          " ",
        )}
      >
        {/* =====================================================
            Backpack header
        ====================================================== */}

        <header
          className={[
            "relative overflow-hidden border-b-2 border-[#c9b79e]",
            "bg-[#fffaf1] px-4 py-3.5 sm:px-5 sm:py-4",
          ].join(
            " ",
          )}
        >
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-14 h-36 w-36 rounded-full border-[18px] border-[#e5d9c6]/70"
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div
                className={[
                  "grid h-12 w-12 shrink-0 place-items-center rounded-[16px]",
                  "border-2 border-[#9dbfd3] bg-[#e9f5fb] text-[#16629b]",
                  "shadow-[inset_0_-3px_0_rgba(22,98,155,0.08),0_4px_0_rgba(91,66,42,0.08)]",
                  "sm:h-14 sm:w-14",
                ].join(
                  " ",
                )}
              >
                <Backpack
                  size={26}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#7a582f]">
                    Ally Scholarship Expedition
                  </p>

                  {!loading && (
                    <span className="rounded-md border border-[#d3c1a9] bg-[#efe3d2] px-2 py-0.5 text-[9px] font-extrabold text-[#755737]">
                      {documents.length}{" "}
                      {documents.length ===
                      1
                        ? "ITEM"
                        : "ITEMS"}
                    </span>
                  )}
                </div>

                <h2
                  id="expedition-backpack-title"
                  className="mt-1 truncate text-lg font-extrabold text-[#2c1607] sm:text-xl"
                >
                  Expedition Backpack
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                aria-label="Refresh backpack"
                title="Refresh"
                disabled={
                  loading ||
                  refreshing
                }
                onClick={() => {
                  void loadDocuments(
                    "refresh",
                  );
                }}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-[#16629b] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                aria-label="Close Expedition Backpack"
                onClick={
                  onClose
                }
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </header>

        {/* =====================================================
            Backpack content
        ====================================================== */}

        <div className="flex-1 overflow-y-auto px-3 py-3.5 sm:px-4 sm:py-4">
          <div className="mx-auto w-full">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">

                {/* <div>
                  <h3 className="font-extrabold text-[#2c1607]">
                    Collected Documents
                  </h3>

                  <p className="text-xs text-slate-500">
                    Your document inventory is the gear you carry through each checkpoint.
                  </p>
                </div> */}
              </div>

              <PrimaryButton
                leftIcon={
                  <Plus
                    size={17}
                  />
                }
                onClick={() => {
                  setUploadOpen(
                    true,
                  );
                }}
              >
                Pack
              </PrimaryButton>
            </div>

            {feedback && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700"
              >
                {
                  feedback
                }
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700"
              >
                <AlertCircle
                  size={16}
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

            {loading ? (
              <div
                className={[
                  "grid min-h-[300px] place-items-center rounded-[22px]",
                  "border-2 border-[#c4af92] bg-[#d9c8af]",
                  "shadow-[inset_0_4px_0_rgba(255,255,255,0.22)]",
                ].join(
                  " ",
                )}
              >
                <div className="text-center">
                  <Loader2
                    size={31}
                    className="mx-auto animate-spin text-[#16629b]"
                    aria-hidden="true"
                  />

                  <p className="mt-4 font-extrabold text-[#2c1607]">
                    Checking your backpack...
                  </p>

                  <p className="mt-1 text-xs text-[#7a6b59]">
                    Gathering the documents you&apos;ve collected.
                  </p>
                </div>
              </div>
            ) : documents.length ===
              0 ? (
              <div
                className={[
                  "relative overflow-hidden rounded-[26px]",
                  "border-2 border-[#bfa98b] bg-[#d8c6ac]",
                  "px-4 py-6 text-center",
                  "shadow-[inset_0_4px_0_rgba(255,255,255,0.23),inset_0_-5px_0_rgba(86,62,37,0.10)]",
                  "sm:px-5 sm:py-7",
                ].join(
                  " ",
                )}
              >
                <div
                  aria-hidden="true"
                  className="absolute left-5 top-5 h-4 w-4 border-l-2 border-t-2 border-[#987a57]"
                />

                <div
                  aria-hidden="true"
                  className="absolute right-5 top-5 h-4 w-4 border-r-2 border-t-2 border-[#987a57]"
                />

                <img
                  src={
                    allyMascot
                  }
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-24 w-24 object-contain sm:h-28 sm:w-28"
                />

                <div className="mx-auto mt-2 max-w-md rounded-[20px] border border-[#c9b79e] bg-[#fffaf1] px-5 py-5 shadow-[0_4px_0_rgba(91,66,42,0.10)]">
                  <Backpack
                    size={25}
                    className="mx-auto text-[#7a582f]"
                    aria-hidden="true"
                  />

                  <h3 className="mt-3 text-lg font-extrabold text-[#2c1607]">
                    Your backpack is empty!
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your expedition is just getting started. Pack your first document to prepare for the journey.
                  </p>

                  <div className="mt-5">
                    <PrimaryButton
                      leftIcon={
                        <Plus
                          size={17}
                        />
                      }
                      onClick={() => {
                        setUploadOpen(
                          true,
                        );
                      }}
                    >
                      Pack Your First Document
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            ) : (
              <DocumentInventory
                documents={
                  documents
                }
                selectedId={
                  selectedDocument?.id ??
                  null
                }
                busy={
                  busy
                }
                onInspect={
                  setSelectedDocument
                }
                onDownload={(
                  document,
                ) => {
                  void handleDownload(
                    document,
                  );
                }}
                onDelete={
                  setDeleteTarget
                }
              />
            )}

            {!loading &&
              documents.length >
                0 && (
                <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
                  Tip: select any inventory item to inspect its details without leaving your backpack.
                </p>
              )}
          </div>
        </div>
      </section>

      <DocumentUpload
        open={
          uploadOpen
        }
        initialScholarshipId={
          scholarshipId
        }
        initialUniversityId={
          universityId
        }
        onClose={() => {
          setUploadOpen(
            false,
          );
        }}
        onUploaded={async () => {
          setFeedback(
            "Document packed successfully! 🎒",
          );

          await loadDocuments(
            "refresh",
          );
        }}
      />

      <DocumentPreview
        document={
          selectedDocument
        }
        onClose={() => {
          setSelectedDocument(
            null,
          );
        }}
        onDelete={(
          document,
        ) => {
          setDeleteTarget(
            document,
          );
        }}
      />

      <style>
        {`
          @keyframes allyVaultPopoverIn {
            from {
              transform: translateY(-6px) scale(0.985);
              opacity: 0;
            }

            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      {deleteTarget && (
        <div className="fixed inset-0 z-[160] grid place-items-center bg-[#152331]/60 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Cancel document deletion"
            onClick={() => {
              setDeleteTarget(
                null,
              );
            }}
            className="absolute inset-0 cursor-default"
          />

          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-backpack-item-title"
            className="relative z-10 w-full max-w-sm rounded-[24px] border-2 border-[#d2b79b] bg-[#fffaf1] p-5 shadow-2xl sm:p-6"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
              <Backpack
                size={23}
                aria-hidden="true"
              />
            </div>

            <h3
              id="remove-backpack-item-title"
              className="mt-4 text-xl font-extrabold text-[#2c1607]"
            >
              Leave this item behind?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Remove{" "}
              <strong className="text-slate-700">
                {
                  deleteTarget.fileName
                }
              </strong>{" "}
              from your expedition backpack?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  busy?.action ===
                  "delete"
                }
                onClick={() => {
                  setDeleteTarget(
                    null,
                  );
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Item
              </button>

              <button
                type="button"
                disabled={
                  busy?.action ===
                  "delete"
                }
                onClick={() => {
                  void confirmDelete();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy?.action ===
                "delete" && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                )}

                {busy?.action ===
                "delete"
                  ? "Removing from backpack..."
                  : "Remove Item"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}