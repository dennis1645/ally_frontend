import type {
  QuestAchievement,
} from "../../types/questTracker";

type AchievementBadgesProps = {
  badges:
    QuestAchievement[];
};

export default function AchievementBadges({
  badges,
}: AchievementBadgesProps) {
  return (
    <section
      aria-labelledby="quest-achievements-title"
    >
      <h2
        id="quest-achievements-title"
        className="text-2xl font-extrabold text-[#2c1607]"
      >
        Achievement Badges
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {badges.map(
          (
            badge,
          ) => {
            const Icon =
              badge.icon;

            return (
              <article
                key={
                  badge.id
                }
                className={[
                  "flex min-h-[132px] flex-col items-center justify-center rounded-2xl border p-4 text-center",
                  badge.unlocked
                    ? "border-[#e8c9aa] bg-[#fff0e5]"
                    : "border-[#d9dee3] bg-white opacity-55",
                ].join(" ")}
              >
                <div
                  className={[
                    "grid h-14 w-14 place-items-center rounded-full border-[3px] shadow-sm",
                    badge.unlocked
                      ? "border-[#e9bb82] bg-[#efc58f] text-[#6f4017]"
                      : "border-[#dbe1e6] bg-[#f3f5f6] text-[#a4acb3]",
                  ].join(" ")}
                >
                  <Icon
                    size={24}
                    aria-hidden="true"
                  />
                </div>

                <p
                  className={[
                    "mt-3 text-xs font-extrabold leading-4",
                    badge.unlocked
                      ? "text-[#79532d]"
                      : "text-[#9ba2a9]",
                  ].join(" ")}
                >
                  {badge.title}
                </p>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}