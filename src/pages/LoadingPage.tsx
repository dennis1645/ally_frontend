import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import mapBackground from "../assets/world-map.png";
import allyMascot from "../assets/ally-explorer.png";

const loadingTips = [
  "Packing motivation letters...",
  "Translating academic transcripts...",
  "Consulting the scholarship map...",
  "Preparing passport and compass...",
];

export default function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // LOGIKA GLOBAL LOADING: Mengambil tujuan dari state, kalau tidak ada default ke "/"
const redirectTo = location.state?.redirectTo || "/landing";

  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Timer Progress Bar (Total 3 Detik)
  useEffect(() => {
    // 1. Animasi bar dari 0 ke 100
    const barTimer = setTimeout(() => {
      setProgress(100);
    }, 100);

    // 2. Pindah ke halaman tujuan setelah 3 detik
    const navTimer = setTimeout(() => {
      // Gunakan replace: true agar user tidak bisa klik tombol "Back" ke loading screen
      navigate(redirectTo, { replace: true });
    }, 3000);

    return () => {
      clearTimeout(barTimer);
      clearTimeout(navTimer);
    };
  }, [navigate, redirectTo]);

  // Efek ganti teks tips
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
          /* Animasi Emoji Floating */
          @keyframes floatUp {
            0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { transform: translateY(-10vh) scale(1.2) rotate(15deg); opacity: 0; }
          }
          .particle {
            position: absolute;
            font-size: 2.5rem;
            animation: floatUp 3s linear infinite;
            z-index: 0;
          }

          /* Teks Shimmer Mengkilap */
          @keyframes textShimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
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
        `}
      </style>

      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f0e6d2] bg-cover bg-center bg-no-repeat font-sans"
        style={{ backgroundImage: `url(${mapBackground})` }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-white/20 z-0 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-70 z-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.6) 2px, transparent 2px)",
            backgroundSize: "100px 100px",
          }}
        />

        {/* Floating Particles */}
        <div className="particle" style={{ left: '10%', animationDelay: '0s', animationDuration: '4s' }}>📜</div>
        <div className="particle" style={{ left: '30%', animationDelay: '1.5s', animationDuration: '3.5s' }}>🧭</div>
        <div className="particle" style={{ left: '50%', animationDelay: '0.5s', animationDuration: '4.2s' }}>🎓</div>
        <div className="particle" style={{ left: '70%', animationDelay: '2s', animationDuration: '3.8s' }}>🗺️</div>
        <div className="particle" style={{ left: '85%', animationDelay: '1s', animationDuration: '4.5s' }}>✈️</div>

        {/* Konten Utama */}
        <main className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
          
          {/* Teks Loading dengan Efek Shimmer */}
          <div className="mb-14 text-center">
            <h1 className="text-mengkilap text-4xl font-extrabold tracking-tight sm:text-5xl">
              Expedition
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-[#7a582f]">
              Loading...
            </p>
          </div>

          {/* Area Progress Bar & Icon Wajah */}
          <div className="relative mt-8 w-full">
            
            {/* Wajah Maskot (Dicrop menggunakan CSS) yang bergerak mulus */}
            <div 
              className="absolute bottom-full mb-2 transition-all ease-linear"
              style={{ 
                left: `${progress}%`,
                transform: 'translateX(-50%)',
                transitionDuration: '2.5s'
              }} 
            >
              {/* Lingkaran pembungkus untuk memotong wajah */}
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-[#6c513e] bg-[#fae8dd] shadow-md sm:h-16 sm:w-16">
                <img
                  src={allyMascot}
                  alt="Ally face"
                  /* Trik scaling dan translateY agar fokus ke area kepala gambar full-body */
                  className="max-w-none scale-[1.8] origin-top -translate-y-1 object-cover"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>

            {/* Progress Bar Elegan (Rounded Pill) */}
            <div className="relative h-6 w-full overflow-hidden rounded-full border-[3px] border-[#6c513e] bg-[#fae8dd] p-[2px] shadow-[0_4px_10px_rgba(61,37,20,0.1)]">
              {/* Isian Bar */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#cfa163] to-[#e8c07d] transition-all ease-linear"
                style={{ 
                  width: `${progress}%`,
                  transitionDuration: '2.5s'
                }}
              />
            </div>
          </div>

          {/* Teks Quest (Halus) */}
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