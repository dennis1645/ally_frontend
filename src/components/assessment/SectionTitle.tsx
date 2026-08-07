import {
  memo,
} from "react";

export type SectionTitleProps = {
  assessmentTitle?: string;
  sectionTitle: string;
  description: string;
  currentStep: number;
  totalSteps: number;
};

function SectionTitleComponent({
  assessmentTitle =
    "Initial Assessment",
  sectionTitle,
  description,
  currentStep,
  totalSteps,
}: SectionTitleProps) {
  return (
    <section
      className="w-full"
      aria-labelledby="assessment-title"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1c64a5]">
          Step {currentStep} of{" "}
          {totalSteps}
        </p>

        <span className="rounded-full bg-[#e8f2fc] px-3 py-1 text-xs font-semibold text-[#1c64a5]">
          {sectionTitle}
        </span>
      </div>

      <h1
        id="assessment-title"
        className="text-3xl font-bold tracking-tight text-[#331a0e] sm:text-4xl"
      >
        {assessmentTitle}
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6c5950] sm:text-base">
        {description}
      </p>
    </section>
  );
}

export const SectionTitle =
  memo(
    SectionTitleComponent,
  );

SectionTitle.displayName =
  "SectionTitle";