import type {
  VaultDocument,
} from "../../api/vaultApi";

import DocumentVaultItem from "./DocumentVaultItem";

export type InventoryBusyState = {
  id:
    string | number;

  action:
    "download" |
    "delete";
} | null;

export type DocumentInventoryProps = {
  documents:
    VaultDocument[];

  selectedId?:
    string | number | null;

  busy:
    InventoryBusyState;

  onInspect:
    (
      document:
        VaultDocument,
    ) => void;

  onDownload:
    (
      document:
        VaultDocument,
    ) => void;

  onDelete:
    (
      document:
        VaultDocument,
    ) => void;
};

export default function DocumentInventory({
  documents,
  selectedId = null,
  busy,
  onInspect,
  onDownload,
  onDelete,
}: DocumentInventoryProps) {
  return (
    <div
      aria-label="Expedition document inventory"
      className={[
        "rounded-[24px] border-2 border-[#bfa98b]",
        "bg-[#d8c6ac] p-3 sm:p-4",
        "shadow-[inset_0_4px_0_rgba(255,255,255,0.24),inset_0_-5px_0_rgba(86,62,37,0.10)]",
      ].join(
        " ",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6d5030]">
            Document Inventory
          </p>

          <p className="mt-0.5 text-xs font-semibold text-[#80684d]">
            Select an item to inspect it.
          </p>
        </div>

        <span className="rounded-lg border border-[#b69f81] bg-[#eadfce] px-2.5 py-1 text-[10px] font-extrabold text-[#6d5030] shadow-[inset_0_-2px_0_rgba(83,60,36,0.08)]">
          {documents.length}{" "}
          {documents.length ===
          1
            ? "ITEM"
            : "ITEMS"}
        </span>
      </div>

      <div
        className={[
          /*
           * The vault is a right-side drawer, so its content width
           * stays compact even on large screens. Two columns keep
           * the inventory readable and tappable instead of forcing
           * viewport-based 3/4/5-column layouts into a narrow panel.
           */
          "grid grid-cols-2 gap-2.5 sm:gap-3",
        ].join(
          " ",
        )}
      >
        {documents.map(
          (
            document,
          ) => {
            const isBusy =
              busy &&
              String(
                busy.id,
              ) ===
                String(
                  document.id,
                );

            return (
              <DocumentVaultItem
                key={
                  String(
                    document.id,
                  )
                }
                document={
                  document
                }
                selected={
                  selectedId !==
                    null &&
                  String(
                    selectedId,
                  ) ===
                    String(
                      document.id,
                    )
                }
                isDownloading={
                  Boolean(
                    isBusy &&
                      busy?.action ===
                        "download",
                  )
                }
                isDeleting={
                  Boolean(
                    isBusy &&
                      busy?.action ===
                        "delete",
                  )
                }
                onInspect={() =>
                  onInspect(
                    document,
                  )
                }
                onDownload={() =>
                  onDownload(
                    document,
                  )
                }
                onDelete={() =>
                  onDelete(
                    document,
                  )
                }
              />
            );
          },
        )}
      </div>
    </div>
  );
}