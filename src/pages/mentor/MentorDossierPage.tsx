import { mentorSidebarItems, SectionHeader } from "./MentorShared";

import UserLayout from "../../components/layout/UserLayout";

export default function MentorDossierPage() {
  const dossierItems = [
    {
      title: "Career story",
      detail:
        "Strong motivation with clear purpose and long-term ambition.",
    },
    {
      title: "Academic readiness",
      detail:
        "Needs one more language preparation pass before the next session.",
    },
    {
      title: "Scholarship target",
      detail:
        "Focused on LPDP and fully funded global opportunities.",
    },
  ];

  const documents = [
    "Motivation letter draft",
    "Academic transcript snapshot",
    "Scholarship checklist",
  ];

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Pre-Session Dossier & Pre-Read"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Dossier"
          title="Check Explorers' Documents Before Each Session"
          description="Review the mentee context before you open the next mentoring session."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Pre-session summary
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              This view can be connected to the backend dossier endpoint so
              mentors can review transcripts, milestone status, and pre-read
              documents before each session.
            </p>

            <div className="mt-6 space-y-3">
              {dossierItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {item.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Pre-read documents
            </h3>

            <div className="mt-4 space-y-3">
              {documents.map((document) => (
                <div
                  key={document}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {document}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Ready to review before the session
                    </p>
                  </div>

                  <button className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
