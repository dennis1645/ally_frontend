import { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  FileText,
  Flag,
  GraduationCap,
  MapPin,
  Send,
  Target,
} from "lucide-react";

// ============================================================================
// TYPES (Format data ideal yang harus di-generate oleh Backend AI)
// ============================================================================
type TaskCategory = "prep" | "document" | "test" | "submission";
type TaskStatus = "completed" | "in-progress" | "pending";

interface TimelineTask {
  id: string;
  title: string;
  duration: string; // e.g., "Week 1 - 2"
  category: TaskCategory;
  description: string;
  status: TaskStatus;
}

interface TimelineMonth {
  id: string;
  monthLabel: string; // e.g., "Bulan 1 (Juni 2026)"
  theme: string; // e.g., "Persiapan Fondasi & Bahasa"
  tasks: TimelineTask[];
}

interface AiTimelineData {
  targetUniversityDeadline: string;
  targetScholarshipDeadline: string;
  months: TimelineMonth[];
}

// ============================================================================
// MOCK DATA (Simulasi hasil generate AI berdasarkan Assessment 2)
// ============================================================================
const mockAiResponse: AiTimelineData = {
  targetUniversityDeadline: "Agustus 2026",
  targetScholarshipDeadline: "September 2026",
  months: [
    {
      id: "m1",
      monthLabel: "Bulan 1 (Juni 2026)",
      theme: "Assessment Gap & Persiapan Awal",
      tasks: [
        {
          id: "t1",
          title: "Intensive TOEFL iBT Preparation",
          duration: "Week 1 - 4",
          category: "test",
          description: "Fokus mengejar target skor. Latihan intensif untuk section Speaking dan Writing.",
          status: "in-progress",
        },
        {
          id: "t2",
          title: "Riset Program Master di Eropa",
          duration: "Week 1 - 2",
          category: "prep",
          description: "Kurasi universitas di Eropa (fokus program Food Science / STEM) yang sesuai profil.",
          status: "completed",
        },
        {
          id: "t3",
          title: "Drafting Motivation Letter (V1)",
          duration: "Week 3 - 4",
          category: "document",
          description: "Menyusun kerangka awal esai berdasarkan pengalaman kerja di industri farmasi.",
          status: "pending",
        },
      ],
    },
    {
      id: "m2",
      monthLabel: "Bulan 2 (Juli 2026)",
      theme: "Pemberkasan & Tes Resmi",
      tasks: [
        {
          id: "t4",
          title: "Official TOEFL iBT Test",
          duration: "Week 2",
          category: "test",
          description: "Pelaksanaan tes resmi. Pastikan dokumen identitas siap.",
          status: "pending",
        },
        {
          id: "t5",
          title: "Finalisasi Dokumen Terjemahan",
          duration: "Week 1 - 3",
          category: "document",
          description: "Translate ijazah, transkrip, dan surat rekomendasi ke Penerjemah Tersumpah.",
          status: "pending",
        },
        {
          id: "t6",
          title: "Review Motivation Letter dengan Ally",
          duration: "Week 4",
          category: "prep",
          description: "Revisi esai bersama AI Mentor untuk sentuhan akhir sebelum disubmit.",
          status: "pending",
        },
      ],
    },
    {
      id: "m3",
      monthLabel: "Bulan 3 (Agustus 2026)",
      theme: "University Application (Deadline)",
      tasks: [
        {
          id: "t7",
          title: "Submit LoA Application",
          duration: "Week 1 - 2",
          category: "submission",
          description: "Kirim aplikasi ke Universitas target (Tenggat waktu pendaftaran Universitas).",
          status: "pending",
        },
        {
          id: "t8",
          title: "Persiapan Dokumen Ekstra Beasiswa",
          duration: "Week 3 - 4",
          category: "document",
          description: "Mulai menyesuaikan format dokumen untuk portal pendaftaran beasiswa spesifik.",
          status: "pending",
        },
      ],
    },
    {
      id: "m4",
      monthLabel: "Bulan 4 (September 2026)",
      theme: "Scholarship Submission (Deadline)",
      tasks: [
        {
          id: "t9",
          title: "Final Review Seluruh Berkas",
          duration: "Week 1",
          category: "prep",
          description: "Pengecekan ulang kelengkapan PDF, ukuran file, dan format.",
          status: "pending",
        },
        {
          id: "t10",
          title: "Submit Scholarship Application",
          duration: "Week 2",
          category: "submission",
          description: "Submit aplikasi beasiswa (Tenggat waktu akhir). Selamat!",
          status: "pending",
        },
      ],
    },
  ],
};

