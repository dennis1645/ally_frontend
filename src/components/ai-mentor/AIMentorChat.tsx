import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bookmark, Search, MoreHorizontal, Trash2, X, Sparkles } from "lucide-react";
import allyMascot from "../../assets/ally-assessment-mascot.png"; // Pastikan path ini benar!

type Message = {
  id: number;
  role: "user" | "ally";
  content: string;
  time: string;
};

type AIMentorChatProps = {
  initialMessages: Message[];
  userInitials: string;
  onSaveInsight: (content: string, category?: string) => void;
};

export default function AIMentorChat({ initialMessages, userInitials, onSaveInsight }: AIMentorChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [inputValue, setInputValue] = useState("");
  
  // Search & Menu Options
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Klik di luar buat nutup menu titik 3
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentTime = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: text, time: getCurrentTime() }]);
    setInputValue("");
    
    // Mocking balasan AI
    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        role: "ally", 
        content: "I've noted that! You can save this advice by clicking the bookmark icon beside this bubble.", 
        time: getCurrentTime() 
      }]);
    }, 1000);
  };

  // Logic Fitur Search
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  // Daftar Pertanyaan Bantuan (Prompt Starters)
  const suggestedQuestions = [
    "Can you review my motivation letter?",
    "How to ask for a recommendation letter?",
    "Tips for TOEFL iBT speaking section?",
    "What are common scholarship interview questions?",
    "Help me build a study plan for this month."
  ];

  return (
    <div className="flex h-[600px] flex-col rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      
      {/* HEADER: Kiri Aktif, Kanan Search & Titik Tiga */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 z-10">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-semibold text-slate-700">Guide is active</span>
        </div>
        
        <div className="flex items-center gap-4 relative">
          {/* Tombol Search */}
          {isSearchOpen ? (
            <div className="flex items-center rounded-full bg-slate-100 px-3 py-1.5">
              <Search size={14} className="text-slate-400 mr-2" />
              <input 
                type="text" autoFocus placeholder="Search chat..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none w-32 placeholder:text-slate-400"
              />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}><X size={14} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="text-slate-400 hover:text-slate-700"><Search size={20} /></button>
          )}

          {/* Tombol Titik Tiga */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-400 hover:text-slate-700"><MoreHorizontal size={22} /></button>
            {isMenuOpen && (
              <div className="absolute right-0 top-8 w-36 rounded-xl border border-slate-200 bg-white shadow-lg p-1 z-50">
                <button onClick={() => { setMessages([]); setIsMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 size={15} /> Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AREA CHAT BUBBLE DENGAN BACKGROUND TITIK-TITIK */}
      <div 
        className="flex-1 overflow-y-auto p-5 space-y-6"
        style={{
          backgroundImage: "radial-gradient(#e2e8f0 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          backgroundColor: "#ffffff"
        }}
      >
        {filteredMessages.map((msg) => {
          const isAlly = msg.role === "ally";

          return (
            <div key={msg.id} className={`flex w-full ${isAlly ? "justify-start" : "justify-end"}`}>
              <div className={`flex max-w-[85%] gap-3 ${isAlly ? "flex-row" : "flex-row-reverse"}`}>
                
                {/* AVATAR */}
                <div className="shrink-0 mt-1">
                  {isAlly ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 border border-slate-200">
                      <img src={allyMascot} alt="Ally" className="h-8 w-8" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5b9bd5] text-white">
                      <span className="text-sm font-bold">{userInitials}</span>
                    </div>
                  )}
                </div>

                {/* BUBBLE & TOMBOL SAVE */}
                <div className={`flex flex-col ${isAlly ? "items-start" : "items-end"}`}>
                  <div className="group relative">
                    <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
                      ${isAlly ? "rounded-2xl rounded-tl-sm bg-[#fdf6f2] border border-[#f1d9c8] text-slate-800" 
                               : "rounded-2xl rounded-tr-sm bg-[#5b9bd5] text-white"}`}
                    >
                      {msg.content}
                    </div>
                    
                    {/* TOMBOL SAVE */}
                    {isAlly && (
                      <button
                        onClick={() => onSaveInsight(msg.content, "AI Advice")}
                        className="absolute -right-10 bottom-0 p-2 rounded-full text-slate-400 opacity-50 transition-all hover:bg-orange-50 hover:text-[#b17a39] hover:opacity-100 group-hover:opacity-100"
                        title="Save to Insights"
                      >
                        <Bookmark size={18} />
                      </button>
                    )}
                  </div>
                  <span className={`text-[11px] text-slate-400 mt-1.5 ${isAlly ? "ml-1" : "mr-1"}`}>{msg.time || "Just now"}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* PERTANYAAN BANTUAN (SUGGESTED QUESTIONS) */}
      <div className="flex w-full gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/50 px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(question)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-500 hover:text-white active:scale-95"
          >
            <Sparkles size={12} />
            {question}
          </button>
        ))}
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="flex items-end gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue); } }}
            placeholder="Type your message here..."
            className="flex-1 max-h-[120px] min-h-[50px] resize-none rounded-xl border border-slate-300 bg-slate-50 py-3.5 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            rows={1}
          />
          <button type="submit" disabled={!inputValue.trim()} className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#5b9bd5] text-white hover:bg-blue-600 disabled:opacity-50 transition-colors">
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}