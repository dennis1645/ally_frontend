import {
  AlertCircle,
  FileText,
  GraduationCap,
  Landmark,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";

import {
  getScholarships,
  getUniversities,
  type Scholarship,
  type University,
} from "../../api/adminApi";

import {
  ApiError,
} from "../../api/apiClient";

import {
  uploadVaultDocument,
} from "../../api/vaultApi";

import {
  PrimaryButton,
  SecondaryButton,
} from "../ui";

export type DocumentUploadProps = {
  open:
    boolean;

  onClose:
    () => void;

  onUploaded:
    () => void | Promise<void>;

  initialScholarshipId?:
    string | number | null;

  initialUniversityId?:
    string | number | null;
};

type FieldErrors =
  Record<
    string,
    string | undefined
  >;

function firstFieldErrors(
  error:
    unknown,
): FieldErrors {
  if (
    !(
      error instanceof
      ApiError
    ) ||
    !error.errors
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(
      error.errors,
    ).map(
      ([
        field,
        messages,
      ]) => [
        field,
        Array.isArray(
          messages,
        )
          ? messages[0]
          : undefined,
      ],
    ),
  );
}

function fileTypeLabel(
  file:
    File,
): string {
  const extension =
    file.name
      .split(
        ".",
      )
      .pop()
      ?.toUpperCase();

  return (
    extension ||
    file.type ||
    "File"
  );
}

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

  const kb =
    bytes /
    1024;

  if (
    kb <
    1024
  ) {
    return `${kb.toFixed(
      kb >=
        100
        ? 0
        : 1,
    )} KB`;
  }

  return `${(
    kb /
    1024
  ).toFixed(
    1,
  )} MB`;
}

