import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  FileText,
  Square,
  UploadCloud,
  X
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import UserLayout from "../../components/layout/UserLayout";

/* =========================================================
   Types & Mock Data
========================================================= */

type ActionTask = {
  id: string;
  title: string;
  mentorName: string;
  dueDate: string;
  milestone: string;
  subTasks: string[];
};

// Simulasi data Action Plan dari Mentor
const MOCK_ACTION_TASKS: Record<string, ActionTask> = {
  "t1": {
    id: "t1",
    title: "Rework Motivation Letter Outline",
    mentorName: "Dr. Eleanor Vance",
    dueDate: "Aug 15, 2026",
    milestone: "Milestone 3 - Essay Summit",
    subTasks: [
      "Review the feedback from our previous session",
      "Write a strong hook for the first paragraph",
      "Connect your chemistry background with green energy goals",
      "Draft the new outline (keep it under 500 words)"
    ],
  },
  "t2": {
    id: "t2",
    title: "Complete the Leadership Worksheet",
    mentorName: "Prof. Alan Turing",
    dueDate: "Aug 14, 2026",
    milestone: "Milestone 2 - Document Valley",
    subTasks: [
      "List 3 major leadership experiences",
      "Detail the challenges faced in each experience",
      "Highlight the specific impact and results"
    ],
  }
};

/* =========================================================
   Main Component
========================================================= */

export default function ActionPlanTaskPage() {
  const navigate = useNavigate();
  // Anggap kita mendapat ID task dari URL, misalnya /action-plan/t1
  const { taskId } = useParams(); 
  
  // Default ke 't1' jika tidak ada ID untuk keperluan demo
  const currentTask = MOCK_ACTION_TASKS[taskId || "t1"];

  // Tasklist States
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);

  // Form States
  const [textDraft, setTextDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  /* =======================================================
     Handlers
  ======================================================= */
  const toggleTask = (index: number) => {
    setCheckedTasks((prev) => 
      prev.includes(index) 
        ? prev.filter((i) => i !== index) 
        : [...prev, index]
    );
  };

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

  const handleSubmit = () => {
    // Tampilkan modal konfirmasi sukses
    setIsSubmitModalOpen(true);
  };

  /* =======================================================
     UI Render
  ======================================================= */
  const allTasksChecked = checkedTasks.length === currentTask.subTasks.length;

  return (
    <UserLayout
      title="Action Plan"
      subtitle="Mentor Assignment"
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-[#fff8f5] relative overflow-hidden pb-20">
        
        {/* Latar Belakang Estetik */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#e3f0f8] to-[#fff8f5] pointer-events-none opacity-60" />

        <div className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-10">
          
          {/* Header Navigasi */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-[#6b6670] hover:text-[#16629b] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-[#eef7ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#16629b] mb-2 border border-[#cbe5fb]">
                {currentTask.milestone}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2c1607] sm:text-4xl">
                {currentTask.title}
              </h1>
              <p className="mt-2 text-sm font-semibold text-[#6b6670]">
                Assigned by <span className="text-[#16629b]">{currentTask.mentorName}</span> • Due: {currentTask.dueDate}
              </p>
            </div>
          </div>

          {/* =======================================
              CHECKLIST SECTION
          ======================================= */}
          <div className="mb-8 rounded-[28px] border-2 border-[#ecdcd1] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#2c1607]">Task Requirements</h2>
              <span className="text-sm font-bold text-[#16629b] bg-[#eef7ff] px-3 py-1 rounded-full">
                {checkedTasks.length} / {currentTask.subTasks.length} Completed
              </span>
            </div>
            
            <ul className="space-y-3">
              {currentTask.subTasks.map((task, idx) => {
                const isChecked = checkedTasks.includes(idx);
                return (
                  <li 
                    key={idx}
                    onClick={() => toggleTask(idx)}
                    className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${
                      isChecked ? "bg-slate-50 border-slate-200" : "bg-white border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 transition-colors">
                      {isChecked ? (
                        <CheckSquare size={20} className="text-[#16629b]" />
                      ) : (
                        <Square size={20} className="text-slate-300" />
                      )}
                    </div>
                    <span className={`text-sm leading-relaxed transition-all ${
                      isChecked ? "text-slate-400 line-through" : "text-slate-700 font-medium"
                    }`}>
                      {task}
                    </span>
                  </li>
                );
              })}
            </ul>
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
                {!allTasksChecked 
                  ? "Please check off all requirements before submitting." 
                  : "All requirements met! Ready to submit."}
              </p>
              
              <button 
                disabled={!allTasksChecked || (!textDraft && !selectedFile)}
                onClick={handleSubmit}
                className="w-full sm:w-auto flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-8 font-bold text-white shadow-[0_4px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
              >
                <CheckCircle2 size={18} /> 
                Submit to Mentor
              </button>
            </div>
          </div>
        </div>

        {/* =======================================
            MODAL POP-UP (SUBMISSION SUCCESS)
        ======================================= */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[28px] bg-white p-8 shadow-2xl text-center animate-[fadeInUp_0.3s_ease-out]">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f3e8] text-green-600 mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#2c1607] mb-2">Submission Sent!</h3>
              <p className="text-[#6b6670] mb-8 text-sm leading-relaxed">
                Your work has been successfully sent to <strong className="text-slate-900">{currentTask.mentorName}</strong> for approval. You will be notified once it is reviewed.
              </p>
              
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  navigate(-1); // Kembali ke halaman sebelumnya
                }}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#16629b] font-bold text-white transition hover:bg-[#1e6da6]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(10px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}
        </style>
      </section>
    </UserLayout>
  );
}