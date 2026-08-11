import { useState } from "react";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  SectionHeader,
} from "./MentorShared";

import { initialAvailability } from "./mentorData";

export default function MentorAvailabilityPage() {
  const [slots, setSlots] = useState(initialAvailability);

  function toggleSlot(id: string) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              available: !slot.available,
            }
          : slot,
      ),
    );
  }

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Availability planner"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Scheduling"
          title="Set your availability for synchronous sessions"
          description="Keep your weekly calendar flexible and easy for explorers to book around."
        />

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Weekly availability
                </h3>

                <p className="text-sm text-slate-500">
                  Toggle the time blocks you want to make visible for booking.
                </p>
              </div>

              <button className="rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white">
                Save slots
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleSlot(slot.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    slot.available
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {slot.day}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {slot.time}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        slot.available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {slot.available ? "Open" : "Paused"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Booking guidance
            </h3>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Best practice
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Keep one buffer block each day so sessions feel calm instead
                  of rushed.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Suggested cadence
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Offer a mix of quick 25-minute sessions and 60-minute deeper
                  check-ins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
