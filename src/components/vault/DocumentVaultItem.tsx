import {
  Download,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Trash2,
} from "lucide-react";

import type {
  VaultDocument,
} from "../../api/vaultApi";

export type DocumentVaultItemProps = {
  document:
    VaultDocument;

  selected?:
    boolean;

  isDownloading?:
    boolean;

  isDeleting?:
    boolean;

  onInspect:
    () => void;

  onDownload:
    () => void;

  onDelete:
    () => void;
};

function fileTypeLabel(
  document:
    VaultDocument,
): string {
  const mime =
    document.mimeType
      ?.toLowerCase() ??
    "";

  const extension =
    document.fileName
      .split(
        ".",
      )
      .pop()
      ?.toUpperCase() ??
    "";

  if (
    mime.includes(
      "pdf",
    )
  ) {
    return "PDF";
  }

  if (
    mime.includes(
      "word",
    ) ||
    mime.includes(
      "document",
    ) ||
    /DOCX?$/.test(
      extension,
    )
  ) {
    return extension ||
      "DOC";
  }

  if (
    mime.includes(
      "spreadsheet",
    ) ||
    mime.includes(
      "excel",
    ) ||
    /XLSX?$/.test(
      extension,
    )
  ) {
    return extension ||
      "Spreadsheet";
  }

  if (
    mime.startsWith(
      "image/",
    ) ||
    /PNG|JPE?G|WEBP|GIF/.test(
      extension,
    )
  ) {
    return extension ||
      "Image";
  }

  return (
    document.documentType ??
    extension ??
    "File"
  );
}

function formatFileSize(
  bytes:
    number | null,
): string | null {
  if (
    bytes ===
      null ||
    !Number.isFinite(
      bytes,
    )
  ) {
    return null;
  }

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

  const mb =
    kb /
    1024;

  return `${mb.toFixed(
    mb >=
      100
      ? 0
      : 1,
  )} MB`;
}

function DocumentIcon({
  document,
}: {
  document:
    VaultDocument;
}) {
  const type =
    fileTypeLabel(
      document,
    ).toUpperCase();

  if (
    type ===
      "PDF" ||
    type ===
      "DOC" ||
    type ===
      "DOCX"
  ) {
    return (
      <FileText
        size={37}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    );
  }

  if (
    type.includes(
      "XLS",
    ) ||
    type.includes(
      "SPREADSHEET",
    )
  ) {
    return (
      <FileSpreadsheet
        size={37}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    );
  }

  if (
    [
      "PNG",
      "JPG",
      "JPEG",
      "WEBP",
      "GIF",
      "IMAGE",
    ].includes(
      type,
    )
  ) {
    return (
      <FileImage
        size={37}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    );
  }

  return (
    <File
      size={37}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}

export default function DocumentVaultItem({
  document,
  selected = false,
  isDownloading = false,
  isDeleting = false,
  onInspect,
  onDownload,
  onDelete,
}: DocumentVaultItemProps) {
  const type =
    fileTypeLabel(
      document,
    );

  const size =
    formatFileSize(
      document.sizeBytes,
    );

  return (
    <article
      className={[
        "group relative min-w-0 rounded-[18px]",
        "border-[2px] p-2.5",
        "transition duration-150",
        "shadow-[inset_0_-3px_0_rgba(89,64,39,0.10),0_4px_0_rgba(102,75,47,0.08)]",
        selected
          ? "border-[#16629b] bg-[#f1f9fe] ring-4 ring-[#d8ecf8]"
          : "border-[#c9b79e] bg-[#f8f1e4] hover:-translate-y-0.5 hover:border-[#9b7a52] hover:bg-[#fffaf1]",
      ].join(
        " ",
      )}
    >
      <button
        type="button"
        onClick={
          onInspect
        }
        className={[
          "block w-full rounded-[13px] px-1.5 pb-2 pt-2",
          "text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#cde7f6]",
        ].join(
          " ",
        )}
      >
        <span
          className={[
            "mx-auto grid aspect-square w-[72%] max-w-[104px] place-items-center",
            "rounded-[15px] border-2",
            "bg-[#ebe1d2]",
            "shadow-[inset_0_3px_0_rgba(255,255,255,0.60),inset_0_-4px_0_rgba(91,66,42,0.09)]",
            selected
              ? "border-[#8abbd8] text-[#16629b]"
              : "border-[#cbb99e] text-[#765632]",
          ].join(
            " ",
          )}
        >
          <DocumentIcon
            document={
              document
            }
          />
        </span>

        <span className="mt-3 line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-[#2c1607]">
          {
            document.fileName
          }
        </span>

        <span className="mt-1 block truncate text-[11px] font-bold uppercase tracking-[0.08em] text-[#7a582f]">
          {[
            type,
            size,
          ]
            .filter(
              Boolean,
            )
            .join(
              " · ",
            )}
        </span>
      </button>

      {(document.scholarshipName ||
        document.universityName ||
        document.status) && (
        <div className="mb-2 flex flex-wrap justify-center gap-1 px-1">
          {document.scholarshipName && (
            <span
              title={
                document.scholarshipName
              }
              className="max-w-full truncate rounded-full bg-[#e8f3fa] px-2 py-1 text-[9px] font-extrabold text-[#16629b]"
            >
              {
                document.scholarshipName
              }
            </span>
          )}

          {document.universityName && (
            <span
              title={
                document.universityName
              }
              className="max-w-full truncate rounded-full bg-[#eef5e9] px-2 py-1 text-[9px] font-extrabold text-emerald-700"
            >
              {
                document.universityName
              }
            </span>
          )}

          {document.status && (
            <span className="max-w-full truncate rounded-full bg-white/80 px-2 py-1 text-[9px] font-extrabold text-slate-600">
              {
                document.status
              }
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5 border-t border-[#d8c8b3] pt-2">
        <button
          type="button"
          aria-label={`Preview ${document.fileName}`}
          title="Preview"
          onClick={
            onInspect
          }
          className="grid min-h-9 place-items-center rounded-lg bg-white/80 text-slate-500 transition hover:bg-white hover:text-[#16629b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fd0eb]"
        >
          <Eye
            size={15}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          aria-label={`Download ${document.fileName}`}
          title="Download"
          disabled={
            isDownloading
          }
          onClick={
            onDownload
          }
          className="grid min-h-9 place-items-center rounded-lg bg-white/80 text-slate-500 transition hover:bg-white hover:text-[#16629b] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fd0eb]"
        >
          <Download
            size={15}
            className={
              isDownloading
                ? "animate-bounce"
                : ""
            }
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          aria-label={`Delete ${document.fileName}`}
          title="Delete"
          disabled={
            isDeleting
          }
          onClick={
            onDelete
          }
          className="grid min-h-9 place-items-center rounded-lg bg-white/80 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        >
          <Trash2
            size={15}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}