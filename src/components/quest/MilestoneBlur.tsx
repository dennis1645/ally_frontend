type MilestoneBlurProps = {
  layout?:
    | "desktop"
    | "mobile";
};

export default function MilestoneBlur({
  layout = "desktop",
}: MilestoneBlurProps) {
  const isMobile =
    layout ===
    "mobile";

  const featherMask =
    "radial-gradient(ellipse at center, black 38%, rgba(0,0,0,0.94) 52%, rgba(0,0,0,0.62) 68%, transparent 86%)";

  return (
    <div
      aria-label="Undiscovered expedition milestone"
      className={[
        "pointer-events-none relative isolate select-none",
        isMobile
          ? "h-[116px] w-full min-w-0"
          : "h-[190px] w-[270px]",
      ].join(
        " ",
      )}
    >
      {/*
       * Pure visual fog-of-war.
       *
       * No milestone icon, name, label, or status is rendered.
       * Only the map/path behind this position is blurred.
       */}

      <div
        aria-hidden="true"
        className={[
          "absolute inset-0",
          "rounded-[50%]",
          "bg-white/16",
          "backdrop-blur-[12px]",
          "backdrop-saturate-[0.68]",
        ].join(
          " ",
        )}
        style={{
          WebkitMaskImage:
            featherMask,
          maskImage:
            featherMask,
        }}
      />

      <div
        aria-hidden="true"
        className={[
          "absolute",
          "left-[10%] right-[9%] top-[20%] bottom-[18%]",
          "rounded-[50%]",
          "bg-[#edf3f4]/13",
          "backdrop-blur-[8px]",
        ].join(
          " ",
        )}
        style={{
          WebkitMaskImage:
            featherMask,
          maskImage:
            featherMask,
        }}
      />

      <div
        aria-hidden="true"
        className={[
          "absolute left-1/2 top-1/2",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full bg-white/14 blur-2xl",
          isMobile
            ? "h-[68px] w-[76%]"
            : "h-[102px] w-[76%]",
        ].join(
          " ",
        )}
      />
    </div>
  );
}