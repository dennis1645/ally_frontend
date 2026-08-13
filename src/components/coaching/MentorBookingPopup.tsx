import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Send,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import allyMascot from "../../assets/ally-assessment-mascot.png";

import type {
  AuthUser,
} from "../../types/auth";

import AllyPopup from "../ui/AllyPopup";

type MentorBookingPopupProps = {
  isOpen: boolean;
  user: AuthUser | null;
  onClose: () => void;
};

type LocalMentorshipRequest = {
  id: string;
  userId: string | number | null;
  userName: string | null;
  mentorId: string | number | null;
  mentorName: string | null;
  requestedDate: string;
  requestedTime: string;
  status: "pending";
  createdAt: string;
};

const STORAGE_KEY =
  "ally.local-mentor-booking-requests";

function tomorrowValue():
  string {
  const date =
    new Date();

  date.setHours(
    0,
    0,
    0,
    0,
  );

  date.setDate(
    date.getDate() +
      1,
  );

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function createId():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    "randomUUID" in
      crypto
  ) {
    return crypto.randomUUID();
  }

  return `mentor-request-${Date.now()}`;
}

function readExistingRequests():
  LocalMentorshipRequest[] {
  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw,
      );

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function formatDate(
  value: string,
): string {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    return value;
  }

  const date =
    new Date(
      Number(
        match[1],
      ),
      Number(
        match[2],
      ) -
        1,
      Number(
        match[3],
      ),
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday:
        "long",
      month:
        "long",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function formatTime(
  value: string,
): string {
  const match =
    /^(\d{2}):(\d{2})/.exec(
      value,
    );

  if (!match) {
    return value;
  }

  const date =
    new Date(
      2000,
      0,
      1,
      Number(
        match[1],
      ),
      Number(
        match[2],
      ),
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour:
        "numeric",
      minute:
        "2-digit",
      hour12:
        true,
    },
  ).format(
    date,
  );
}

function getMentorIdentity(
  user: AuthUser | null,
): {
  id:
    | string
    | number
    | null;
  name: string | null;
} {
  if (!user) {
    return {
      id:
        null,
      name:
        null,
    };
  }

  const assignedMentor =
    typeof user.assigned_mentor ===
      "object" &&
    user.assigned_mentor !==
      null &&
    !Array.isArray(
      user.assigned_mentor,
    )
      ? user.assigned_mentor as Record<string, unknown>
      : null;

  const rawId =
    user.assigned_mentor_id ??
    assignedMentor?.id ??
    null;

  const rawName =
    user.assigned_mentor_name ??
    assignedMentor?.name ??
    assignedMentor?.full_name ??
    null;

  return {
    id:
      typeof rawId ===
        "string" ||
      typeof rawId ===
        "number"
        ? rawId
        : null,

    name:
      typeof rawName ===
        "string" &&
      rawName.trim()
        ? rawName.trim()
        : null,
  };
}

