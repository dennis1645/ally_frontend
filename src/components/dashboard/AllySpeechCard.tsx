import allyMascot from "../../assets/ally-assessment-mascot.png";

export default function AllySpeechCard() {
  return (
    <section
      aria-label="Message from Ally"
      className={[
        "flex min-h-[250px] items-end gap-3",
        "rounded-[24px]",
        "border-2 border-dashed border-[#b9cddd]",
        "bg-[#fff0e7] p-5",
      ].join(" ")}
    >
      <div className="flex w-[34%] shrink-0 items-end justify-center self-stretch">
        <img
          src={
            allyMascot
          }
          alt="Ally scholarship expedition guide"
          className="max-h-[190px] w-full object-contain object-bottom"
        />
      </div>

      <div
        className={[
          "relative mb-2 flex-1",
          "rounded-2xl border border-[#ead5c5]",
          "bg-white p-5",
          "shadow-sm",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "absolute bottom-8 -left-2",
            "h-4 w-4 rotate-45",
            "border-b border-l border-[#ead5c5]",
            "bg-white",
          ].join(" ")}
        />

        <p className="text-sm font-medium leading-7 text-[#49382c]">
          “The view from the summit is worth every step! Today, focus on completing one important task. You&apos;ve got this!”
        </p>

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#16629b]">
          Ally, your expedition guide
        </p>
      </div>
    </section>
  );
}