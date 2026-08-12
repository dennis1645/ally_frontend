import {
  CalendarClock,
  CheckCircle2,
  Mail
} from "lucide-react";

/* =========================================================
   Types
========================================================= */
type SessionRescheduledModalProps = {
  isOpen: boolean;
  onAcknowledge: () => void;
  mentorName: string;
  newDate: string;
  newTime: string;
};

/* =========================================================
   Main Component
========================================================= */
export default function SessionRescheduledModal({
  isOpen,
  onAcknowledge,
  mentorName,
  newDate,
  newTime,
}: SessionRescheduledModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
      
      {/* Modal Container */}
      <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl animate-[bounceIn_0.4s_ease-out]">
        
        {/* Icon / Avatar Area */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-inner">
          <CalendarClock size={40} className="animate-[wiggle_1s_ease-in-out_infinite]" />
        </div>

        {/* Title & Body */}
        <h3 className="mb-2 text-2xl font-extrabold text-[#2c1607]">
          Session Rescheduled!
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-[#6b6670]">
          <strong className="text-slate-900">{mentorName}</strong> has proposed a new time for your upcoming expedition session.
        </p>

        {/* New Schedule Box */}
        <div className="mb-6 rounded-2xl border-2 border-amber-100 bg-amber-50 p-4 text-left shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-800">
            Your New Schedule
          </p>
          <p className="text-lg font-extrabold text-[#2c1607]">{newDate}</p>
          <p className="text-sm font-semibold text-amber-700">{newTime}</p>
        </div>

        {/* Email Notification Note */}
        <div className="mb-8 flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 border border-slate-100">
          <Mail size={16} className="text-[#16629b]" />
          <span>We've also sent the updated calendar invite to your email.</span>
        </div>

        {/* Single Acknowledge Button */}
        <button
          onClick={onAcknowledge}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 font-bold text-white shadow-[0_5px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none"
        >
          <CheckCircle2 size={20} />
          Got it, thanks!
        </button>

      </div>

      {/* CSS untuk Animasi Bounce & Wiggle */}
      <style>
        {`
          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
        `}
      </style>
    </div>
  );
}