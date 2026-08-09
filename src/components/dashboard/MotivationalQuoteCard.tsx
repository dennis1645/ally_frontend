import {
  Quote,
} from "lucide-react";

export default function MotivationalQuoteCard() {
  return (
    <section
      aria-label="Motivational quote"
      className={[
        "relative min-h-[250px] overflow-hidden",
        "rounded-[24px]",
        "bg-gradient-to-br from-[#8a663b] to-[#694b2d]",
        "p-8 text-white",
        "shadow-[0_6px_0_#50381f]",
      ].join(" ")}
    >
      <Quote
        size={44}
        className="text-white/25"
        fill="currentColor"
        aria-hidden="true"
      />

      <blockquote className="mt-5">
        <p className="text-xl font-bold italic leading-9 sm:text-2xl">
          “Scholarship is not just a destination; it&apos;s the strength you gain during the climb.”
        </p>

        <footer className="mt-6 flex items-center gap-3 text-sm font-semibold text-white/70">
          <span className="h-px w-5 bg-white/50" />

          Summit AI Mentor
        </footer>
      </blockquote>

      <div
        aria-hidden="true"
        className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full border-[18px] border-white/5"
      />
    </section>
  );
}