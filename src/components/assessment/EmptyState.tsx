import { memo } from "react";
import { ClipboardX } from "lucide-react";

export type EmptyStateProps = {
  title?: string;
  message?: string;
};

function EmptyStateComponent({
  title =
    "No assessment questions available",
  message =
    "No assessment questions are currently available. Please check again later.",
}: EmptyStateProps) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-16">
      <section className="w-full max-w-md rounded-2xl border border-[#eee4df] bg-white p-8 text-center shadow-[0_6px_20px_rgba(67,36,22,0.06)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff1e8] text-[#e57e3d]">
          <ClipboardX
            size={27}
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-5 text-xl font-bold text-[#331a0e]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6c5950]">
          {message}
        </p>
      </section>
    </main>
  );
}

export const EmptyState = memo(
  EmptyStateComponent,
);

EmptyState.displayName =
  "EmptyState";