import type {
  ReactNode,
} from "react";

import {
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router";

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

  const profilePath = location.pathname.startsWith("/mentor")
    ? "/mentor/profile"
    : "/profile";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* ===============================================
            Left
        ================================================ */}

        <div className="flex min-w-0 items-center gap-3">
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
            />
          </button>

          <div className="min-w-0">
            {subtitle && (
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                {subtitle}
              </p>
            )}

            <h1 className="truncate text-xl font-extrabold text-ally-primary sm:text-2xl lg:text-3xl">
              {title}
            </h1>
          </div>
        </div>

        {/* ===============================================
            Right
        ================================================ */}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">

          {/* Optional page-specific actions */}

          {actions}

          {/* Profile */}

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
            />
          </button>

          {/* Logout */}

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
              />

              <span className="hidden xl:inline">
                {isLoggingOut
                  ? "Logging out..."
                  : "Log out"}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}