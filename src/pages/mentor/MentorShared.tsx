import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";

import type { SidebarItem } from "../../components/layout/Sidebar";

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
    icon: UsersRound,
  },
  {
    label: "Dossier",
    path: "/mentor/dossier",
    icon: ClipboardList,
  },
  {
    label: "Scheduling",
    path: "/mentor/availability",
    icon: CalendarDays,
  },
  {
    label: "Meeting Confirmation",
    path: "/mentor/bookings",
    icon: CheckCircle2,
  },
  {
    label: "Action Plans",
    path: "/mentor/action-plans",
    icon: BriefcaseBusiness,
  },
  {
    label: "Documents Library",
    path: "/mentor/documents",
    icon: BookOpen,
  },
  {
    label: "Settings",
    path: "/mentor/settings",
    icon: Settings,
  },
  {
    label: "Support",
    path: "/mentor/support",
    icon: LifeBuoy,
  },
  {
    label: "Profile",
    path: "/mentor/profile",
    icon: UserRound,
  },
];

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {helper}
      </p>
    </div>
  );
}
