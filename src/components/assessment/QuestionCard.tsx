import { memo } from "react";

import type {
  ReactNode,
} from "react";

export type QuestionCardProps = {
  children: ReactNode;
  className?: string;
};

function QuestionCardComponent({
  children,
  className = "",
}: QuestionCardProps) {
  return (
    <section
      className={[
        "w-full rounded-2xl border border-[#eee4df]",
        "bg-white p-6 shadow-[0_6px_20px_rgba(67,36,22,0.06)]",
        "sm:p-8",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

export const QuestionCard = memo(
  QuestionCardComponent,
);

QuestionCard.displayName =
  "QuestionCard";