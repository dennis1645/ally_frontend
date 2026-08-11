import type {
  ReactNode,
} from "react";

import {
  Backpack,
  Bell,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router";

import {
  API_BASE_URL,
} from "../../api/apiClient";

import {
  useAuth,
} from "../../context/AuthContext";

import DocumentVault from "../vault/DocumentVault";
import NotificationPanel from "../notifications/NotificationPanel";

export type TopbarProps = {
  title:
    string;

  subtitle?:
    string;

  onMenuClick?:
    () => void;

  onLogout?:
    () => void;

  isLoggingOut?:
    boolean;

  actions?:
    ReactNode;

  // Kept for compatibility with pages that configure the topbar.
  // The current Topbar does not render a search control.
  showSearch?:
    boolean;
};

function resolveProfilePictureUrl(
  profilePictureUrl:
    | string
    | null
    | undefined,
): string | null {
  if (
    !profilePictureUrl?.trim()
  ) {
    return null;
  }

  const value =
    profilePictureUrl.trim();

  if (
    value.startsWith(
      "http://",
    ) ||
    value.startsWith(
      "https://",
    ) ||
    value.startsWith(
      "blob:",
    ) ||
    value.startsWith(
      "data:",
    )
  ) {
    return value;
  }

  try {
    const apiOrigin =
      new URL(
        API_BASE_URL,
      ).origin;

    return `${apiOrigin}/${value.replace(
      /^\/+/,
      "",
    )}`;
  } catch {
    return value;
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

export default function Topbar({
  title,
  subtitle,
  onMenuClick,
  onLogout,
  isLoggingOut = false,
  actions,
}: TopbarProps) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    user,
  } =
    useAuth();

  const [
    vaultOpen,
    setVaultOpen,
  ] =
    useState(
      false,
    );

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] =
    useState(
      false,
    );

  const isMentorArea =
    location.pathname.startsWith(
      "/mentor",
    );

  const isAdminArea =
    location.pathname.startsWith(
      "/admin",
    );

  /*
   * The enhanced expedition controls are intentionally scoped to
   * normal user/explorer pages so shared mentor/admin topbars are
   * not unintentionally redesigned.
   */
  const showExplorerTools =
    !isMentorArea &&
    !isAdminArea;

  const profilePath =
    isMentorArea
      ? "/mentor/profile"
      : "/profile";

  const profilePicture =
    useMemo(
      () =>
        resolveProfilePictureUrl(
          user?.profile_picture_url ??
            user?.profile_picture,
        ),
      [
        user?.profile_picture,
        user?.profile_picture_url,
      ],
    );

  const displayLevel =
    user?.level ??
    user?.expedition_level ??
    null;

  const userName =
    user?.name?.trim() ||
    "Explorer";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex min-h-20 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          {/* ===============================================
              Left
          ================================================ */}

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={
                onMenuClick
              }
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-ally-primary lg:hidden"
            >
              <Menu
                size={22}
                aria-hidden="true"
              />
            </button>

            <div className="min-w-0">
              {subtitle && (
                <p className="hidden truncate text-xs font-semibold uppercase tracking-wider text-slate-400 sm:block">
                  {
                    subtitle
                  }
                </p>
              )}

              <h1 className="truncate text-lg font-extrabold text-ally-primary sm:text-2xl lg:text-3xl">
                {
                  title
                }
              </h1>
            </div>
          </div>

          {/* ===============================================
              Right
          ================================================ */}

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Optional page-specific actions */}

            <div className="hidden md:block">
              {
                actions
              }
            </div>

            {showExplorerTools && (
              <>
                {/* Document Vault / Expedition Backpack */}

                <div className="relative">
                  <button
                    type="button"
                    aria-label="Open Document Vault"
                    aria-expanded={
                      vaultOpen
                    }
                    onClick={() => {
                      setNotificationsOpen(
                        false,
                      );

                      setVaultOpen(
                        (
                          current,
                        ) =>
                          !current,
                      );
                    }}
                    className={[
                      "grid h-10 w-10 place-items-center rounded-xl",
                      "text-slate-600 transition",
                      vaultOpen
                        ? "bg-[#eef6fb] text-[#16629b]"
                        : "hover:bg-[#eef6fb] hover:text-[#16629b]",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7edf9]",
                    ].join(
                      " ",
                    )}
                  >
                    <Backpack
                      size={21}
                      aria-hidden="true"
                    />
                  </button>

                  <DocumentVault
                    open={
                      vaultOpen
                    }
                    onClose={() => {
                      setVaultOpen(
                        false,
                      );
                    }}
                  />
                </div>

                {/* Notifications */}

                <div className="relative">
                  <button
                    type="button"
                    aria-label="Open notifications"
                    aria-expanded={
                      notificationsOpen
                    }
                    onClick={() => {
                      setNotificationsOpen(
                        (
                          current,
                        ) =>
                          !current,
                      );
                    }}
                    className={[
                      "relative grid h-10 w-10 place-items-center rounded-xl",
                      "text-slate-600 transition",
                      "hover:bg-[#fff7e9] hover:text-[#a36b22]",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4e5c8]",
                    ].join(
                      " ",
                    )}
                  >
                    <Bell
                      size={20}
                      aria-hidden="true"
                    />

                    {/*
                     * No unread badge is rendered because no notification
                     * count API is currently documented.
                     */}
                  </button>

                  <NotificationPanel
                    open={
                      notificationsOpen
                    }
                    onClose={() => {
                      setNotificationsOpen(
                        false,
                      );
                    }}
                  />
                </div>
              </>
            )}

            {/* ===============================================
                Profile
            ================================================ */}

            {showExplorerTools &&
            user ? (
              <button
                type="button"
                aria-label="Open profile"
                onClick={() => {
                  navigate(
                    profilePath,
                  );
                }}
                className={[
                  "flex h-11 items-center gap-2 rounded-2xl",
                  "border border-transparent px-1.5 sm:px-2.5",
                  "text-left transition",
                  "hover:border-[#d8e7f0] hover:bg-[#f6fbfe]",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7edf9]",
                ].join(
                  " ",
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eaf5fb] text-xs font-extrabold text-[#16629b]">
                  {profilePicture ? (
                    <img
                      src={
                        profilePicture
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(
                      userName,
                    )
                  )}
                </span>

                <span className="hidden min-w-0 sm:block">
                  <span className="block max-w-[120px] truncate text-xs font-extrabold leading-4 text-[#2c1607]">
                    {
                      userName
                    }
                  </span>

                  <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#16629b]">
                    {displayLevel !==
                    null
                      ? `Level ${String(
                          displayLevel,
                        )}`
                      : "Explorer"}
                  </span>
                </span>
              </button>
            ) : (
              <button
                type="button"
                aria-label="Open profile"
                onClick={() => {
                  navigate(
                    profilePath,
                  );
                }}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-ally-primary"
              >
                <UserRound
                  size={21}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* ===============================================
                Existing Logout — preserved
            ================================================ */}

            {onLogout && (
              <button
                type="button"
                aria-label="Log out"
                disabled={
                  isLoggingOut
                }
                onClick={
                  onLogout
                }
                className="flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
              >
                <LogOut
                  size={19}
                  aria-hidden="true"
                />

                <span className="hidden 2xl:inline">
                  {isLoggingOut
                    ? "Logging out..."
                    : "Log out"}
                </span>
              </button>
            )}
          </div>
        </div>

        {actions && (
          <div className="border-t border-slate-100 px-3 py-2 md:hidden sm:px-6">
            <div className="flex justify-end">
              {actions}
            </div>
          </div>
        )}
      </header>

    </>
  );
}