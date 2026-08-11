import {
  Bell,
  X,
} from "lucide-react";

export type NotificationPanelProps = {
  open:
    boolean;

  onClose:
    () => void;
};

export default function NotificationPanel({
  open,
  onClose,
}: NotificationPanelProps) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Notifications"
      className={[
        "absolute right-0 top-[calc(100%+10px)] z-[90]",
        "w-[min(360px,calc(100vw-2rem))]",
        "rounded-[22px] border border-[#dbe3e8]",
        "bg-white p-4",
        "shadow-[0_18px_50px_rgba(25,40,55,0.18)]",
      ].join(
        " ",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf5fb] text-[#16629b]">
            <Bell
              size={18}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="font-extrabold text-[#2c1607]">
              Notifications
            </p>

            <p className="text-[11px] text-slate-400">
              Expedition updates
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close notifications"
          onClick={
            onClose
          }
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X
            size={17}
            aria-hidden="true"
          />
        </button>
      </div>

      {/*
       * No notification API is currently documented in the supplied
       * frontend/backend material, so no fake count or fake messages
       * are rendered here.
       */}
      <div className="mt-4 rounded-2xl border border-dashed border-[#dce4e9] bg-[#fafcfd] px-4 py-6 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <Bell
            size={20}
            aria-hidden="true"
          />
        </div>

        <p className="mt-3 text-sm font-bold text-[#2c1607]">
          No expedition updates yet
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Deadline reminders, mentor updates, and other journey notifications will appear here when notification data is connected.
        </p>
      </div>
    </div>
  );
}