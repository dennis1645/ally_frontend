import {
  Award,
  CheckCircle2,
  GraduationCap,
  Radar,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";

/* =========================================================
   Types
========================================================= */
type GuideProfile = {
  id: string;
  name: string;
  title: string;
  degree: string;
  scholarship: string;
  avatar: string;
};

type MentorMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onMatchSuccess: (guide: GuideProfile) => void;
};

// Simulasi Data Mentor yang didapat dari AI
const MATCHED_GUIDE: GuideProfile = {
  id: "g-101",
  name: "Dr. Eleanor Vance",
  title: "Senior Scholarship Guide",
  degree: "Master of Food Science, Wageningen University",
  scholarship: "LPDP Awardee 2024",
  avatar: "https://i.pravatar.cc/150?u=eleanor",
};

/* =========================================================
   Main Component
========================================================= */
export default function MentorMatchModal({ isOpen, onClose, onMatchSuccess }: MentorMatchModalProps) {
  // Status: 'idle' -> 'scanning' -> 'analyzing' -> 'found'
  const [matchStatus, setMatchStatus] = useState<"idle" | "scanning" | "analyzing" | "found">("idle");

  useEffect(() => {
    if (!isOpen) {
      setMatchStatus("idle");
      return;
    }

    // Sequence Animasi Loading AI
    setMatchStatus("scanning");
    
    const timer1 = setTimeout(() => {
      setMatchStatus("analyzing");
    }, 2000); // Setelah 2 detik, ganti teks

    const timer2 = setTimeout(() => {
      setMatchStatus("found");
    }, 4500); // Setelah 4.5 detik, mentor ketemu!

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
      
      {/* =======================================
          STATE: LOADING / MATCHING
      ======================================= */}
      {(matchStatus === "scanning" || matchStatus === "analyzing") && (
        <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl animate-[zoomIn_0.3s_ease-out]">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#eef7ff] text-[#16629b]">
            <Radar size={40} className="animate-[spin_3s_linear_infinite]" />
            {/* Efek Ping (Gelombang Radar) */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16629b] opacity-20"></span>
          </div>
          
          <h3 className="mb-2 text-2xl font-extrabold text-[#2c1607]">
            {matchStatus === "scanning" ? "Scanning Profile..." : "Analyzing Best Fit..."}
          </h3>
          <p className="text-sm font-medium text-[#6b6670]">
            Ally AI is finding the perfect expedition guide for your background and goals.
          </p>
        </div>
      )}

      {/* =======================================
          STATE: FOUND (SUCCESS)
      ======================================= */}
      {matchStatus === "found" && (
        <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-2xl animate-[zoomIn_0.4s_ease-out]">
          
          {/* Badge Success */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f3e8] text-green-600 shadow-inner">
            <CheckCircle2 size={40} className="animate-[bounce_1s_ease-in-out_infinite]" />
          </div>

          <div className="mb-2 flex items-center justify-center gap-2 text-[#16629b]">
            <Sparkles size={20} className="animate-pulse" />
            <h3 className="text-2xl font-extrabold text-[#2c1607]">We found your Guide!</h3>
            <Sparkles size={20} className="animate-pulse" />
          </div>
          
          <p className="mb-8 text-sm text-[#6b6670]">
            Based on your expedition map, we matched you with a mentor who walked the exact same path.
          </p>

          {/* Kartu Profil Mentor */}
          <div className="relative mb-8 rounded-2xl border-2 border-[#ead3bd] bg-[#fff8f5] p-5 shadow-sm transition-transform hover:-translate-y-1">
            <img 
              src={MATCHED_GUIDE.avatar} 
              alt={MATCHED_GUIDE.name} 
              className="absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border-4 border-white shadow-md"
            />
            
            <div className="mt-8">
              <h4 className="text-xl font-extrabold text-[#2c1607]">{MATCHED_GUIDE.name}</h4>
              <p className="mb-4 text-sm font-bold text-[#16629b]">{MATCHED_GUIDE.title}</p>
              
              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 text-sm shadow-sm border border-slate-100">
                  <GraduationCap size={18} className="mt-0.5 shrink-0 text-[#8b5e3c]" />
                  <span className="font-medium text-slate-700">{MATCHED_GUIDE.degree}</span>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 text-sm shadow-sm border border-slate-100">
                  <Award size={18} className="mt-0.5 shrink-0 text-[#d97706]" />
                  <span className="font-medium text-slate-700">{MATCHED_GUIDE.scholarship}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onMatchSuccess(MATCHED_GUIDE);
              onClose();
            }}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 font-bold text-white shadow-[0_5px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none"
          >
            Meet Your Guide
          </button>

        </div>
      )}

      {/* CSS untuk Animasi Zoom In */}
      <style>
        {`
          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}