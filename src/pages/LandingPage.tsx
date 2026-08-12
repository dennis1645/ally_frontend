import { useState, useEffect } from "react";
import { Compass, Mountain } from "lucide-react";
import { useNavigate } from "react-router";

import worldMap from "../assets/world-map.png";
import allyMascot from "../assets/ally-explorer.png";
import PrimaryButton from "../components/ui/PrimaryButton";

import { useAuth } from "../context/AuthContext";
import { getHomePathForUser } from "../utils/authRouting";

// Teks statis (silakan ubah sesuai kebutuhan aslimu)
const TEXTS = {
  title: "Welcome to Ally Explorer!",
  body: "Are you ready to embark on an unforgettable journey? Pack your bags and let's discover the world together.",
  expedition: "GLOBAL EXPEDITION",
  beginBtn: "Begin Expedition",
  departure: "Ready for departure",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, status } = useAuth();

  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedBody, setDisplayedBody] = useState("");

  // Effect Typewriter
  useEffect(() => {
    let isCancelled = false;

    setDisplayedTitle("");
    setDisplayedBody("");

    const typeText = async () => {
      for (let i = 1; i <= TEXTS.title.length; i++) {
        if (isCancelled) return;
        setDisplayedTitle(TEXTS.title.substring(0, i));
        await new Promise((resolve) => setTimeout(resolve, 35));
      }

      if (isCancelled) return;
      await new Promise((resolve) => setTimeout(resolve, 400));

      for (let i = 1; i <= TEXTS.body.length; i++) {
        if (isCancelled) return;
        setDisplayedBody(TEXTS.body.substring(0, i));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    };

    typeText();

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleBeginExpedition(): void {
    if (status === "authenticated" && user) {
      navigate(getHomePathForUser(user));
      return;
    }
    navigate("/choose-adventure");
  }

  return (
    <main
      className="landing-map relative flex h-dvh min-h-0 flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${worldMap})` }}
    >
      {/* Light overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-white/30" />

      {/* Container utama */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-3 px-4 py-4 sm:gap-5 sm:px-8 sm:py-6">
        
        {/* Header / Logo */}
        <header className="flex shrink-0 flex-col items-center text-center">
          <span
            className="ally-logo text-[46px] leading-none sm:text-[52px] md:text-[62px]"
            role="img"
            aria-label="Ally"
          >
            <span aria-hidden="true" className="ally-logo-a font-bold text-[#005a9c]">A</span>
            <span aria-hidden="true" className="ally-logo-lly font-bold text-[#005a9c]">lly</span>
          </span>
          <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a582f] sm:mt-3 sm:text-xs md:text-sm">
            {TEXTS.expedition}
          </p>
        </header>

        {/* Middle Section (Speech Bubble) */}
        <section className="flex w-full shrink-0 flex-col items-center justify-center">
          <div className="relative w-[95%] max-w-xl rounded-2xl border-[3px] border-[#b89c7d] bg-[#fbf6ef] p-4 text-center shadow-lg sm:p-5 md:p-6">
            <div className="absolute -bottom-[11px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#b89c7d] bg-[#fbf6ef]" />
            <h2 className="min-h-[1.75rem] text-base font-bold leading-snug text-[#2c1607] sm:min-h-[2rem] sm:text-lg md:text-xl lg:text-2xl">
              {displayedTitle}
            </h2>
            <p className="mt-2 min-h-[3.5rem] text-xs leading-relaxed text-[#414750] sm:mt-3 sm:min-h-[4rem] sm:text-sm md:text-base">
              {displayedBody}
            </p>
          </div>
        </section>

        {/* Maskot & Tombol CTA */}
        <div className="flex flex-col items-center">
          <div className="flex h-[130px] w-[130px] shrink-0 items-center justify-center sm:h-[170px] sm:w-[170px] md:h-[200px] md:w-[200px]">
            <img
              src={allyMascot}
              alt="Ally mascot"
              className="h-full w-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="-mt-4 flex shrink-0 flex-col items-center sm:-mt-6 md:-mt-8">
            <PrimaryButton
              type="button"
              size="lg"
              isLoading={status === "loading"}
              loadingText="Preparing..."
              rightIcon={<Compass size={21} aria-hidden="true" />}
              onClick={handleBeginExpedition}
              className="min-w-[200px] text-sm sm:min-w-[220px] sm:text-base md:min-w-[240px] md:text-lg"
            >
              {TEXTS.beginBtn}
            </PrimaryButton>

            <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-[#7a582f]/80 sm:mt-2.5 sm:text-xs md:text-sm">
              <Mountain size={16} aria-hidden="true" />
              <span>{TEXTS.departure}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}