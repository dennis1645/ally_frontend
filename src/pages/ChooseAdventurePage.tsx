import { useState, useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  Compass,
  FileQuestion,
  Mountain,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router";

import mapBackground from "../assets/world-map.png";
import allyMascot from "../assets/ally-explorer.png";

import { AdventureOptionCard } from "../components/adventure/AdventureOptionCard";
import { INITIAL_ASSESSMENT_ROUTE } from "../routes/assessment.routes";
import { useDiagnosticGuestToken } from "../hooks/useDiagnosticGuestToken";
import { resetAssessmentProgress } from "../utils/resetAssessmentProgress";

export default function ChooseAdventurePage() {
  const navigate = useNavigate();
  const { createNewGuestToken } = useDiagnosticGuestToken();

  // Teks untuk Typewriter
  const fullText =
    "Ready to begin your expedition? Or do you want to discover your scholarship readiness?";
  const fullLly = "lly";
  const fullRestText = " is here to guide you every step of the way.";

  // State untuk Typewriter
  const [displayedText, setDisplayedText] = useState("");
  const [subCharCount, setSubCharCount] = useState(0);

  // State untuk animasi & UI
  const [isNavigating, setIsNavigating] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  // Efek Typewriter Berurutan
  useEffect(() => {
    let isCancelled = false;

    const runTypewriter = async () => {
      // 1. Ketik teks utama di bagian atas
      for (let i = 1; i <= fullText.length; i++) {
        if (isCancelled) return;
        setDisplayedText(fullText.slice(0, i));
        await new Promise((r) => setTimeout(r, 35));
      }

      // 2. Jeda singkat sebelum mengetik baris bawah
      if (isCancelled) return;
      await new Promise((r) => setTimeout(r, 350));

      // 3. Ketik baris bawah (1 'A' + 3 'lly' + sisa kalimat)
      const totalSubChars = 1 + fullLly.length + fullRestText.length;
      for (let i = 1; i <= totalSubChars; i++) {
        if (isCancelled) return;
        setSubCharCount(i);
        await new Promise((r) => setTimeout(r, 35));
      }
    };

    runTypewriter();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Efek Deteksi Scroll
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

  function handleStartExpedition(): void {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/auth?mode=register");
    }, 900);
  }

  function handleStartFreeAssessment(): void {
    setIsNavigating(true);
    resetAssessmentProgress();
    const guestToken = createNewGuestToken();

    if (import.meta.env.DEV) {
      console.info("[Diagnostic] New assessment attempt created.", {
        has_guest_token: Boolean(guestToken),
      });
    }

    setTimeout(() => {
      navigate(INITIAL_ASSESSMENT_ROUTE);
    }, 900);
  }

  return (
    <>
      <style>
        {`
          /* Animasi Teks Mengkilap: Kilap cepat, jeda ~3 detik */
          @keyframes textShimmerPause {
            0% { background-position: 200% center; }
            25% { background-position: -200% center; }
            100% { background-position: -200% center; }
          }
          .text-mengkilap {
            background: linear-gradient(
              120deg, 
              #3d2514 30%, 
              #d4a373 50%, 
              #3d2514 70%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textShimmerPause 4s ease-in-out infinite;
          }

          /* Animasi Maskot Mengambang */
          @keyframes floatMascot {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-mascot {
            animation: floatMascot 4s ease-in-out infinite;
          }

          /* HOVER EFFECT: Cahaya Glow untuk kedua tombol */
          .hover-glow {
            transition: transform 0.4s ease, box-shadow 0.4s ease;
          }
          .hover-glow:hover {
            transform: translateY(-6px);
            box-shadow: 0 0 35px 10px rgba(188, 222, 255, 0.7), 0 10px 20px rgba(0,0,0,0.1);
            z-index: 30;
          }

          /* TRANSISI PINDAH HALAMAN: Dibuat 0.9s agar pelan & cinematic */
          @keyframes mapZoomExit {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.1) translateY(-10px);
              opacity: 0;
            }
          }
          .page-exit {
            animation: mapZoomExit 0.9s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
        `}
      </style>

      <div
        className={[
          "relative min-h-screen overflow-x-hidden",
          "bg-[#f0e6d2] bg-cover bg-center bg-no-repeat",
          "font-sans text-[#3d2514] md:bg-fixed",
        ].join(" ")}
        style={{
          backgroundImage: `url(${mapBackground})`,
        }}
      >
        {/* Background Overlays */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-white/10 z-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-80 z-0"
          style={{
            backgroundImage: [
              "linear-gradient(rgba(255,255,255,0.55) 2px, transparent 2px)",
              "linear-gradient(90deg, rgba(255,255,255,0.55) 2px, transparent 2px)",
            ].join(", "),
            backgroundSize: "120px 120px",
          }}
        />

        {/* Indikator Scroll Dinamis di Pojok Kanan Bawah */}
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

        {/* Konten Utama */}
        <main 
          className={[
            "relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8",
            isNavigating ? "page-exit" : ""
          ].join(" ")}
        >
          
          {/* Badge */}
          <div
            className={[
              "inline-flex items-center gap-2 rounded-full",
              "border border-white/70 bg-[#fae8dd]",
              "px-4 py-2 text-xs font-semibold uppercase",
              "tracking-[0.08em] text-[#6a5a4a]",
              "shadow-sm sm:text-sm",
            ].join(" ")}
          >
            <Compass size={16} strokeWidth={2} aria-hidden="true" />
            New Expedition Awaits
          </div>

          {/* Title dengan Efek Mengkilap */}
          <h1
            className={[
              "mt-5 text-center text-4xl font-extrabold",
              "tracking-[-0.04em] drop-shadow-sm sm:text-5xl lg:text-6xl",
              "text-mengkilap"
            ].join(" ")}
          >
            Choose Your Adventure
          </h1>

          {/* Bubble Chat */}
          <section aria-label="Message from Ally" className="relative mt-8 w-full max-w-2xl">
            <div
              className={[
                "relative rounded-[28px] border-[3px]",
                "border-[#6c513e] bg-[#fae8dd]",
                "px-6 py-7 text-center",
                "shadow-[0_6px_14px_rgba(61,37,20,0.14)]",
                "sm:px-10 sm:py-8",
              ].join(" ")}
            >
              {/* Teks Utama */}
              <p className="min-h-[4rem] text-base leading-7 text-[#5a4332] sm:min-h-[4rem] sm:text-xl sm:leading-8">
                {displayedText}
              </p>

              {/* Typewriter untuk "Ally is here to guide you every step of the way." */}
              <p className="mt-5 min-h-[2rem] text-lg font-bold text-[#3d2514] sm:text-xl">
                {/* 1. Huruf 'A' */}
                {subCharCount >= 1 && (
                  <span className="text-[#2a5aa3] font-black italic">
                    A
                  </span>
                )}

                {/* 2. Huruf 'lly' dengan styling Sansita Swashed */}
                {subCharCount > 1 && (
                  <span className="ally-logo-lly text-[#2a5aa3]">
                    {fullLly.slice(0, Math.max(0, subCharCount - 1))}
                  </span>
                )}

                {/* 3. Sisa kalimat */}
                {subCharCount > 4 && (
                  <span>
                    {fullRestText.slice(0, Math.max(0, subCharCount - 4))}
                  </span>
                )}
              </p>

              {/* Tail */}
              <div aria-hidden="true" className="absolute left-1/2 top-full -translate-x-1/2">
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

          {/* Maskot */}
          <div className="relative mt-7 flex h-52 w-full items-end justify-center sm:h-60">
            <div className="h-full">
              <img
                src={allyMascot}
                alt="Ally the explorer mascot"
                className="animate-mascot h-full max-w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Kartu Pilihan */}
          <section
            aria-label="Choose how to continue"
            className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 relative z-20"
          >
            <div className="hover-glow cursor-pointer rounded-[24px]">
              <AdventureOptionCard
                icon={<Mountain size={41} fill="currentColor" strokeWidth={1.6} aria-hidden="true" />}
                title="Yes, I’m ready!"
                description={
                  <p>
                    Create your{" "}
                    <span className="font-extrabold italic text-[#2a5aa3]">Ally</span>{" "}
                    account to unlock your personalized scholarship roadmap, AI
                    guidance, milestone tracking, coaching, and progress
                    management.
                  </p>
                }
                buttonLabel="Start My Expedition"
                buttonIcon={<ArrowRight size={21} aria-hidden="true" />}
                variant="primary"
                onClick={handleStartExpedition}
              />
            </div>

            <div className="hover-glow cursor-pointer rounded-[24px]">
              <AdventureOptionCard
                icon={<FileQuestion size={39} strokeWidth={2} aria-hidden="true" />}
                title="I’m still considering…"
                description={
                  <p>
                    Take a quick scholarship readiness assessment to discover how
                    prepared you are before creating an account. It’s free and
                    takes only five minutes!
                  </p>
                }
                buttonLabel="Start Free Assessment"
                buttonIcon={<BarChart3 size={20} aria-hidden="true" />}
                variant="outline"
                onClick={handleStartFreeAssessment}
              />
            </div>
          </section>

        </main>
      </div>
    </>
  );
}