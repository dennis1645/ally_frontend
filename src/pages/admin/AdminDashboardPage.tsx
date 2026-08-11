import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Activity,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  ClipboardList,
  CreditCard,
  DollarSign,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
} from "lucide-react";

import {
  getAdminDashboardStats,
  type AdminDashboardRecentUser,
  type AdminDashboardStats,
} from "../../api/adminApi";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  if (!value) {
    return "—";
  }

  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T");

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRole(value: string): string {
  if (!value) {
    return "User";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function OverviewCard({
  label,
  value,
  note,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <h3 className="mt-1 text-2xl font-bold text-gray-800">
          {value}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {note}
        </p>
      </div>

      <div className={`ml-4 shrink-0 rounded-lg p-3 ${iconClassName}`}>
        {icon}
      </div>
    </div>
  );
}

type ModuleMetric = {
  label: string;
  value: string;
};

function ModuleCard({
  title,
  description,
  icon,
  iconClassName,
  metrics,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
  metrics: ModuleMetric[];
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>

        <div className={`shrink-0 rounded-xl p-2.5 ${iconClassName}`}>
          {icon}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl bg-gray-50 px-3 py-3"
          >
            <p className="text-lg font-bold text-gray-900">
              {metric.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium leading-4 text-gray-500">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const normalized = role.toLowerCase();

  const className =
    normalized === "admin"
      ? "bg-violet-100 text-violet-700"
      : normalized === "mentor"
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {formatRole(role)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const active = normalized === "active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
      }`}
    >
      {formatRole(status)}
    </span>
  );
}

function RecentUserRow({
  user,
}: {
  user: AdminDashboardRecentUser;
}) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
            {getInitials(user.name) || "U"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={user.status} />
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
        {formatDateTime(user.createdAt)}
      </td>
    </tr>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStats(
    mode: "initial" | "refresh" = "initial",
  ) {
    try {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to load admin dashboard statistics.",
        ),
      );
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void loadStats("initial");
  }, []);

  return (
    <UserLayout
      title="Admin Dashboard"
      subtitle="Platform overview and management statistics"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Live platform metrics from the admin dashboard statistics API.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadStats("refresh")}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Loading dashboard statistics...
          </div>
        ) : stats ? (
          <>
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Platform Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <OverviewCard
                  label="Total Users"
                  value={formatNumber(stats.overview.totalUsers)}
                  note="Overview user count"
                  icon={<Users size={24} />}
                  iconClassName="bg-blue-50 text-blue-600"
                />

                <OverviewCard
                  label="Active Mentors"
                  value={formatNumber(stats.overview.activeMentors)}
                  note="Currently active mentor accounts"
                  icon={<UserCheck size={24} />}
                  iconClassName="bg-emerald-50 text-emerald-600"
                />

                <OverviewCard
                  label="Open Scholarships"
                  value={formatNumber(stats.overview.openScholarships)}
                  note="Applications currently open"
                  icon={<GraduationCap size={24} />}
                  iconClassName="bg-violet-50 text-violet-600"
                />

                <OverviewCard
                  label="Pending Payments"
                  value={formatNumber(stats.overview.pendingPayments)}
                  note="Transactions awaiting completion"
                  icon={<CreditCard size={24} />}
                  iconClassName="bg-amber-50 text-amber-600"
                />
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Management Modules
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Metrics are displayed directly from each section of the dashboard response.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ModuleCard
                  title="User Management"
                  description="Registered accounts and account status distribution."
                  icon={<Users size={20} />}
                  iconClassName="bg-blue-50 text-blue-600"
                  metrics={[
                    {
                      label: "Total Accounts",
                      value: formatNumber(stats.userManagement.totalUsers),
                    },
                    {
                      label: "Active",
                      value: formatNumber(stats.userManagement.activeUsers),
                    },
                    {
                      label: "Suspended",
                      value: formatNumber(stats.userManagement.suspendedUsers),
                    },
                  ]}
                />

                <ModuleCard
                  title="Finance"
                  description="Revenue, premium membership, and transaction activity."
                  icon={<DollarSign size={20} />}
                  iconClassName="bg-emerald-50 text-emerald-600"
                  metrics={[
                    {
                      label: "Monthly Revenue",
                      value: formatCurrency(stats.finance.monthlyRevenue),
                    },
                    {
                      label: "Premium Users",
                      value: formatNumber(stats.finance.premiumUsers),
                    },
                    {
                      label: "Transactions",
                      value: formatNumber(stats.finance.transactionCount),
                    },
                  ]}
                />

                <ModuleCard
                  title="Universities"
                  description="University catalog coverage and archived records."
                  icon={<Building2 size={20} />}
                  iconClassName="bg-cyan-50 text-cyan-600"
                  metrics={[
                    {
                      label: "Universities",
                      value: formatNumber(stats.university.totalUniversities),
                    },
                    {
                      label: "Countries",
                      value: formatNumber(stats.university.countriesCovered),
                    },
                    {
                      label: "Archived",
                      value: formatNumber(stats.university.archivedUniversities),
                    },
                  ]}
                />

                <ModuleCard
                  title="Scholarships"
                  description="Active programs, open applications, and funding coverage."
                  icon={<Award size={20} />}
                  iconClassName="bg-violet-50 text-violet-600"
                  metrics={[
                    {
                      label: "Active Programs",
                      value: formatNumber(
                        stats.scholarship.totalActivePrograms,
                      ),
                    },
                    {
                      label: "Open Applications",
                      value: formatNumber(stats.scholarship.openApplications),
                    },
                    {
                      label: "Fully Funded",
                      value: `${formatNumber(
                        stats.scholarship.fullyFundedRatio,
                      )}%`,
                    },
                  ]}
                />

                <ModuleCard
                  title="Initial Assessment"
                  description="Question-bank size currently reported by the backend dashboard."
                  icon={<ClipboardList size={20} />}
                  iconClassName="bg-orange-50 text-orange-600"
                  metrics={[
                    {
                      label: "Diagnostic Questions",
                      value: formatNumber(
                        stats.assessment.totalDiagnosticQuestions,
                      ),
                    },
                    {
                      label: "Source",
                      value: "API",
                    },
                    {
                      label: "Module",
                      value: "Initial",
                    },
                  ]}
                />

                <ModuleCard
                  title="Shop"
                  description="Active catalog, token/top-up packages, and purchases."
                  icon={<Store size={20} />}
                  iconClassName="bg-amber-50 text-amber-600"
                  metrics={[
                    {
                      label: "Active Catalog",
                      value: formatNumber(stats.shop.totalActiveCatalog),
                    },
                    {
                      label: "Token Packages",
                      value: formatNumber(stats.shop.topUpPackages),
                    },
                    {
                      label: "Total Purchased",
                      value: formatNumber(stats.shop.totalPurchased),
                    },
                  ]}
                />

                <ModuleCard
                  title="Practice Tests"
                  description="Practice exam inventory, question bank, and attempts."
                  icon={<BookOpen size={20} />}
                  iconClassName="bg-indigo-50 text-indigo-600"
                  metrics={[
                    {
                      label: "Practice Exams",
                      value: formatNumber(stats.practice.totalPracticeExams),
                    },
                    {
                      label: "Question Bank",
                      value: formatNumber(stats.practice.questionBankSize),
                    },
                    {
                      label: "Test Attempts",
                      value: formatNumber(stats.practice.totalTestAttempts),
                    },
                  ]}
                />

                <ModuleCard
                  title="Gamification"
                  description="Badge catalog activity and badge unlock volume."
                  icon={<BadgeCheck size={20} />}
                  iconClassName="bg-rose-50 text-rose-600"
                  metrics={[
                    {
                      label: "Active Badges",
                      value: formatNumber(
                        stats.gamification.totalActiveBadges,
                      ),
                    },
                    {
                      label: "Badges Unlocked",
                      value: formatNumber(stats.gamification.badgesUnlocked),
                    },
                    {
                      label: "Catalog Status",
                      value:
                        stats.gamification.totalActiveBadges > 0
                          ? "Active"
                          : "Empty",
                    },
                  ]}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Recent Users
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Latest accounts returned by overview.recent_users.
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Users size={18} />
                  </div>
                </div>

                {stats.overview.recentUsers.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-500">
                    No recent users were returned by the dashboard API.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            User
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Role
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Joined
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {stats.overview.recentUsers.map((user) => (
                          <RecentUserRow key={user.id} user={user} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Account Health
                      </h3>
                      <p className="text-xs text-gray-500">
                        Current user status distribution
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-600">
                        Registered users
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatNumber(stats.finance.registeredUsers)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-600">
                        Active users
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatNumber(stats.userManagement.activeUsers)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-600">
                        Premium users
                      </span>
                      <span className="font-bold text-blue-700">
                        {formatNumber(stats.finance.premiumUsers)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Scholarship Snapshot
                      </h3>
                      <p className="text-xs text-gray-500">
                        Current program availability
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(
                          stats.scholarship.fullyFundedCount,
                        )}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Fully funded programs
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.scholarship.openApplications)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Open applications
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Dashboard statistics are unavailable.
          </div>
        )}
      </div>
    </UserLayout>
  );
}