import {
  ArrowRight,
  BarChart3,
  Compass,
  FileQuestion,
  Mountain,
} from "lucide-react";

import {
  useNavigate,
} from "react-router";

import mapBackground from "../assets/world-map.png";
import allyMascot from "../assets/ally-explorer.png";

import {
  AdventureOptionCard,
} from "../components/adventure/AdventureOptionCard";

export default function ChooseAdventurePage() {
  const navigate =
    useNavigate();

  return (
    <div
      className={[
        "relative min-h-screen overflow-x-hidden",
        "bg-[#f0e6d2] bg-cover bg-center bg-no-repeat",
        "font-sans text-[#3d2514] md:bg-fixed",
      ].join(" ")}
      style={{
        backgroundImage:
          `url(${mapBackground})`,
      }}
    >
      {/* Soft overlay */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-white/10"
      />

      {/* Map grid overlay */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(255,255,255,0.55) 2px, transparent 2px)",
            "linear-gradient(90deg, rgba(255,255,255,0.55) 2px, transparent 2px)",
          ].join(", "),
          backgroundSize:
            "120px 120px",
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        {/* Expedition badge */}

        <div
          className={[
            "inline-flex items-center gap-2 rounded-full",
            "border border-white/70 bg-[#fae8dd]",
            "px-4 py-2 text-xs font-semibold uppercase",
            "tracking-[0.08em] text-[#6a5a4a]",
            "shadow-sm sm:text-sm",
          ].join(" ")}
        >
          <Compass
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />

          New Expedition Awaits
        </div>

        {/* Main heading */}

        <h1
          className={[
            "mt-5 text-center text-4xl font-extrabold",
            "tracking-[-0.04em] text-[#3d2514]",
            "drop-shadow-sm sm:text-5xl lg:text-6xl",
          ].join(" ")}
        >
          Choose Your Adventure
        </h1>

        {/* Speech bubble */}

        <section
          aria-label="Message from Ally"
          className="relative mt-8 w-full max-w-2xl"
        >
          <div
            className={[
              "relative rounded-[28px] border-[3px]",
              "border-[#6c513e] bg-[#fae8dd]",
              "px-6 py-7 text-center",
              "shadow-[0_6px_14px_rgba(61,37,20,0.14)]",
              "sm:px-10 sm:py-8",
            ].join(" ")}
          >
            <p className="text-base leading-7 text-[#5a4332] sm:text-xl sm:leading-8">
              Ready to begin your
              expedition? Or do you want
              to discover your
              scholarship readiness?
            </p>

            <p className="mt-5 text-lg font-bold text-[#3d2514] sm:text-xl">
              <span className="italic text-[#2a5aa3]">
                Ally
              </span>{" "}
              is here to guide you every
              step of the way.
            </p>

            {/* Speech bubble tail */}

            <div
              aria-hidden="true"
              className="absolute left-1/2 top-full -translate-x-1/2"
            >
              <div
                className={[
                  "h-0 w-0",
                  "border-l-[19px] border-r-[19px]",
                  "border-t-[20px]",
                  "border-l-transparent border-r-transparent",
                  "border-t-[#6c513e]",
                ].join(" ")}
              />

              <div
                className={[
                  "absolute left-1/2 top-[-20px] h-0 w-0",
                  "-translate-x-1/2",
                  "border-l-[14px] border-r-[14px]",
                  "border-t-[15px]",
                  "border-l-transparent border-r-transparent",
                  "border-t-[#fae8dd]",
                ].join(" ")}
              />
            </div>
          </div>
        </section>

        {/* Ally mascot */}

        <div className="relative mt-7 flex h-52 w-full items-end justify-center sm:h-60">
          <img
            src={allyMascot}
            alt="Ally the explorer mascot"
            className="h-full max-w-full object-contain drop-shadow-[0_10px_8px_rgba(61,37,20,0.2)]"
          />
        </div>

        {/* Adventure options */}

        <section
          aria-label="Choose how to continue"
          className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2"
        >
          <AdventureOptionCard
            icon={
              <Mountain
                size={41}
                fill="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            }
            title="Yes, I’m ready!"
            description={
              <p>
                Create your{" "}
                <span className="font-extrabold italic text-[#2a5aa3]">
                  Ally
                </span>{" "}
                account to unlock your
                personalized scholarship
                roadmap, AI guidance,
                milestone tracking,
                coaching, and progress
                management.
              </p>
            }
            buttonLabel="Start My Expedition"
            buttonIcon={
              <ArrowRight
                size={21}
                aria-hidden="true"
              />
            }
            variant="primary"
            onClick={() =>
              navigate(
                "/auth?mode=register",
              )
            }
          />

          <AdventureOptionCard
            icon={
              <FileQuestion
                size={39}
                strokeWidth={2}
                aria-hidden="true"
              />
            }
            title="I’m still considering…"
            description={
              <p>
                Take a quick scholarship
                readiness assessment to
                discover how prepared you
                are before creating an
                account. It’s free and
                takes only five minutes!
              </p>
            }
            buttonLabel="Start Free Assessment"
            buttonIcon={
              <BarChart3
                size={20}
                aria-hidden="true"
              />
            }
            variant="outline"
            onClick={() =>
              navigate(
                "/onboarding/diagnostic",
              )
            }
          />
        </section>
      </main>
    </div>
  );
}