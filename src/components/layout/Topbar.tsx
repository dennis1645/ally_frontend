import type { ChangeEvent, ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  LogOut,
  Menu,
  Search,
  Sparkles,
  UserRound,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router";

export type TopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onSparkleClick?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  actions?: ReactNode;
};

export default function Topbar({
  title,
  subtitle,
  onMenuClick,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = true,
  notificationCount = 0,
  onNotificationClick,
  onSparkleClick,
  onLogout,
  isLoggingOut = false,
  actions,
}: TopbarProps) {
  const navigate = useNavigate();
  
  // State & Ref untuk Pop-up Profile
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Menutup pop-up jika user mengeklik di luar area menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    onSearchChange?.(event.target.value);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        
        {/* LEFT SECTION: Menu Toggle & Title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClick}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <Menu size={21} />
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

        {/* RIGHT SECTION: Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {showSearch && (
            <div className="relative hidden md:block">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-52 rounded-full border border-transparent bg-orange-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-200 focus:ring-4 focus:ring-orange-100 lg:w-64"
              />
            </div>
          )}

          {actions}

          {onSparkleClick && (
            <button
              type="button"
              aria-label="Open daily activity"
              onClick={onSparkleClick}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-ally-primary"
            >
              <Sparkles size={21} />
            </button>
          )}

          {onNotificationClick && (
            <button
              type="button"
              aria-label="Open notifications"
              onClick={onNotificationClick}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-ally-primary"
            >
              <Bell size={21} />
              {notificationCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* PROFILE BUTTON WITH POP-UP DROPDOWN */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              aria-label="Open profile menu"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                isProfileOpen ? "bg-slate-100 text-ally-primary" : "text-slate-600 hover:bg-slate-100 hover:text-ally-primary"
              }`}
            >
              <UserRound size={21} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-800">Admin Workspace</p>
                  <p className="text-xs font-medium text-slate-400">admin@ally.com</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/admin/profile");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ally-primary"
                  >
                    <Settings size={16} />
                    Profile Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LOGOUT BUTTON (Red default style) */}
          {onLogout && (
            <button
              type="button"
              aria-label="Log out"
              disabled={isLoggingOut}
              onClick={onLogout}
              className="hidden h-10 items-center gap-2 rounded-xl bg-rose-50 px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
            >
              <LogOut size={19} />
              <span className="hidden xl:inline">
                {isLoggingOut ? "Logging out..." : "Log out"}
              </span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}