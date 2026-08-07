import {
  CreditCard,
  GraduationCap,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";
import Card from "../../components/ui/Card";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useEffect, useState } from "react";
import { getUsers, type AdminUser } from "../../api/adminApi";
import { adminSidebarItems } from "./adminSidebarItems";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const safeUsers = Array.isArray(users) ? users : [];
  const userCount = users === null ? null : safeUsers.length;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getUsers();

        if (!mounted) return;

        setUsers(data);
      } catch (err: any) {
        setError(
          err?.message || "Gagal mengambil data pengguna",
        );
        setUsers([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  return (
    <UserLayout
      title="Admin Control Center"
      subtitle="Cartographer Dashboard"
      sidebarItems={adminSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section
        aria-label="Admin dashboard content"
        className="min-h-[calc(100vh-80px)] bg-ally-background p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Overview of platform activity and system metrics</p>
            </div>

            <div className="flex items-center gap-3">
              <PrimaryButton size="md">Invite Admin</PrimaryButton>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card title="Total Users" padding="md" className="flex items-center justify-between">
              <div className="text-3xl font-bold">{userCount === null ? "—" : userCount}</div>
              <UsersRound className="h-8 w-8 text-ally-primary" />
            </Card>

            <Card title="Active Mentors" padding="md" className="flex items-center justify-between">
              <div className="text-3xl font-bold">{userCount === null ? "—" : safeUsers.filter((u) => u.role === "mentor").length}</div>
              <ShieldCheck className="h-8 w-8 text-ally-primary" />
            </Card>

            <Card title="Open Scholarships" padding="md" className="flex items-center justify-between">
              <div className="text-3xl font-bold">8</div>
              <GraduationCap className="h-8 w-8 text-ally-primary" />
            </Card>

            <Card title="Pending Payments" padding="md" className="flex items-center justify-between">
              <div className="text-3xl font-bold">24</div>
              <CreditCard className="h-8 w-8 text-ally-primary" />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card title="Platform Activity" description="Last 30 days" padding="md">
                <div className="h-64 flex items-center justify-center rounded-md border border-dashed border-slate-200 bg-white/50 text-sm text-slate-400">
                  Chart placeholder
                </div>
              </Card>
            </div>

            <div>
              <Card title="Recent Users" padding="md">
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}

                {!users && !error && (
                  <div className="text-sm text-slate-500">Loading...</div>
                )}

                {users && (
                  <ul className="space-y-4">
                    {users.slice(0, 6).map((u) => (
                      <li key={u.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-sm text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
                        </div>

                        <div className="text-sm text-slate-500">{u.role ?? "User"}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}