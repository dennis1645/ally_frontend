import {
  CloudUpload,
  FolderOpen,
  ScanLine,
} from "lucide-react";

import {
  useRef,
  useState,
  type DragEvent,
} from "react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ACCEPTED_TYPES =
  new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
  ]);

export type DocumentUploadZoneProps = {
  onFilesAccepted:
    (
      files:
        File[],
    ) => void;

  onScanWithMobile:
    () => void;
};

export default function DocumentUploadZone({
  onFilesAccepted,
  onScanWithMobile,
}: DocumentUploadZoneProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    isDragging,
    setIsDragging,
  ] =
    useState(
      false,
    );

  const [
    validationMessage,
    setValidationMessage,
  ] =
    useState<string | null>(
      null,
    );

  function validateFiles(
    incomingFiles:
      File[],
  ): File[] {
    const accepted =
      incomingFiles.filter(
        (
          file,
        ) =>
          ACCEPTED_TYPES.has(
            file.type,
          ) &&
          file.size <=
            MAX_FILE_SIZE,
      );

    if (
      accepted.length !==
      incomingFiles.length
    ) {
      setValidationMessage(
        "Some files were skipped. Use PDF, JPG, or PNG files up to 10 MB.",
      );
    } else {
      setValidationMessage(
        null,
      );
    }

    return accepted;
  }

  function processFiles(
    fileList:
      FileList | null,
  ): void {
    if (
      !fileList
    ) {
      return;
    }

    const accepted =
      validateFiles(
        Array.from(
          fileList,
        ),
      );

    if (
      accepted.length >
      0
    ) {
      onFilesAccepted(
        accepted,
      );
    }
  }

  function handleDrop(
    event:
      DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault();

    setIsDragging(
      false,
    );

    processFiles(
      event.dataTransfer.files,
    );
  }

  return (
    <section
      onDragEnter={(
        event,
      ) => {
        event.preventDefault();

        setIsDragging(
          true,
        );
      }}
      onDragOver={(
        event,
      ) => {
        event.preventDefault();

        setIsDragging(
          true,
        );
      }}
      onDragLeave={() => {
        setIsDragging(
          false,
        );
      }}
      onDrop={
        handleDrop
      }
      className={[
        "relative rounded-3xl border-2 border-dashed px-6 py-10 text-center shadow-[0_4px_0_#9d7651] transition sm:px-8 sm:py-12",

        isDragging
          ? "border-[#16629b] bg-[#eaf6ff]"
          : "border-[#9d7651] bg-[#f7e9b9]",
      ].join(
        " ",
      )}
    >
      <input
        ref={
          inputRef
        }
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={(
          event,
        ) => {
          processFiles(
            event.target.files,
          );

          event.target.value =
            "";
        }}
      />

      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#d7dfce] text-[#63a8e5]">
        <CloudUpload
          size={38}
        />
      </div>

      <h2 className="mt-7 text-2xl font-extrabold text-[#5a3c2b]">
        Ready to pack a new file?
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7a6658]">
        Drag and drop your document here, or browse your local storage. Accepted: PDF, JPG, PNG (Max 10MB).
      </p>

      {validationMessage && (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-lg rounded-xl bg-white/70 px-4 py-2 text-xs font-semibold text-red-600"
        >
          {
            validationMessage
          }
        </p>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            inputRef.current
              ?.click();
          }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#63a8e5] px-7 font-bold text-white shadow-[0_4px_0_#3c82bd] transition hover:bg-[#589bd7] active:translate-y-0.5 active:shadow-none"
        >
          <FolderOpen
            size={19}
          />

          Browse Files
        </button>

        <button
          type="button"
          onClick={
            onScanWithMobile
          }
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#63a8e5] bg-white px-7 font-bold text-[#63a8e5] shadow-[0_3px_0_#d1c0aa] transition hover:bg-[#f8fcff] active:translate-y-0.5 active:shadow-none"
        >
          <ScanLine
            size={19}
          />

          Scan with Mobile
        </button>
      </div>

      <div className="mt-10 flex items-end justify-end gap-3 lg:absolute lg:-bottom-14 lg:right-0 lg:mt-0">
        <div className="relative max-w-xs rounded-2xl border border-[#ead3bd] bg-white px-5 py-4 text-left shadow-md">
          <p className="text-xs leading-5 text-[#4f4137] sm:text-sm">
            &ldquo;Great explorers always pack wisely! Let&apos;s make sure your scholarship backpack has everything you need before continuing the journey.&rdquo;
          </p>

          <span
            aria-hidden="true"
            className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-[#ead3bd] bg-white"
          />
        </div>

        <img
          src={
            allyMascot
          }
          alt="Ally explorer mascot"
          className="hidden h-24 w-24 object-contain sm:block"
        />
      </div>
    </section>
  );
}