export default function DocumentUpload({
  open,
  onClose,
  onUploaded,
  initialScholarshipId = null,
  initialUniversityId = null,
}: DocumentUploadProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    scholarshipId,
    setScholarshipId,
  ] =
    useState(
      initialScholarshipId
        ? String(
            initialScholarshipId,
          )
        : "",
    );

  const [
    universityId,
    setUniversityId,
  ] =
    useState(
      initialUniversityId
        ? String(
            initialUniversityId,
          )
        : "",
    );

  const [
    scholarships,
    setScholarships,
  ] =
    useState<
      Scholarship[]
    >([]);

  const [
    universities,
    setUniversities,
  ] =
    useState<
      University[]
    >([]);

  const [
    loadingRelations,
    setLoadingRelations,
  ] =
    useState(
      false,
    );

  const [
    relationMessage,
    setRelationMessage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    uploading,
    setUploading,
  ] =
    useState(
      false,
    );

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<FieldErrors>(
      {},
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    dragActive,
    setDragActive,
  ] =
    useState(
      false,
    );

  const selectedFileInfo =
    useMemo(
      () =>
        file
          ? {
              type:
                fileTypeLabel(
                  file,
                ),

              size:
                formatFileSize(
                  file.size,
                ),
            }
          : null,
      [
        file,
      ],
    );

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      setFile(
        null,
      );

      setFieldErrors(
        {},
      );

      setError(
        null,
      );

      setScholarshipId(
        initialScholarshipId
          ? String(
              initialScholarshipId,
            )
          : "",
      );

      setUniversityId(
        initialUniversityId
          ? String(
              initialUniversityId,
            )
          : "",
      );

      let cancelled =
        false;

      async function loadAssociations():
        Promise<void> {
        setLoadingRelations(
          true,
        );

        setRelationMessage(
          null,
        );

        const [
          scholarshipResult,
          universityResult,
        ] =
          await Promise.allSettled(
            [
              getScholarships(),
              getUniversities(),
            ],
          );

        if (
          cancelled
        ) {
          return;
        }

        if (
          scholarshipResult.status ===
          "fulfilled"
        ) {
          setScholarships(
            scholarshipResult.value.filter(
              (
                scholarship,
              ) =>
                !scholarship.isDeleted,
            ),
          );
        } else {
          setScholarships(
            [],
          );
        }

        if (
          universityResult.status ===
          "fulfilled"
        ) {
          setUniversities(
            universityResult.value.filter(
              (
                university,
              ) =>
                !university.isDeleted,
            ),
          );
        } else {
          setUniversities(
            [],
          );
        }

        if (
          scholarshipResult.status ===
            "rejected" ||
          universityResult.status ===
            "rejected"
        ) {
          setRelationMessage(
            "Some scholarship or university options could not be loaded. You can still choose a file and let the vault API validate the required fields.",
          );
        }

        setLoadingRelations(
          false,
        );
      }

      void loadAssociations();

      return () => {
        cancelled =
          true;
      };
    },
    [
      open,
      initialScholarshipId,
      initialUniversityId,
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
            !uploading
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
      uploading,
      onClose,
    ],
  );

  if (
    !open
  ) {
    return null;
  }

  function chooseFile(
    nextFile:
      File | null,
  ): void {
    setFile(
      nextFile,
    );

    setFieldErrors(
      (
        current,
      ) => ({
        ...current,
        file:
          undefined,
      }),
    );

    setError(
      null,
    );
  }

  function handleDrop(
    event:
      DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();

    setDragActive(
      false,
    );

    chooseFile(
      event.dataTransfer
        .files?.[0] ??
        null,
    );
  }

  async function handleUpload():
    Promise<void> {
    if (
      !file
    ) {
      setFieldErrors({
        file:
          "The file field is required.",
      });

      return;
    }

    setUploading(
      true,
    );

    setFieldErrors(
      {},
    );

    setError(
      null,
    );

    try {
      await uploadVaultDocument({
        file,

        scholarshipId:
          scholarshipId ||
          null,

        universityId:
          universityId ||
          null,
      });

      await onUploaded();

      onClose();
    } catch (
      uploadError
    ) {
      console.error(
        "[Document Vault] Upload failed:",
        uploadError,
      );

      setFieldErrors(
        firstFieldErrors(
          uploadError,
        ),
      );

      setError(
        "Something went wrong while packing this document. Check the fields below and try again.",
      );
    } finally {
      setUploading(
        false,
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-[#182431]/55 p-3 backdrop-blur-sm sm:p-5">
      <button
        type="button"
        aria-label="Close upload dialog"
        disabled={
          uploading
        }
        onClick={
          onClose
        }
        className="absolute inset-0 cursor-default disabled:cursor-wait"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pack-document-title"
        className={[
          "relative z-10 w-full max-w-[620px]",
          "overflow-hidden rounded-[28px]",
          "border-2 border-[#c9b79e] bg-[#fffaf1]",
          "shadow-[0_26px_80px_rgba(21,34,46,0.28),0_7px_0_rgba(91,66,42,0.14)]",
        ].join(
          " ",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#e3d4c2] bg-white/75 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a582f]">
              Add to Inventory
            </p>

            <h2
              id="pack-document-title"
              className="mt-1 text-xl font-extrabold text-[#2c1607] sm:text-2xl"
            >
              Pack a New Document
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Add an important document to your expedition backpack.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close upload dialog"
            disabled={
              uploading
            }
            onClick={
              onClose
            }
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-50"
          >
            <X
              size={19}
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-5 py-5 sm:px-6">
          <div
            onDragEnter={(
              event,
            ) => {
              event.preventDefault();

              setDragActive(
                true,
              );
            }}
            onDragOver={(
              event,
            ) => {
              event.preventDefault();

              setDragActive(
                true,
              );
            }}
            onDragLeave={() => {
              setDragActive(
                false,
              );
            }}
            onDrop={
              handleDrop
            }
            className={[
              "rounded-[22px] border-2 border-dashed p-5 text-center",
              "transition",
              dragActive
                ? "border-[#16629b] bg-[#eaf5fb]"
                : "border-[#c9b79e] bg-[#f7efe2]",
            ].join(
              " ",
            )}
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#d5c4ad] bg-white text-[#16629b] shadow-sm">
              <UploadCloud
                size={26}
                aria-hidden="true"
              />
            </div>

            <p className="mt-3 font-extrabold text-[#2c1607]">
              Drop your document here
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              or choose a file from your device
            </p>

            <input
              ref={
                inputRef
              }
              id="vault-upload-file"
              type="file"
              className="sr-only"
              onChange={(
                event,
              ) => {
                chooseFile(
                  event.target
                    .files?.[0] ??
                    null,
                );
              }}
            />

            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              className="mt-4 rounded-xl border border-[#aacfe5] bg-white px-4 py-2.5 text-sm font-extrabold text-[#16629b] shadow-sm transition hover:bg-[#f4fbff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d2eaf7]"
            >
              Choose Document
            </button>
          </div>

          {fieldErrors.file && (
            <p className="mt-2 text-xs font-bold text-red-600">
              {
                fieldErrors.file
              }
            </p>
          )}

          {file &&
            selectedFileInfo && (
              <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-[#d8c7b1] bg-white p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#edf6fb] text-[#16629b]">
                  <FileText
                    size={23}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#2c1607]">
                    {
                      file.name
                    }
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {
                      selectedFileInfo.type
                    }{" "}
                    ·{" "}
                    {
                      selectedFileInfo.size
                    }
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Remove selected document"
                  disabled={
                    uploading
                  }
                  onClick={() => {
                    chooseFile(
                      null,
                    );

                    if (
                      inputRef.current
                    ) {
                      inputRef.current.value =
                        "";
                    }
                  }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X
                    size={16}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#6c5235]">
                <GraduationCap
                  size={15}
                  aria-hidden="true"
                />
                Scholarship
              </span>

              <select
                value={
                  scholarshipId
                }
                disabled={
                  loadingRelations ||
                  uploading
                }
                onChange={(
                  event,
                ) => {
                  setScholarshipId(
                    event.target.value,
                  );

                  setFieldErrors(
                    (
                      current,
                    ) => ({
                      ...current,
                      scholarship_id:
                        undefined,
                    }),
                  );
                }}
                className={[
                  "h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700",
                  "outline-none transition focus:ring-4 focus:ring-[#d6ebf7]",
                  fieldErrors.scholarship_id
                    ? "border-red-400"
                    : "border-[#d6c6b2] focus:border-[#5fa6d0]",
                ].join(
                  " ",
                )}
              >
                <option value="">
                  No scholarship selected
                </option>

                {scholarships.map(
                  (
                    scholarship,
                  ) => (
                    <option
                      key={
                        String(
                          scholarship.id,
                        )
                      }
                      value={
                        String(
                          scholarship.id,
                        )
                      }
                    >
                      {
                        scholarship.name
                      }
                    </option>
                  ),
                )}
              </select>

              {fieldErrors.scholarship_id && (
                <p className="mt-1.5 text-xs font-bold text-red-600">
                  {
                    fieldErrors.scholarship_id
                  }
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#6c5235]">
                <Landmark
                  size={15}
                  aria-hidden="true"
                />
                University
              </span>

              <select
                value={
                  universityId
                }
                disabled={
                  loadingRelations ||
                  uploading
                }
                onChange={(
                  event,
                ) => {
                  setUniversityId(
                    event.target.value,
                  );

                  setFieldErrors(
                    (
                      current,
                    ) => ({
                      ...current,
                      university_id:
                        undefined,
                    }),
                  );
                }}
                className={[
                  "h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700",
                  "outline-none transition focus:ring-4 focus:ring-[#d6ebf7]",
                  fieldErrors.university_id
                    ? "border-red-400"
                    : "border-[#d6c6b2] focus:border-[#5fa6d0]",
                ].join(
                  " ",
                )}
              >
                <option value="">
                  No university selected
                </option>

                {universities.map(
                  (
                    university,
                  ) => (
                    <option
                      key={
                        String(
                          university.id,
                        )
                      }
                      value={
                        String(
                          university.id,
                        )
                      }
                    >
                      {
                        university.name
                      }
                    </option>
                  ),
                )}
              </select>

              {fieldErrors.university_id && (
                <p className="mt-1.5 text-xs font-bold text-red-600">
                  {
                    fieldErrors.university_id
                  }
                </p>
              )}
            </label>
          </div>

          {loadingRelations && (
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Loader2
                size={14}
                className="animate-spin"
                aria-hidden="true"
              />
              Loading scholarship and university options...
            </p>
          )}

          {relationMessage && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span>
                {
                  relationMessage
                }
              </span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700"
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

        <footer className="flex flex-col-reverse gap-3 border-t border-[#e3d4c2] bg-white/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <SecondaryButton
            disabled={
              uploading
            }
            onClick={
              onClose
            }
          >
            Cancel
          </SecondaryButton>

          <PrimaryButton
            disabled={
              !file
            }
            isLoading={
              uploading
            }
            loadingText="Packing your document..."
            leftIcon={
              <UploadCloud
                size={17}
              />
            }
            onClick={() => {
              void handleUpload();
            }}
          >
            Pack Document
          </PrimaryButton>
        </footer>
      </section>
    </div>
  );
}