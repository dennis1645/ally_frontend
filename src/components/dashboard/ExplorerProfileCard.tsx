import {
  Award,
  Coins,
  Gauge,
  Sparkles,
  Trophy,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  AuthBadge,
  AuthUser,
} from "../../types/auth";

import {
  Link,
} from "react-router";

type ExplorerProfileCardProps = {
  user: AuthUser;
};

function getInitials(
  name: string,
): string {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length ===
    0
  ) {
    return "A";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase(),
    )
    .join("");
}

function formatEarnedDate(
  value:
    | string
    | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function AchievementItem({
  badge,
}: {
  badge: AuthBadge;
}) {
  const earnedDate =
    formatEarnedDate(
      badge.pivot
        ?.earned_at,
    );

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#eee4d8] bg-[#fffdfa] p-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#fff0d6] text-[#9a681f]">
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
            size={19}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-extrabold leading-5 text-[#3d2a1d]">
          {badge.name}
        </p>

        {badge.description && (
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {badge.description}
          </p>
        )}

        {earnedDate && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.09em] text-[#9a681f]">
            Earned {earnedDate}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ExplorerProfileCard({
  user,
}: ExplorerProfileCardProps) {
  const [
    achievementsOpen,
    setAchievementsOpen,
  ] =
    useState(
      false,
    );

  const level =
    user.level ??
    1;

  const xpPoints =
    typeof user.xp_points ===
      "number" &&
    Number.isFinite(
      user.xp_points,
    )
      ? Math.max(
          0,
          user.xp_points,
        )
      : 0;

  const readinessScore =
    user.readiness_score;

  const tokenBalance =
    typeof user.token_balance ===
      "number" &&
    Number.isFinite(
      user.token_balance,
    )
      ? Math.max(
          0,
          user.token_balance,
        )
      : null;

  const achievements =
    Array.isArray(
      user.badges,
    )
      ? user.badges
      : [];

  const initials =
    getInitials(
      user.name,
    );

  const explorerMessage =
    user.headline?.trim() ||
    `Your expedition begins with ${xpPoints.toLocaleString()} XP and ${
      readinessScore ?? 0
    } readiness points.`;

  return (
    <section
      aria-labelledby="explorer-profile-title"
      className={[
        "rounded-[24px] border border-[#f1d9c8]",
        "bg-white p-6",
        "shadow-[0_6px_0_#d8c6ae]",
        "sm:p-8",
      ].join(
        " ",
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative flex shrink-0 flex-col items-center">
          <Link
            to="/profile"
            aria-label={`Open ${user.name}'s profile`}
            className={[
              "group relative shrink-0 rounded-full",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#9bcaff]",
            ].join(
              " ",
            )}
          >
            <div
              className={[
                "grid h-24 w-24 place-items-center overflow-hidden",
                "rounded-full border-4 border-[#79b7ef]",
                "bg-[#e8f3fc] text-2xl font-extrabold text-[#16629b]",
                "transition-transform duration-200",
                "group-hover:scale-[1.04]",
              ].join(
                " ",
              )}
            >
              {user.profile_picture_url ? (
                <img
                  src={
                    user.profile_picture_url
                  }
                  alt={`${user.name}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  aria-label={`${user.name} initials`}
                >
                  {initials}
                </span>
              )}
            </div>
          </Link>

          <div
            className="group relative mt-3"
            onMouseEnter={() => {
              setAchievementsOpen(
                true,
              );
            }}
            onMouseLeave={() => {
              setAchievementsOpen(
                false,
              );
            }}
          >
            <button
              type="button"
              aria-label="View achievements"
              aria-expanded={
                achievementsOpen
              }
              aria-haspopup="dialog"
              onClick={() => {
                setAchievementsOpen(
                  (current) =>
                    !current,
                );
              }}
              onFocus={() => {
                setAchievementsOpen(
                  true,
                );
              }}
              className={[
                "grid h-10 w-10 place-items-center",
                "rounded-full border border-[#e5c98f]",
                "bg-[#fff8e8] text-[#895d21]",
                "shadow-sm transition",
                "hover:-translate-y-0.5 hover:bg-[#fff2d4]",
                "focus-visible:outline-none",
                "focus-visible:ring-4 focus-visible:ring-[#f7d99f]",
              ].join(
                " ",
              )}
            >
              <Award
                size={19}
                strokeWidth={2.3}
                aria-hidden="true"
              />
            </button>

            <div
              role="dialog"
              aria-label="Earned achievements"
              className={[
                "absolute left-1/2 top-[calc(100%+10px)] z-50",
                "w-[290px] -translate-x-1/2",
                "rounded-2xl border border-[#eadbc8]",
                "bg-white p-4",
                "shadow-[0_18px_50px_rgba(44,22,7,0.18)]",
                "transition-all duration-150",
                achievementsOpen
                  ? "visible translate-y-0 opacity-100"
                  : "pointer-events-none invisible -translate-y-1 opacity-0",
                "sm:left-0 sm:translate-x-0",
              ].join(
                " ",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9a681f]">
                    Expedition Awards
                  </p>

                  <h3 className="mt-1 text-base font-extrabold text-[#2c1607]">
                    Your achievements
                  </h3>
                </div>

                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff2d8] text-[#9a681f]">
                  <Trophy
                    size={18}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {achievements.length >
              0 ? (
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {achievements.map(
                    (
                      badge,
                    ) => (
                      <AchievementItem
                        key={
                          String(
                            badge.id,
                          )
                        }
                        badge={
                          badge
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-slate-50 px-4 py-4 text-center">
                  <Award
                    size={22}
                    className="mx-auto text-slate-400"
                    aria-hidden="true"
                  />

                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                    No achievements earned yet. Keep progressing through your expedition.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="explorer-profile-title"
              className="text-2xl font-extrabold tracking-tight text-[#2c1607] sm:text-3xl"
            >
              Explorer {user.name}
            </h2>

            <span
              className={[
                "w-fit rounded-full bg-[#fef0df]",
                "px-4 py-1.5",
                "text-xs font-bold uppercase tracking-wider",
                "text-[#83501f]",
              ].join(
                " ",
              )}
            >
              Level {level}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm italic leading-6 text-[#60646d] sm:text-base">
            “{explorerMessage}”
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div
              className={[
                "flex items-center gap-3 rounded-2xl",
                "border border-[#d9e9f6] bg-[#f4f9fd]",
                "px-4 py-4",
              ].join(
                " ",
              )}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d8ecfb] text-[#16629b]">
                <Sparkles
                  size={21}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#69717a]">
                  Experience
                </p>

                <p className="mt-1 truncate text-xl font-extrabold text-[#16629b]">
                  {xpPoints.toLocaleString()} XP
                </p>
              </div>
            </div>

            <div
              className={[
                "flex items-center gap-3 rounded-2xl",
                "border border-[#f1dbc8] bg-[#fff8f1]",
                "px-4 py-4",
              ].join(
                " ",
              )}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ffe3cc] text-[#895625]">
                <Gauge
                  size={21}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#69717a]">
                  Readiness Score
                </p>

                <p className="mt-1 truncate text-xl font-extrabold text-[#895625]">
                  {readinessScore !==
                    null &&
                  readinessScore !==
                    undefined
                    ? `${readinessScore} points`
                    : "Not assessed"}
                </p>
              </div>
            </div>

            <div
              className={[
                "flex items-center gap-3 rounded-2xl",
                "border border-[#eadfac] bg-[#fffbed]",
                "px-4 py-4",
              ].join(
                " ",
              )}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff0b8] text-[#8a681d]">
                <Coins
                  size={21}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#69717a]">
                  Mentor Tokens
                </p>

                <p className="mt-1 truncate text-xl font-extrabold text-[#8a681d]">
                  {tokenBalance !==
                  null
                    ? tokenBalance.toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}