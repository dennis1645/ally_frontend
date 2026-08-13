import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  FileText,
  History,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useLocation } from "react-router";

import { ApiError } from "../../api/apiClient";
import {
  createMentorActionPlan,
  getMentorMentees,
  getMentorSubmissions,
  reviewMentorSubmission,
  type MentorMentee,
  type MentorSubmission,
} from "../../api/mentorApi";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

type TaskStatus = "In Progress" | "Answered" | "Approval Needed" | "Approved";

type AssignmentItem = {
  id: string;
  submissionId: string | number | null;
  milestoneId: number | null;
  title: string;
  mentee: string;
  due: string;
  status: TaskStatus;
  note: string;
  menteeResponse?: {
    text?: string;
    fileName?: string;
    fileUrl?: string;
    submittedAt?: string;
  };
};

type LocationState = {
  autoSelectMentee?: string;
  bookingId?: string | number;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusFor(submission: MentorSubmission): TaskStatus {
  const status = submission.reviewStatus?.trim().toLowerCase();

  if (status === "approved") return "Approved";
  if (status === "revision_requested") return "In Progress";
  if (status === "pending" || !status) return "Approval Needed";
  return "Answered";
}

function toAssignment(submission: MentorSubmission): AssignmentItem {
  const menteeResponse =
    submission.textResponse || submission.fileName
      ? {
          text: submission.textResponse ?? undefined,
          fileName: submission.fileName ?? undefined,
          fileUrl: submission.fileUrl ?? undefined,
          submittedAt: formatDate(submission.submittedAt),
        }
      : undefined;

  return {
    id: `submission-${String(submission.id)}`,
    submissionId: submission.id,
    milestoneId: submission.milestoneId,
    title: submission.taskName ?? `Submission ${String(submission.id)}`,
    mentee: submission.menteeName ?? "Unknown mentee",
    due: formatDate(submission.deadline),
    status: statusFor(submission),
    note:
      submission.feedback ??
      (submission.reviewStatus === "revision_requested"
        ? "Revision requested by mentor."
        : "Awaiting mentor review."),
    menteeResponse,
  };
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ally-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export function MentorActionPlansPage() {
  const location = useLocation();
  const routeState = (location.state ?? {}) as LocationState;

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [mentees, setMentees] = useState<MentorMentee[]>([]);
  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  const [approveModalId, setApproveModalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    mentee: "",
    due: "",
    note: "",
  });

  async function loadPage(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const [menteeResult, pendingResult, approvedResult, revisionResult] =
        await Promise.allSettled([
          getMentorMentees(),
          getMentorSubmissions("pending"),
          getMentorSubmissions("approved"),
          getMentorSubmissions("revision_requested"),
        ]);

      if (menteeResult.status === "fulfilled") {
        setMentees(menteeResult.value);

        setDraft((current) => {
          if (current.mentee) return current;

          const autoSelected = routeState.autoSelectMentee
            ? menteeResult.value.find(
                (mentee) => mentee.name === routeState.autoSelectMentee,
              )
            : null;

          const selected = autoSelected ?? menteeResult.value[0];
          return {
            ...current,
            mentee: selected ? String(selected.id) : "",
          };
        });
      } else {
        setMentees([]);
      }

      const submissions = [pendingResult, approvedResult, revisionResult].flatMap(
        (result) => (result.status === "fulfilled" ? result.value : []),
      );

      setAssignments(submissions.map(toAssignment));

      if (
        menteeResult.status === "rejected" &&
        pendingResult.status === "rejected" &&
        approvedResult.status === "rejected" &&
        revisionResult.status === "rejected"
      ) {
        setError("The mentor action-plan data could not be loaded.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, []);

  const selectedMentee = useMemo(
    () =>
      mentees.find((mentee) => String(mentee.id) === draft.mentee) ?? null,
    [draft.mentee, mentees],
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!draft.title || !draft.mentee || !draft.due) return;

    if (!selectedMentee) {
      setError("Choose an assigned mentee before creating the action plan.");
      return;
    }

    const bookingId = routeState.bookingId ?? selectedMentee.bookingId;

    const matchingAssignment = assignments.find(
      (assignment) =>
        assignment.mentee === selectedMentee.name && assignment.milestoneId !== null,
    );

    const parentMilestoneId =
      selectedMentee.parentMilestoneId ?? matchingAssignment?.milestoneId ?? null;

    if (
      bookingId === null ||
      bookingId === undefined ||
      parentMilestoneId === null ||
      parentMilestoneId === undefined
    ) {
      setError(
        "The backend action-plan endpoint requires both a booking ID and parent milestone ID. This mentee does not currently expose that context. Open Action Plans after completing a booked session, or wait until the backend returns those IDs with the mentee/submission data.",
      );
      return;
    }

    const description = draft.note.trim()
      ? `${draft.title.trim()}\n\nMentor note: ${draft.note.trim()}`
      : draft.title.trim();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await createMentorActionPlan(bookingId, {
        task_description: description,
        deadline: draft.due,
        parent_milestone_id: parentMilestoneId,
      });

      setAssignments((current) => [
        {
          id: `created-${Date.now()}`,
          submissionId: null,
          milestoneId: parentMilestoneId,
          title: draft.title,
          mentee: selectedMentee.name,
          due: formatDate(draft.due),
          status: "In Progress",
          note: draft.note || "Action plan created.",
        },
        ...current,
      ]);

      setDraft((current) => ({
        ...current,
        title: "",
        due: "",
        note: "",
      }));

      setSuccess("Action plan created successfully.");
      setActiveTab("Active");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create action plan."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmApprove(): Promise<void> {
    if (!approveModalId) return;

    const assignment = assignments.find((task) => task.id === approveModalId);
    if (!assignment || assignment.submissionId === null) {
      setApproveModalId(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await reviewMentorSubmission(assignment.submissionId, {
        status: "approved",
      });

      setAssignments((current) =>
        current.map((task) =>
          task.id === approveModalId ? { ...task, status: "Approved" } : task,
        ),
      );

      setApproveModalId(null);
      setSuccess("Submission approved.");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Failed to approve this submission."),
      );
    } finally {
      setSaving(false);
    }
  }

  const displayedTasks = assignments.filter((task) =>
    activeTab === "Active" ? task.status !== "Approved" : task.status === "Approved",
  );

  return (
    <UserLayout
      title="Post-Session Action Plans"
      subtitle="Tasks for Mentees"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8 relative">
        <SectionHeader
          eyebrow="Action plans"
          title="Manage Post-Session Tasks"
          description="Create clear follow-up tasks, review mentees' submitted answers, and track their progress."
        />

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
            <div className="flex items-center gap-4 border-b border-slate-200 p-5 bg-slate-50/50">
              <div className="flex rounded-full bg-slate-200/80 p-1">
                <button
                  onClick={() => setActiveTab("Active")}
                  className={`rounded-full px-5 py-1.5 text-sm font-bold transition-all ${
                    activeTab === "Active"
                      ? "bg-white text-ally-primary shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Active Tasks
                </button>
                <button
                  onClick={() => setActiveTab("History")}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-bold transition-all ${
                    activeTab === "History"
                      ? "bg-ally-primary text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <History size={16} /> History
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 bg-slate-50/30">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                  Loading action-plan submissions...
                </div>
              ) : displayedTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                  {activeTab === "Active"
                    ? "No active tasks right now."
                    : "History is empty."}
                </div>
              ) : (
                displayedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-5 transition hover:shadow-sm ${
                      task.status === "Approved"
                        ? "border-slate-200 bg-slate-50/80"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{task.title}</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          Mentee:{" "}
                          <span className="font-bold text-ally-primary">
                            {task.mentee}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          task.status === "Approval Needed"
                            ? "bg-amber-100 text-amber-700"
                            : task.status === "In Progress"
                              ? "bg-sky-100 text-sky-700"
                              : task.status === "Answered"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CalendarDays size={15} className="text-slate-400" />
                        Due: {task.due}
                      </span>
                      {task.note && <span className="italic">"{task.note}"</span>}
                    </div>

                    {task.menteeResponse && (
                      <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-800">
                            <MessageSquare size={14} /> Mentee Submission
                          </p>
                          <span className="text-[10px] font-medium text-indigo-400">
                            {task.menteeResponse.submittedAt}
                          </span>
                        </div>

                        {task.menteeResponse.text && (
                          <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-indigo-50 shadow-2xs">
                            {task.menteeResponse.text}
                          </p>
                        )}

                        {task.menteeResponse.fileName && (
                          <button
                            type="button"
                            onClick={() => {
                              if (task.menteeResponse?.fileUrl) {
                                window.open(
                                  task.menteeResponse.fileUrl,
                                  "_blank",
                                  "noopener,noreferrer",
                                );
                              } else {
                                window.alert(
                                  "This submission did not return an openable document URL.",
                                );
                              }
                            }}
                            className="mt-3 flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                          >
                            <FileText size={16} />
                            {task.menteeResponse.fileName}
                          </button>
                        )}

                        {task.status === "Approval Needed" &&
                          task.submissionId !== null && (
                            <div className="mt-4 flex justify-end border-t border-indigo-100 pt-4">
                              <button
                                onClick={() => setApproveModalId(task.id)}
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                              >
                                <CheckCircle size={16} />
                                Approve Task
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6 sticky top-6 self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Create new task</h3>
              <p className="mt-1 text-sm text-slate-500">
                Assign a specific follow-up task to your mentee.
              </p>

              <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                    placeholder="e.g., Rewrite first paragraph"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Assign to Mentee <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={draft.mentee}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          mentee: event.target.value,
                        }))
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-ally-primary focus:bg-white cursor-pointer"
                      required
                    >
                      <option value="">Choose mentee</option>
                      {mentees.map((mentee) => (
                        <option key={String(mentee.id)} value={String(mentee.id)}>
                          {mentee.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={draft.due}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        due: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Optional Mentor's Note
                  </label>
                  <textarea
                    value={draft.note}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
                    placeholder="Leave a short encouraging note or specific detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ally-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ally-primary/90 disabled:opacity-60"
                >
                  <Plus size={16} />
                  {saving ? "Saving..." : "Assign Task"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Mentor Guidance</h3>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ally-primary text-white shadow-sm">
                  <Bot size={22} />
                </div>
                <div className="relative rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  <p>
                    "Review submissions thoroughly! Clicking <strong>Approve</strong> will move the task to History and allow the explorer to proceed to their next milestone."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {approveModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Approve Task?</h3>
              <p className="mt-2 text-sm text-slate-500">
                By approving this task, the mentee will unlock and proceed to their next milestone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setApproveModalId(null)}
                  disabled={saving}
                  className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void confirmApprove()}
                  disabled={saving}
                  className="flex-1 rounded-full bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Approving..." : "Yes, Approve"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </UserLayout>
  );
}
