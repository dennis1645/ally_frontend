import { Flame, CheckCircle2, Circle, HelpCircle } from "lucide-react";

export default function TodaysAscentCard() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* STREAK CARD */}
      <section className="rounded-[24px] border border-[#f1d9c8] bg-white p-6 shadow-[0_6px_0_#d8c6ae]">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-extrabold uppercase tracking-wide text-[#8b929a]">
            Streak Status
          </h3>
          <span className="rounded-full bg-[#7eb6ff]/20 px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#005596]">
            Freeze Active
          </span>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#fc5844]/30 bg-[#fc5844]/10 text-[#fc5844]">
            <Flame size={28} />
          </div>
          <div>
            <p className="text-[22px] font-bold text-[#2c1607] leading-tight">3 Days</p>
            <p className="text-sm font-semibold text-[#8b929a]">Keep it up, Stefanie!</p>
          </div>
        </div>

        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-[2px] border-[#f2f4f6] bg-transparent py-3 text-[13px] font-bold text-[#8b929a] transition-all hover:bg-[#f2f4f6] hover:text-[#2c1607]">
          <HelpCircle size={18} />
          Protect Streak Quiz
        </button>
      </section>

      {/* MISSION STATUS CARD */}
      <section className="rounded-[24px] border border-[#f1d9c8] bg-white p-6 shadow-[0_6px_0_#d8c6ae]">
        <h3 className="mb-5 text-[12px] font-extrabold uppercase tracking-wide text-[#8b929a]">
          Mission Status
        </h3>
        
        <div className="flex items-center gap-5">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
              <path className="text-[#f2f4f6]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-[#efb674]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeWidth="3" />
            </svg>
            <span className="absolute text-sm font-bold text-[#2c1607]">80%</span>
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase text-[#a87747]">Readiness Score</span>
            <span className="text-[14px] font-bold text-[#2c1607] leading-tight">Almost App Ready!</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between px-1">
          {['M', 'T', 'W', 'T', 'F'].map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              {idx < 2 ? (
                <CheckCircle2 size={24} className="text-[#efb674] fill-[#f9d5ae]" />
              ) : idx === 2 ? (
                <CheckCircle2 size={24} className="text-[#fc5844] fill-[#ffdad4]" />
              ) : (
                <Circle size={24} className="text-[#dce2e8]" />
              )}
              <span className={`text-[10px] font-extrabold uppercase ${idx === 2 ? 'text-[#2c1607]' : 'text-[#8b929a]'}`}>
                {day}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}