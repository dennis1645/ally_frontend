import { useState, useEffect } from "react";
import {
  Compass,
  Mountain,
  ChevronDown,
} from "lucide-react";

import { useNavigate } from "react-router";

import worldMap from "../assets/world-map.png";
import allyMascot from "../assets/ally-explorer.png";

import PrimaryButton from "../components/ui/PrimaryButton";

import { useAuth } from "../context/AuthContext";
import { getHomePathForUser } from "../utils/authRouting";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, status } = useAuth();

  // State untuk indikator scroll dinamis
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  // Text untuk Typewriter
  const fullTitle = "Are you ready for your Scholarship Journey?";
  const fullBody =
    "I'm your companion for this journey. Together, we'll reach the summit of your dream scholarship!";

  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedBody, setDisplayedBody] = useState("");

  // Listener untuk Typewriter Berurutan (Async/Await lebih aman dari bug Strict Mode)
  useEffect(() => {
    let isCancelled = false;

    const typeText = async () => {
      // 1. Ketik Judul terlebih dahulu
      for (let i = 1; i <= fullTitle.length; i++) {
        if (isCancelled) return;
        setDisplayedTitle(fullTitle.substring(0, i));
        await new Promise((resolve) => setTimeout(resolve, 35));
      }

      // 2. Jeda sejenak (400ms) sebelum mengetik teks bawahnya
      if (isCancelled) return;
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 3. Ketik Body/Paragraf
      for (let i = 1; i <= fullBody.length; i++) {
        if (isCancelled) return;
        setDisplayedBody(fullBody.substring(0, i));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    };

    typeText();

    return () => {
      // Cleanup untuk mencegah memory leak / double-typing
      isCancelled = true;
    };
  }, []);

  // Listener untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      className={[
        // PERBAIKAN: overflow-hidden diubah jadi overflow-x-hidden agar halaman bisa discroll ke bawah
        "landing-map relative flex min-h-dvh overflow-x-hidden",
        "bg-cover bg-center bg-no-repeat",
      ].join(" ")}
      style={{
        backgroundImage: `url(${worldMap})`,
      }}
    >
      {/* Light overlay improves text readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/10"
      />

      {/* Indikator Scroll Dinamis (Fixed di Pojok Kanan Bawah) */}
      <div
        className={`fixed bottom-10 right-6 z-50 flex animate-bounce flex-col items-center transition-all duration-500 sm:right-10 ${
          showScrollArrow
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <span className="mb-1 rounded-full bg-white/70 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#3d2514] shadow-sm backdrop-blur-sm">
          Scroll
        </span>
        <ChevronDown
          size={28}
          strokeWidth={3}
          className="mt-1 text-[#3d2514] drop-shadow-md"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center px-5 py-8 sm:px-8 sm:py-12">
        {/* Ally logo */}
        <header className="text-center">
          <div>
            <span
              className="ally-logo text-[62px] leading-none"
              role="img"
              aria-label="Ally"
            >
              <span aria-hidden="true" className="ally-logo-a">
                A
              </span>
              <span aria-hidden="true" className="ally-logo-lly">
                lly
              </span>
            </span>
          </div>

          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a582f] sm:text-sm">
            Scholarship Expedition
          </p>
        </header>

        {/* Main welcome area */}
        <section className="mt-12 flex w-full flex-1 flex-col items-center justify-center sm:mt-16">
          {/* Speech bubble */}
          <div className="landing-speech-bubble w-full max-w-2xl">
            {/* PERBAIKAN: Ditambah min-h agar bubble tidak lompat ukurannya saat teks diketik */}
            <h2 className="min-h-[1.75rem] text-xl font-bold leading-snug text-[#2c1607] sm:min-h-[2rem] sm:text-2xl">
              {displayedTitle}
            </h2>

            <p className="mt-4 min-h-[4.5rem] text-base leading-relaxed text-[#414750] sm:min-h-[3.5rem] sm:text-lg">
              {displayedBody}
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
              isLoading={status === "loading"}
              loadingText="Preparing..."
              rightIcon={
                <Compass size={21} aria-hidden="true" />
              }
              onClick={handleBeginExpedition}
              className="min-w-[240px] text-lg"
            >
              Begin Expedition
            </PrimaryButton>

            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#7a582f]/75">
              <Mountain size={17} aria-hidden="true" />
              <span>Ready for Departure</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}