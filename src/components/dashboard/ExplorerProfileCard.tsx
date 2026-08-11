import { Menu, Bell, Backpack } from "lucide-react";

export default function ExplorerProfileCard() {
  return (
    <header className="w-full border-b border-[#f1d9c8] bg-white px-6 py-4 shadow-sm mb-8">
      <div className="mx-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9d5ae] border-2 border-[#efb674] transition-transform hover:scale-105">
             <Menu className="text-[#855324]" size={20} />
          </button>
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#8b929a]">
              Expedition HQ
            </span>
            <h1 className="text-xl font-bold text-[#2c1607]">ScholarQuest</h1>
          </div>
        </div>

        {/* Profile & Actions */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-3 rounded-full border-2 border-[#f1d9c8] bg-[#fff8f1] py-1 pl-1 pr-4">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHfw4JxPg02473Ybivh7FU7NTMPeTWyTEcHJvwHRTesYMoV0H8xYCWmr7xuKqYH10S2XN2mXV_0v-6_YZdgdFajmLPf0UEXOZrm1kH6n_weQ6I7aF579NArCBSgLG_W8TSISt6px5ayiBJ-XvFM4J6ETVNowPg2_QC7TXPHGYPFDsBH_XsHseKbonET4N6XfOXVX6FtW8Njuf6FhZRPw2kRsBXcOMV770lgXC7iX64UwQM4rWLhA3UQw" 
              alt="Profile" 
              className="h-9 w-9 rounded-full border-2 border-[#efb674] object-cover"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#2c1607] leading-tight">Stefanie</span>
              <span className="text-[10px] font-extrabold uppercase text-[#a87747]">LVL 3 Explorer</span>
            </div>
          </div>

          <button className="relative text-[#8b929a] hover:text-[#2c1607] transition-colors">
            <Backpack size={26} strokeWidth={2.2} />
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#fc5844] text-[9px] font-bold text-white shadow-sm">
              2
            </span>
          </button>
          <button className="text-[#8b929a] hover:text-[#2c1607] transition-colors">
            <Bell size={26} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </header>
  );
}