import mapBackground from "../assets/world-map.png";

import AuthCard from "../components/auth/AuthCard";
import JourneyPanel from "../components/auth/JourneyPanel";

export default function AuthPage() {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      <JourneyPanel />

      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-5 py-10 sm:px-10"
        style={{
          backgroundImage: `url(${mapBackground})`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

        <div className="relative z-10 w-full">
          <div className="mb-8 text-center text-3xl font-bold text-ally-primary lg:hidden">
            Ally
          </div>

          <div className="mx-auto flex max-w-md justify-center">
            <AuthCard />
          </div>
        </div>
      </section>
    </main>
  );
}