import {
  ArrowRight,
  Coins,
  Edit3,
  Flame,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router";

import {
  API_BASE_URL,
} from "../../api/apiClient";

import type {
  AuthUser,
} from "../../types/auth";

type ExplorerProfileCardProps = {
  user: AuthUser;

  variant?:
    | "default"
    | "hero"
    | "sidebar"
    | "overlay";

  /*
   * DashboardPage already retrieves the latest Deep Diagnostic
   * result. Prefer that value so this summary does not show an
   * older readiness_score from the profile response.
   */
  readinessScore?:
    | number
    | null;

  readinessLoading?:
    boolean;

  onBookMentor?:
    () => void;
};

function resolveProfilePictureUrl(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (
    !value?.trim()
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.startsWith(
      "http://",
    ) ||
    normalized.startsWith(
      "https://",
    ) ||
    normalized.startsWith(
      "blob:",
    ) ||
    normalized.startsWith(
      "data:",
    )
  ) {
    return normalized;
  }

  try {
    const apiOrigin =
      new URL(
        API_BASE_URL,
      ).origin;

    return `${apiOrigin}/${normalized.replace(
      /^\/+/,
      "",
    )}`;
  } catch {
    return normalized;
  }
}

function getInitials(
  name:
    string,
): string {
  const initials =
    name
      .trim()
      .split(
        /\s+/,
      )
      .slice(
        0,
        2,
      )
      .map(
        (
          part,
        ) =>
          part
            .charAt(
              0,
            )
            .toUpperCase(),
      )
      .join(
        "",
      );

  return (
    initials ||
    "EX"
  );
}

function formatMetric(
  value:
    | string
    | number
    | null
    | undefined,
): string {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      ""
  ) {
    return "—";
  }

  return String(
    value,
  );
}

