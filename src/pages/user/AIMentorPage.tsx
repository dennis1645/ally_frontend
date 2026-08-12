import {
  Clock3,
  MessageCircle,
  Plus
} from "lucide-react";

import { useMemo, useState } from "react";
import allyMascot from "../../assets/ally-assessment-mascot.png";
import AIMentorChat from "../../components/ai-mentor/AIMentorChat"; 
import UserLayout from "../../components/layout/UserLayout";
import { useAuth } from "../../context/AuthContext";
import { aiMentorMock } from "../../mocks/aiMentorMock";

type MentorSession = { 
  id: number; 
  title: string; 
  category?: string; 
  date: string; 
};

/* =========================================================
   Helpers
========================================================= */

function getInitials(name: string | null | undefined): string {
  if (!name) return "EX";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "EX";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getFirstName(name: string | null | undefined): string {
  if (!name) return "Explorer";
  return name.trim().split(/\s+/)[0];
}

// Fungsi baru untuk Relative Time (Just now, 2 hours ago, dll)
function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) return "Just now";
  
  const date = new Date(dateString);
  
  // Mencegah error "Invalid Date"
  if (Number.isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  
  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays < 30) return `${diffInDays} days ago`;

  // Kalau sudah lebih dari 30 hari, tampilkan tanggal (misal: Oct 12)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* =========================================================
   Dummy Data (Untuk memanjangkan list)
========================================================= */
const extendedRecentSessions: MentorSession[] = [
  { id: 1, title: "Motivation Letter Review", date: new Date().toISOString() }, // Sekarang
  { id: 2, title: "Interview Prep: Strengths", date: new Date(Date.now() - 1000 * 60 * 45).toISOString() }, // 45 menit lalu
  { id: 3, title: "TOEFL Speaking Strategy", date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() }, // 3 jam lalu
  { id: 4, title: "Scholarship Essay Hook", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() }, // Kemarin
  { id: 5, title: "Recommendation Letter Template", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }, // 2 hari lalu
  { id: 6, title: "Study Plan for November", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }, // 5 hari lalu
  { id: 7, title: "Aachen University Requirements", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() }, // 12 hari lalu
];

/* =========================================================
   Main Page
========================================================= */

export default function AIMentorPage() {
  const { user } = useAuth();
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(1);
  
  // Menggunakan data dummy yang diperpanjang di atas
  const recentConversations = useMemo(() => extendedRecentSessions, []);
  
  const userInitials = useMemo(() => getInitials(user?.name), [user?.name]);
  const firstName = useMemo(() => getFirstName(user?.name), [user?.name]);

  const initialChatMessages = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (aiMentorMock.messages || []).map((msg: any) => ({
      id: msg.id,
      role: (msg.role === "assistant" ? "ally" : "user") as "user" | "ally", 
      content: msg.text || msg.content || "",
      time: msg.time || "10:24 AM",
    }));
  }, []);

  return (
    <UserLayout 
      title="AI Chatbot"
      subtitle="Your Scholarship Companion"
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background px-4 py-6 relative">
        <div className="mx-auto w-full max-w-[1220px]">
          
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            
            {/* AREA KIRI: CHAT */}
            <main className="min-w-0 space-y-5">
              <section className="rounded-[22px] border border-[#efccb8] bg-[#fff1ea] p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-1.5 border-2 border-slate-200">
                    <img src={allyMascot} alt="Ally" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#3d2514]">Hey, {firstName}! 👋</h2>
                    <p className="text-sm text-[#6a4a35]">What can I help you conquer today?</p>
                  </div>
                </div>
              </section>

              <AIMentorChat
                initialMessages={initialChatMessages}
                userInitials={userInitials}
              />
            </main>

            {/* AREA KANAN: SIDEBAR RECENT */}
            <aside className="space-y-6">
              
              <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-[600px]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock3 size={18} className="text-[#16629b]" />
                    <h2 className="text-lg font-bold text-slate-900">Recent Chats</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedSessionId(null)} 
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                    title="New Chat"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                {/* Scrollable list */}
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
                  {recentConversations.map((session) => (
                    <button 
                      key={session.id} 
                      onClick={() => setSelectedSessionId(session.id)} 
                      className={`w-full flex items-start gap-3 rounded-xl p-3 text-left border transition-all ${
                        selectedSessionId === session.id 
                          ? "bg-[#eef7ff] border-[#76b5e8] shadow-sm" 
                          : "bg-white border-slate-100 hover:bg-[#fff8f4] hover:border-[#efccb8]"
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                        selectedSessionId === session.id ? "bg-white text-[#16629b]" : "bg-slate-50 text-slate-400"
                      }`}>
                        <MessageCircle size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${
                          selectedSessionId === session.id ? "text-[#16629b]" : "text-slate-700"
                        }`}>
                          {session.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatRelativeTime(session.date)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

            </aside>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}