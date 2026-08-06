import { useLocation } from "react-router";

type EmptyPageProps = {
  title: string;
  description?: string;
};

export default function EmptyPage({
  title,
  description = "This page has not been implemented yet.",
}: EmptyPageProps) {
  const location = useLocation();

  return (
    <main className="grid min-h-screen place-items-center bg-ally-background p-6">
      <section className="w-full max-w-2xl rounded-3xl border border-ally-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-ally-primary">
          Ally Scholarship Expedition
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-ally-text">
          {title}
        </h1>

        <p className="mt-3 text-ally-muted">
          {description}
        </p>

        <code className="mt-6 inline-block rounded-lg bg-ally-surface px-4 py-2 text-sm text-ally-primary">
          {location.pathname}
        </code>
      </section>
    </main>
  );
}