export default function MentorBookingPopup({
  isOpen,
  user,
  onClose,
}: MentorBookingPopupProps) {
  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      tomorrowValue(),
    );

  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState(
      "10:00",
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    submitted,
    setSubmitted,
  ] =
    useState<LocalMentorshipRequest | null>(
      null,
    );

  const mentor =
    getMentorIdentity(
      user,
    );

  const mentorName =
    mentor.name ??
    "your allocated mentor";

  useEffect(
    () => {
      if (!isOpen) {
        return;
      }

      setSelectedDate(
        tomorrowValue(),
      );

      setSelectedTime(
        "10:00",
      );

      setError(
        null,
      );

      setSubmitted(
        null,
      );
    },
    [
      isOpen,
      user?.id,
    ],
  );

  function submitRequest():
    void {
    if (
      !selectedDate ||
      !selectedTime
    ) {
      setError(
        "Please choose a day and time.",
      );

      return;
    }

    const selectedDateTime =
      new Date(
        `${selectedDate}T${selectedTime}:00`,
      );

    if (
      Number.isNaN(
        selectedDateTime.getTime(),
      ) ||
      selectedDateTime <=
        new Date()
    ) {
      setError(
        "Please choose a future day and time.",
      );

      return;
    }

    const request:
      LocalMentorshipRequest =
      {
        id:
          createId(),

        userId:
          user?.id ??
          null,

        userName:
          typeof user?.name ===
            "string"
            ? user.name
            : null,

        mentorId:
          mentor.id,

        mentorName:
          mentor.name,

        requestedDate:
          selectedDate,

        requestedTime:
          selectedTime,

        status:
          "pending",

        createdAt:
          new Date().toISOString(),
      };

    try {
      const existing =
        readExistingRequests();

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          request,
          ...existing,
        ]),
      );
    } catch {
      /*
       * The popup is intentionally API-free for the prototype.
       * If localStorage is blocked, keep the submitted state visible
       * for the current session rather than failing the form.
       */
    }

    setError(
      null,
    );

    setSubmitted(
      request,
    );
  }

  if (submitted) {
    return (
      <AllyPopup
        isOpen={
          isOpen
        }
        badge="Request Submitted"
        badgeIcon={
          <CheckCircle2
            size={14}
            aria-hidden="true"
          />
        }
        mascotSrc={
          allyMascot
        }
        mascotAlt="Ally confirming the mentorship request"
        title="Mentorship request submitted"
        description={`Your requested day and time have been sent to ${mentorName} for approval.`}
        onClose={
          onClose
        }
        closeLabel="Close mentorship request"
      >
        <div className="mt-5 rounded-2xl border border-[#d7e4ec] bg-white p-4 text-left shadow-sm">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaf5fb] text-[#16629b]">
              <CalendarDays
                size={19}
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#2c1607]">
                {
                  formatDate(
                    submitted.requestedDate,
                  )
                }
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {
                  formatTime(
                    submitted.requestedTime,
                  )
                }
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-[#fff8e8] px-3 py-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#9b681f]">
              Pending Mentor Approval
            </p>

            <p className="mt-1 text-xs leading-5 text-[#7c6849]">
              This is a request, not a confirmed meeting. The mentor must accept it before the mentorship session is confirmed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="squishy-button mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#16629b] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_#0d4773] transition hover:-translate-y-0.5 hover:bg-[#115787] active:translate-y-0 active:shadow-none"
        >
          Done
        </button>
      </AllyPopup>
    );
  }

  return (
    <AllyPopup
      isOpen={
        isOpen
      }
      badge="Book Mentorship"
      badgeIcon={
        <Sparkles
          size={14}
          aria-hidden="true"
        />
      }
      mascotSrc={
        allyMascot
      }
      mascotAlt="Ally helping request a mentorship session"
      title="Choose your preferred schedule"
      description={`Pick a day and hour to request mentorship with ${mentorName}.`}
      onClose={
        onClose
      }
      closeLabel="Close mentorship booking"
    >
      <div className="mt-5 text-left">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays
              size={16}
              className="text-[#16629b]"
              aria-hidden="true"
            />

            <label
              htmlFor="mentorship-request-date"
              className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#6c7d86]"
            >
              Choose Day
            </label>
          </div>

          <input
            id="mentorship-request-date"
            type="date"
            min={
              tomorrowValue()
            }
            value={
              selectedDate
            }
            onChange={
              (
                event,
              ) => {
                setSelectedDate(
                  event.target.value,
                );

                setError(
                  null,
                );
              }
            }
            className="mt-2.5 w-full rounded-xl border-2 border-[#dce6eb] bg-white px-3.5 py-3 text-sm font-bold text-[#2c1607] outline-none transition focus:border-[#16629b] focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Clock3
              size={16}
              className="text-[#16629b]"
              aria-hidden="true"
            />

            <label
              htmlFor="mentorship-request-time"
              className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#6c7d86]"
            >
              Choose Hour
            </label>
          </div>

          <input
            id="mentorship-request-time"
            type="time"
            value={
              selectedTime
            }
            onChange={
              (
                event,
              ) => {
                setSelectedTime(
                  event.target.value,
                );

                setError(
                  null,
                );
              }
            }
            className="mt-2.5 w-full rounded-xl border-2 border-[#dce6eb] bg-white px-3.5 py-3 text-sm font-bold text-[#2c1607] outline-none transition focus:border-[#16629b] focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={
            submitRequest
          }
          className={[
            "squishy-button mt-5 inline-flex w-full items-center justify-center gap-2",
            "rounded-xl bg-[#16629b] px-5 py-3.5",
            "text-sm font-extrabold text-white",
            "shadow-[0_4px_0_#0d4773] transition",
            "hover:-translate-y-0.5 hover:bg-[#115787]",
            "active:translate-y-0 active:shadow-none",
          ].join(
            " ",
          )}
        >
          <Send
            size={16}
            aria-hidden="true"
          />
          Submit Mentorship Request
        </button>
      </div>
    </AllyPopup>
  );
}