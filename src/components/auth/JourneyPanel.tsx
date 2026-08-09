import {
  Backpack,
  Compass,
  TreePine,
} from "lucide-react";

import allyExplorer from "../../assets/ally-explorer.png";
import JourneyTrail from "./JourneyTrail.tsx";

export default function JourneyPanel() {
  return (
    <section className="relative hidden min-h-screen overflow-hidden border-r border-ally-border bg-ally-surface px-10 py-9 lg:flex lg:flex-col">
      <div
        aria-hidden="true"
        className="topographic-pattern pointer-events-none absolute inset-0 opacity-25"
      />

      <div className="relative z-10 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-ally-primary text-white shadow-sm">
          <Compass size={24} />
        </div>

        <span
  className="ally-logo text-3xl text-ally-primary"
  role="img"
  aria-label="Ally"
>
  <span
    aria-hidden="true"
    className="ally-logo-a"
  >
    A
  </span>

  <span
    aria-hidden="true"
    className="ally-logo-lly"
  >
    lly
  </span>
</span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <div className="relative mx-auto h-[430px] w-full max-w-2xl">
          <JourneyTrail />

          <div className="speech-bubble absolute left-8 top-4 max-w-[320px] rounded-2xl border border-ally-border bg-ally-surface p-5 shadow-md">
            <p className="leading-relaxed text-ally-text">
              Welcome, Explorer! <br /> <br />Your scholarship summit awaits. Let's climb there together.
            </p>
          </div>

          <img
            src={allyExplorer}
            alt="Ally, the scholarship expedition companion"
            className="ally-floating absolute bottom-12 left-16 w-28 object-contain"
          />
        </div>

        <div className="max-w-xl">
          <h1 className="text-2xl font-medium leading-snug text-ally-text">
            Every scholarship journey
            <span className="block text-ally-primary">
              begins with a single step.
            </span>
          </h1>

          <p className="mt-7 leading-relaxed text-ally-muted">
            Track your progress, prepare smarter, and reach your dream
            scholarship through personalised milestones, AI guidance,
            and expert coaching.
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ally-muted">
        <div className="flex items-center gap-2">
          <Compass size={18} />
          <span>Navigate Paths</span>
        </div>

        <div className="flex items-center gap-2">
          <Backpack size={18} />
          <span>Gather Resources</span>
        </div>

        <div className="flex items-center gap-2">
          <TreePine size={18} />
          <span>Expert Guidance</span>
        </div>
      </div>
    </section>
  );
}