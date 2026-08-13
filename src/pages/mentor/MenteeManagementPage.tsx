import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Clock3,
  FileText,
  Filter,
  GraduationCap,
  Search,
} from "lucide-react";

import { Link } from "react-router";
import { ApiError } from "../../api/apiClient";
import {
  getMentorMentees,
  getMentorSubmissions,
  type MentorMentee,
  type MentorSubmission,
} from "../../api/mentorApi";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

type Explorer = {
  id: string;
  backendId: string | number;
  name: string;
  targetUniv?: string;
  targetMajor?: string;
  targetScholarship: string;
  stage?: string;
  lastSession: string | null;
  documentsSubmitted?: string[];
  assessmentSummary?: string;
  completedDate?: string;
  status: "Active" | "Inactive";
  bookingId: string | number | null;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function formatDateTime(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isInactiveStatus(status: string): boolean {
  return ["inactive", "completed", "finished", "graduated", "archived"].includes(
    status.trim().toLowerCase(),
  );
}

function toExplorer(mentee: MentorMentee): Explorer {
  const inactive = isInactiveStatus(mentee.status);

  return {
    id: String(mentee.id),
    backendId: mentee.id,
    name: mentee.name,
    targetUniv: mentee.targetUniversity ?? "Not provided",
    targetMajor: mentee.targetMajor ?? "Not provided",
    targetScholarship: mentee.primaryScholarshipTarget ?? "Not provided",
    stage:
      mentee.currentStage ??
      (mentee.readinessScore !== null
        ? `Readiness ${mentee.readinessScore}%`
        : undefined),
    lastSession: formatDateTime(mentee.lastSessionAt),
    documentsSubmitted: mentee.documentsSubmitted,
    assessmentSummary:
      mentee.assessmentSummary ??
      mentee.headline ??
      "No assessment summary has been returned for this explorer yet.",
    completedDate: formatDateTime(mentee.completedAt) ?? undefined,
    status: inactive ? "Inactive" : "Active",
    bookingId: mentee.bookingId,
  };
}

function MetricCard({
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
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

export default function MenteeManagementPage() {
  const [mentees, setMentees] = useState<MentorMentee[]>([]);
  const [pendingSubmissions, setPendingSubmissions] =
    useState<MentorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | "Active" | "Inactive">("All");

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const [menteeResult, submissionResult] = await Promise.allSettled([
          getMentorMentees(),
          getMentorSubmissions("pending"),
        ]);

        if (!active) return;

        const errors: string[] = [];

        if (menteeResult.status === "fulfilled") {
          setMentees(menteeResult.value);
        } else {
          setMentees([]);
          errors.push(getErrorMessage(menteeResult.reason, "Failed to load mentees."));
        }

        if (submissionResult.status === "fulfilled") {
          setPendingSubmissions(submissionResult.value);
        } else {
          setPendingSubmissions([]);
          errors.push(
            getErrorMessage(submissionResult.reason, "Failed to load pending reviews."),
          );
        }

        if (errors.length > 0) setError(errors.join(" "));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const allExplorersData = useMemo(() => mentees.map(toExplorer), [mentees]);

  const filteredExplorers = allExplorersData.filter((explorer) => {
    const matchesSearch = explorer.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || explorer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = allExplorersData.filter((e) => e.status === "Active").length;
  const inactiveCount = allExplorersData.filter((e) => e.status === "Inactive").length;

  const reviewNames = new Set(
    pendingSubmissions
      .map((submission) => submission.menteeName?.trim())
      .filter((name): name is string => Boolean(name)),
  );
  const reviewCount = reviewNames.size > 0 ? reviewNames.size : pendingSubmissions.length;

  return (
    <UserLayout
      title="Mentees Dashboard"
      subtitle="Mentee Progress Overview"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Active Assigned Explorers"
            value={loading ? "..." : String(activeCount)}
            helper="Assigned by AI & actively guided"
          />
          <MetricCard
            title="History Explorers"
            value={loading ? "..." : String(inactiveCount)}
            helper="Mentees who have completed their program"
          />
          <MetricCard
            title="Explorers to Review"
            value={loading ? "..." : String(reviewCount)}
            helper="Mentees with new documents ready for review"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Explorer Directory</h3>
                <p className="text-sm text-slate-500">
                  Manage your active sessions and past mentees
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search mentee name..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-48 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-ally-primary sm:w-64"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as "All" | "Active" | "Inactive",
                      )
                    }
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-ally-primary cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <Filter
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Loading assigned explorers...
                </div>
              ) : filteredExplorers.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No explorers found matching your criteria.
                </div>
              ) : (
                filteredExplorers.map((explorer) => (
                  <div
                    key={explorer.id}
                    className={`rounded-2xl border p-5 transition ${
                      explorer.status === "Active"
                        ? "border-slate-200 bg-slate-50/70"
                        : "border-slate-100 bg-slate-50/30 opacity-80 grayscale-[20%]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-slate-900">{explorer.name}</p>
                          {explorer.status === "Inactive" && (
                            <span className="text-xs text-slate-400 font-medium">
                              (Completed: {explorer.completedDate ?? "—"})
                            </span>
                          )}
                        </div>
                        {explorer.stage && explorer.status === "Active" && (
                          <span className="mt-1 inline-block rounded-full bg-ally-surface px-3 py-0.5 text-xs font-medium text-ally-primary">
                            {explorer.stage}
                          </span>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          explorer.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {explorer.status}
                      </span>
                    </div>

                    {explorer.status === "Active" && (
                      <>
                        <div className="mt-4 grid gap-2 rounded-xl bg-white p-3.5 text-sm text-slate-700 shadow-sm border border-slate-100">
                          <div className="flex items-center gap-2">
                            <GraduationCap
                              size={16}
                              className="text-ally-primary shrink-0"
                            />
                            <span>
                              <strong className="font-semibold text-slate-900">
                                Target Univ & Major:
                              </strong>{" "}
                              {explorer.targetUniv} — {explorer.targetMajor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BadgeCheck
                              size={16}
                              className="text-ally-primary shrink-0"
                            />
                            <span>
                              <strong className="font-semibold text-slate-900">
                                Scholarship:
                              </strong>{" "}
                              {explorer.targetScholarship}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-slate-600 bg-slate-100/60 p-3 rounded-xl border border-slate-200/60">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Assessment Note
                          </p>
                          <p className="italic">
                            &ldquo;{explorer.assessmentSummary}&rdquo;
                          </p>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                            Submitted Documents ({explorer.documentsSubmitted?.length ?? 0})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {explorer.documentsSubmitted?.map((doc, index) => (
                              <span
                                key={`${doc}-${index}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-2xs"
                              >
                                <FileText size={13} className="text-slate-400" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {explorer.status === "Inactive" && (
                      <div className="mt-3 text-sm text-slate-600">
                        <p>
                          <strong>Target Scholarship:</strong>{" "}
                          {explorer.targetScholarship}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 italic">
                          Documents are archived and no longer accessible.
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock3 size={15} /> Last session:{" "}
                        <span className="font-medium text-slate-700">
                          {explorer.lastSession ?? "-"}
                        </span>
                      </span>
                      {explorer.status === "Active" ? (
                        <Link
                          to={`/mentor/dossier?menteeId=${encodeURIComponent(
                            String(explorer.backendId),
                          )}${
                            explorer.bookingId !== null
                              ? `&bookingId=${encodeURIComponent(
                                  String(explorer.bookingId),
                                )}`
                              : ""
                          }`}
                          className="inline-flex items-center gap-2 font-semibold text-ally-primary hover:underline"
                        >
                          Mentee Overview
                          <ArrowRight size={16} />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-2 font-medium text-slate-400 cursor-not-allowed">
                          Overview Archived
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Mentor Guidance</h3>
              <div className="mt-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ally-primary text-white shadow-sm">
                  <Bot size={22} />
                </div>
                <div className="relative rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  <p>
                    "Don't forget to check your mentee's readiness, they depend on your guidance!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
