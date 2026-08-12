import type { LucideIcon } from "lucide-react";

import {
  Bot,
  Compass,
  CreditCard,
  LayoutDashboard,
  Map,
  PanelLeft,
  X,
} from "lucide-react";

import { NavLink } from "react-router";

export type SidebarItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
};

export type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  userName?: string;
  userEmail?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

/* =========================================================
   USER SIDEBAR
   ========================================================= */

export const defaultUserSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Quest Tracker",
    path: "/quests",
    icon: Map,
  },
  {
    label: "AI Chatbot",
    path: "/ally",
    icon: Bot,
  },
  {
    label: "Subscription",
    path: "/billing",
    icon: CreditCard,
  },
];

/* =========================================================
   SIDEBAR COMPONENT
   ========================================================= */

export default function Sidebar({
  isOpen = false,
  onClose,
  items = defaultUserSidebarItems,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "flex flex-col border-r border-slate-200 bg-white",
          "transition-all duration-200",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-16" : "w-64",
          collapsed ? "lg:w-16" : "lg:w-64",
        ].join(" ")}
      >
        {/* =====================================================
            HEADER
            ===================================================== */}

        <div
          className={[
            "flex",
            collapsed
              ? "flex-col items-center pt-6 pb-4" // Jika ditutup, cukup padding atas bawah
              : "items-center justify-between px-3 py-6",
          ].join(" ")}
        >
          {collapsed ? (
            /* Toggle Button yang tergabung dengan Logo Kompas */
            <div className="group relative flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Open sidebar"
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#16629b] text-white transition-colors duration-200 group-hover:bg-slate-100 group-hover:text-slate-600"
              >
                {/* Ikon Kompas tampil saat normal */}
                <Compass size={22} strokeWidth={2.5} className="block group-hover:hidden" />
                
                {/* Ikon PanelLeft tampil saat di-hover */}
                <PanelLeft size={20} className="hidden group-hover:block" />
              </button>

              {/* Custom Tooltip "Open sidebar" */}
              <div className="pointer-events-none absolute left-14 top-1/2 z-50 w-max -translate-y-1/2 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                Open sidebar
              </div>
            </div>
          ) : (
            /* Tampilan normal saat sidebar terbuka (Teks Logo Ally + Tombol Toggle Terpisah) */
            <>
              <div>
                <span
                  className="ally-logo text-[40px] leading-none"
                  role="img"
                  aria-label="Ally"
                >
                  <span aria-hidden="true" className="ally-logo-a">
                    A
                  </span>
                  <span aria-hidden="true" className="ally-logo-lly">
                    lly
                  </span>
                </span>
                <p className="mt-1 text-xs text-slate-400">Explorer Portal</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Desktop collapse toggle */}
                <button
                  type="button"
                  aria-label="Collapse sidebar"
                  onClick={onToggleCollapse}
                  className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:flex"
                >
                  <PanelLeft size={20} />
                </button>

                {/* Mobile close */}
                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={onClose}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
                >
                  <X size={20} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            NAVIGATION
            ===================================================== */}

        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-2 pb-5">
          {items.map((item) => {
            const Icon = item.icon;

            /* Disabled item */
            if (item.disabled) {
              return (
                <div
                  key={item.path}
                  className={[
                    "flex cursor-not-allowed items-center rounded-xl py-3",
                    "text-sm font-semibold text-slate-300",
                    collapsed ? "justify-center px-0" : "gap-3 px-4",
                  ].join(" ")}
                  title={item.label}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              );
            }

            /* Active / normal navigation item */
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                title={collapsed ? item.label : undefined} // Native tooltip saat hover ikon menu
                className={({ isActive }) =>
                  [
                    "flex items-center rounded-xl py-3",
                    "text-sm font-semibold transition",
                    collapsed ? "justify-center px-0" : "gap-3 px-4",
                    isActive
                      ? "bg-blue-50 text-ally-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}