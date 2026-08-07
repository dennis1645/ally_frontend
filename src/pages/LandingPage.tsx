import {
  Compass,
  Mountain,
} from "lucide-react";

import {
  useNavigate,
} from "react-router";

import worldMap from "../assets/world-map.png";
import allyMascot from "../assets/ally-explorer.png";

import PrimaryButton from "../components/ui/PrimaryButton";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getHomePathForUser,
} from "../utils/authRouting";

export default function LandingPage() {
  const navigate =
    useNavigate();

  const {
    user,
    status,
  } = useAuth();

  function handleBeginExpedition(): void {
    /*
     * Existing authenticated users should continue directly
     * to their appropriate portal.
     */
    if (
      status ===
        "authenticated" &&
      user
    ) {
      navigate(
        getHomePathForUser(
          user,
        ),
      );

      return;
    }

    /*
     * New visitors first choose whether to register or take
     * the free scholarship-readiness assessment.
     */
    navigate(
      "/choose-adventure",
    );
  }

  return (
    <main
      className={[
        "landing-map relative flex min-h-dvh overflow-hidden",
        "bg-cover bg-center bg-no-repeat",
      ].join(" ")}
      style={{
        backgroundImage:
          `url(${worldMap})`,
      }}
    >
      {/* Light overlay improves text readability */}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/10"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center px-5 py-8 sm:px-8 sm:py-12">
        {/* Ally logo */}

        <header className="text-center">
          <h1 className="text-5xl font-extrabold italic tracking-tight text-ally-primary sm:text-6xl">
            Ally
          </h1>

          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a582f] sm:text-sm">
            Scholarship Expedition
          </p>
        </header>

        {/* Main welcome area */}

        <section className="mt-12 flex w-full flex-1 flex-col items-center justify-center sm:mt-16">
          {/* Speech bubble */}

          <div className="landing-speech-bubble w-full max-w-2xl">
            <h2 className="text-xl font-bold leading-snug text-[#2c1607] sm:text-2xl">
              Are you ready for your
              Scholarship Journey?
            </h2>

            <p className="mt-4 text-base leading-relaxed text-[#414750] sm:text-lg">
              I&apos;m your companion
              for this journey.
              Together, we&apos;ll
              reach the summit of your
              dream scholarship!
            </p>
          </div>

          {/* Ally mascot */}

          <div className="landing-mascot-float mt-8 flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
            <img
              src={allyMascot}
              alt="Ally, your scholarship expedition companion"
              className="h-full w-full object-contain drop-shadow-xl"
            />
          </div>

          {/* Main CTA */}

          <div className="mt-7 flex flex-col items-center">
            <PrimaryButton
              type="button"
              size="lg"
              isLoading={
                status ===
                "loading"
              }
              loadingText="Preparing..."
              rightIcon={
                <Compass
                  size={21}
                  aria-hidden="true"
                />
              }
              onClick={
                handleBeginExpedition
              }
              className="min-w-[240px] text-lg"
            >
              Begin Expedition
            </PrimaryButton>

            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#7a582f]/75">
              <Mountain
                size={17}
                aria-hidden="true"
              />

              <span>
                Ready for Departure
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}