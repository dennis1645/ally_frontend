import {
  Cloud,
  LockKeyhole,
} from "lucide-react";

type MilestoneFogProps = {
  layout?:
    | "desktop"
    | "mobile";
};

export default function MilestoneFog({
  layout = "desktop",
}: MilestoneFogProps) {
  const isMobile =
    layout ===
    "mobile";

  return (
    <div
      aria-label="Undiscovered expedition milestone"
      className={[
        "relative isolate",
        "select-none",
        isMobile
          ? "h-[108px] w-full min-w-0"
          : "h-[150px] w-[220px]",
      ].join(
        " ",
      )}
    >
      {/*
       * The cloud shapes intentionally cover the milestone
       * instead of blurring the real milestone underneath.
       *
       * This means the name, description and icon of an
       * undiscovered milestone are never rendered here.
       */}
      <div
        aria-hidden="true"
        className={[
          "absolute inset-x-2 top-1/2 -translate-y-1/2",
          "rounded-[999px] bg-white/72",
          "blur-xl",
          isMobile
            ? "h-[74px]"
            : "h-[105px]",
        ].join(
          " ",
        )}
      />

      <div
        aria-hidden="true"
        className={[
          "absolute rounded-full border border-white/75",
          "bg-white/90 shadow-[0_8px_22px_rgba(83,99,112,0.12)]",
          isMobile
            ? "left-1 top-[34px] h-14 w-[42%]"
            : "left-1 top-[54px] h-20 w-24",
        ].join(
          " ",
        )}
      />

      <div
        aria-hidden="true"
        className={[
          "absolute rounded-full border border-white/80",
          "bg-white/95 shadow-[0_8px_24px_rgba(83,99,112,0.14)]",
          isMobile
            ? "left-[25%] top-[15px] h-[72px] w-[48%]"
            : "left-[55px] top-[24px] h-[108px] w-[112px]",
        ].join(
          " ",
        )}
      />

      <div
        aria-hidden="true"
        className={[
          "absolute rounded-full border border-white/75",
          "bg-white/90 shadow-[0_8px_22px_rgba(83,99,112,0.12)]",
          isMobile
            ? "right-1 top-[35px] h-14 w-[40%]"
            : "right-1 top-[55px] h-20 w-24",
        ].join(
          " ",
        )}
      />

      <div
        className={[
          "absolute left-1/2 top-1/2 z-10",
          "-translate-x-1/2 -translate-y-1/2",
          "flex items-center gap-2",
          "rounded-xl border border-white/80",
          "bg-white/68 px-3 py-2",
          "text-[#71808b] shadow-sm backdrop-blur-md",
        ].join(
          " ",
        )}
      >
        <Cloud
          size={
            isMobile
              ? 16
              : 18
          }
          aria-hidden="true"
        />

        <LockKeyhole
          size={
            isMobile
              ? 13
              : 15
          }
          aria-hidden="true"
        />

        <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.12em] sm:text-[11px]">
          Undiscovered
        </span>
      </div>
    </div>
  );
}