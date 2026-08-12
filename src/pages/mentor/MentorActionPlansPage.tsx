import { useState } from "react";
import {
  Bot,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  FileText,
  History,
  MessageSquare,
  Plus
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

// --- TYPES ---
type TaskStatus = "In Progress" | "Answered" | "Approval Needed" | "Approved";

type AssignmentItem = {
  id: string;
  title: string;
  mentee: string;
  due: string;
  status: TaskStatus;
  note: string;
  menteeResponse?: {
    text?: string;
    fileName?: string;
    submittedAt?: string;
  };
};

// --- MOCK DATA ---
const initialAssignments: AssignmentItem[] = [
  {
    id: "a1",
    title: "Complete the leadership worksheet",
    mentee: "Mina Alvarez",
    due: "2026-08-14",
    status: "Approval Needed",
    note: "Use the reflection journal template we discussed.",
    menteeResponse: {
      text: "Hi! I've filled out the worksheet focusing on my experience leading the university debate club.",
      fileName: "Mina_Leadership_Worksheet.pdf",
      submittedAt: "Today, 10:30 AM",
    },
  },
  {
    id: "a2",
    title: "Rework motivation letter outline",
    mentee: "Ari Chen",
    due: "2026-08-15",
    status: "In Progress",
    note: "Make sure to connect your chemistry background with the scholarship's green energy goals.",
  },
  {
    id: "a3",
    title: "Draft 3 potential research topics",
    mentee: "Jordan Lee",
    due: "2026-08-10",
    status: "Approved",
    note: "Keep it under food technology and supply chain.",
    menteeResponse: {
      text: "I've decided to focus on sustainable packaging and shelf-life extension.",
      submittedAt: "Aug 11, 2026",
    },
  },
];

const activeMenteesList = ["Ari Chen", "Jordan Lee", "Mina Alvarez"];

// --- SHARED COMPONENT ---
function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

// --- MAIN COMPONENT ---
export function MentorActionPlansPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>(initialAssignments);
  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  
  // State untuk Approval Modal
  const [approveModalId, setApproveModalId] = useState<string | null>(null);

  // State untuk form draft tugas baru
  const [draft, setDraft] = useState({
    title: "",
    mentee: activeMenteesList[0],
    due: "",
    note: "",
  });

  // Fungsi membuat tugas baru
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title || !draft.mentee || !draft.due) return;

    setAssignments((current) => [
      {
        id: `task-${Date.now()}`,
        title: draft.title,
        mentee: draft.mentee,
        due: draft.due,
        status: "In Progress",
        note: draft.note || "Keep up the good work!",
      },
      ...current,
    ]);

    setDraft({ title: "", mentee: activeMenteesList[0], due: "", note: "" });
    setActiveTab("Active"); // Pindah ke tab active kalau baru bikin
  }

  // Fungsi Konfirmasi Approve Tugas dari Modal
  function confirmApprove() {
    if (!approveModalId) return;
    
    setAssignments((current) =>
      current.map((task) =>
        task.id === approveModalId ? { ...task, status: "Approved" } : task
      )
    );
    
    setApproveModalId(null); // Tutup modal
  }

  // Filter tugas berdasarkan Tab
  const displayedTasks = assignments.filter((task) =>
    activeTab === "Active" ? task.status !== "Approved" : task.status === "Approved"
  );

  return (
    <UserLayout
      title="Post-Session Action Plans"
      subtitle="Tasks for Mentees"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8 relative">
        <SectionHeader
          eyebrow="Action plans"
          title="Manage Post-Session Tasks"
          description="Create clear follow-up tasks, review mentees' submitted answers, and track their progress."
        />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          
          {/* =======================================
              KOLOM KIRI: DAFTAR ACTION PLANS
          ======================================= */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
            
            {/* Tabs Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 p-5 bg-slate-50/50">
              <div className="flex rounded-full bg-slate-200/80 p-1">
                <button
                  onClick={() => setActiveTab("Active")}
                  className={`rounded-full px-5 py-1.5 text-sm font-bold transition-all ${
                    activeTab === "Active" ? "bg-white text-ally-primary shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Active Tasks
                </button>
                <button
                  onClick={() => setActiveTab("History")}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-bold transition-all ${
                    activeTab === "History" ? "bg-ally-primary text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <History size={16} /> History
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="p-5 space-y-4 bg-slate-50/30">
              {displayedTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                  {activeTab === "Active" ? "No active tasks right now." : "History is empty."}
                </div>
              ) : (
                displayedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-5 transition hover:shadow-sm ${
                      task.status === "Approved" ? "border-slate-200 bg-slate-50/80" : "border-slate-200 bg-white"
                    }`}
                  >
                    {/* Header Card */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{task.title}</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          Mentee: <span className="font-bold text-ally-primary">{task.mentee}</span>
                        </p>
                      </div>
                      
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          task.status === "Approval Needed" ? "bg-amber-100 text-amber-700" :
                          task.status === "In Progress" ? "bg-sky-100 text-sky-700" :
                          task.status === "Answered" ? "bg-indigo-100 text-indigo-700" :
                          "bg-emerald-100 text-emerald-700" // Approved
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* Mentor's Note & Due Date */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CalendarDays size={15} className="text-slate-400" />
                        Due: {task.due}
                      </span>
                      {task.note && (
                        <span className="italic">"{task.note}"</span>
                      )}
                    </div>

                    {/* Mentee's Response Box (Muncul jika ada respons/jawaban) */}
                    {task.menteeResponse && (
                      <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-800">
                            <MessageSquare size={14} /> Mentee Submission
                          </p>
                          <span className="text-[10px] font-medium text-indigo-400">{task.menteeResponse.submittedAt}</span>
                        </div>
                        
                        {task.menteeResponse.text && (
                          <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-indigo-50 shadow-2xs">
                            {task.menteeResponse.text}
                          </p>
                        )}
                        
                        {task.menteeResponse.fileName && (
                          <button className="mt-3 flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
                            <FileText size={16} />
                            {task.menteeResponse.fileName}
                          </button>
                        )}

                        {/* Tombol Approve (Hanya muncul jika butuh approval) */}
                        {task.status === "Approval Needed" && (
                          <div className="mt-4 flex justify-end border-t border-indigo-100 pt-4">
                            <button
                              onClick={() => setApproveModalId(task.id)}
                              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                            >
                              <CheckCircle size={16} />
                              Approve Task
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* =======================================
              KOLOM KANAN: CREATE TASK & GUIDANCE
          ======================================= */}
          <div className="space-y-6 sticky top-6 self-start">
            
            {/* Box Form Create Task */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Create new task</h3>
              <p className="mt-1 text-sm text-slate-500">
                Assign a specific follow-up task to your mentee.
              </p>
              
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                    placeholder="e.g., Rewrite first paragraph"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Assign to Mentee <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={draft.mentee}
                      onChange={(event) => setDraft((current) => ({ ...current, mentee: event.target.value }))}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-ally-primary focus:bg-white cursor-pointer"
                      required
                    >
                      {activeMenteesList.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={draft.due}
                    onChange={(event) => setDraft((current) => ({ ...current, due: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Optional Mentor's Note</label>
                  <textarea
                    value={draft.note}
                    onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                    placeholder="Leave a short encouraging note or specific detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ally-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ally-primary/90"
                >
                  <Plus size={16} />
                  Assign Task
                </button>
              </form>
            </div>

            {/* Box Ally Mentor Guidance */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Mentor Guidance</h3>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ally-primary text-white shadow-sm">
                  <Bot size={22} />
                </div>
                <div className="relative rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  <p>
                    "Review submissions thoroughly! Clicking <strong>Approve</strong> will move the task to History and allow the explorer to proceed to their next milestone."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =======================================
            MODAL POP-UP (APPROVE CONFIRMATION)
        ======================================= */}
        {approveModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Approve Task?</h3>
              <p className="mt-2 text-sm text-slate-500">
                By approving this task, the mentee will unlock and proceed to their next milestone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setApproveModalId(null)}
                  className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  className="flex-1 rounded-full bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Yes, Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CSS Styles tambahan untuk animasi Modal */}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </UserLayout>
  );
}