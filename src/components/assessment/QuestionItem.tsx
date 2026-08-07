import {
  memo,
  useCallback,
} from "react";

import {
  QuestionOption,
} from "./QuestionOption";

import type {
  DiagnosticQuestion,
} from "../../types/diagnostic";

export type QuestionItemProps = {
  question: DiagnosticQuestion;
  selectedOptionId?: number;
  hasError?: boolean;
  disabled?: boolean;

  onAnswer: (
    questionId: number,
    optionId: number,
  ) => void;
};

function QuestionItemComponent({
  question,
  selectedOptionId,
  hasError = false,
  disabled = false,
  onAnswer,
}: QuestionItemProps) {
  const questionTitleId =
    `question-${question.id}-title`;

  const questionErrorId =
    `question-${question.id}-error`;

  const radioGroupName =
    `question-${question.id}`;

  const handleOptionChange =
    useCallback(
      (
        optionId: number,
      ): void => {
        onAnswer(
          question.id,
          optionId,
        );
      },
      [
        onAnswer,
        question.id,
      ],
    );

  return (
    <fieldset
      className="m-0 min-w-0 border-0 p-0"
      aria-describedby={
        hasError
          ? questionErrorId
          : undefined
      }
      aria-invalid={hasError}
    >
      <legend
        id={questionTitleId}
        className="mb-4 block w-full text-base font-semibold leading-7 text-[#331a0e] sm:text-lg"
      >
        <span className="mr-2 text-[#1c64a5]">
          Q{question.order_number}.
        </span>

        {question.question_text}
      </legend>

      {question.options.length > 0 ? (
        <div
          role="radiogroup"
          aria-labelledby={
            questionTitleId
          }
          className="space-y-2"
        >
          {question.options.map(
            (option) => (
              <QuestionOption
                key={option.id}
                questionId={
                  question.id
                }
                groupName={
                  radioGroupName
                }
                option={option}
                checked={
                  selectedOptionId ===
                  option.id
                }
                disabled={disabled}
                onChange={
                  handleOptionChange
                }
              />
            ),
          )}
        </div>
      ) : (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          No answer options are
          available for this question.
        </p>
      )}

      {hasError && (
        <p
          id={questionErrorId}
          role="alert"
          className="mt-3 text-sm font-medium text-red-600"
        >
          Please select an answer
          for this question.
        </p>
      )}
    </fieldset>
  );
}

export const QuestionItem = memo(
  QuestionItemComponent,
);

QuestionItem.displayName =
  "QuestionItem";