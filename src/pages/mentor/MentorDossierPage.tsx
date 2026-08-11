import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "react-router";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

// Tipe Data Detail Mentee untuk Halaman Dossier
type MenteeDossier = {
  id: string;
  name: string;
  avatar?: string;
  targetUniv: string;
  targetMajor: string;
  targetScholarship: string;
  stage: string;
  lastSession: string | null;
  assessmentData: {
    careerStory: string;
    academicReadiness: string;
    scholarshipTargetNote: string;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    status: "Needs Review" | "Reviewed";
    size: string;
  }[];
};

// Mock Database per Mentee
const dossierDatabase: Record<string, MenteeDossier> = {
  e1: {
    id: "e1",
    name: "Ari Chen",
    targetUniv: "TU Delft / ETH Zurich",
    targetMajor: "Chemical Engineering",
    targetScholarship: "LPDP / Eiffel Excellence",
    stage: "Milestone 2.1 - Essay Review",
    lastSession: "Tue · 10:30 AM",
    assessmentData: {
      careerStory: "Strong motivation with clear purpose. Aiming to pioneer sustainable chemical processes in Southeast Asia.",
      academicReadiness: "Solid chemistry background (GPA 3.82/4.00). Working on TOEFL iBT target (Current: 98, Target: 105).",
      scholarshipTargetNote: "Focusing heavily on LPDP Target Awardee requirements and Eiffel Excellence essay structures.",
    },
    documents: [
      { id: "d1", name: "Motivation_Letter_v2_Draft.pdf", type: "PDF", uploadedAt: "2 hours ago", status: "Needs Review", size: "1.2 MB" },
      { id: "d2", name: "Academic_Transcript_Official.pdf", type: "PDF", uploadedAt: "Yesterday", status: "Reviewed", size: "2.4 MB" },
      { id: "d3", name: "TOEFL_iBT_Score_Report.pdf", type: "PDF", uploadedAt: "3 days ago", status: "Reviewed", size: "850 KB" },
    ],
  },
  e2: {
    id: "e2",
    name: "Jordan Lee",
    targetUniv: "Wageningen University",
    targetMajor: "Food Technology",
    targetScholarship: "Holland Scholarship",
    stage: "Milestone 1 - University Selection",
    lastSession: null,
    assessmentData: {
      careerStory: "Passionate about food supply chain security and functional food formulation.",
      academicReadiness: "Bachelor's degree in Food Science. Needs guidance on aligning curriculum modules.",
      scholarshipTargetNote: "Targeting Netherlands-based government scholarships and institutional partial waivers.",
    },
    documents: [
      { id: "d4", name: "CV_ATS_Format_Jordan.pdf", type: "PDF", uploadedAt: "1 day ago", status: "Needs Review", size: "900 KB" },
      { id: "d5", name: "Research_Statement_Draft.docx", type: "DOCX", uploadedAt: "2 days ago", status: "Needs Review", size: "512 KB" },
    ],
  },
};

export function MentorDossierPage() {
  // State untuk memilih mentee yang sedang dilihat dossier-nya
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>("e1");
  const currentMentee = dossierDatabase[selectedMenteeId] || dossierDatabase["e1"];

  return (
    <UserLayout
      title="Mentee Dossier"
      subtitle="Pre-Session Document & Assessment Review"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        {/* Top Actions: Back Button & Mentee Switcher Dropdown */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/mentor/mentees"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-ally-primary"
          >
            <ArrowLeft size={16} />
            Back to Mentees Directory
          </Link>

          {/* Quick Switcher for Mentee */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Viewing Mentee:
            </span>
            <div className="relative">
              <select
                value={selectedMenteeId}
                onChange={(e) => setSelectedMenteeId(e.target.value)}
                className="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-ally-primary cursor-pointer"
              >
                {Object.values(dossierDatabase).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.targetScholarship})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>

        {/* Mentee Specific Context Header */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ally-surface text-ally-primary font-bold text-2xl shadow-inner border border-ally-primary/10">
                {currentMentee.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{currentMentee.name}</h1>
                  <span className="rounded-full bg-ally-surface px-3 py-1 text-xs font-semibold text-ally-primary border border-ally-primary/20">
                    {currentMentee.stage}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-ally-primary" />
                    {currentMentee.targetUniv} — {currentMentee.targetMajor}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck size={16} className="text-ally-primary" />
                    {currentMentee.targetScholarship}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100">
              <Clock3 size={15} />
              <span>Last session: <strong>{currentMentee.lastSession || "-"}</strong></span>
            </div>
          </div>
        </div>

        {/* Content Layout Split */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Column 1: Pre-session Summary & Assessment */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="text-ally-primary" size={20} />
              <h3 className="text-lg font-semibold text-slate-900">Pre-Session Profile & Assessment</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Review key insights from {currentMentee.name}'s initial assessment before opening the mentoring session.
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Career Story & Motivation</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{currentMentee.assessmentData.careerStory}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Readiness</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{currentMentee.assessmentData.academicReadiness}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scholarship Focus</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{currentMentee.assessmentData.scholarshipTargetNote}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Specific Documents List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Submitted Documents</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {currentMentee.documents.length} Files
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Uploaded files by {currentMentee.name} ready for review.
            </p>

            <div className="space-y-3">
              {currentMentee.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm leading-snug">{doc.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Uploaded {doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0 sm:justify-end">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        doc.status === "Needs Review"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-ally-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ally-primary/90"
                    >
                      <ExternalLink size={13} />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}