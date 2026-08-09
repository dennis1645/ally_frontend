import {
  Award,
  Gauge,
  Sparkles,
} from "lucide-react";

import type {
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
    parts.length === 0
  ) {
    return "A";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0).toUpperCase(),
    )
    .join("");
}

export default function ExplorerProfileCard({
  user,
}: ExplorerProfileCardProps) {
  const level =
    user.level ?? 1;

  const xpPoints =
    user.xp_points ?? 0;

  const readinessScore =
    user.readiness_score;

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
      ].join(" ")}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
{/* Clickable avatar */}

<Link
  to="/profile"
  aria-label={`Open ${user.name}'s profile`}
  className={[
    "group relative shrink-0 rounded-full",
    "focus-visible:outline-none",
    "focus-visible:ring-4",
    "focus-visible:ring-[#9bcaff]",
  ].join(" ")}
>
  <div
    className={[
      "grid h-24 w-24 place-items-center overflow-hidden",
      "rounded-full border-4 border-[#79b7ef]",
      "bg-[#e8f3fc] text-2xl font-extrabold text-[#16629b]",
      "transition-transform duration-200",
      "group-hover:scale-[1.04]",
    ].join(" ")}
  >
    {user.profile_picture_url ? (
      <img
        src={user.profile_picture_url}
        alt={`${user.name}'s profile`}
        className="h-full w-full object-cover"
      />
    ) : (
      <span aria-label={`${user.name} initials`}>
        {initials}
      </span>
    )}
  </div>

  <div
    aria-hidden="true"
    className={[
      "absolute -bottom-1 -right-1",
      "grid h-8 w-8 place-items-center rounded-full",
      "border-2 border-white bg-[#8a642f] text-white",
      "shadow-sm",
    ].join(" ")}
  >
    <Award
      size={16}
      strokeWidth={2.4}
    />
  </div>
</Link>

        {/* User information */}

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
              ].join(" ")}
            >
              Level {level} 
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm italic leading-6 text-[#60646d] sm:text-base">
            “{explorerMessage}”
          </p>

          {/* Current statistics */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div
              className={[
                "flex items-center gap-4 rounded-2xl",
                "border border-[#d9e9f6] bg-[#f4f9fd]",
                "px-4 py-4",
              ].join(" ")}
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#d8ecfb] text-[#16629b]">
                <Sparkles
                  size={21}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#69717a]">
                  Experience
                </p>

                <p className="mt-1 text-xl font-extrabold text-[#16629b]">
                  {xpPoints.toLocaleString()} XP
                </p>
              </div>
            </div>

            <div
              className={[
                "flex items-center gap-4 rounded-2xl",
                "border border-[#f1dbc8] bg-[#fff8f1]",
                "px-4 py-4",
              ].join(" ")}
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ffe3cc] text-[#895625]">
                <Gauge
                  size={21}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#69717a]">
                  Readiness Score
                </p>

                <p className="mt-1 text-xl font-extrabold text-[#895625]">
                  {readinessScore !==
                  null &&
                  readinessScore !==
                  undefined
                    ? `${readinessScore} points`
                    : "Not assessed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}