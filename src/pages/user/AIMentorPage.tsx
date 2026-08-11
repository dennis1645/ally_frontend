import {
  BookmarkCheck,
  Clock3,
  MessageCircle,
  Lightbulb,
  Trash2,
  AlertTriangle
} from "lucide-react";

import { useMemo, useState, useEffect } from "react";
import allyMascot from "../../assets/ally-assessment-mascot.png";
import AIMentorChat from "../../components/ai-mentor/AIMentorChat"; 
import UserLayout from "../../components/layout/UserLayout";
import { useAuth } from "../../context/AuthContext";
import { aiMentorMock } from "../../mocks/aiMentorMock";

type SavedInsight = { id: number; content: string; category: string; savedAt: string; };
type MentorSession = { id: number; title: string; category?: string; date: string; };
type Notice = { message: string; onUndo?: () => void; };

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

function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `Today · ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AIMentorPage() {
  const { user } = useAuth();
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([
    { id: 1, content: "Your research experience is one of your strongest points.", category: "Essay Feedback", savedAt: new Date().toISOString() }
  ]);

  const recentConversations = useMemo(() => aiMentorMock.recentSessions as MentorSession[], []);
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

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  function handleSaveInsight(content: string, category = "Mentor Insight") {
    const alreadySaved = savedInsights.some((i) => i.content.trim() === content.trim());
    if (alreadySaved) {
      setNotice({ message: "This insight is already saved." });
      return;
    }
    const newInsight = { id: Date.now(), content, category, savedAt: new Date().toISOString() };
    setSavedInsights((prev) => [newInsight, ...prev]);
    setNotice({ message: "Insight saved to your collection." });
  }

  function executeDelete() {
    if (!deleteConfirmationId) return;
    const insightToRemove = savedInsights.find(i => i.id === deleteConfirmationId);
    if (insightToRemove) {
      setSavedInsights((prev) => prev.filter((i) => i.id !== deleteConfirmationId));
      setNotice({ message: "Saved insight removed.", onUndo: () => {
          setSavedInsights((prev) => [insightToRemove, ...prev].sort((a,b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
          setNotice(null);
      }});
    }
    setDeleteConfirmationId(null);
  }

  return (
    <UserLayout title="AI Mentor — Your scholarship companion, whenever you need a hand.">
      <section className="min-h-[calc(100vh-80px)] bg-ally-background px-4 py-6 relative">
        <div className="mx-auto w-full max-w-[1220px]">
          
          {notice && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#24577d]">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">✓</span>
                <span>{notice?.message}</span>
              </div>
              <div className="flex items-center gap-4">
                {notice?.onUndo && <button onClick={notice.onUndo} className="font-bold text-blue-600 hover:underline">Undo</button>}
                <button onClick={() => setNotice(null)} className="font-bold text-lg text-blue-400">×</button>
              </div>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            
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
                onSaveInsight={handleSaveInsight} 
              />
            </main>

            <aside className="space-y-6">
              
              <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Clock3 size={18} className="text-blue-500" />
                  <h2 className="text-lg font-bold text-slate-900">Recent Conversations</h2>
                </div>
                <div className="space-y-2">
                  {recentConversations.slice(0, 3).map((session) => (
                    <button 
                      key={session.id} 
                      onClick={() => setSelectedSessionId(session.id)} 
                      className={`w-full flex items-start gap-3 rounded-xl p-3 text-left border ${
                        selectedSessionId === session.id ? "bg-[#eef7ff] border-[#76b5e8]" : "bg-[#fff8f4] border-transparent hover:border-[#efccb8]"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm text-slate-500"><MessageCircle size={17} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{session.title}</p>
                        <p className="text-xs text-slate-500">{formatSessionDate(session.date)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck size={18} className="text-[#b17a39]" />
                    <h2 className="text-lg font-bold text-slate-900">Saved Insights</h2>
                  </div>
                  {savedInsights.length > 0 && <span className="rounded-full bg-[#fff1ea] px-2.5 py-1 text-xs font-bold text-[#9a6735]">{savedInsights.length}</span>}
                </div>

                <div className="space-y-3">
                  {savedInsights.length === 0 ? (
                    <p className="text-sm text-center text-slate-500 py-4">No saved insights yet.</p>
                  ) : (
                    savedInsights.map((insight) => (
                      <div key={insight.id} className="group relative rounded-xl bg-[#fff8f4] p-3 border border-transparent hover:border-[#efccb8]">
                        <p className="text-xs font-bold uppercase text-[#9a6735]">{insight.category}</p>
                        <p className="mt-1 text-sm text-slate-700">{insight.content}</p>
                        <button onClick={() => setDeleteConfirmationId(insight.id)} className="absolute right-2 top-2 p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[20px] border border-blue-100 bg-blue-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={18} className="text-blue-600" />
                  <h2 className="font-bold text-blue-800">Pro Tips</h2>
                </div>
                <p className="text-sm text-slate-600">Save important chat bubbles by clicking the bookmark icon next to Ally's messages.</p>
              </section>

            </aside>
          </div>
        </div>

        {deleteConfirmationId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold text-slate-900">Delete Insight?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">Are you sure you want to remove this saved insight?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirmationId(null)} className="px-4 py-2 text-sm font-semibold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={executeDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}