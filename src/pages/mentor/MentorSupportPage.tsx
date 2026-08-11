import { LifeBuoy } from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  SectionHeader,
} from "./MentorShared";

export default function MentorSupportPage() {
  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Support"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Support"
          title="Get help quickly when you need it"
          description="Surface a support channel, escalation path, or mentor help center from this section."
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-ally-primary">
            <LifeBuoy size={18} />

            <p className="font-semibold text-slate-900">
              Support options
            </p>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Link this page to chat support, a mentor forum, or the product
            team handoff flow later.
          </p>
        </div>
      </section>
    </UserLayout>
  );
}
