import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import allyMascot from "../../assets/ally-assessment-mascot.png";
import UserLayout from "../../components/layout/UserLayout";

/* =========================================================
   Types & Mock Data
========================================================= */

type TaskData = {
  id: string;
  title: string;
  milestoneName: string;
  allyInitialPrompt: string;
};

// Simulasi data dari Backend berdasarkan Milestone ID
const MILESTONE_TASKS: Record<string, TaskData> = {
  "m1": {
    id: "m1",
    milestoneName: "Research Trail",
    title: "Define Your Expedition Goals",
    allyInitialPrompt: "Welcome to the Research Trail! To conquer this first milestone, please write a brief summary of your target study program and why it fits your background. You can also upload your initial research document below.",
  },
  "m2": {
    id: "m2",
    milestoneName: "Document Valley",
    title: "Prepare Your Core Documents",
    allyInitialPrompt: "You've reached Document Valley! Here, we need to ensure your CV and recommendation letters are rock solid. Draft your CV summary or upload your current documents for a quick scan.",
  },
  "m3": {
    id: "m3",
    milestoneName: "Essay Summit",
    title: "Draft Your Motivation Letter",
    allyInitialPrompt: "The Essay Summit! This is a crucial step. Draft your motivation letter below or upload your current draft. I'll act as your AI Checker to review the structure and highlight what's missing.",
  },
};

/* =========================================================
   Main Component
========================================================= */

