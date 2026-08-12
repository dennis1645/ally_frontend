import { useState } from "react";
import {
  Bell,
  Bot,
  CalendarSync,
  ExternalLink,
  LifeBuoy,
  Mail,
  MessageCircle,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

// --- SHARED COMPONENT ---
function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

// ============================================================================
// 1. MENTOR SETTINGS PAGE
// ============================================================================
export function MentorSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [calendarSync, setCalendarSync] = useState(false);
  const [matchNotifications, setMatchNotifications] = useState(true);

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Settings"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          title="Control your mentor experience"
          description="Adjust preferences for notifications, meeting reminders, and system integrations."
        />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-ally-primary">
                <Settings size={20} />
                <h3 className="text-lg font-bold text-slate-900">Preferences</h3>
              </div>

              <div className="space-y-6">
                {/* Setting Item 1 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-400">
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Booking Alerts</p>
                      <p className="text-sm text-slate-500">Receive email notifications for new booking requests.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      emailAlerts ? "bg-ally-primary" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Setting Item 2 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-400">
                      <CalendarSync size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Google Calendar Sync</p>
                      <p className="text-sm text-slate-500">Automatically sync confirmed sessions to your calendar.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCalendarSync(!calendarSync)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      calendarSync ? "bg-ally-primary" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        calendarSync ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Setting Item 3 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-400">
                      <Bot size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">AI Match Notifications</p>
                      <p className="text-sm text-slate-500">Get notified when AI assigns a new mentee to your directory.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMatchNotifications(!matchNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      matchNotifications ? "bg-ally-primary" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        matchNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">System Notice</h3>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ally-primary text-white shadow-sm">
                  <Bot size={22} />
                </div>
                <div className="relative rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  <p>
                    "Keep your Google Calendar sync enabled so you never miss a confirmed session with your explorer!"
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

// ============================================================================
// 2. MENTOR SUPPORT PAGE
// ============================================================================
export function MentorSupportPage() {
  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Support"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          title="Get help quickly when you need it"
          description="Surface a support channel, escalation path, or mentor help center."
        />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {/* Support Card 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-ally-surface p-3 text-ally-primary">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">Mentor Community Forum</h3>
                  <p className="mt-1 text-sm text-slate-600">Connect with other mentors, share tips, and discuss best practices for guiding explorers.</p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Join Discussion <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Support Card 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <Mail size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">Contact Platform Admin</h3>
                  <p className="mt-1 text-sm text-slate-600">Need help resolving a scheduling conflict or technical issue? Reach out to our support team.</p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-ally-primary/90">
                    Send Email to Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Support Card 3 */}
            <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                  <ShieldAlert size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">Report Mentee Issue</h3>
                  <p className="mt-1 text-sm text-slate-600">If a mentee is consistently unresponsive or violating platform guidelines, you can report the issue here.</p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
                    File a Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-ally-primary">
                <LifeBuoy size={20} />
                <h3 className="text-lg font-bold text-slate-900">Guidance</h3>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ally-primary text-white shadow-sm">
                  <Bot size={22} />
                </div>
                <div className="relative rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  <p>
                    "We are here to help! If you face any difficulties with the platform or need advice on handling a specific explorer, just reach out."
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