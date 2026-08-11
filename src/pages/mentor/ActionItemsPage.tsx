import {
    useState,
    type FormEvent,
} from "react";

import {
    Clock3,
    Plus
} from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  SectionHeader,
} from "./MentorShared";

import { initialAssignments } from "./mentorData";



export default function ActionItemsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [draft, setDraft] = useState({
    title: "",
    mentee: "",
    due: "",
    note: "",
  });

  function handleSubmit(
    event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title || !draft.mentee || !draft.due) {
      return;
    }

    setAssignments((current) => [
      {
        id: `${Date.now()}`,
        title: draft.title,
        mentee: draft.mentee,
        due: draft.due,
        status: "Queued",
        note: draft.note || "Add a short note for the explorer.",
      },
      ...current,
    ]);

    setDraft({
      title: "",
      mentee: "",
      due: "",
      note: "",
    });
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Follow-up planner"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Action items"
          title="Add the next assignment after every session"
          description="Turn insights into momentum by attaching a clear task and a due date."
        />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{assignment.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{assignment.mentee}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      assignment.status === "Ready"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <Clock3 size={15} />
                    {assignment.due}
                  </span>
                  <span className="text-sm text-slate-500">{assignment.note}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Create a new assignment</h3>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Assignment title"
              />
              <input
                value={draft.mentee}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, mentee: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Explorer name"
              />
              <input
                value={draft.due}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, due: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Due date"
              />
              <textarea
                value={draft.note}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, note: event.target.value }))
                }
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-ally-primary"
                placeholder="Optional note"
              />
              <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white">
                <Plus size={16} />
                Add assignment
              </button>
            </form>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}