// ============================================================================
// HELPER COMPONENTS & UTILS
// ============================================================================
const getCategoryConfig = (category: TaskCategory) => {
  switch (category) {
    case "test":
      return { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" };
    case "document":
      return { icon: FileText, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" };
    case "submission":
      return { icon: Send, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" };
    case "prep":
    default:
      return { icon: Target, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" };
  }
};

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 size={18} className="text-emerald-500" />;
    case "in-progress":
      return <Clock size={18} className="text-amber-500" />;
    case "pending":
    default:
      return <Circle size={18} className="text-slate-300" />;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TimelineGenerator() {
  const data = mockAiResponse;
  
  // State untuk expand/collapse detail bulan
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({
    m1: true, // Bulan 1 otomatis terbuka
    m2: true,
  });

  const toggleMonth = (id: string) => {
    setExpandedMonths((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#f0e6d2] p-4 font-sans sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        
        {/* HEADER SECTION */}
        <header className="mb-10 rounded-[32px] border border-white/40 bg-[#fae8dd] p-6 shadow-sm sm:p-8 md:flex md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <MapPin size={14} />
              AI Generated Map
            </div>
            <h1 className="text-2xl font-extrabold text-[#3d2514] sm:text-3xl">
              Your Expedition Timeline
            </h1>
            <p className="mt-2 text-sm text-[#7a582f] sm:text-base">
              Rute perjalananmu telah disesuaikan berdasarkan hasil Assessment 2.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:mt-0 md:min-w-[220px]">
            <div className="rounded-xl bg-white/60 p-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <GraduationCap size={14} />
                University Deadline
              </div>
              <div className="mt-1 font-bold text-[#3d2514]">
                {data.targetUniversityDeadline}
              </div>
            </div>
            <div className="rounded-xl bg-white/60 p-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Flag size={14} />
                Scholarship Deadline
              </div>
              <div className="mt-1 font-bold text-[#3d2514]">
                {data.targetScholarshipDeadline}
              </div>
            </div>
          </div>
        </header>

        {/* TIMELINE SECTION */}
        <div className="relative">
          {/* Garis vertikal penghubung (Jejeak ekspedisi) */}
          <div className="absolute bottom-0 left-4 top-4 hidden w-1 rounded-full bg-white/60 shadow-inner sm:block sm:left-[2.25rem]"></div>

          <div className="space-y-6 sm:space-y-8">
            {data.months.map((month, index) => {
              const isExpanded = expandedMonths[month.id];

              return (
                <div key={month.id} className="relative flex flex-col sm:flex-row sm:gap-6">
                  
                  {/* Ikon penanda bulan */}
                  <div className="hidden sm:flex z-10 mt-1.5 h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-[#f0e6d2] bg-[#3270c5] text-white shadow-md">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>

                  {/* Konten Bulan */}
                  <div className="flex-1 rounded-[24px] border border-white/50 bg-white/80 p-1 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                    
                    {/* Header Bulan (Bisa diklik untuk buka/tutup) */}
                    <button
                      onClick={() => toggleMonth(month.id)}
                      className="flex w-full items-center justify-between rounded-[20px] p-4 text-left transition hover:bg-slate-50/50 sm:p-5"
                    >
                      <div>
                        <h2 className="text-lg font-bold text-[#2c1607] sm:text-xl">
                          {month.monthLabel}
                        </h2>
                        <p className="mt-0.5 text-sm font-medium text-[#7a582f]">
                          {month.theme}
                        </p>
                      </div>
                      <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Daftar Task (Mingguan) */}
                    {isExpanded && (
                      <div className="space-y-3 px-4 pb-5 sm:px-5">
                        <div className="my-2 h-px w-full bg-slate-100"></div>
                        
                        {month.tasks.map((task) => {
                          const catConfig = getCategoryConfig(task.category);
                          const TaskIcon = catConfig.icon;

                          return (
                            <div
                              key={task.id}
                              className={`flex flex-col gap-3 rounded-2xl border ${catConfig.border} bg-white p-4 shadow-sm transition hover:scale-[1.01] sm:flex-row sm:items-start`}
                            >
                              {/* Kolom Kiri: Durasi & Status */}
                              <div className="flex shrink-0 items-center gap-3 sm:w-32 sm:flex-col sm:items-start sm:gap-1.5">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  <Calendar size={12} />
                                  {task.duration}
                                </span>
                                <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
                                  {getStatusIcon(task.status)}
                                </div>
                              </div>

                              {/* Kolom Kanan: Detail Task */}
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  <div className={`mt-0.5 rounded-md p-1 ${catConfig.bg} ${catConfig.color}`}>
                                    <TaskIcon size={14} strokeWidth={2.5} />
                                  </div>
                                  <h3 className="text-base font-bold text-slate-800">
                                    {task.title}
                                  </h3>
                                </div>
                                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 sm:ml-7">
                                  {task.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}