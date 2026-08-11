import {
  BookOpen,
  Compass,
  MessageCircle,
  Route,
  Sparkles,
  Sprout,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

const optionIcons: LucideIcon[] = [
  Compass,
  BookOpen,
  Sprout,
  Route,
  Sparkles,
  MessageCircle,
];

export type DeepDiagnosticOptionProps = {
  index:
    number;

  text:
    string;

  selected:
    boolean;

  disabled:
    boolean;

  onSelect:
    () => void;
};

export default function DeepDiagnosticOption({
  index,
  text,
  selected,
  disabled,
  onSelect,
}: DeepDiagnosticOptionProps) {
  const Icon =
    optionIcons[
      index %
        optionIcons.length
    ];

  return (
    <button
      type="button"
      disabled={
        disabled
      }
      aria-pressed={
        selected
      }
      onClick={
        onSelect
      }
      className={[
        "group flex w-full items-center gap-3",
        "rounded-2xl border-2 px-4 py-3.5 text-left",
        "font-semibold transition duration-150",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bcaff]",
        selected
          ? [
              "border-[#16629b] bg-[#eaf5fb]",
              "text-[#104e78]",
              "shadow-[0_4px_0_rgba(22,98,155,0.20)]",
              "-translate-y-0.5",
            ].join(
              " ",
            )
          : [
              "border-[#d8e1e6] bg-white/92",
              "text-[#3d4a54]",
              "shadow-sm",
              "enabled:hover:-translate-y-0.5",
              "enabled:hover:border-[#8bbbd9]",
              "enabled:hover:bg-[#f5fbff]",
            ].join(
              " ",
            ),
        disabled &&
        !selected
          ? "cursor-not-allowed opacity-55"
          : "",
      ].join(
        " ",
      )}
    >
      <span
        className={[
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          selected
            ? "bg-[#16629b] text-white"
            : "bg-[#fff6e4] text-[#8b622e] group-enabled:group-hover:bg-[#eaf5fb] group-enabled:group-hover:text-[#16629b]",
        ].join(
          " ",
        )}
      >
        <Icon
          size={18}
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0 flex-1 text-sm leading-5 sm:text-[15px] sm:leading-6">
        {
          text
        }
      </span>
    </button>
  );
}