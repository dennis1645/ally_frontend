import { Settings } from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  SectionHeader,
} from "./MentorShared";

export default function MentorSettingsPage() {
  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Settings"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Settings"
          title="Control your mentor experience"
          description="Adjust preferences for notifications, meeting reminders, and the way your dashboard surfaces information."
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <Settings size={18} />

            <p className="font-semibold text-slate-900">
              Preferences
            </p>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            This workspace is ready to connect to a future settings panel
            with toggles for availability reminders and session formats.
          </p>
        </div>
      </section>
    </UserLayout>
  );
}
