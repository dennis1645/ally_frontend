import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

type OnboardingPlaceholderProps = {
  step: number;
  title: string;
  description: string;
  nextPath: string;
  nextLabel: string;
};

export default function OnboardingPlaceholder({
  step,
  title,
  description,
  nextPath,
  nextLabel,
}: OnboardingPlaceholderProps) {
  const navigate = useNavigate();

  return (
    <main className="grid min-h-screen place-items-center bg-ally-background p-6">
      <section className="w-full max-w-2xl rounded-3xl border border-ally-border bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ally-primary">
            Ally
          </p>

          <span className="rounded-full bg-ally-blue-light px-3 py-1 text-sm text-ally-primary">
            Step {step} of 3
          </span>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium text-ally-primary">
            Explorer Onboarding
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-ally-text">
            {title}
          </h1>

          <p className="mt-3 leading-relaxed text-ally-muted">
            {description}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-ally-border bg-ally-surface p-8 text-center text-ally-muted">
          The detailed page interface will be added here.
        </div>

        <button
          type="button"
          onClick={() => navigate(nextPath)}
          className="squishy-button mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-ally-blue py-4 font-medium text-white"
        >
          {nextLabel}
          <ArrowRight size={20} />
        </button>
      </section>
    </main>
  );
}