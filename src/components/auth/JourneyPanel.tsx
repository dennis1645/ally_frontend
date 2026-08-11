import { Compass, BookOpen } from "lucide-react";

export default function JourneyPanel() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-[#3B9EDB] via-[#43A8DC] to-[#4DB6D9] px-8 py-10 sm:px-12 xl:px-16">

      {/* Soft Background Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative Map Path */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 400 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 700 C 150 650, 50 500, 200 450 C 350 400, 200 250, 300 150 C 400 50, 300 0, 300 0"
          stroke="white"
          strokeDasharray="10 10"
          strokeLinecap="round"
          strokeWidth="3"
        />

        <circle
          cx="50"
          cy="700"
          fill="white"
          r="10"
        />

        <circle
          cx="200"
          cy="450"
          fill="#DFF8FF"
          r="14"
        />

        <circle
          cx="300"
          cy="150"
          fill="#FF5573"
          r="10"
        />
      </svg>

      {/* Main Content - Diubah menjadi justify-center agar posisi teks selalu pas di tengah layar */}
      <div className="relative z-20 flex h-full w-full max-w-lg flex-col justify-center">

        {/* Main Heading */}
        <h1 className="text-[2.75rem] sm:text-5xl xl:text-[4rem] font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
          Every scholarship journey{" "}
          <br />
          begins with a{" "}
          <span className="bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent font-black drop-shadow-sm">
            single step.
          </span>
        </h1>

        {/* CTA */}
        <p className="text-lg text-white/90 mb-10 leading-relaxed font-medium max-w-md">
          Let’s take the first step together with a single sign-up.
        </p>

        {/* Journey Features */}
        <div className="flex flex-wrap gap-6 font-bold text-white text-sm uppercase tracking-wider">

          {/* Navigate Paths */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5573] text-white shadow-lg shadow-rose-500/30">
              <Compass size={20} strokeWidth={2.5} />
            </div>

            Navigate Paths
          </div>

          {/* Gather Resources */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5573] text-white shadow-lg shadow-rose-500/30">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>

            Gather Resources
          </div>

        </div>
      </div>
    </div>
  );
}