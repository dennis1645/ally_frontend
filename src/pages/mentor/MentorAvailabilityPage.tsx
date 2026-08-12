import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  XCircle,
  AlertCircle
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

// --- TYPES ---
type SessionEvent = {
  id: string;
  mentee: string;
  topic: string;
  dateStr: string; // e.g., "2026-08-14"
  time: string; // e.g., "11:00 AM"
  status: "Pending" | "Confirmed" | "Completed" | "Rejected" | "Rescheduled";
};

// --- CONSTANTS & MOCK DATA ---
const TODAY_STR = "2026-08-12"; // Simulasi hari ini: Rabu, 12 Agustus 2026

const HOURS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", 
  "04:00 PM", "05:00 PM"
];

// Data Sesi Mentor
const initialSessions: SessionEvent[] = [
  { id: "s1", mentee: "Mina Alvarez", topic: "Career clarity session", dateStr: "2026-08-14", time: "11:00 AM", status: "Confirmed" },
  { id: "s2", mentee: "Devon Vance", topic: "Final Essay Review", dateStr: "2026-08-11", time: "02:00 PM", status: "Confirmed" },
  { id: "b1", mentee: "Ari Chen", topic: "Scholarship interview prep", dateStr: "2026-08-13", time: "04:00 PM", status: "Pending" },
  { id: "b2", mentee: "Jordan Lee", topic: "Goal-setting roadmap", dateStr: "2026-08-10", time: "10:00 AM", status: "Pending" },
];

// Mock Available Slots (Format: YYYY-MM-DD-Time)
const initialAvailableSlots = [
  "2026-08-13-04:00 PM", "2026-08-14-11:00 AM", "2026-08-14-12:00 PM", 
  "2026-08-11-02:00 PM", "2026-08-10-10:00 AM"
];

