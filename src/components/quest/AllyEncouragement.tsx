import allyMascot from "../../assets/ally-assessment-mascot.png";

type AllyEncouragementProps = {
  progress:
    number;

  milestoneTitle:
    string;
};

export default function AllyEncouragement({
  progress,
  milestoneTitle,
}: AllyEncouragementProps) {
  return (
    <section
      aria-label="Encouragement from Ally"
      className="flex items-center gap-4 sm:gap-6"
    >
      <div className="flex h-24 w-24 shrink-0 items-end justify-center overflow-hidden rounded-2xl border-2 border-[#bfcbd5] bg-[#fff0e5] shadow-sm sm:h-28 sm:w-28">
        <img
          src={
            allyMascot
          }
          alt="Ally expedition mascot"
          className="ally-mascot-float h-full w-full object-contain object-bottom"
        />
      </div>

      <div className="relative flex-1 rounded-2xl border border-[#bfcbd5] bg-[#fff0e8] px-5 py-5 shadow-sm sm:px-7 sm:py-6">
        <span
          aria-hidden="true"
          className="absolute left-[-9px] top-8 h-4 w-4 rotate-45 border-b border-l border-[#bfcbd5] bg-[#fff0e8]"
        />

        <p className="text-sm font-medium italic leading-7 text-[#3c2a20] sm:text-lg sm:leading-8">
          &ldquo;Great job! You&apos;ve completed {progress}% of {milestoneTitle}. The view from the top is going to be amazing — keep climbing!&rdquo;
        </p>
      </div>
    </section>
  );
}