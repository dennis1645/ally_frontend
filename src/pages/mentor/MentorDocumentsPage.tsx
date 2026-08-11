import { Plus } from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";

import {
  mentorSidebarItems,
  SectionHeader,
} from "./MentorShared";

export default function MentorDocumentsPage() {
  const documents = [
    {
      name: "Motivation letter draft",
      updated: "Updated 2h ago",
    },
    {
      name: "Scholarship statement",
      updated: "Updated yesterday",
    },
    {
      name: "Recommendation note",
      updated: "Updated 3 days ago",
    },
  ];

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Documents Preview"
      sidebarItems={mentorSidebarItems}
      topbarProps={{
        showSearch: false,
      }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <SectionHeader
          eyebrow="Documents Library"
          title="Explorers' Documents Preview"
          description="Review and manage the documents shared by mentees and mentors before the next session."
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Shared documents
              </h3>

              <p className="text-sm text-slate-500">
                The mentor can open, upload, or remove documents as needed.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white">
              <Plus size={16} />
              Upload document
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.name}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {document.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {document.updated}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                    Preview
                  </button>

                  <button className="rounded-full bg-ally-primary px-3 py-2 text-sm font-semibold text-white">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