// --- MAIN COMPONENT ---
export function MentorAvailabilityPage() {
  const navigate = useNavigate();

  // State Data
  const [sessions, setSessions] = useState<SessionEvent[]>(initialSessions);
  const [availableSlots, setAvailableSlots] = useState<string[]>(initialAvailableSlots);
  const [calendarMode, setCalendarMode] = useState<"availability" | "booked">("availability");
  
  // State Tanggal Dinamis
  const [weekOffset, setWeekOffset] = useState(0);

  // State Modals
  const [confirmModalId, setConfirmModalId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [joinModalId, setJoinModalId] = useState<string | null>(null);
  const [warningToast, setWarningToast] = useState<string | null>(null);

  // Mouse Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<"add" | "remove" | null>(null);

  // --- LOGIKA TANGGAL & KALENDER ---
  const getWeekDays = (offset: number) => {
    // Mulai dari Senin minggu ini (10 Agustus 2026)
    const start = new Date("2026-08-10T00:00:00"); 
    start.setDate(start.getDate() + (offset * 7));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        id: dateStr,
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateStr: dateStr,
        displayDate: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        isPast: dateStr < TODAY_STR
      };
    });
  };

  const weekDays = getWeekDays(weekOffset);
  const dateRangeStr = `${weekDays[0].displayDate} - ${weekDays[6].displayDate}`;

  // Membersihkan Toast Warning otomatis
  useEffect(() => {
    if (warningToast) {
      const timer = setTimeout(() => setWarningToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [warningToast]);

  // --- LOGIKA DRAG TO SELECT ---
  const handleMouseDown = (cellId: string, isPast: boolean, isBooked: boolean) => {
    if (calendarMode !== "availability") return;
    if (isPast) return;
    if (isBooked) {
      setWarningToast("You cannot remove this slot because a mentee has already booked it.");
      return;
    }
    
    setIsDragging(true);
    const isCurrentlyAvailable = availableSlots.includes(cellId);
    const action = isCurrentlyAvailable ? "remove" : "add";
    setDragAction(action);
    updateSlot(cellId, action);
  };

  const handleMouseEnter = (cellId: string, isPast: boolean, isBooked: boolean) => {
    if (calendarMode !== "availability") return;
    if (isDragging && dragAction && !isPast && !isBooked) {
      updateSlot(cellId, dragAction);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragAction(null);
  };

  const updateSlot = (cellId: string, action: "add" | "remove") => {
    setAvailableSlots((prev) => {
      if (action === "add" && !prev.includes(cellId)) return [...prev, cellId];
      if (action === "remove") return prev.filter((id) => id !== cellId);
      return prev;
    });
  };

  // --- LOGIKA AKSI SESSIONS & MODALS ---
  
  // Fungsi yang sempat hilang dikembalikan ke sini
  function updateSessionStatus(id: string, newStatus: SessionEvent["status"]) {
    setSessions((current) =>
      current.map((session) => (session.id === id ? { ...session, status: newStatus } : session))
    );
  }

  const handleConfirmRequest = () => {
    if (!confirmModalId) return;
    setSessions(s => s.map(session => session.id === confirmModalId ? { ...session, status: "Confirmed" } : session));
    setConfirmModalId(null);
  };

  const handleRejectRequest = () => {
    if (!rejectModalId) return;
    console.log("Reject reason sent to admin:", rejectReason);
    setSessions(s => s.map(session => session.id === rejectModalId ? { ...session, status: "Rejected" } : session));
    setRejectModalId(null);
    setRejectReason("");
  };

  const handleCompleteSession = (id: string, menteeName: string) => {
    setSessions(s => s.map(session => session.id === id ? { ...session, status: "Completed" } : session));
    navigate("/mentor/action-plans", { state: { autoSelectMentee: menteeName } });
  };

  const upcomingSessions = sessions.filter((s) => s.status === "Confirmed");
  const pendingRequests = sessions.filter((s) => s.status === "Pending");

  return (
    <UserLayout 
      title="Availability & Scheduling" 
      subtitle="Schedule and meet your mentees" 
      sidebarItems={mentorSidebarItems}
    >
      
      {/* GLOBAL MOUSE UP HANDLER */}
      <section onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8 select-none relative">
        
        {/* WARNING TOAST */}
        {warningToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl animate-fade-in-down">
            <AlertCircle size={18} className="text-amber-400" />
            <span className="text-sm font-medium">{warningToast}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr] items-start">
          
          {/* =======================================
              KOLOM KIRI: INTERACTIVE CALENDAR
          ======================================= */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
            
            {/* Calendar Header & Controls */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 p-5 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="flex rounded-full bg-slate-200/80 p-1">
                  <button
                    onClick={() => setCalendarMode("availability")}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                      calendarMode === "availability" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Edit Availability
                  </button>
                  <button
                    onClick={() => setCalendarMode("booked")}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                      calendarMode === "booked" ? "bg-ally-primary text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    View Booked
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 sm:mt-0">
                <button onClick={() => setWeekOffset(w => w - 1)} className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold text-slate-700 min-w-[150px] text-center">{dateRangeStr}</span>
                <button onClick={() => setWeekOffset(w => w + 1)} className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Hint Text */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                {calendarMode === "availability" ? (
                  <>💡 <strong className="text-emerald-600">Tip:</strong> Click and drag to mark available hours. <span className="text-slate-400 font-medium">(Past dates are grayed out)</span></>
                ) : (
                  <>💡 <strong className="text-ally-primary">Tip:</strong> Hover over the booked slots (Blue) to quickly join the meeting.</>
                )}
              </p>
            </div>

            {/* Calendar Grid Layout */}
            <div className="p-4 overflow-x-auto bg-slate-50/50">
              <div className="min-w-[650px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                
                {/* Header Row (Days & Dates) */}
                <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                  <div className="p-3 text-center text-xs font-bold text-slate-400 border-r border-slate-200 flex items-center justify-center bg-slate-100/50">
                    GMT+7
                  </div>
                  {weekDays.map((d) => (
                    <div key={d.id} className={`p-2 text-center border-r border-slate-200 last:border-0 ${d.isPast ? "bg-slate-100/50" : ""}`}>
                      <p className={`text-sm font-bold ${d.isPast ? "text-slate-400" : "text-slate-800"}`}>{d.day}</p>
                      <p className={`mt-0.5 text-[10px] font-medium ${d.isPast ? "text-slate-400" : "text-slate-500"}`}>{d.displayDate}</p>
                    </div>
                  ))}
                </div>

                {/* Time Rows */}
                <div className="bg-white">
                  {HOURS.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-slate-100 last:border-0">
                      {/* Hour Label */}
                      <div className="p-2 text-right text-xs font-medium text-slate-400 border-r border-slate-200 flex items-start justify-end bg-slate-50/30">
                        <span className="-mt-1.5">{hour}</span>
                      </div>

                      {/* Day Cells */}
                      {weekDays.map((d) => {
                        const cellId = `${d.dateStr}-${hour}`;
                        const isAvailable = availableSlots.includes(cellId);
                        
                        // Cek apakah ada booking di sel ini (Pending atau Confirmed)
                        const bookedSession = sessions.find((s) => s.dateStr === d.dateStr && s.time === hour && (s.status === "Confirmed" || s.status === "Pending"));

                        let cellClass = "border-r border-slate-100 last:border-0 h-14 transition-colors duration-75 relative ";
                        
                        if (d.isPast) {
                          cellClass += "bg-slate-100/70 cursor-not-allowed patterned-bg opacity-70";
                        } else if (calendarMode === "availability") {
                          if (bookedSession) {
                            cellClass += "bg-emerald-500 border-emerald-600 cursor-not-allowed"; // Hijau pekat, gabisa diganti
                          } else {
                            cellClass += isAvailable ? "bg-emerald-300 cursor-pointer" : "bg-white hover:bg-slate-50 cursor-pointer";
                          }
                        } else {
                          // View Booked Mode
                          cellClass += bookedSession?.status === "Confirmed" ? "bg-ally-primary text-white group" : "bg-white opacity-50 cursor-default";
                        }

                        return (
                          <div
                            key={cellId}
                            onMouseDown={() => handleMouseDown(cellId, d.isPast, !!bookedSession)}
                            onMouseEnter={() => handleMouseEnter(cellId, d.isPast, !!bookedSession)}
                            className={cellClass}
                          >
                            {/* Render Nama Mentee jika di mode Booked, ATAU icon lock jika di mode availability dan sudah dibooked */}
                            {calendarMode === "booked" && bookedSession?.status === "Confirmed" && (
                              <div className="absolute inset-0 p-1.5 overflow-hidden">
                                <div className="bg-white/20 rounded p-1.5 h-full flex flex-col justify-center relative">
                                  <p className="text-[10px] leading-tight font-bold truncate group-hover:opacity-0 transition-opacity">
                                    {bookedSession.mentee}
                                  </p>
                                  
                                  {/* Hover Button */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setJoinModalId(bookedSession.id);
                                      }}
                                      className="flex items-center gap-1 bg-white text-ally-primary px-2 py-1 rounded-md text-[10px] font-bold shadow-sm transition hover:scale-105"
                                    >
                                      <Video size={12} /> Join
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {calendarMode === "availability" && bookedSession && !d.isPast && (
                               <div className="absolute top-1 right-1 opacity-50"><CheckCircle size={12} className="text-white"/></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =======================================
              KOLOM KANAN: LIST SESSIONS & REQUESTS
          ======================================= */}
          <div className="space-y-6 sticky top-6 self-start max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pb-6">
            
            {/* 1. UPCOMING SESSIONS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <CalendarIcon size={20} className="text-ally-primary" />
                <h3 className="text-lg font-bold">Upcoming Sessions</h3>
              </div>
              
              <div className="space-y-3">
                {upcomingSessions.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No upcoming sessions.</p>
                ) : (
                  upcomingSessions.map((session) => {
                    const isPastSession = session.dateStr < TODAY_STR;
                    return (
                      <div key={session.id} className={`rounded-2xl border ${isPastSession ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-slate-50/50'} p-4 transition hover:border-slate-300`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900">{session.mentee}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{session.topic}</p>
                          </div>
                          {isPastSession && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Overdue</span>}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-600">
                          <span className="flex items-center gap-1.5"><CalendarDays size={14}/> {session.dateStr} · {session.time}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => setJoinModalId(session.id)} className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-full bg-ally-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-ally-primary/90">
                            <Video size={14} /> Join
                          </button>
                          <button onClick={() => handleCompleteSession(session.id, session.mentee)} className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                            Complete
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* 2. BOOKING REQUESTS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Booking Requests</h3>
                {pendingRequests.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length} New</span>
                )}
              </div>

              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No pending requests.</p>
                ) : (
                  pendingRequests.map((booking) => {
                    const isPastRequest = booking.dateStr < TODAY_STR;
                    return (
                      <div key={booking.id} className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                        <p className="font-bold text-slate-900">{booking.mentee}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{booking.topic}</p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                          <Clock size={14} /> {booking.dateStr} · {booking.time}
                        </p>
                        
                        {isPastRequest ? (
                          <div className="mt-3 flex flex-col gap-2">
                            <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                              <AlertCircle size={12} /> Date passed. Must reschedule or reject.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => updateSessionStatus(booking.id, "Rescheduled")} className="inline-flex justify-center items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50">
                                <Clock size={13} /> Reschedule
                              </button>
                              <button onClick={() => setRejectModalId(booking.id)} className="inline-flex justify-center items-center gap-1.5 rounded-full border border-rose-200 bg-white px-2 py-1.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-50">
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button onClick={() => setConfirmModalId(booking.id)} className="inline-flex justify-center items-center gap-1.5 rounded-full bg-emerald-600 px-2 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700">
                              <CheckCircle size={13} /> Confirm
                            </button>
                            <button onClick={() => setRejectModalId(booking.id)} className="inline-flex justify-center items-center gap-1.5 rounded-full border border-rose-200 bg-white px-2 py-1.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-50">
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================
          MODALS / POP-UPS
      ======================================= */}
      
      {/* 1. CONFIRM BOOKING MODAL */}
      {confirmModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900">Confirm Booking?</h3>
            <p className="mt-2 text-sm text-center text-slate-500">This will lock the schedule and send an invitation link to the explorer.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmModalId(null)} className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleConfirmRequest} className="flex-1 rounded-full bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Yes, Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECT BOOKING MODAL */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="text-rose-600" /> Reject Booking
            </h3>
            <p className="mt-2 text-sm text-slate-600">Please provide a reason. This will be sent directly to the Admin for review.</p>
            
            <textarea
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-rose-300 focus:bg-white min-h-[100px]"
              placeholder="e.g., I have an urgent meeting at this time..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => {setRejectModalId(null); setRejectReason("");}} className="rounded-full px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={handleRejectRequest} disabled={!rejectReason.trim()} className="rounded-full bg-rose-600 px-6 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. JOIN MEETING MODAL */}
      {joinModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 mb-4">
              <Video size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Joining Meeting...</h3>
            <p className="mt-2 text-sm text-slate-500">We will direct you to the Zoom/Google Meet link for this session.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setJoinModalId(null)} className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => {setJoinModalId(null); alert("Redirecting to Zoom...");}} className="flex-1 rounded-full bg-ally-primary py-2.5 text-sm font-bold text-white hover:bg-ally-primary/90">Go to Meeting</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles tambahan untuk pattern background past date & no-scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .patterned-bg {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.03) 5px, rgba(0,0,0,0.03) 10px);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </UserLayout>
  );
}