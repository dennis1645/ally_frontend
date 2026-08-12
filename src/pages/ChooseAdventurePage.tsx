import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Compass,
  FileQuestion,
  Mountain,
  Globe,
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

  // State untuk Bahasa
  const [language, setLanguage] = useState<"en" | "id">("en");

  // Translasi Teks
  const texts = {
    en: {
      badge: "New Expedition Awaits",
      title: "Choose Your Adventure",
      mainText: "Ready to begin your expedition? Or do you want to discover your scholarship readiness?",
      llyText: "lly",
      restText: " is here to guide you every step of the way.",
      btnChoose: "Choose an Adventure",
      btnBack: "Back",
      opt1Title: "Yes, I’m ready!",
      opt1Desc: "Create your <ally> account to unlock your personalized scholarship roadmap, AI guidance, milestone tracking, coaching, and progress management.",
      opt1Btn: "Start My Expedition",
      opt2Title: "I’m still considering…",
      opt2Desc: "Take a quick scholarship readiness assessment to discover how prepared you are before creating an account. It’s free and takes only five minutes!",
      opt2Btn: "Start Free Assessment"
    },
    id: {
      badge: "Ekspedisi Baru Menanti",
      title: "Pilih Petualanganmu",
      mainText: "Siap untuk memulai ekspedisi? Atau ingin mengetahui tingkat kesiapan beasiswamu terlebih dahulu?",
      llyText: "lly",
      restText: " hadir untuk memandumu di setiap langkah perjalanan.",
      btnChoose: "Pilih Petualangan",
      btnBack: "Kembali",
      opt1Title: "Ya, saya siap!",
      opt1Desc: "Buat akun <ally> kamu untuk membuka peta jalan beasiswa personal, panduan AI, pelacakan progres, dan bimbingan eksklusif.",
      opt1Btn: "Mulai Ekspedisiku",
      opt2Title: "Saya masih ragu...",
      opt2Desc: "Ikuti tes kesiapan beasiswa singkat untuk mengetahui potensimu sebelum membuat akun. Gratis dan hanya butuh lima menit!",
      opt2Btn: "Mulai Tes Gratis"
    }
  };

  const currentTexts = texts[language];

  const [displayedText, setDisplayedText] = useState("");
  const [subCharCount, setSubCharCount] = useState(0);

  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState<"intro" | "options">("intro");

  // Efek Typewriter Berurutan
  useEffect(() => {
    let isCancelled = false;

    // Reset teks
    setDisplayedText("");
    setSubCharCount(0);

    const runTypewriter = async () => {
      // 1. Ketik teks utama
      for (let i = 1; i <= currentTexts.mainText.length; i++) {
        if (isCancelled) return;
        setDisplayedText(currentTexts.mainText.slice(0, i));
        await new Promise((r) => setTimeout(r, 35));
      }

      if (isCancelled) return;
      await new Promise((r) => setTimeout(r, 350));

      // 2. Ketik baris bawah (Ally + sisa teks)
      const totalSubChars = 1 + currentTexts.llyText.length + currentTexts.restText.length;
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
  }, [currentTexts.mainText, currentTexts.restText, language]);

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
    setTimeout(() => {
      navigate(INITIAL_ASSESSMENT_ROUTE);
    }, 900);
  }

  function toggleLanguage() {
    setLanguage((prev) => (prev === "en" ? "id" : "en"));
  }

  return (
    <>
      <style>
        {`
          @keyframes textShimmerPause {
            0% { background-position: 200% center; }
            25% { background-position: -200% center; }
            100% { background-position: -200% center; }
          }
          .text-mengkilap {
            background: linear-gradient(120deg, #3d2514 30%, #d4a373 50%, #3d2514 70%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textShimmerPause 4s ease-in-out infinite;
          }
          @keyframes floatMascot {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-mascot { animation: floatMascot 4s ease-in-out infinite; }
          .hover-glow { transition: transform 0.4s ease, box-shadow 0.4s ease; }
          .hover-glow:hover {
            transform: translateY(-6px);
            box-shadow: 0 0 35px 10px rgba(188, 222, 255, 0.7), 0 10px 20px rgba(0,0,0,0.1);
            z-index: 30;
          }
          @keyframes mapZoomExit {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.1) translateY(-10px); opacity: 0; }
          }
          .page-exit { animation: mapZoomExit 0.9s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        `}
      </style>

      <div
        className={[
          "choose-adventure-page relative flex h-dvh min-h-0 overflow-hidden bg-[#f0e6d2] bg-cover bg-center bg-no-repeat font-sans text-[#3d2514] md:bg-fixed",
        ].join(" ")}
        style={{ backgroundImage: `url(${mapBackground})` }}
      >
        {/* Overlays */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-white/20" />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-80"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.55) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.55) 2px, transparent 2px)",
            backgroundSize: "120px 120px",
          }}
        />

        {/* Tombol Toggle Bahasa */}
        <button
          onClick={toggleLanguage}
          className="absolute right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/50 bg-[#fae8dd]/80 px-4 py-2 text-sm font-bold text-[#6a5a4a] shadow-sm backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 sm:right-6 sm:top-6"
        >
          <Globe size={18} />
          {language === "en" ? "EN" : "ID"}
        </button>

        <main
          className={[
            "choose-adventure-shell relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8",
            isNavigating ? "page-exit" : "",
          ].join(" ")}
        >
          {currentStep === "intro" ? (
            <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6 md:gap-7">
              <header className="flex shrink-0 flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-[#fae8dd] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6a5a4a] shadow-sm sm:px-4 sm:py-2 sm:text-xs md:text-sm">
                  <Compass size={16} strokeWidth={2} aria-hidden="true" />
                  {currentTexts.badge}
                </div>
                <h1 className="mt-3 pb-2 text-center text-3xl font-extrabold leading-normal tracking-[-0.04em] drop-shadow-sm sm:mt-4 sm:pb-3 sm:text-4xl md:text-5xl lg:text-6xl text-mengkilap">
  {currentTexts.title}
</h1>
              </header>

              <section aria-label="Message from Ally" className="relative w-[95%] max-w-2xl shrink-0">
                <div className="relative rounded-[24px] border-[3px] border-[#6c513e] bg-[#fae8dd] px-5 py-4 text-center shadow-[0_6px_14px_rgba(61,37,20,0.14)] sm:px-8 sm:py-6 md:px-10 md:py-8">
                  <div className="absolute -bottom-[11px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#6c513e] bg-[#fae8dd]" />
                  <p className="min-h-[3rem] text-sm leading-relaxed text-[#5a4332] sm:min-h-[4rem] sm:text-base md:text-lg md:leading-8">
                    {displayedText}
                  </p>
                  <p className="mt-3 min-h-[1.5rem] text-sm font-bold text-[#3d2514] sm:mt-4 sm:min-h-[2rem] sm:text-base md:text-xl">
                    {subCharCount >= 1 && <span className="font-black italic text-[#2a5aa3]">A</span>}
                    {subCharCount > 1 && (
                      <span className="ally-logo-lly text-[#2a5aa3]">
                        {currentTexts.llyText.slice(0, Math.max(0, subCharCount - 1))}
                      </span>
                    )}
                    {subCharCount > 4 && (
                      <span>{currentTexts.restText.slice(0, Math.max(0, subCharCount - 4))}</span>
                    )}
                  </p>
                </div>
              </section>

             <div className="flex flex-col items-center">
                <div className="flex h-[130px] w-[130px] shrink-0 items-center justify-center sm:h-[170px] sm:w-[170px] md:h-[200px] md:w-[200px]">
                  <img src={allyMascot} alt="Ally mascot" className="animate-mascot h-full w-full object-contain drop-shadow-xl" />
                </div>
                
                {/* Tambahkan -mt-4 sm:-mt-6 md:-mt-8 di sini untuk menarik tombolnya naik dan mepet ke maskot */}
                <button
                  type="button"
                  onClick={() => setCurrentStep("options")}
                  className="-mt-4 sm:-mt-6 md:-mt-8 shrink-0 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-b-4 border-[#3270c5] bg-[#6ba8e6] px-6 text-sm font-extrabold text-[#183954] shadow-sm transition hover:bg-[#5d9fe0] active:translate-y-[2px] active:border-b-2 sm:min-h-[48px] sm:gap-3 sm:px-7 sm:text-base"
                >
                  {currentTexts.btnChoose}
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => setCurrentStep("intro")}
                className="mb-4 shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-[#5a4332] transition hover:bg-white/60 sm:mb-6"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                {currentTexts.btnBack}
              </button>

             {/* Kartu Pilihan - Tinggi Disamakan (Equal Height) */}
              <section aria-label="Choose how to continue" className="relative z-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                
                {/* KARTU 1 */}
                {/* Ditambah h-full dan [&>*]:h-full agar kartunya merata ukurannya */}
                <div className="hover-glow h-full cursor-pointer rounded-[24px] [&>*]:h-full">
                  <AdventureOptionCard
                    icon={<Mountain size={36} fill="currentColor" strokeWidth={1.6} aria-hidden="true" className="sm:h-10 sm:w-10" />}
                    title={currentTexts.opt1Title}
                    description={
                      <p className="text-sm leading-relaxed text-[#5a4332] sm:text-base md:text-[17px]">
                        {language === "en" ? (
                          <>
                            Create your <span className="font-extrabold italic text-[#2a5aa3]">Ally</span> account to unlock your personalized scholarship roadmap, AI guidance, milestone tracking, coaching, and progress management.
                          </>
                        ) : (
                          <>
                            Buat akun <span className="font-extrabold italic text-[#2a5aa3]">Ally</span> kamu untuk membuka peta jalan beasiswa personal, panduan AI, pelacakan progres, dan bimbingan eksklusif.
                          </>
                        )}
                      </p>
                    }
                    buttonLabel={currentTexts.opt1Btn}
                    buttonIcon={<ArrowRight size={18} aria-hidden="true" className="sm:h-5 sm:w-5" />}
                    variant="primary"
                    onClick={handleStartExpedition}
                  />
                </div>

                {/* KARTU 2 */}
                {/* Ditambah h-full dan [&>*]:h-full agar kartunya merata ukurannya */}
                <div className="hover-glow h-full cursor-pointer rounded-[24px] [&>*]:h-full">
                  <AdventureOptionCard
                    icon={<FileQuestion size={34} strokeWidth={2} aria-hidden="true" className="sm:h-9 sm:w-9" />}
                    title={currentTexts.opt2Title}
                    description={
                      <p className="text-sm leading-relaxed text-[#5a4332] sm:text-base md:text-[17px]">
                        {currentTexts.opt2Desc}
                      </p>
                    }
                    buttonLabel={currentTexts.opt2Btn}
                    buttonIcon={<BarChart3 size={18} aria-hidden="true" className="sm:h-5 sm:w-5" />}
                    variant="outline"
                    onClick={handleStartFreeAssessment}
                  />
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}