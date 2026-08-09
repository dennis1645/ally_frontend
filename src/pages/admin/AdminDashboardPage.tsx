import {
  CreditCard,
  GraduationCap,
  TrendingUp,
  UsersRound,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Send,
} from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import Card from "../../components/ui/Card";
import { useEffect, useState } from "react";
// import { getDashboardMetrics, getActionTasks, updateTaskStatus } from "../../api/adminApi";
import { adminSidebarItems } from "./adminSidebarItems";

// --- Types ---
interface FeatureUsage {
  name: string;
  percentage: number;
  colorClass: string;
}

type TaskStatus = "Pending" | "Process" | "Done";

interface ActionTask {
  id: string;
  userName: string;
  email: string;
  plan: "Free" | "Medium" | "Premium";
  requestType: "Payment Sync" | "General Support" | "Account Issue";
  detail: string;
  status: TaskStatus;
}

interface DashboardMetrics {
  activeUsers: { total: number; freePct: number; medPct: number; premPct: number; growth: number };
  conversion: { rate: number; growth: number };
  scholarships: { total: number; closingSoon: number };
  features: {
    mostUsed: FeatureUsage[];
    leastUsed: FeatureUsage[];
  };
}

export default function AdminDashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Done Confirmation Modal & Email trigger
  const [pendingDoneTaskId, setPendingDoneTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600)); 

        const mockMetrics: DashboardMetrics = {
          activeUsers: { total: 12450, freePct: 80, medPct: 15, premPct: 5, growth: 8 },
          conversion: { rate: 4.2, growth: 1.2 },
          scholarships: { total: 142, closingSoon: 12 },
          features: {
            mostUsed: [
              { name: "Initial Assessment", percentage: 45, colorClass: "bg-ally-primary" },
              { name: "IELTS Quiz Task 1", percentage: 30, colorClass: "bg-blue-400" },
              { name: "University Search", percentage: 15, colorClass: "bg-purple-400" },
            ],
            leastUsed: [
              { name: "Referral Invite", percentage: 2, colorClass: "bg-rose-400" },
              { name: "Forum Discussion", percentage: 3, colorClass: "bg-orange-400" },
              { name: "Profile Badges", percentage: 5, colorClass: "bg-amber-400" },
            ]
          }
        };

        const mockTasks: ActionTask[] = [
          { id: "1", userName: "Budi S.", email: "budi@email.com", plan: "Premium", requestType: "Payment Sync", detail: "Midtrans Webhook Timeout", status: "Pending" },
          { id: "2", userName: "Siti A.", email: "siti@email.com", plan: "Medium", requestType: "General Support", detail: "Inquiry on LPDP Scholarship", status: "Process" },
          { id: "3", userName: "Amanda P.", email: "amanda@email.com", plan: "Free", requestType: "Account Issue", detail: "Reset Password Request", status: "Pending" },
        ];

        if (!mounted) return;
        setMetrics(mockMetrics);
        setTasks(mockTasks);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch dashboard data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedMonth, selectedYear]);

  // Calculate active tasks count (status != Done)
  const activeTasksCount = tasks.filter((t) => t.status !== "Done").length;

  // Dropdown Status Change Handler with restriction against going back to Pending from Process
  const handleDropdownChange = (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    
    // Prevent going back from Process to Pending
    if (targetTask?.status === "Process" && newStatus === "Pending") {
      return;
    }

    if (newStatus === "Done") {
      setPendingDoneTaskId(taskId);
      setIsModalOpen(true);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }
  };

  // Final Confirmation to Resolve Task & Send Email
  const confirmResolveTask = () => {
    if (!pendingDoneTaskId) return;

    const targetTask = tasks.find((t) => t.id === pendingDoneTaskId);

    setTasks((prev) =>
      prev.map((t) => (t.id === pendingDoneTaskId ? { ...t, status: "Done" } : t))
    );

    setIsModalOpen(false);
    setPendingDoneTaskId(null);

    alert(`Success: The task has been resolved. A notification email has been automatically sent to the user's Gmail (${targetTask?.email}).`);
  };

  const cancelResolveTask = () => {
    setIsModalOpen(false);
    setPendingDoneTaskId(null);
  };

  const targetTaskToResolve = tasks.find((t) => t.id === pendingDoneTaskId);

  return (
    <UserLayout
      title="Admin Control Center"
      subtitle="Overview of platform activity"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <section
        aria-label="Admin dashboard content"
        className="min-h-[calc(100vh-80px)] bg-ally-background p-4 sm:p-6 relative"
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          
          {/* TOP SECTION: Header & Dynamic Filter */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-xs sm:text-sm text-slate-500">Platform operational health and growth metrics</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer hover:text-slate-900"
              >
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
              <span className="text-slate-300">|</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer hover:text-slate-900"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* KPI SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card padding="md" className="flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Active Users</p>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {isLoading ? "..." : metrics?.activeUsers.total.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <UsersRound className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              {!isLoading && metrics && (
                <div className="mt-3 text-[11px] sm:text-xs text-slate-500 flex justify-between items-center">
                  <span className="text-emerald-600 font-medium">+{metrics.activeUsers.growth}% mo-mo</span>
                  <span>{metrics.activeUsers.freePct}% F | {metrics.activeUsers.medPct}% M | {metrics.activeUsers.premPct}% P</span>
                </div>
              )}
            </Card>

            <Card padding="md" className="flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Upgrade Conv</p>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {isLoading ? "..." : `${metrics?.conversion.rate}%`}
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-emerald-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
              </div>
              {!isLoading && metrics && (
                <div className="mt-3 text-[11px] sm:text-xs text-slate-500">
                  <span className="text-emerald-600 font-medium">+{metrics.conversion.growth}%</span> (Free to Paid)
                </div>
              )}
            </Card>

            <Card padding="md" className="flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Scholarships</p>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {isLoading ? "..." : metrics?.scholarships.total}
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
              {!isLoading && metrics && (
                <div className="mt-3 text-[11px] sm:text-xs text-slate-500">
                  <span className="text-amber-600 font-medium">{metrics.scholarships.closingSoon} Closing Soon</span>
                </div>
              )}
            </Card>

            {/* PENDING TASKS CARD */}
            <Card padding="md" className="flex flex-col justify-center border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Pending Tasks</p>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {isLoading ? "..." : activeTasksCount}
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-amber-50 rounded-lg">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-3 text-[11px] sm:text-xs text-amber-600 font-medium">
                Actions In Progress / Pending
              </div>
            </Card>
          </div>

          {/* ANALYTICS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-h-[220px]">
            <Card title="User Plan Growth Trend" padding="md" className="lg:col-span-6 flex flex-col">
              <div className="flex-1 flex items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 mt-2 text-xs text-slate-400 min-h-[140px]">
                {isLoading ? "Loading Chart Data..." : "[ Line Graph: Free vs Medium vs Premium ]"}
              </div>
            </Card>

            <Card title="Most Used Features" padding="md" className="lg:col-span-3 flex flex-col">
              <div className="flex-1 flex flex-col justify-center gap-3 mt-2">
                {isLoading ? (
                  <span className="text-xs text-slate-400 text-center">Loading...</span>
                ) : (
                  metrics?.features.mostUsed.map((feat, idx) => (
                    <div key={idx} className="w-full">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-700 truncate mr-2">{feat.name}</span>
                        <span className="font-medium">{feat.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className={`${feat.colorClass} h-1.5 rounded-full`} style={{ width: `${feat.percentage}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Least Used Features" padding="md" className="lg:col-span-3 flex flex-col">
              <div className="flex-1 flex flex-col justify-center gap-3 mt-2">
                {isLoading ? (
                  <span className="text-xs text-slate-400 text-center">Loading...</span>
                ) : (
                  metrics?.features.leastUsed.map((feat, idx) => (
                    <div key={idx} className="w-full">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-700 truncate mr-2">{feat.name}</span>
                        <span className="font-medium text-rose-600">{feat.percentage}%</span>
                      </div>
                      <div className="w-full bg-rose-50 rounded-full h-1.5">
                        <div className={`${feat.colorClass} h-1.5 rounded-full`} style={{ width: `${feat.percentage}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* ACTION CENTER SECTION */}
          <Card padding="md" className="flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Operational Action Center</h3>
              <p className="text-xs text-slate-500">Tasks requiring admin attention</p>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Request Type</th>
                    <th className="px-4 py-3 font-medium">Detail</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Loading data for month {selectedMonth} - {selectedYear}...</td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">All clear. No pending actions.</td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className={`transition-colors ${task.status === 'Done' ? 'bg-slate-50/50 opacity-70' : 'hover:bg-slate-50'}`}>
                        <td className="px-4 py-3 min-w-[150px]">
                          <div className={`font-semibold text-sm ${task.status === 'Done' ? 'text-slate-600' : 'text-slate-900'}`}>{task.userName}</div>
                          <div className="text-xs text-slate-400">{task.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            task.plan === 'Premium' ? 'bg-purple-100 text-purple-700' : 
                            task.plan === 'Medium' ? 'bg-blue-100 text-blue-700' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {task.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{task.requestType}</td>
                        <td className="px-4 py-3 text-xs">{task.detail}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            {task.status === "Done" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> Done
                              </span>
                            ) : (
                              <select 
                                value={task.status}
                                onChange={(e) => handleDropdownChange(task.id, e.target.value as TaskStatus)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-md outline-none border cursor-pointer ${
                                  task.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-400'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 focus:border-blue-400'
                                }`}
                              >
                                {task.status === "Pending" && <option value="Pending">🟡 Pending</option>}
                                <option value="Process">🔵 Process</option>
                                <option value="Done">🟢 Done</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* TASK RESOLUTION MODAL */}
        {isModalOpen && targetTaskToResolve && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Send className="w-5 h-5" />
                  </div>
                  <span>Task Resolution Confirmation</span>
                </div>
                <button 
                  onClick={cancelResolveTask}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <p>You are about to resolve the support ticket for:</p>
                <div className="font-semibold text-slate-900">
                  {targetTaskToResolve.userName} ({targetTaskToResolve.email})
                </div>
                <div className="text-xs text-slate-500">
                  Request Type: <span className="font-medium text-slate-700">{targetTaskToResolve.requestType}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-xs text-slate-600">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>The system will automatically send a confirmation email to the user's Gmail and permanently lock the status to <strong>Done</strong>.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={cancelResolveTask}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResolveTask}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Yes, Resolve & Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}