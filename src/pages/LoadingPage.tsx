import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import mapBackground from "../assets/world-map.png";
import allyMascot from "../assets/ally-assessment-mascot.png";

const loadingTips = [
  "Packing motivation letters...",
  "Translating academic transcripts...",
  "Consulting the scholarship map...",
  "Preparing passport and compass...",
];

export default function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Global loading destination. Falls back to the landing page.
  const redirectTo = location.state?.redirectTo || "/landing";

  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Progress bar animation + redirect.
  useEffect(() => {
    const barTimer = setTimeout(() => {
      setProgress(100);
    }, 100);

    const navTimer = setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 3000);

    return () => {
      clearTimeout(barTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, redirectTo]);

  // Rotate loading tips.
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 800);

    return () => clearInterval(tipInterval);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes floatUp {
            0% {
              transform: translateY(100vh) scale(0.5);
              opacity: 0;
            }

            20% {
              opacity: 0.8;
            }

            80% {
              opacity: 0.8;
            }

            100% {
              transform: translateY(-10vh) scale(1.2) rotate(15deg);
              opacity: 0;
            }
          }

          .particle {
            position: absolute;
            font-size: 2.5rem;
            animation: floatUp 3s linear infinite;
            z-index: 0;
          }

          @keyframes textShimmer {
            0% {
              background-position: 200% center;
            }

            100% {
              background-position: -200% center;
            }
          }

          .text-mengkilap {
            background: linear-gradient(
              120deg,
              #3d2514 20%,
              #d4a373 50%,
              #3d2514 80%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textShimmer 3s linear infinite;
          }

          @keyframes mascotBob {
            0%,
            100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-5px);
            }
          }

          .loading-ally-mascot {
            animation: mascotBob 1.15s ease-in-out infinite;
            filter: drop-shadow(0 8px 8px rgba(61, 37, 20, 0.18));
          }
        `}
      </style>

      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f0e6d2] bg-cover bg-center bg-no-repeat font-sans"
        style={{
          backgroundImage: `url(${mapBackground})`,
        }}
      >
        {/* Background overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-white/20" />

        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.6) 2px, transparent 2px)",
            backgroundSize: "100px 100px",
          }}
        />

        {/* Floating particles */}
        <div
          className="particle"
          style={{
            left: "10%",
            animationDelay: "0s",
            animationDuration: "4s",
          }}
        >
          📜
        </div>

        <div
          className="particle"
          style={{
            left: "30%",
            animationDelay: "1.5s",
            animationDuration: "3.5s",
          }}
        >
          🧭
        </div>

        <div
          className="particle"
          style={{
            left: "50%",
            animationDelay: "0.5s",
            animationDuration: "4.2s",
          }}
        >
          🎓
        </div>

        <div
          className="particle"
          style={{
            left: "70%",
            animationDelay: "2s",
            animationDuration: "3.8s",
          }}
        >
          🗺️
        </div>

        <div
          className="particle"
          style={{
            left: "85%",
            animationDelay: "1s",
            animationDuration: "4.5s",
          }}
        >
          ✈️
        </div>

        {/* Main content */}
        <main className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
          {/* Loading title */}
          <div className="mb-14 text-center">
            <h1 className="text-mengkilap text-4xl font-extrabold tracking-tight sm:text-5xl">
              Expedition
            </h1>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-[#7a582f]">
              Loading...
            </p>
          </div>

          {/* Progress bar + moving Ally mascot */}
          <div className="relative mt-8 w-full">
            <div
              className="absolute bottom-full z-20 mb-1 transition-all ease-linear"
              style={{
                /*
                 * Keep the full mascot safely inside the bar at both ends,
                 * instead of letting half of it overflow at 0% / 100%.
                 */
                left: `calc(8% + ${progress * 0.84}%)`,
                transform: "translateX(-50%)",
                transitionDuration: "2.5s",
              }}
            >
              <img
                src={allyMascot}
                alt="Ally mascot"
                className="loading-ally-mascot h-auto w-[88px] select-none object-contain sm:w-[104px]"
                draggable={false}
              />
            </div>

            {/* Progress bar */}
            <div className="relative h-6 w-full overflow-hidden rounded-full border-[3px] border-[#6c513e] bg-[#fae8dd] p-[2px] shadow-[0_4px_10px_rgba(61,37,20,0.1)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#cfa163] to-[#e8c07d] transition-all ease-linear"
                style={{
                  width: `${progress}%`,
                  transitionDuration: "2.5s",
                }}
              />
            </div>
          </div>

          {/* Loading tip */}
          <div className="mt-8 h-8 text-center">
            <p className="animate-pulse text-sm font-semibold italic text-[#5a4332] drop-shadow-sm">
              {loadingTips[tipIndex]}
            </p>
          </div>
        </main>
      </div>
    </>
  );
}