export default function ExplorerProfileCard({
  user,
  variant = "default",
  readinessScore,
  readinessLoading = false,
  onBookMentor,
}: ExplorerProfileCardProps) {
  const navigate =
    useNavigate();

  const profilePicture =
    resolveProfilePictureUrl(
      user.profile_picture_url ??
        user.profile_picture,
    );

  const level =
    user.level ??
    user.expedition_level ??
    null;

  const currentReadiness =
    readinessScore ??
    user.readiness_score ??
    null;

  const normalizedReadiness =
    typeof currentReadiness ===
      "number" &&
    Number.isFinite(
      currentReadiness,
    )
      ? Math.max(
          0,
          Math.min(
            100,
            currentReadiness,
          ),
        )
      : null;

  const xp =
    typeof user.xp_points ===
    "number"
      ? user.xp_points
      : null;

  const streak =
    typeof user.current_streak ===
    "number"
      ? user.current_streak
      : null;

  const scholarshipTarget =
    user.target_scholarship_data?.name ??
    user.primary_scholarship_target ??
    user.target_scholarship ??
    null;

  const tokenBalance =
    typeof user.token_balance ===
      "number" &&
    Number.isFinite(
      user.token_balance,
    )
      ? Math.max(
          0,
          Math.floor(
            user.token_balance,
          ),
        )
      : null;

  if (
    variant ===
    "overlay"
  ) {
    const readinessLabel =
      readinessLoading
        ? "..."
        : normalizedReadiness !==
            null
          ? `${Math.round(
              normalizedReadiness,
            )}%`
          : "—";

    const tokenLabel =
      tokenBalance !==
        null
        ? `${tokenBalance.toLocaleString()} ${
            tokenBalance ===
            1
              ? "Token"
              : "Tokens"
          }`
        : "—";

    const levelLabel =
      level !==
        null
        ? `Lv. ${formatMetric(
            level,
          )}`
        : "—";

    return (
      <section
        aria-labelledby="explorer-overlay-profile-title"
        className={[
          "relative overflow-hidden rounded-[24px]",
          "border border-[#d8e2e8]",
          "bg-white/96 p-4",
          "shadow-[0_14px_38px_rgba(29,58,79,0.20)]",
          "backdrop-blur-md",
          "sm:p-5",
        ].join(
          " ",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#dceeff]/70 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -left-8 h-28 w-28 rounded-full bg-[#fff0db]/55 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Open Explorer Passport"
              onClick={() =>
                navigate(
                  "/profile",
                )
              }
              className={[
                "grid h-14 w-14 shrink-0 place-items-center overflow-hidden",
                "rounded-[17px] border-[3px] border-white bg-[#eaf5fb]",
                "shadow-[0_3px_0_rgba(22,98,155,0.14)]",
                "transition hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
              ].join(
                " ",
              )}
            >
              {profilePicture ? (
                <img
                  src={
                    profilePicture
                  }
                  alt={`${user.name}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-base font-extrabold text-[#16629b]">
                  {
                    getInitials(
                      user.name,
                    )
                  }
                </span>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#16629b]">
                    Explorer
                  </p>

                  <h2
                    id="explorer-overlay-profile-title"
                    className="mt-1 truncate text-lg font-extrabold leading-tight text-[#2c1607]"
                  >
                    {user.name}
                  </h2>

                  <p className="mt-1.5 text-sm font-extrabold text-[#16629b]">
                    {typeof user.xp_points === "number" &&
                    Number.isFinite(user.xp_points)
                      ? `${Math.max(
                          0,
                          Math.round(
                            user.xp_points,
                          ),
                        ).toLocaleString()} XP`
                      : "— XP"}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Edit profile"
                  onClick={() =>
                    navigate(
                      "/profile/edit",
                    )
                  }
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#c7dceb] bg-white text-[#16629b] shadow-sm transition hover:bg-[#f4faff]"
                >
                  <Edit3
                    size={14}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[14px] border border-[#d8e6ef] bg-[#f4faff] px-2.5 py-3 text-center">
              <p className="text-xl font-extrabold leading-none text-[#16629b]">
                {readinessLabel}
              </p>

              <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.09em] text-slate-500">
                Readiness
              </p>
            </div>

            <div className="rounded-[14px] border border-[#eadcc7] bg-[#fffaf2] px-2.5 py-3 text-center">
              <Coins
                size={16}
                aria-hidden="true"
                className="mx-auto text-[#b77a2a]"
              />

              <p className="mt-1.5 text-xs font-extrabold leading-tight text-[#2c1607]">
                {tokenLabel}
              </p>
            </div>

            <div className="rounded-[14px] border border-[#eadcc7] bg-[#fffaf2] px-2.5 py-3 text-center">
              <Trophy
                size={16}
                aria-hidden="true"
                className="mx-auto text-[#b77a2a]"
              />

              <p className="mt-1.5 text-xs font-extrabold leading-tight text-[#2c1607]">
                {levelLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-[15px] border border-[#ead8c8] bg-white/80 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <Target
                size={14}
                className="shrink-0 text-[#e49a36]"
                aria-hidden="true"
              />

              <p className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#7a582f]">
                Target Scholarship
              </p>
            </div>

            <p className="mt-1.5 line-clamp-2 text-sm font-extrabold leading-5 text-[#2c1607]">
              {scholarshipTarget ||
                "No scholarship selected"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (
                onBookMentor
              ) {
                onBookMentor();

                return;
              }

              navigate(
                "/sessions",
              );
            }}
            className={[
              "squishy-button mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2",
              "rounded-xl bg-[#16629b] px-4 py-3",
              "text-sm font-extrabold text-white",
              "shadow-[0_4px_0_#0d4773]",
              "transition hover:-translate-y-0.5 hover:bg-[#115787]",
              "active:translate-y-0 active:shadow-none",
            ].join(
              " ",
            )}
          >
            Book Mentorship

            <ArrowRight
              size={15}
              aria-hidden="true"
            />
          </button>
        </div>
      </section>
    );
  }

  if (
    variant ===
    "sidebar"
  ) {
    return (
      <section
        aria-labelledby="explorer-profile-title"
        className={[
          "relative overflow-hidden rounded-[22px]",
          "border border-[#d9c8b8]",
          "bg-gradient-to-br from-[#fffdf9] via-white to-[#eef7ff]",
          "p-4 shadow-[0_5px_0_#dfcdbb]",
        ].join(
          " ",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#dceeff]/65 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Open Explorer Passport"
              onClick={() =>
                navigate(
                  "/profile",
                )
              }
              className={[
                "grid h-14 w-14 shrink-0 place-items-center overflow-hidden",
                "rounded-[17px] border-[3px] border-white bg-[#eaf5fb]",
                "shadow-[0_3px_0_rgba(22,98,155,0.14)]",
                "transition hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
              ].join(
                " ",
              )}
            >
              {profilePicture ? (
                <img
                  src={
                    profilePicture
                  }
                  alt={`${user.name}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-base font-extrabold text-[#16629b]">
                  {
                    getInitials(
                      user.name,
                    )
                  }
                </span>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#bed9ea] bg-[#eef7fc] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#16629b]">
                  <UserRound
                    size={11}
                    aria-hidden="true"
                  />
                  Explorer Profile
                </span>

                <button
                  type="button"
                  aria-label="Edit profile"
                  onClick={() =>
                    navigate(
                      "/profile/edit",
                    )
                  }
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#c7dceb] bg-white text-[#16629b] shadow-sm transition hover:bg-[#f4faff]"
                >
                  <Edit3
                    size={14}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <h2
                id="explorer-profile-title"
                className="mt-2 truncate text-base font-extrabold text-[#2c1607]"
              >
                {user.name}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {level !==
                  null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6df] px-2 py-1 text-[10px] font-extrabold text-[#91631f]">
                    <Trophy
                      size={11}
                      aria-hidden="true"
                    />
                    Lv.{" "}
                    {
                      formatMetric(
                        level,
                      )
                    }
                  </span>
                )}

                <span className="truncate text-xs font-medium text-slate-500">
                  {user.headline?.trim() ||
                    user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#ead8c8] bg-white/75 px-3 py-2.5">
            <Target
              size={14}
              className="mt-0.5 shrink-0 text-[#e49a36]"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#7a582f]">
                Target Scholarship
              </p>

              <p className="mt-0.5 line-clamp-2 text-xs font-bold leading-5 text-[#2c1607]">
                {scholarshipTarget
                  ? scholarshipTarget
                  : "No primary scholarship selected yet"}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (
    variant ===
    "hero"
  ) {
    return (
      <section
        aria-labelledby="explorer-profile-title"
        className={[
          "relative h-full min-h-[430px] overflow-hidden rounded-[28px]",
          "border border-[#d9c8b8]",
          "bg-gradient-to-br from-[#fffdf9] via-white to-[#eef7ff]",
          "p-5 shadow-[0_8px_0_#dfcdbb]",
          "sm:p-6",
        ].join(
          " ",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#dceeff]/65 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-12 h-36 w-36 rounded-full bg-[#ffe4c9]/50 blur-3xl"
        />

        <div className="relative flex h-full min-h-[382px] flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open Explorer Passport"
                onClick={() =>
                  navigate(
                    "/profile",
                  )
                }
                className={[
                  "grid h-16 w-16 shrink-0 place-items-center overflow-hidden",
                  "rounded-[18px] border-4 border-white bg-[#eaf5fb]",
                  "shadow-[0_4px_0_rgba(22,98,155,0.14)]",
                  "transition hover:-translate-y-0.5",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                ].join(
                  " ",
                )}
              >
                {profilePicture ? (
                  <img
                    src={
                      profilePicture
                    }
                    alt={`${user.name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-extrabold text-[#16629b]">
                    {
                      getInitials(
                        user.name,
                      )
                    }
                  </span>
                )}
              </button>

              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bed9ea] bg-[#eef7fc] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#16629b]">
                  <UserRound
                    size={12}
                    aria-hidden="true"
                  />
                  Explorer
                </span>

                <h2
                  id="explorer-profile-title"
                  className="mt-1.5 truncate text-lg font-extrabold tracking-tight text-[#2c1607]"
                >
                  {user.name}
                </h2>

                <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                  {user.headline?.trim() ||
                    user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Edit profile"
              onClick={() =>
                navigate(
                  "/profile/edit",
                )
              }
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#c7dceb] bg-white text-[#16629b] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f4faff]"
            >
              <Edit3
                size={15}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-[#ead8c8] bg-white/80 p-3.5">
            <div className="flex items-center gap-2 text-[#66584d]">
              <Target
                size={15}
                className="shrink-0 text-[#e49a36]"
                aria-hidden="true"
              />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.11em]">
                Target Scholarship
              </p>
            </div>

            <p className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-[#2c1607]">
              {scholarshipTarget
                ? scholarshipTarget
                : "No primary scholarship selected yet"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <ProfileMetric
              label="Level"
              value={
                formatMetric(
                  level,
                )
              }
              detail="Explorer"
              tone="blue"
            />

            <ProfileMetric
              label="Readiness"
              value={
                readinessLoading
                  ? "..."
                  : normalizedReadiness !==
                      null
                    ? `${Math.round(
                        normalizedReadiness,
                      )}%`
                    : "—"
              }
              detail="Score"
              tone="green"
            />

            <ProfileMetric
              label="XP"
              value={
                xp !==
                  null
                  ? xp.toLocaleString()
                  : "—"
              }
              detail="Experience"
              tone="gold"
            />

            <ProfileMetric
              label="Streak"
              value={
                streak !==
                  null
                  ? `${streak}d`
                  : "—"
              }
              detail="Current"
              tone="orange"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/profile",
              )
            }
            className="mt-auto inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#bfd8e8] bg-[#f4faff] px-4 py-2.5 text-xs font-extrabold text-[#16629b] transition hover:bg-[#eaf5fb]"
          >
            View Explorer Passport
            <ArrowRight
              size={14}
              aria-hidden="true"
            />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="explorer-profile-title"
      className={[
        "relative overflow-hidden rounded-[26px]",
        "border border-[#d9c8b8]",
        "bg-gradient-to-br from-[#fffdf9] via-white to-[#eef7ff]",
        "p-5 shadow-[0_6px_0_#dfcdbb]",
        "sm:p-6",
      ].join(
        " ",
      )}
    >
      {/* Subtle expedition decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#dceeff]/65 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 left-24 h-36 w-36 rounded-full bg-[#ffe4c9]/50 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {/* Actual explorer profile image */}
            <button
              type="button"
              aria-label="Open Explorer Passport"
              onClick={() =>
                navigate(
                  "/profile",
                )
              }
              className={[
                "relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden",
                "rounded-[22px] border-4 border-white bg-[#eaf5fb]",
                "shadow-[0_4px_0_rgba(22,98,155,0.14)]",
                "transition hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                "sm:h-24 sm:w-24",
              ].join(
                " ",
              )}
            >
              {profilePicture ? (
                <img
                  src={
                    profilePicture
                  }
                  alt={`${user.name}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-extrabold text-[#16629b] sm:text-2xl">
                  {
                    getInitials(
                      user.name,
                    )
                  }
                </span>
              )}
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full",
                    "border border-[#bed9ea] bg-[#eef7fc]",
                    "px-2.5 py-1 text-[10px] font-extrabold",
                    "uppercase tracking-[0.13em] text-[#16629b]",
                  ].join(
                    " ",
                  )}
                >
                  <UserRound
                    size={13}
                    aria-hidden="true"
                  />
                  Explorer Profile
                </span>

                {level !==
                  null && (
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full",
                      "border border-[#ead19d] bg-[#fff6df]",
                      "px-2.5 py-1 text-[10px] font-extrabold",
                      "uppercase tracking-[0.12em] text-[#91631f]",
                    ].join(
                      " ",
                    )}
                  >
                    <Trophy
                      size={12}
                      aria-hidden="true"
                    />
                    Level{" "}
                    {
                      formatMetric(
                        level,
                      )
                    }
                  </span>
                )}
              </div>

              <h2
                id="explorer-profile-title"
                className="mt-2 truncate text-xl font-extrabold tracking-[-0.02em] text-[#2c1607] sm:text-2xl"
              >
                {
                  user.name
                }
              </h2>

              <p className="mt-1 truncate text-sm font-medium text-slate-500">
                {user.headline?.trim() ||
                  user.email}
              </p>

              <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-[#66584d]">
                <Target
                  size={16}
                  className="shrink-0 text-[#e49a36]"
                  aria-hidden="true"
                />

                <span className="truncate">
                  {scholarshipTarget
                    ? scholarshipTarget
                    : "No primary scholarship selected yet"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/profile/edit",
              )
            }
            className={[
              "inline-flex min-h-10 shrink-0 items-center justify-center gap-2",
              "rounded-xl border border-[#c7dceb] bg-white px-4",
              "text-sm font-bold text-[#16629b]",
              "shadow-sm transition",
              "hover:-translate-y-0.5 hover:bg-[#f4faff]",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
            ].join(
              " ",
            )}
          >
            <Edit3
              size={16}
              aria-hidden="true"
            />
            Edit Profile
          </button>
        </div>

        {/* Previous profile-style stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ProfileMetric
            label="Level"
            value={
              formatMetric(
                level,
              )
            }
            detail="Explorer level"
            tone="blue"
          />

          <ProfileMetric
            label="Readiness"
            value={
              readinessLoading
                ? "..."
                : normalizedReadiness !==
                    null
                  ? `${Math.round(
                      normalizedReadiness,
                    )}%`
                  : "—"
            }
            detail={
              readinessLoading
                ? "Checking score"
                : "Scholarship score"
            }
            tone="green"
          />

          <ProfileMetric
            label="XP"
            value={
              xp !==
                null
                ? xp.toLocaleString()
                : "—"
            }
            detail="Experience points"
            tone="gold"
          />

          <ProfileMetric
            label="Streak"
            value={
              streak !==
                null
                ? `${streak}d`
                : "—"
            }
            detail="Current streak"
            tone="orange"
          />
        </div>

        {normalizedReadiness !==
          null &&
          !readinessLoading && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>
                Readiness progress
              </span>

              <span className="text-[#16629b]">
                {
                  Math.round(
                    normalizedReadiness,
                  )
                }
                %
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-[#e8edf1]">
              <div
                className="h-full rounded-full bg-[#35a66f] transition-[width] duration-500"
                style={{
                  width:
                    `${normalizedReadiness}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/profile",
              )
            }
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#16629b] transition hover:gap-2"
          >
            View Explorer Passport
            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  );
}

type ProfileMetricProps = {
  label: string;
  value: string;
  detail: string;

  tone:
    | "blue"
    | "green"
    | "gold"
    | "orange";
};

function ProfileMetric({
  label,
  value,
  detail,
  tone,
}: ProfileMetricProps) {
  const toneClass =
    tone ===
      "green"
      ? "border-[#cce9d9] bg-[#f0fbf5] text-[#28744e]"
      : tone ===
          "gold"
        ? "border-[#ead8a8] bg-[#fff8e5] text-[#8e651f]"
        : tone ===
            "orange"
          ? "border-[#f0d4bf] bg-[#fff5ee] text-[#a45b32]"
          : "border-[#cfe1ed] bg-[#f2f9fd] text-[#16629b]";

  return (
    <div
      className={[
        "rounded-2xl border p-3.5",
        toneClass,
      ].join(
        " ",
      )}
    >
      <div className="flex items-center gap-1.5">
        {tone ===
          "orange" ? (
          <Flame
            size={14}
            aria-hidden="true"
          />
        ) : (
          <Sparkles
            size={14}
            aria-hidden="true"
          />
        )}

        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-extrabold leading-none sm:text-2xl">
        {value}
      </p>

      <p className="mt-1.5 text-[11px] font-semibold opacity-70">
        {detail}
      </p>
    </div>
  );
}