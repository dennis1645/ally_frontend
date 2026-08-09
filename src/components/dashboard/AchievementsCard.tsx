import {
  Award,
  LockKeyhole,
} from "lucide-react";

import {
  Link,
} from "react-router";

import type {
  AuthBadge,
} from "../../types/auth";

type AchievementsCardProps = {
  badges:
    AuthBadge[] | undefined;
};

type EarnedBadgeProps = {
  badge: AuthBadge;
};

function EarnedBadge({
  badge,
}: EarnedBadgeProps) {
  return (
    <article
      className="group flex min-w-0 flex-col items-center text-center"
      title={
        badge.description
      }
    >
      <div
        className={[
          "grid h-16 w-16 place-items-center overflow-hidden",
          "rounded-full border-[3px] border-[#efb674]",
          "bg-[#f9d5ae] shadow-sm",
          "transition-transform group-hover:-translate-y-1",
        ].join(" ")}
      >
        {badge.icon_url ? (
          <img
            src={
              badge.icon_url
            }
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Award
            size={26}
            className="text-[#855324]"
            aria-hidden="true"
          />
        )}
      </div>

      <p className="mt-3 max-w-24 text-[11px] font-extrabold uppercase leading-4 text-[#39291e]">
        {badge.name}
      </p>
    </article>
  );
}

function LockedAchievement() {
  return (
    <article className="flex min-w-0 flex-col items-center text-center opacity-55">
      <div
        className={[
          "grid h-16 w-16 place-items-center rounded-full",
          "border-[3px] border-[#dce2e8] bg-[#f2f4f6]",
          "text-[#9ba3ac]",
        ].join(" ")}
      >
        <LockKeyhole
          size={23}
          aria-hidden="true"
        />
      </div>

      <p className="mt-3 text-[11px] font-extrabold uppercase leading-4 text-[#8b929a]">
        Locked
      </p>
    </article>
  );
}

export default function AchievementsCard({
  badges,
}: AchievementsCardProps) {
  const earnedBadges =
    badges ?? [];

  const visibleBadges =
    earnedBadges.slice(
      0,
      3,
    );

  const emptySlots =
    Math.max(
      0,
      3 -
        visibleBadges.length,
    );

  return (
    <section
      aria-labelledby="achievements-title"
      className={[
        "rounded-[24px] border border-[#f1d9c8]",
        "bg-white p-6",
        "shadow-[0_6px_0_#d8c6ae]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="achievements-title"
          className="text-lg font-bold text-[#2c1607]"
        >
          Achievements
        </h2>

        <Link
          to="/profile/journey-log"
          className="text-xs font-bold uppercase tracking-wide text-[#16629b] hover:underline"
        >
          View All
        </Link>
      </div>

      {visibleBadges.length >
      0 ? (
        <div className="mt-7 grid grid-cols-3 gap-4">
          {visibleBadges.map(
            (
              badge,
            ) => (
              <EarnedBadge
                key={
                  badge.id
                }
                badge={
                  badge
                }
              />
            ),
          )}

          {Array.from({
            length:
              emptySlots,
          }).map(
            (
              _,
              index,
            ) => (
              <LockedAchievement
                key={`locked-${index}`}
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl bg-[#fff8f1] px-4 py-6 text-center">
          <Award
            size={28}
            className="mx-auto text-[#a87747]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-semibold text-[#4c3829]">
            Your first achievement is waiting.
          </p>
        </div>
      )}
    </section>
  );
}