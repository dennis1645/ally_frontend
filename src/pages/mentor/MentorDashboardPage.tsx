import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  UserRound,
  UsersRound,
} from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import type {
  SidebarItem,
} from "../../components/layout/Sidebar";

const mentorSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/mentor/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "My Mentees",
    path: "/mentor/mentees",
    icon: UsersRound,
  },
  {
    label: "Availability",
    path: "/mentor/availability",
    icon: CalendarDays,
  },
  {
    label: "Mentor Sessions",
    path: "/mentor/sessions",
    icon: ClipboardList,
  },
  {
    label: "Action Items",
    path: "/mentor/action-items",
    icon: ClipboardList,
  },
  {
    label: "Profile",
    path: "/mentor/profile",
    icon: UserRound,
  },
];

export default function MentorDashboardPage() {
  return (
    <UserLayout
      title="Mentor Headquarters"
      subtitle="Lantern Guide Dashboard"
      sidebarItems={mentorSidebarItems}>
      <section
        aria-label="Mentor dashboard content"
        className="min-h-[calc(100vh-80px)] bg-ally-background"
      >
        {/* Mentor dashboard content will be implemented here later. */}
      </section>
    </UserLayout>
  );
}