import type { SidebarItem } from "../../components/layout/Sidebar";
import {
  LayoutDashboard,
  UsersRound,
  Landmark,
  GraduationCap,
  ClipboardCheck,
  Store,
  FileQuestion,
  Award,
  CreditCard, // icon untuk Finance
} from "lucide-react";

export const adminSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: UsersRound,
  },
  {
    label: "Finance",
    path: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "University",
    path: "/admin/university",
    icon: Landmark,
  },
  {
    label: "Scholarships",
    path: "/admin/scholarships",
    icon: GraduationCap,
  },
  {
    label: "Initial Assessment",
    path: "/admin/assessment",
    icon: ClipboardCheck,
  },
  {
    label: "Item Shop",
    path: "/admin/shop",
    icon: Store,
  },
  {
    label: "Quiz & Exercises",
    path: "/admin/quiz",
    icon: FileQuestion,
  },
  {
    label: "Badges",
    path: "/admin/badges",
    icon: Award,
  },
];