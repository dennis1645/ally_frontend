import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Map as MapIcon,
  Target,
  Video,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import UserLayout from "../../components/layout/UserLayout";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   Types & Mocks
========================================================= */

type Guide = {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  avatar: string;
};

type Session = {
  date: Date;
  timeSlot: string;
  guide: Guide;
};

const MOCK_GUIDE: Guide = {
  id: "g-101",
  name: "Dr. Eleanor Vance",
  title: "Senior Scholarship Guide",
  expertise: ["European Universities", "STEM Fields", "Motivation Letters"],
  avatar: "https://i.pravatar.cc/150?u=eleanor",
};

const AVAILABLE_TIME_SLOTS = [
  "09:00 - 10:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "15:00 - 16:00",
  "19:00 - 20:00",
];

/* =========================================================
   Helpers
========================================================= */

function getAvailableDates(): Date[] {
  const dates = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatFullDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* =========================================================
   Main Component
========================================================= */

export default function ProgressMentoring() {
  const { user } = useAuth();
  
  // Safe parsing token untuk mencegah error tipe data
  const initialTokens = typeof user?.tokens === "number" ? user.tokens : 4;
  const [tokens, setTokens] = useState<number>(initialTokens);
  
  const readinessScore = 78; 
  
  const [upcomingSession, setUpcomingSession] = useState<Session | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const availableDates = getAvailableDates();

  /* =======================================================
     Countdown Timer Logic
  ======================================================= */
  useEffect(() => {
    if (!upcomingSession) return;

    const timer = setInterval(() => {
      const startTimeStr = upcomingSession.timeSlot.split(" - ")[0];
      const [startHour, startMin] = startTimeStr.split(":");
      
      const targetTime = new Date(upcomingSession.date);
      targetTime.setHours(parseInt(startHour, 10), parseInt(startMin, 10), 0, 0);

      const now = new Date();
      const diffMs = targetTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown("Session Started!");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);
      const secs = Math.floor((diffMs / 1000) % 60);

      let countdownStr = "";
      if (days > 0) countdownStr += `${days}d `;
      countdownStr += `${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
      
      setCountdown(countdownStr);
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingSession]);

  /* =======================================================
     Handlers
  ======================================================= */
  const handleOpenBooking = () => {
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setIsBookingModalOpen(true);
  };

  const handleBookSession = () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    setTokens((prev) => Math.max(0, prev - 1));
    setUpcomingSession({
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      guide: MOCK_GUIDE,
    });
    
    setIsBookingModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  /* =======================================================
     UI
  ======================================================= */
  return (
    <UserLayout title="Quest Tracker" subtitle="Expedition Roadmap & Milestones">
      <section className="min-h-[calc(100vh-80px)] bg-[#fff8f5] pb-20">
        
        <div className="w-full h-[250px] bg-gradient-to-b from-[#e3f0f8] to-[#fff8f5] border-b border-[#ead3bd] flex flex-col items-center justify-center relative overflow-hidden mb-10">
           <MapIcon size={100} className="text-[#16629b] opacity-10 absolute -right-10 -bottom-10" />
           <div className="text-center z-10 px-4">
             <h2 className="text-2xl font-extrabold text-[#2c1607] sm:text-3xl">Your Scholarship Expedition</h2>
             <p className="mt-2 text-[#6b6670] max-w-lg mx-auto">Follow the trail and complete each quest. Prepare yourself with our matched Guides to reach your summit.</p>
           </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
          
          <div className="grid gap-6 md:grid-cols-2 mb-10">
            {/* Tokens Card */}
            <div className="rounded-[24px] border-2 border-[#ead3bd] bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#8a7a6d]">Expedition Resources</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#2c1607]">{tokens}</span>
                  <span className="text-base font-semibold text-[#6b6670]">Tokens Left</span>
                </div>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0e7] text-[#16629b]">
                <Coins size={32} />
              </div>
            </div>

            {/* Readiness Card */}
            <div className="rounded-[24px] border-2 border-[#ead3bd] bg-white p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
              <div className="z-10">
                <p className="text-sm font-bold uppercase tracking-wider text-[#8a7a6d]">Readiness Check</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#16629b]">{readinessScore}%</span>
                  <span className="text-base font-semibold text-[#6b6670]">Prepared</span>
                </div>
              </div>
              
              <div className="relative flex h-16 w-16 items-center justify-center z-10">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-[#f1d8c7]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-[#16629b]"
                    strokeDasharray={`${readinessScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
                <Target size={20} className="absolute text-[#16629b]" />
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-extrabold text-[#2c1607] mb-6">Your Expedition Guide</h3>
          
          {upcomingSession ? (
            <article className="rounded-[28px] border-2 border-[#16629b] bg-white p-6 shadow-[0_8px_24px_rgba(22,98,155,0.12)] sm:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch">
                
                <div className="flex flex-col items-center text-center md:border-r md:border-slate-200 md:pr-8 md:w-1/3">
                  <img src={upcomingSession.guide.avatar} alt="Guide" className="h-24 w-24 rounded-full border-4 border-[#eef7ff] shadow-sm mb-4" />
                  <h4 className="text-xl font-extrabold text-[#2c1607]">{upcomingSession.guide.name}</h4>
                  <p className="text-sm text-[#16629b] font-semibold mt-1">{upcomingSession.guide.title}</p>
                </div>

                <div className="flex-1 flex flex-col justify-center w-full">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#eef7ff] px-4 py-1.5 text-sm font-bold text-[#16629b] w-fit mb-4">
                    <Clock size={16} />
                    Upcoming Session
                  </div>
                  
                  <h4 className="text-2xl font-bold text-[#2c1607] mb-2">
                    {formatFullDateDisplay(upcomingSession.date)}
                  </h4>
                  <p className="text-lg text-[#6b6670] mb-6 flex items-center gap-2">
                    <CalendarDays size={20} />
                    {upcomingSession.timeSlot}
                  </p>

                  <div className="bg-[#fff8f5] rounded-xl p-4 border border-[#ead3bd] mb-6">
                    <p className="text-sm font-bold uppercase tracking-wider text-[#8a7a6d] mb-1">Starting In</p>
                    <p className="text-3xl font-extrabold text-[#d97706] tracking-tight font-mono">{countdown}</p>
                  </div>

                  <a 
                    href="https://zoom.us/test" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 font-bold text-white shadow-[0_5px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none"
                  >
                    <Video size={20} />
                    Join Zoom Session
                  </a>
                </div>
              </div>
            </article>

          ) : (
            <article className="rounded-[28px] border-2 border-[#ead3bd] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <img src={MOCK_GUIDE.avatar} alt="Guide" className="h-20 w-20 rounded-2xl border border-slate-200 shadow-sm" />
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <span className="inline-block rounded-full bg-[#e8f3e8] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700 mb-2">
                        Matched Guide
                      </span>
                      <h4 className="text-xl font-extrabold text-[#2c1607]">{MOCK_GUIDE.name}</h4>
                      <p className="text-sm font-semibold text-[#16629b]">{MOCK_GUIDE.title}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {MOCK_GUIDE.expertise.map(skill => (
                          <span key={skill} className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleOpenBooking}
                      disabled={tokens <= 0}
                      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#16629b] px-6 font-bold text-white transition hover:bg-[#1e6da6] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Book Session
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  {tokens <= 0 ? (
                     <p className="text-xs text-red-500 font-medium mt-3 text-right">Not enough tokens to book.</p>
                  ) : null}
                </div>
              </div>
            </article>
          )}
        </div>

        {/* BOOKING MODAL */}
        {isBookingModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8 relative">
              <button onClick={() => setIsBookingModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-700">
                <X size={24} />
              </button>

              <h3 className="text-2xl font-extrabold text-[#2c1607] mb-2">Book Your Guide</h3>
              <p className="text-sm text-[#6b6670] mb-6">Schedule a 1-on-1 session with {MOCK_GUIDE.name}.</p>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold uppercase tracking-wider text-[#8a7a6d] mb-3 block">1. Select Date</label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableDates.map((date, idx) => {
                      const isSelected = selectedDate?.getTime() === date.getTime();
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTimeSlot(null);
                          }}
                          className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-colors ${
                            isSelected ? "border-[#16629b] bg-[#eef7ff]" : "border-slate-200 hover:border-[#16629b]/50"
                          }`}
                        >
                          <span className={`text-xs font-semibold ${isSelected ? "text-[#16629b]" : "text-slate-500"}`}>
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className={`text-lg font-extrabold ${isSelected ? "text-[#16629b]" : "text-slate-900"}`}>
                            {date.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate ? (
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#8a7a6d] mb-3 block">2. Select Time (1 Hour)</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {AVAILABLE_TIME_SLOTS.map((time, idx) => {
                        const isSelected = selectedTimeSlot === time;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTimeSlot(time)}
                            className={`rounded-lg border-2 py-2 text-sm font-semibold transition-colors ${
                              isSelected ? "border-[#16629b] bg-[#16629b] text-white" : "border-slate-200 text-slate-700 hover:border-[#16629b]/50"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <button
                  disabled={!selectedDate || !selectedTimeSlot}
                  onClick={handleBookSession}
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[#16629b] px-5 font-bold text-white transition hover:bg-[#1e6da6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Now! (1 Token)
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* SUCCESS MODAL */}
        {isSuccessModalOpen && upcomingSession ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[28px] bg-white p-8 shadow-2xl text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f3e8] text-green-600 mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#2c1607] mb-2">Booking Confirmed!</h3>
              <p className="text-[#6b6670] mb-6">
                You already booked your session on <strong className="text-slate-900">{formatDateDisplay(upcomingSession.date)} at {upcomingSession.timeSlot}</strong> with {upcomingSession.guide.name}.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 mb-8">
                We've sent the calendar invite and Zoom link to your registered email.
              </div>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#16629b] font-bold text-white transition hover:bg-[#1e6da6]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : null}

      </section>
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </UserLayout>
  );
}