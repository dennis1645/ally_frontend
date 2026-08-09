import type {
  LucideIcon,
} from "lucide-react";

import {
  // BookOpenCheck,
  Bot,
  CreditCard,
  // FileText,
  LayoutDashboard,
  Map,
  UsersRound,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  NavLink,
} from "react-router";

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
  // {
  //   label: "Scholarships",
  //   path: "/scholarships",
  //   icon: BookOpenCheck,
  // },
  // {
  //   label: "Documents",
  //   path: "/documents",
  //   icon: FileText,
  // },
  {
    label: "AI Mentor",
    path: "/ally",
    icon: Bot,
  },
  {
    label: "Coaching",
    path: "/sessions",
    icon: UsersRound,
  },
  {
    label: "Billing",
    path: "/billing",
    icon: CreditCard,
  },
];

export default function Sidebar({
  isOpen = false,
  onClose,
  userName,
  userEmail,
  items = defaultUserSidebarItems,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "flex flex-col border-r border-slate-200 bg-white",
          "transition-all duration-200",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // width: collapsed => w-12 (3rem), expanded => w-64
          collapsed ? "w-12" : "w-64",
          // ensure on large screens we use the same widths
          collapsed ? "lg:w-12" : "lg:w-64",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-3 py-6">
          <div>
            <div>
              <span
                className="ally-logo text-[40px] leading-none"
                role="img"
                aria-label="Ally"
              >
                <span
                  aria-hidden="true"
                  className="ally-logo-a"
                >
                  A
                </span>

                <span
                  aria-hidden="true"
                  className="ally-logo-lly"
                >
                  lly
                </span>
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Explorer Portal
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* collapse toggle - visible on lg screens */}
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleCollapse}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:flex"
            >
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>

            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-2 pb-5">
          {items.map((item) => {
            const Icon =
              item.icon;

            if (
              item.disabled
            ) {
              return (
                <div
                  key={
                    item.path
                  }
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300"
                >
                  <Icon
                    size={20}
                  />

                  <span>
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={
                  item.path
                }
                to={
                  item.path
                }
                end={
                  item.end
                }
                onClick={
                  onClose
                }
                className={({
                  isActive,
                }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3",
                    "text-sm font-semibold transition",

                    isActive
                      ? "bg-blue-50 text-ally-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(
                    " ",
                  )
                }
                title={item.label}
              >
                <Icon
                  size={20}
                />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {(userName ||
          userEmail) && (
          <div className="border-t border-slate-100 p-4">
            <div className="rounded-xl bg-slate-50 p-3">
              {userName && (
                <p className="truncate text-sm font-semibold text-slate-800">
                  {userName}
                </p>
              )}

              {userEmail && (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {userEmail}
                </p>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}