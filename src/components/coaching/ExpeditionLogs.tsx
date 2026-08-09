import {
  FileText,
  Star,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  CoachingSession,
} from "../../types/coaching";

export type ExpeditionLogsProps = {
  sessions:
    CoachingSession[];
};

type NotesState = {
  mentorName:
    string;

  notes:
    string;
} | null;

export default function ExpeditionLogs({
  sessions,
}: ExpeditionLogsProps) {
  const [
    notesState,
    setNotesState,
  ] =
    useState<NotesState>(
      null,
    );

  const [
    ratedMentorId,
    setRatedMentorId,
  ] =
    useState<number | null>(
      null,
    );

  return (
    <section>
      <h2 className="mb-5 text-xl font-extrabold text-[#2c1607] sm:text-2xl">
        Expedition Logs (Past Sessions)
      </h2>

      <div className="overflow-hidden rounded-[18px] border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-[#fff1ea] text-xs font-bold text-slate-600">
                <th className="px-6 py-4">
                  Mentor
                </th>

                <th className="px-6 py-4">
                  Date
                </th>

                <th className="px-6 py-4">
                  Focus
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {sessions.map(
                (
                  session,
                  index,
                ) => (
                  <tr
                    key={
                      session.id
                    }
                    className={[
                      "transition hover:bg-slate-50",

                      index <
                      sessions.length -
                        1
                        ? "border-b border-slate-200"
                        : "",
                    ].join(
                      " ",
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#72b1e8] text-xs font-bold text-white">
                          {
                            session.mentorInitials
                          }
                        </div>

                        <span className="font-semibold text-[#3f4147]">
                          {
                            session.mentorName
                          }
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {
                        session.date
                      }
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-bold",

                          session.focusTone ===
                          "blue"
                            ? "bg-[#eaf6ff] text-[#267bac]"
                            : "bg-[#f8eddf] text-[#8e6948]",
                        ].join(
                          " ",
                        )}
                      >
                        {
                          session.focus
                        }
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setNotesState({
                              mentorName:
                                session.mentorName,

                              notes:
                                session.notes,
                            });
                          }}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#16629b] transition hover:text-[#0f4c79]"
                        >
                          <FileText
                            size={15}
                          />

                          View Notes
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRatedMentorId(
                              session.id,
                            );
                          }}
                          className={[
                            "inline-flex items-center gap-1 text-sm font-semibold transition",

                            ratedMentorId ===
                            session.id
                              ? "text-amber-600"
                              : "text-[#8e6948] hover:text-[#6e4d30]",
                          ].join(
                            " ",
                          )}
                        >
                          <Star
                            size={15}
                            fill={
                              ratedMentorId ===
                              session.id
                                ? "currentColor"
                                : "none"
                            }
                          />

                          {ratedMentorId ===
                          session.id
                            ? "Rated"
                            : "Rate Mentor"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {notesState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Notes from ${notesState.mentorName}`}
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 p-4"
          onMouseDown={() => {
            setNotesState(
              null,
            );
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-[#ead3bd] bg-white p-6 shadow-2xl sm:p-7"
            onMouseDown={(
              event,
            ) => {
              event.stopPropagation();
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#16629b]">
                  Session Notes
                </p>

                <h3 className="mt-1 text-2xl font-extrabold text-[#2c1607]">
                  {
                    notesState.mentorName
                  }
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close session notes"
                onClick={() => {
                  setNotesState(
                    null,
                  );
                }}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <p className="mt-5 leading-7 text-slate-600">
              {
                notesState.notes
              }
            </p>

            <button
              type="button"
              onClick={() => {
                setNotesState(
                  null,
                );
              }}
              className="mt-7 min-h-11 w-full rounded-xl bg-[#16629b] px-5 font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}