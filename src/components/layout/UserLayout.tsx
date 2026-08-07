import {
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router";

import { useAuth } from "../../context/AuthContext";

import Sidebar, {
  type SidebarItem,
} from "./Sidebar";

import Topbar, {
  type TopbarProps,
} from "./Topbar";

export type UserLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;

  sidebarItems?: SidebarItem[];

  topbarProps?: Omit<
    TopbarProps,
    | "title"
    | "subtitle"
    | "onMenuClick"
    | "onLogout"
    | "isLoggingOut"
  >;

  level?: number;
  progress?: number;
};

export default function UserLayout({
  children,
  title,
  subtitle,
  sidebarItems,
  topbarProps,
  level,
  progress,
}: UserLayoutProps) {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  async function handleLogout(): Promise<void> {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout request failed:",
        error,
      );
    } finally {
      navigate("/auth", {
        replace: true,
      });

      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-ally-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() =>
          setIsSidebarOpen(false)
        }
        onLogout={() => {
          void handleLogout();
        }}
        isLoggingOut={isLoggingOut}
        userName={user?.name}
        userEmail={user?.email}
        level={level}
        progress={progress}
        items={sidebarItems}
      />

      <div className="min-h-screen lg:pl-64">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() =>
            setIsSidebarOpen(true)
          }
          onLogout={() => {
            void handleLogout();
          }}
          isLoggingOut={isLoggingOut}
          {...topbarProps}
        />

        <main className="min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}