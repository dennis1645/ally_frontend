import {
  memo,
} from "react";

import type {
  ReactNode,
} from "react";

export type AdventureOptionCardProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  buttonLabel: string;
  buttonIcon: ReactNode;
  variant: "primary" | "outline";
  onClick: () => void;
};

function AdventureOptionCardComponent({
  icon,
  title,
  description,
  buttonLabel,
  buttonIcon,
  variant,
  onClick,
}: AdventureOptionCardProps) {
  const isPrimary =
    variant === "primary";

  return (
    <article
      className={[
        "flex min-h-[430px] flex-col items-center rounded-[28px]",
        "border-[3px] border-transparent bg-white p-8 text-center",
        "shadow-[0_12px_28px_rgba(61,37,20,0.16)]",
        "transition duration-200",
        "hover:-translate-y-1 hover:border-[#c5ddf5]",
        "sm:p-10",
      ].join(" ")}
    >
      <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#dfecf9] text-[#2a5aa3]">
        {icon}
      </div>

      <h2 className="mt-7 text-2xl font-extrabold tracking-tight text-[#3d2514] sm:text-[28px]">
        {title}
      </h2>

      <div className="mt-4 flex-1 text-base leading-7 text-[#6a5a4a] sm:text-lg">
        {description}
      </div>

      <button
        type="button"
        onClick={onClick}
        className={[
          "mt-9 inline-flex min-h-16 w-full items-center justify-center gap-3",
          "rounded-2xl px-6 text-base font-extrabold transition-all",
          "focus-visible:outline-none focus-visible:ring-4",
          "focus-visible:ring-[#6ba8e6]/30",
          isPrimary
            ? [
                "border-b-4 border-[#3270c5]",
                "bg-[#6ba8e6] text-[#183954]",
                "hover:bg-[#5d9fe0]",
                "active:translate-y-[2px]",
                "active:border-b-2",
              ].join(" ")
            : [
                "border-2 border-[#6ba8e6]",
                "bg-white text-[#1f5f98]",
                "hover:bg-[#f0f6fd]",
              ].join(" "),
        ].join(" ")}
      >
        <span>
          {buttonLabel}
        </span>

        {buttonIcon}
      </button>
    </article>
  );
}

export const AdventureOptionCard =
  memo(
    AdventureOptionCardComponent,
  );

AdventureOptionCard.displayName =
  "AdventureOptionCard";
