import {
  memo,
  useMemo,
} from "react";

import {
  CheckCircle2,
  Pencil,
} from "lucide-react";

import {
  getSelectedOption,
} from "../../utils/validation";

import type {
  AssessmentAnswers,
  AssessmentSection,
} from "../../types/diagnostic";

export type ReviewSectionProps = {
  section: AssessmentSection;
  sectionIndex: number;
  answers: AssessmentAnswers;
  disabled?: boolean;

  onEdit: (
    sectionIndex: number,
  ) => void;
};

function ReviewSectionComponent({
  section,
  sectionIndex,
  answers,
  disabled = false,
  onEdit,
}: ReviewSectionProps) {
  const reviewItems = useMemo(
    () =>
      section.questions.map(
        (question) => ({
          question,
          selectedOption:
            getSelectedOption(
              question,
              answers,
            ),
        }),
      ),
    [
      section.questions,
      answers,
    ],
  );

  return (
    <section
      aria-labelledby={`review-section-${section.key}`}
      className="rounded-2xl border border-[#eee4df] bg-white p-5 shadow-[0_4px_15px_rgba(67,36,22,0.04)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={19}
              className="shrink-0 text-[#27865b]"
              aria-hidden="true"
            />

            <h2
              id={`review-section-${section.key}`}
              className="text-lg font-bold text-[#331a0e]"
            >
              {section.title}
            </h2>
          </div>

          <p className="mt-1 text-sm text-[#78645b]">
            {section.questions.length}{" "}
            {section.questions.length ===
            1
              ? "question"
              : "questions"}
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onEdit(sectionIndex)
          }
          aria-label={`Edit ${section.title}`}
          className={[
            "inline-flex h-9 items-center justify-center gap-2",
            "rounded-lg px-3 text-sm font-semibold",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-4",
            "focus-visible:ring-[#1c64a5]/20",
            disabled
              ? "cursor-not-allowed text-[#9b9b9b] opacity-60"
              : "text-[#1c64a5] hover:bg-[#eef6fd] hover:text-[#134778]",
          ].join(" ")}
        >
          <Pencil
            size={15}
            aria-hidden="true"
          />

          Edit
        </button>
      </div>

      <dl className="mt-5 divide-y divide-[#eee4df]">
        {reviewItems.map(
          ({
            question,
            selectedOption,
          }) => (
            <div
              key={question.id}
              className="py-4 first:pt-0 last:pb-0"
            >
              <dt className="text-sm font-semibold leading-6 text-[#331a0e]">
                <span className="mr-1 text-[#1c64a5]">
                  Q{question.order_number}.
                </span>

                {question.question_text}
              </dt>

              <dd
                className={[
                  "mt-2 rounded-xl px-4 py-3",
                  "text-sm leading-6",
                  selectedOption
                    ? "bg-[#fff8f5] text-[#5c4940]"
                    : "border border-red-100 bg-red-50 text-red-600",
                ].join(" ")}
              >
                {selectedOption
                  ? selectedOption.option_text
                  : "Not answered"}
              </dd>
            </div>
          ),
        )}
      </dl>
    </section>
  );
}

export const ReviewSection = memo(
  ReviewSectionComponent,
);

ReviewSection.displayName =
  "ReviewSection";