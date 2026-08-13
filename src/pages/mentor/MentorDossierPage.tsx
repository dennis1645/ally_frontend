import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { ApiError } from "../../api/apiClient";
import {
  getMentorDossier,
  getMentorDossierPreReadDocuments,
  getMentorMentees,
  type MentorDossier,
  type MentorMentee,
} from "../../api/mentorApi";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

type RecordValue = Record<string, unknown>;

type DossierDocument = {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: string;
  size: string;
  url: string;
};

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function nestedRecord(
  source: RecordValue | null,
  keys: string[],
): RecordValue | null {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (isRecord(value)) return value;
  }
  return null;
}

function firstText(source: RecordValue | null, keys: string[]): string | null {
  if (!source) return null;
  for (const key of keys) {
    const value = text(source[key]);
    if (value) return value;
  }
  return null;
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
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

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function buildDocuments(dossier: MentorDossier | null): DossierDocument[] {
  if (!dossier) return [];

  return getMentorDossierPreReadDocuments(dossier).map((document, index) => {
    const raw = document.raw;

    return {
      id: String(raw.id ?? raw.document_id ?? `pre-read-${index}`),
      name: document.label,
      type: firstText(raw, ["file_type", "mime_type", "type"]) ?? "FILE",
      uploadedAt: formatDateTime(
        firstText(raw, ["updated_at", "created_at", "uploaded_at"]),
      ),
      status: firstText(raw, ["review_status", "status"]) ?? "Available",
      size: firstText(raw, ["file_size", "size"]) ?? "—",
      url: document.filePath,
    };
  });
}

export function MentorDossierPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentees, setMentees] = useState<MentorMentee[]>([]);
  const [selectedMenteeId, setSelectedMenteeId] = useState(
    searchParams.get("menteeId") ?? "",
  );
  const [dossier, setDossier] = useState<MentorDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMentees(): Promise<void> {
      try {
        const result = await getMentorMentees();
        if (!active) return;

        setMentees(result);

        if (!selectedMenteeId && result.length > 0) {
          setSelectedMenteeId(String(result[0].id));
        }
      } catch (requestError) {
        if (active) {
          setError(
            getErrorMessage(requestError, "Failed to load assigned mentees."),
          );
        }
      }
    }

    void loadMentees();

    return () => {
      active = false;
    };
  }, [selectedMenteeId]);

  const currentMentee = useMemo(
    () =>
      mentees.find((mentee) => String(mentee.id) === selectedMenteeId) ??
      mentees[0] ??
      null,
    [mentees, selectedMenteeId],
  );

  const queryBookingId = searchParams.get("bookingId");
  const bookingId =
    queryBookingId ??
    (currentMentee?.bookingId !== null && currentMentee?.bookingId !== undefined
      ? String(currentMentee.bookingId)
      : null);

  useEffect(() => {
    let active = true;

    async function loadDossier(): Promise<void> {
      if (!bookingId) {
        setDossier(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getMentorDossier(bookingId);
        if (active) setDossier(result);
      } catch (requestError) {
        if (active) {
          setDossier(null);
          setError(
            getErrorMessage(requestError, "Failed to load the pre-session dossier."),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDossier();

    return () => {
      active = false;
    };
  }, [bookingId]);

  const dossierMentee = dossier
    ? nestedRecord(dossier, ["mentee", "user", "profile"]) ?? dossier
    : null;

  const assessment = dossier
    ? nestedRecord(dossier, [
        "assessment",
        "deep_diagnostic_result",
        "assessment_result",
        "pre_session_assessment",
      ])
    : null;

  const name =
    firstText(dossierMentee, ["name", "mentee_name", "full_name"]) ??
    currentMentee?.name ??
    "Explorer";

  const targetUniv =
    firstText(dossierMentee, [
      "target_university_name",
      "target_university",
      "university_name",
    ]) ??
    currentMentee?.targetUniversity ??
    "Not provided";

  const targetMajor =
    firstText(dossierMentee, ["target_major", "target_program"]) ??
    currentMentee?.targetMajor ??
    "Not provided";

  const targetScholarship =
    firstText(dossierMentee, [
      "primary_scholarship_target",
      "target_scholarship",
      "scholarship_name",
    ]) ??
    currentMentee?.primaryScholarshipTarget ??
    "Not provided";

  const stage =
    firstText(dossier, ["current_stage", "stage", "milestone_name"]) ??
    currentMentee?.currentStage ??
    (currentMentee?.readinessScore !== null &&
    currentMentee?.readinessScore !== undefined
      ? `Readiness ${currentMentee.readinessScore}%`
      : "Pre-session review");

  const lastSession =
    firstText(dossier, ["last_session_at", "last_session", "completed_at"]) ??
    currentMentee?.lastSessionAt ??
    null;

  const careerStory =
    firstText(assessment, [
      "career_story",
      "career_motivation",
      "motivation",
      "summary",
    ]) ??
    firstText(dossier, [
      "career_story",
      "career_motivation",
      "assessment_summary",
    ]) ??
    currentMentee?.assessmentSummary ??
    "No career-story summary was returned by the dossier endpoint.";

  const academicReadiness =
    firstText(assessment, [
      "academic_readiness",
      "academic_summary",
      "readiness_summary",
    ]) ??
    firstText(dossier, ["academic_readiness", "academic_summary"]) ??
    (currentMentee?.readinessScore !== null &&
    currentMentee?.readinessScore !== undefined
      ? `Current readiness score: ${currentMentee.readinessScore}%.`
      : "No academic-readiness summary was returned by the dossier endpoint.");

  const scholarshipTargetNote =
    firstText(assessment, [
      "scholarship_target_note",
      "scholarship_focus",
      "recommendation",
      "suggestion",
    ]) ??
    firstText(dossier, [
      "scholarship_target_note",
      "scholarship_focus",
      "ai_suggestion",
    ]) ??
    `Current scholarship target: ${targetScholarship}.`;

  const documents = buildDocuments(dossier);

  return (
    <UserLayout
      title="Mentee Dossier"
      subtitle="Pre-Session Document & Assessment Review"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/mentor/mentees"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-ally-primary"
          >
            <ArrowLeft size={16} />
            Back to Mentees Directory
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Viewing Mentee:
            </span>
            <div className="relative">
              <select
                value={currentMentee ? String(currentMentee.id) : ""}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setSelectedMenteeId(nextId);
                  setSearchParams({ menteeId: nextId });
                }}
                className="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-ally-primary cursor-pointer"
              >
                {mentees.map((mentee) => (
                  <option key={String(mentee.id)} value={String(mentee.id)}>
                    {mentee.name} ({mentee.primaryScholarshipTarget ?? "No target"})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!bookingId && !loading && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This explorer does not currently expose a booking ID, so the
            pre-session dossier endpoint cannot be requested yet. Profile
            information from the mentee directory is shown below.
          </div>
        )}

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ally-surface text-ally-primary font-bold text-2xl shadow-inner border border-ally-primary/10">
                {name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {loading ? "Loading..." : name}
                  </h1>
                  <span className="rounded-full bg-ally-surface px-3 py-1 text-xs font-semibold text-ally-primary border border-ally-primary/20">
                    {stage}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-ally-primary" />
                    {targetUniv} — {targetMajor}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck size={16} className="text-ally-primary" />
                    {targetScholarship}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100">
              <Clock3 size={15} />
              <span>
                Last session: <strong>{formatDateTime(lastSession)}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="text-ally-primary" size={20} />
              <h3 className="text-lg font-semibold text-slate-900">
                Pre-Session Profile & Assessment
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Review key insights from {name}'s initial assessment before opening the mentoring session.
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Career Story & Motivation
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">
                  {careerStory}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Academic Readiness
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">
                  {academicReadiness}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Scholarship Focus
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">
                  {scholarshipTargetNote}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Submitted Documents
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {documents.length} Files
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Uploaded files by {name} ready for review.
            </p>

            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                  No pre-read documents were returned for this booking.
                </div>
              ) : (
                documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm leading-snug">
                          {document.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span>{document.type}</span>
                          <span>•</span>
                          <span>{document.size}</span>
                          <span>•</span>
                          <span>{document.uploadedAt}</span>
                        </div>
                        <span className="mt-2 inline-block rounded-md bg-ally-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ally-primary">
                          {document.status}
                        </span>
                      </div>
                    </div>

                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ally-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ally-primary/90"
                    >
                      <ExternalLink size={13} />
                      Open
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
