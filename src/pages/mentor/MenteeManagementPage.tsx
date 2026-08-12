import { useState } from "react";
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
// Pastikan path import ini sesuai dengan struktur foldermu
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

// --- TYPES ---
type Explorer = {
  id: string;
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
};

// --- MOCK DATA ---
const allExplorersData: Explorer[] = [
  {
    id: "e1",
    name: "Ari Chen",
    targetUniv: "TU Delft / ETH Zurich",
    targetMajor: "Chemical Engineering",
    targetScholarship: "LPDP / Eiffel Excellence",
    stage: "Milestone 2.1 - Essay Review",
    lastSession: "Tue · 10:30 AM",
    documentsSubmitted: ["Motivation Letter v2.pdf", "Academic Transcript.pdf", "TOEFL Certificate.pdf"],
    assessmentSummary: "Focuses on detailing real contributions to the country post-graduation.",
    status: "Active",
  },
  {
    id: "e2",
    name: "Jordan Lee",
    targetUniv: "Wageningen University",
    targetMajor: "Food Technology",
    targetScholarship: "Holland Scholarship",
    stage: "Milestone 1 - University Selection",
    lastSession: null,
    documentsSubmitted: ["CV ATS Format.pdf", "Research Statement Draft.pdf"],
    assessmentSummary: "Needs extra guidance in selecting a curriculum aligned with their Bachelor's degree.",
    status: "Active",
  },
  {
    id: "h1",
    name: "Mina Alvarez",
    targetScholarship: "Chevening Scholarship",
    lastSession: "14 Feb 2026",
    completedDate: "Feb 2026",
    status: "Inactive",
  },
  {
    id: "h2",
    name: "Devon Vance",
    targetScholarship: "DAAD EPOS",
    lastSession: "10 Jan 2026",
    completedDate: "Jan 2026",
    status: "Inactive",
  },
  {
    id: "h3",
    name: "Siti Rahma",
    targetScholarship: "LPDP Reguler",
    lastSession: "05 Dec 2025",
    completedDate: "Dec 2025",
    status: "Inactive",
  },
];

// --- COMPONENT PENDUKUNG ---
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

// --- MAIN COMPONENT ---
export default function MenteeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  const filteredExplorers = allExplorersData.filter((explorer) => {
    const matchesSearch = explorer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || explorer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = allExplorersData.filter((e) => e.status === "Active").length;
  const inactiveCount = allExplorersData.filter((e) => e.status === "Inactive").length;
  const reviewCount = 2; // Statis sebagai contoh UI

  return (
    <UserLayout
      title="Mentees Dashboard"
      subtitle="Mentee Progress Overview"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">

        {/* Metric Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Active Assigned Explorers"
            value={String(activeCount)}
            helper="Assigned by AI & actively guided"
          />
          <MetricCard
            title="History Explorers"
            value={String(inactiveCount)}
            helper="Mentees who have completed their program"
          />
          <MetricCard
            title="Explorers to Review"
            value={String(reviewCount)}
            helper="Mentees with new documents ready for review"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          {/* Main List Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Explorer Directory</h3>
                <p className="text-sm text-slate-500">
                  Manage your active sessions and past mentees
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search mentee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-ally-primary sm:w-64"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-ally-primary cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {filteredExplorers.length === 0 ? (
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
                              (Completed: {explorer.completedDate})
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
                            <GraduationCap size={16} className="text-ally-primary shrink-0" />
                            <span>
                              <strong className="font-semibold text-slate-900">Target Univ & Major:</strong>{" "}
                              {explorer.targetUniv} — {explorer.targetMajor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BadgeCheck size={16} className="text-ally-primary shrink-0" />
                            <span>
                              <strong className="font-semibold text-slate-900">Scholarship:</strong>{" "}
                              {explorer.targetScholarship}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-slate-600 bg-slate-100/60 p-3 rounded-xl border border-slate-200/60">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                            Assessment Note
                          </p>
                          <p className="italic">&ldquo;{explorer.assessmentSummary}&rdquo;</p>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                            Submitted Documents ({explorer.documentsSubmitted?.length || 0})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {explorer.documentsSubmitted?.map((doc, idx) => (
                              <span
                                key={idx}
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
                        <p><strong>Target Scholarship:</strong> {explorer.targetScholarship}</p>
                        <p className="mt-1 text-xs text-slate-400 italic">Documents are archived and no longer accessible.</p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock3 size={15} /> Last session:{" "}
                        <span className="font-medium text-slate-700">
                          {explorer.lastSession ? explorer.lastSession : "-"}
                        </span>
                      </span>
                      {explorer.status === "Active" ? (
                        <Link
                          to="/mentor/dossier"
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

          {/* Side Panel */}
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