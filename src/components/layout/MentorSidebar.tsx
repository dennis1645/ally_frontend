import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Compass,
  LayoutDashboard,
  PanelLeft,
  Users,
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
  items?: SidebarItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

/* =========================================================
   MENTOR SIDEBAR ITEMS (Wajib diexport agar tidak error)
   ========================================================= */
export const mentorSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/mentor/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Explorer Data",
    path: "/mentor/mentees",
    icon: Users,
  },
  {
    label: "Dossier",
    path: "/mentor/dossier",
    icon: ClipboardList,
  },
  {
    label: "Availability & Schedule Confirmation",
    path: "/mentor/availability",
    icon: CalendarDays,
  },
  {
    label: "Action Plans",
    path: "/mentor/action-plans",
    icon: Briefcase,
  },
  {
    label: "Documents Library",
    path: "/mentor/documents",
    icon: BookOpen,
  },
];

/* =========================================================
   SIDEBAR COMPONENT
   ========================================================= */
export default function MentorSidebar({
  isOpen = false,
  onClose,
  items = mentorSidebarItems,
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
          collapsed ? "w-16" : "w-72", // Dilebarkan sedikit agar teks panjang tidak terpotong
          collapsed ? "lg:w-16" : "lg:w-72",
        ].join(" ")}
      >
        {/* =====================================================
            HEADER
            ===================================================== */}
        <div
          className={[
            "flex",
            collapsed
              ? "flex-col items-center pt-6 pb-4"
              : "items-center justify-between px-4 py-6",
          ].join(" ")}
        >
          {collapsed ? (
            /* Toggle Button saat sidebar tertutup */
            <div className="group relative flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Open sidebar"
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#16629b] text-white transition-colors duration-200 group-hover:bg-slate-100 group-hover:text-slate-600"
              >
                <Compass size={22} strokeWidth={2.5} className="block group-hover:hidden" />
                <PanelLeft size={20} className="hidden group-hover:block" />
              </button>

              {/* Tooltip Open Sidebar */}
              <div className="pointer-events-none absolute left-14 top-1/2 z-50 w-max -translate-y-1/2 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                Open sidebar
              </div>
            </div>
          ) : (
            /* Tampilan normal saat sidebar terbuka */
            <>
              <div>
                <span
                  className="ally-logo text-[40px] leading-none text-[#16629b] font-black tracking-tighter"
                  role="img"
                  aria-label="Ally"
                >
                  <span aria-hidden="true" className="ally-logo-a">A</span>
                  <span aria-hidden="true" className="ally-logo-lly">lly</span>
                </span>
                <p className="mt-1 text-xs font-medium text-slate-400">Guide Portal</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Desktop collapse toggle */}
                <div className="group relative flex items-center">
                  <button
                    type="button"
                    aria-label="Collapse sidebar"
                    onClick={onToggleCollapse}
                    className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:flex"
                  >
                    <PanelLeft size={20} />
                  </button>
                  
                  {/* Tooltip Close Sidebar */}
                  <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-max -translate-x-1/2 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                    Close sidebar
                  </div>
                </div>

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
        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-5 custom-scrollbar">
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
                    collapsed ? "justify-center px-0" : "gap-3 px-3",
                  ].join(" ")}
                >
                  <Icon size={20} className="shrink-0" />
                  {!collapsed && <span className="leading-snug">{item.label}</span>}
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
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    "flex items-center rounded-xl py-3",
                    "text-sm font-semibold transition-colors duration-200",
                    collapsed ? "justify-center px-0" : "gap-3 px-3",
                    isActive
                      ? "bg-slate-50 text-[#16629b] shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="leading-snug">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* CSS internal scrollbar agar rapi jika menu banyak */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}