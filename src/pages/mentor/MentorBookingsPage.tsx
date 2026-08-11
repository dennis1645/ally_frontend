import { useState } from "react";

import { CalendarDays } from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  SectionHeader,
} from "./MentorShared";

type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Rejected"
  | "Rescheduled";

type Booking = {
  id: string;
  mentee: string;
  topic: string;
  time: string;
  status: BookingStatus;
};

export default function MentorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "b1",
      mentee: "Ari Chen",
      topic: "Scholarship interview prep",
      time: "Thu · 4:00 PM",
      status: "Pending",
    },
    {
      id: "b2",
      mentee: "Mina Alvarez",
      topic: "Career clarity session",
      time: "Fri · 11:00 AM",
      status: "Confirmed",
    },
  ]);

  function updateStatus(
    id: string,
    status: BookingStatus,
  ) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status,
            }
          : booking,
      ),
    );
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Confirm / Reject / Reschedule Booking"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Meeting Confirmation"
          title="Confirm / Reject / Reschedule Booking"
          description="Handle consultation requests directly from one place and keep the next step visible."
        />

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {booking.mentee}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {booking.topic}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    booking.status === "Confirmed"
                      ? "bg-emerald-100 text-emerald-700"
                      : booking.status === "Rejected"
                        ? "bg-rose-100 text-rose-700"
                        : booking.status === "Rescheduled"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays size={16} />
                  {booking.time}
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateStatus(booking.id, "Confirmed")
                    }
                    className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white"
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(booking.id, "Rejected")
                    }
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(booking.id, "Rescheduled")
                    }
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </UserLayout>
  );
}
