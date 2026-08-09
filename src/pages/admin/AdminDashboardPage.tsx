import {
  BarChart3,
  CreditCard,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import type {
  SidebarItem,
} from "../../components/layout/Sidebar";

const adminSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "User Management",
    path: "/admin/users",
    icon: UsersRound,
  },
  {
    label: "Scholarships",
    path: "/admin/scholarships",
    icon: GraduationCap,
  },
  {
    label: "Mentor Management",
    path: "/admin/mentors",
    icon: ShieldCheck,
  },
  {
    label: "Capacity Monitoring",
    path: "/admin/capacity",
    icon: Gauge,
  },
  {
    label: "Payments",
    path: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminDashboardPage() {
  return (
    <UserLayout
      title="Admin Control Center"
      subtitle="Cartographer Dashboard"
      sidebarItems={adminSidebarItems}>
      <section
        aria-label="Admin dashboard content"
        className="min-h-[calc(100vh-80px)] bg-ally-background"
      >
        {/* Admin dashboard content will be implemented here later. */}
      </section>
    </UserLayout>
  );
}