export default function MilestoneTaskPage() {
  const navigate = useNavigate();
  // Anggap kita mendapat ID milestone dari URL, misalnya /milestone-task/m3
  const { milestoneId } = useParams(); 
  
  // Default ke 'm3' (Essay Summit) jika tidak ada ID untuk keperluan demo
  const currentTask = MILESTONE_TASKS[milestoneId || "m3"];

  // Form States
  const [textDraft, setTextDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Checker States
  const [isChecking, setIsChecking] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  // Typewriter States
  const [fullMessage, setFullMessage] = useState(currentTask.allyInitialPrompt);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  /* =======================================================
     Typewriter Effect Logic
  ======================================================= */
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullMessage.length) {
        setDisplayedText(fullMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 25); // Kecepatan ketik (25ms per karakter)

    return () => clearInterval(typingInterval);
  }, [fullMessage]);

  const handleReveal = () => {
    setDisplayedText(fullMessage);
    setIsTyping(false);
  };

  /* =======================================================
     File Upload Logic
  ======================================================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Ukuran (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB limit.");
      return;
    }

    // Validasi Ekstensi (.pdf, .doc, .docx, .jpg, .jpeg)
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setFileError("Invalid file format. Please upload PDF, DOC, or JPG.");
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* =======================================================
     AI Checker Logic
  ======================================================= */
  const handleAICheck = () => {
    if (!textDraft.trim() && !selectedFile) return;

    setIsChecking(true);
    setHasFeedback(false);
    
    // Simulasi loading AI
    setTimeout(() => {
      setIsChecking(false);
      setHasFeedback(true);
      // Mengubah pesan Ally menjadi hasil feedback
      setFullMessage("I've reviewed your submission! The overall tone is great, but there are a few missing elements. Look at the highlighted feedback below to improve your draft.");
    }, 2500);
  };

  /* =======================================================
     UI Render
  ======================================================= */
  return (
    <UserLayout
      title={currentTask.milestoneName}
      subtitle="Quest Task"
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-[#fff8f5] relative overflow-hidden">
        
        {/* Latar Belakang Estetik (Vibe Ekspedisi) */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#e3f0f8] to-[#fff8f5] pointer-events-none opacity-60" />

        <div className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-10">
          
          {/* Header Navigasi */}
          <button 
            onClick={() => navigate("/quest-tracker")}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-[#6b6670] hover:text-[#16629b] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Quest Map
          </button>

          <div className="mb-8">
            <span className="inline-block rounded-full bg-[#eef7ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#16629b] mb-2">
              Current Milestone
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2c1607] sm:text-4xl">
              {currentTask.title}
            </h1>
          </div>

          {/* =======================================
              ALLY'S BUBBLE CHAT
          ======================================= */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-[#f1d8c7] bg-[#ffe3d2] p-1.5 shadow-[3px_4px_0_#d1c0aa]">
              <img src={allyMascot} alt="Ally" className="h-full w-full object-contain" />
            </div>

            <div className="relative flex-1">
              {/* Segitiga Bubble (Desktop) */}
              <div className="absolute left-[-9px] top-6 hidden h-5 w-5 rotate-45 border-b border-l border-[#ecdcd1] bg-white sm:block" />
              
              <div className="relative rounded-2xl border-2 border-[#ecdcd1] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 mb-2 text-[#16629b]">
                    <Sparkles size={16} />
                    <span className="text-sm font-bold">Ally AI Guide</span>
                  </div>
                  {isTyping && (
                    <button 
                      onClick={handleReveal}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#8a7a6d] hover:text-[#2c1607] transition-colors bg-slate-100 px-2 py-1 rounded-md"
                    >
                      Reveal
                    </button>
                  )}
                </div>
                
                <p className="text-sm leading-relaxed text-[#4c5159] sm:text-base min-h-[48px]">
                  {displayedText}
                  {isTyping && <span className="animate-[blink_1s_infinite] border-r-2 border-[#2c1607] ml-0.5" />}
                </p>

                {/* TAMPILAN HIGHLIGHT FEEDBACK JIKA SUDAH DICEK */}
                {hasFeedback && !isTyping && (
                  <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4 animate-[fadeIn_0.5s_ease-out]">
                    <h4 className="text-sm font-bold text-rose-800 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} /> Improvement Areas Detected:
                    </h4>
                    <ul className="space-y-3 text-sm text-rose-700">
                      <li className="flex gap-2">
                        <span className="font-bold shrink-0">1.</span>
                        <span>Your motivation letter lacks a strong <span className="bg-rose-200 px-1 rounded font-bold text-rose-900">Hook</span> in the first paragraph. Try starting with a personal anecdote.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold shrink-0">2.</span>
                        <span>The connection to the <span className="bg-rose-200 px-1 rounded font-bold text-rose-900">University's Core Values</span> is missing. Mention specific labs or professors.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =======================================
              INPUT TASK AREA
          ======================================= */}
          <div className="rounded-[28px] border-2 border-[#ead3bd] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-extrabold text-[#2c1607] mb-6">Your Submission</h2>

            <div className="grid gap-8 lg:grid-cols-2">
              
              {/* Kolom 1: Long Text Draft */}
              <div className="flex flex-col h-full">
                <label className="mb-2 block text-sm font-bold text-[#6b6670]">
                  Draft your response here
                </label>
                <textarea
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder="Start typing your draft..."
                  className="w-full flex-1 min-h-[250px] resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 outline-none transition-colors focus:border-[#16629b] focus:bg-white"
                />
              </div>

              {/* Kolom 2: Upload File */}
              <div className="flex flex-col h-full">
                <label className="mb-2 block text-sm font-bold text-[#6b6670]">
                  Or upload a document
                </label>
                
                <div className="relative flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors hover:bg-slate-100">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />
                  
                  {!selectedFile ? (
                    <>
                      <div className="mb-4 rounded-full bg-white p-3 shadow-sm border border-slate-200 text-[#16629b]">
                        <UploadCloud size={32} />
                      </div>
                      <p className="text-sm font-bold text-[#2c1607]">Click to upload or drag and drop</p>
                      <p className="mt-1 text-xs text-slate-500">PDF, JPG, or DOC (max. 5MB)</p>
                    </>
                  ) : (
                    <div className="z-20 flex w-full max-w-[250px] flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef7ff] text-[#16629b] border border-[#cbe5fb]">
                        <FileText size={32} />
                      </div>
                      <p className="text-sm font-bold text-[#2c1607] truncate w-full px-2">{selectedFile.name}</p>
                      <button
                        onClick={removeFile}
                        className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        <X size={14} /> Remove file
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Pesan Error Upload */}
                {fileError && (
                  <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {fileError}
                  </p>
                )}
              </div>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-500 font-medium">
                Make sure your work is ready before submitting.
              </p>
              
              <div className="flex w-full sm:w-auto gap-3">
                <button 
                  disabled={isChecking || (!textDraft && !selectedFile)}
                  onClick={handleAICheck}
                  className="flex-1 sm:flex-none flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#16629b] bg-white px-6 font-bold text-[#16629b] transition hover:bg-[#eef7ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                    <><Loader2 size={18} className="animate-spin" /> Scanning...</>
                  ) : (
                    <><Sparkles size={18} /> Check with Ally AI</>
                  )}
                </button>
                
                <button 
                  disabled={isChecking || (!textDraft && !selectedFile)}
                  className="flex-1 sm:flex-none flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-6 font-bold text-white shadow-[0_4px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                >
                  <CheckCircle2 size={18} /> Submit to Mentor
                </button>
              </div>
            </div>

          </div>
        </div>

        <style>
          {`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-5px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </section>
    </UserLayout>
  );
}