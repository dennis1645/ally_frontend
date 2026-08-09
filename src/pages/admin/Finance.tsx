import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import PrimaryButton from "../../components/ui/PrimaryButton";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import { getFinanceSummary, getTransactions, type FinanceSummary } from "../../api/financeApi";

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary>({});
  const [transactions, setTransactions] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [summaryResponse, txs] = await Promise.all([
          getFinanceSummary(),
          getTransactions(),
        ]);

        if (!mounted) {
          return;
        }

        setSummary(summaryResponse);
        setTransactions(txs.length);
      } catch (err: any) {
        if (!mounted) {
          return;
        }
        setError(err?.message || "Gagal memuat metrik finansial");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const revenue = summary.revenue ?? 0;
  const revenueChange = summary.revenue_change ?? 0;
  const premiumUsers = summary.premium_users ?? 0;
  const registeredUsers = summary.registered_users ?? 0;

  const revenueDirection = useMemo(
    () => (revenueChange >= 0 ? "up" : "down"),
    [revenueChange],
  );

  return (
    <UserLayout
      title="Finance Overview"
      subtitle="Revenue, premium subscriptions, and registration metrics"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section className="bg-ally-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Finance Dashboard</h1>
              <p className="text-sm text-slate-500">Revenue and subscription performance.</p>
            </div>
            <PrimaryButton size="md">Export Report</PrimaryButton>
          </div>

          {error && (
            <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card title="Monthly Revenue" padding="md" className="flex flex-col justify-between gap-4">
              <div className="text-3xl font-bold text-slate-900">{loading ? "—" : `Rp ${revenue.toLocaleString("id-ID")}`}</div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {revenueDirection === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-rose-500" />
                )}
                <span>{loading ? "Memuat..." : `${Math.abs(revenueChange)}% ${revenueDirection === "up" ? "lebih tinggi" : "lebih rendah"} dari bulan lalu`}</span>
              </div>
            </Card>

            <Card title="Premium Users" padding="md" className="flex flex-col justify-between gap-4">
              <div className="flex items-center gap-3">
                <UsersRound className="h-8 w-8 text-ally-primary" />
                <div>
                  <div className="text-sm text-slate-500">Total premium users</div>
                  <div className="text-3xl font-bold text-slate-900">{loading ? "—" : premiumUsers}</div>
                </div>
              </div>
            </Card>

            <Card title="Registered Users" padding="md" className="flex flex-col justify-between gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-ally-primary" />
                <div>
                  <div className="text-sm text-slate-500">New registrations</div>
                  <div className="text-3xl font-bold text-slate-900">{loading ? "—" : registeredUsers}</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Transaction Count" padding="md" className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Total recorded transactions</div>
                <div className="text-3xl font-bold text-slate-900">{loading ? "—" : transactions ?? 0}</div>
              </div>
              <CreditCard className="h-10 w-10 text-ally-primary" />
            </Card>

            <Card title="Revenue Trend" padding="md">
              <div className="h-64 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-400">
                {loading ? "Memuat tren revenue..." : "Trend chart placeholder"}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
