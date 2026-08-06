import {
  Flag,
} from "lucide-react";

import {
  Link,
} from "react-router";

import documentValleyImage from "../../assets/document-valley.png";

export default function ExpeditionTrailCard() {
  return (
    <section
      aria-labelledby="expedition-trail-title"
      className={[
        "overflow-hidden rounded-[24px]",
        "border border-orange-100 bg-white",
        "p-6 shadow-[0_6px_0_#d8c6ae]",
        "sm:p-8",
      ].join(" ")}
    >
      <div>
        <h2
          id="expedition-trail-title"
          className="text-[22px] font-bold leading-tight text-slate-900"
        >
          Expedition Trail
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Document Valley
        </p>
      </div>

      <div
        className={[
          "mt-4 flex h-[250px] items-center justify-center",
          "overflow-hidden rounded-xl bg-[#fefaf7]",
        ].join(" ")}
      >
        <img
          src={documentValleyImage}
          alt="Document Valley expedition trail"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          to="/quests"
          aria-label="Open Quest Tracker"
          title="Open Quest Tracker"
          className={[
            "grid h-11 w-11 place-items-center rounded-full",
            "bg-[#7eb6ff] text-[#005596]",
            "shadow-md transition",
            "hover:scale-105 hover:bg-[#69a9f8]",
            "focus-visible:outline-none",
            "focus-visible:ring-4 focus-visible:ring-blue-200",
          ].join(" ")}
        >
          <Flag
            size={21}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}