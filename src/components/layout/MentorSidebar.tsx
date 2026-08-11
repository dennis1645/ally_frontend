import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  BriefcaseBusiness,
  BookOpen,
//   Settings,
//   LifeBuoy,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";

import type { SidebarItem } from "./Sidebar";

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
//   {
//     label: "Settings",
//     path: "/mentor/settings",
//     icon: Settings,
//   },
//   {
//     label: "Support",
//     path: "/mentor/support",
//     icon: LifeBuoy,
//   },
];