import {
  memo,
  useCallback,
} from "react";

import type {
  ChangeEvent,
} from "react";

import type {
  DiagnosticOption,
} from "../../types/diagnostic";

export type QuestionOptionProps = {
  questionId: number;
  groupName: string;
  option: DiagnosticOption;
  checked: boolean;
  disabled?: boolean;

  onChange: (
    optionId: number,
  ) => void;
};

function QuestionOptionComponent({
  questionId,
  groupName,
  option,
  checked,
  disabled = false,
  onChange,
}: QuestionOptionProps) {
  const inputId =
    `question-${questionId}-option-${option.id}`;

  const handleChange =
    useCallback(
      (
        event:
          ChangeEvent<HTMLInputElement>,
      ): void => {
        if (
          event.target.checked
        ) {
          onChange(
            option.id,
          );
        }
      },
      [
        onChange,
        option.id,
      ],
    );

  return (
    <label
      htmlFor={inputId}
      className={[
        "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3",
        "transition-colors duration-200",
        "focus-within:ring-4 focus-within:ring-[#f39a63]/20",

        checked
          ? "border-[#f39a63] bg-[#fff5ee]"
          : "border-transparent bg-transparent hover:bg-[#fff8f5]",

        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
      ].join(" ")}
    >
      <span className="relative grid h-5 w-5 shrink-0 place-items-center">
        <input
          id={inputId}
          type="radio"
          name={groupName}
          value={option.id}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="peer absolute h-5 w-5 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />

        <span
          aria-hidden="true"
          className={[
            "grid h-5 w-5 place-items-center rounded-full border-2",
            "transition-colors duration-200",

            checked
              ? "border-[#f39a63]"
              : "border-[#d9b9aa]",

            "peer-focus-visible:ring-4 peer-focus-visible:ring-[#f39a63]/25",
          ].join(" ")}
        >
          {checked && (
            <span className="h-2.5 w-2.5 rounded-full bg-[#f39a63]" />
          )}
        </span>
      </span>

      <span className="text-sm leading-6 text-[#4e3c34] sm:text-base">
        {option.option_text}
      </span>
    </label>
  );
}

export const QuestionOption = memo(
  QuestionOptionComponent,
);

QuestionOption.displayName =
  "QuestionOption";