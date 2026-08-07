import { memo } from "react";

export type AllySpeechBubbleProps = {
  message: string;
  mascotSrc: string;
  mascotAlt?: string;
};

function AllySpeechBubbleComponent({
  message,
  mascotSrc,
  mascotAlt = "Ally explorer mascot",
}: AllySpeechBubbleProps) {
  return (
    <section
      aria-label="Message from Ally"
      className={[
        "mx-auto flex w-full max-w-2xl items-center",
        "gap-4 sm:gap-6",
      ].join(" ")}
    >
      {/* Animated Ally mascot */}

      <div
        className={[
          "ally-mascot-float",
          "h-20 w-20 shrink-0",
          "sm:h-24 sm:w-24",
        ].join(" ")}
      >
        <img
          src={mascotSrc}
          alt={mascotAlt}
          className={[
            "h-full w-full object-contain",
            "drop-shadow-[0_8px_10px_rgba(44,22,7,0.16)]",
          ].join(" ")}
        />
      </div>

      {/* Speech bubble */}

      <div
        className={[
          "relative flex-1 rounded-2xl",
          "border border-[#e0c8bc]",
          "bg-[#faebe2]",
          "px-5 py-4",
          "text-sm leading-6 text-[#6c5950]",
          "shadow-sm",
          "sm:px-6 sm:py-5 sm:text-base",

          /*
           * Outer speech-bubble arrow.
           */
          "before:absolute before:right-full before:top-1/2",
          "before:-translate-y-1/2",
          "before:border-[11px]",
          "before:border-transparent",
          "before:border-r-[#e0c8bc]",

          /*
           * Inner speech-bubble arrow.
           */
          "after:absolute after:right-full after:top-1/2",
          "after:-translate-y-1/2",
          "after:border-[10px]",
          "after:border-transparent",
          "after:border-r-[#faebe2]",
        ].join(" ")}
      >
        <p className="italic">
          “{message}”
        </p>
      </div>
    </section>
  );
}

export const AllySpeechBubble = memo(
  AllySpeechBubbleComponent,
);

AllySpeechBubble.displayName =
  "AllySpeechBubble";