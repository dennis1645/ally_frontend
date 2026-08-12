import type {
  ReactNode,
} from "react";

import {
  Backpack,
  Bell,
  Globe,
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
  useTranslation,
} from "react-i18next";

import {
  API_BASE_URL,
} from "../../api/apiClient";

import {
  useAuth,
} from "../../context/AuthContext";

import DocumentVault from "../vault/DocumentVault";
import NotificationPanel from "../notifications/NotificationPanel";

export type TopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  actions?: ReactNode;
  showSearch?: boolean;
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

function LanguageSwitcher() {
  const {
    i18n,
  } =
    useTranslation();

  const currentLanguage =
    (
      i18n.resolvedLanguage ??
      i18n.language ??
      "en"
    )
      .toLowerCase();

  const isIndonesian =
    currentLanguage.startsWith(
      "id",
    );

  const nextLanguage =
    isIndonesian
      ? "en"
      : "id";

  const currentLabel =
    isIndonesian
      ? "ID"
      : "EN";

  return (
    <button
      type="button"
      aria-label={
        isIndonesian
          ? "Switch language to English"
          : "Ganti bahasa ke Indonesia"
      }
      title={
        isIndonesian
          ? "Switch to English"
          : "Ganti ke Bahasa Indonesia"
      }
      onClick={() => {
        void i18n.changeLanguage(
          nextLanguage,
        );
      }}
      className={[
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3",
        "border border-slate-200 bg-white",
        "text-xs font-bold tracking-wider text-slate-700",
        "transition hover:border-[#bad6e7] hover:bg-[#f3f9fd] hover:text-[#16629b]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7edf9]",
      ].join(
        " ",
      )}
    >
      <Globe size={16} className="text-slate-500" />
      <span>{currentLabel}</span>
    </button>
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
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

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

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* Optional page-specific actions */}

            <div className="hidden md:block">
              {
                actions
              }
            </div>

            <LanguageSwitcher />

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
                      setVaultOpen(
                        false,
                      );

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
                Profile Widget (Diperbesar)
            ================================================ */}

            {showExplorerTools &&
            user ? (
              <button
                type="button"
                aria-label="Open profile"
                onClick={() => {
                  setVaultOpen(
                    false,
                  );

                  setNotificationsOpen(
                    false,
                  );

                  navigate(
                    profilePath,
                  );
                }}
                className={[
                  "flex h-12 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-2.5 py-1 sm:px-3.5",
                  "text-left transition",
                  "hover:border-[#bad6e7] hover:bg-[#f3f9fd]",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7edf9]",
                ].join(
                  " ",
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eaf5fb] text-xs font-black text-[#16629b] shadow-xs sm:h-10 sm:w-10 sm:text-sm">
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
                  <span className="block max-w-[140px] truncate text-sm font-extrabold leading-tight text-[#2c1607]">
                    {
                      userName
                    }
                  </span>

                  <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#16629b]">
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
                  setVaultOpen(
                    false,
                  );

                  setNotificationsOpen(
                    false,
                  );

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

            {/* Logout Button */}

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
                className="group flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
              >
                <LogOut
                  size={19}
                  aria-hidden="true"
                  className="text-red-500 transition-colors group-hover:text-red-600"
                />

                <span className="hidden 2xl:inline">
                  {isLoggingOut
                    ? t(
                        "topbar.loggingOut",
                        "Logging out...",
                      )
                    : t(
                        "topbar.logout",
                        "Log out",
                      )}
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