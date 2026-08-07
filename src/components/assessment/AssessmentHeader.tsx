import { memo } from "react";

export type AssessmentHeaderProps = {
  logoText?: string;
};

function AssessmentHeaderComponent({
  logoText = "Ally",
}: AssessmentHeaderProps) {
  const usesAllyBrandLogo =
    logoText.trim().toLowerCase() === "ally";

  return (
    <header className="w-full border-b border-[#eadfd9] bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-4xl items-center px-4 sm:px-6 lg:px-8">
        {usesAllyBrandLogo ? (
          <span
            aria-label="Ally Explorer Portal"
            className="ally-logo text-3xl sm:text-4xl"
          >
            <span
              className="ally-logo-a"
              aria-hidden="true"
            >
              A
            </span>

            <span
              className="ally-logo-lly"
              aria-hidden="true"
            >
              lly
            </span>
          </span>
        ) : (
          <span className="text-3xl font-extrabold tracking-tight text-[var(--color-ally-primary)] sm:text-4xl">
            {logoText}
          </span>
        )}
      </div>
    </header>
  );
}

export const AssessmentHeader = memo(
  AssessmentHeaderComponent,
);

AssessmentHeader.displayName =
  "AssessmentHeader";