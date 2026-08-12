import { useState } from "react";
import {
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  User,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";

type GlobalDocument = {
  id: string;
  name: string;
  menteeName: string;
  category: "Essay & Letter" | "Academic Record" | "Recommendation" | "Other";
  updated: string;
  size: string;
};

const globalDocumentsData: GlobalDocument[] = [
  {
    id: "doc-1",
    name: "Motivation_Letter_v2_Draft.pdf",
    menteeName: "Ari Chen",
    category: "Essay & Letter",
    updated: "Updated 2h ago",
    size: "1.2 MB",
  },
  {
    id: "doc-2",
    name: "Academic_Transcript_Official.pdf",
    menteeName: "Ari Chen",
    category: "Academic Record",
    updated: "Updated yesterday",
    size: "2.4 MB",
  },
  {
    id: "doc-3",
    name: "CV_ATS_Format_Jordan.pdf",
    menteeName: "Jordan Lee",
    category: "Academic Record",
    updated: "Updated yesterday",
    size: "900 KB",
  },
  {
    id: "doc-4",
    name: "Recommendation_Letter_Professor.pdf",
    menteeName: "Mina Alvarez",
    category: "Recommendation",
    updated: "Updated 3 days ago",
    size: "850 KB",
  },
  {
    id: "doc-5",
    name: "Research_Statement_Draft.docx",
    menteeName: "Jordan Lee",
    category: "Essay & Letter",
    updated: "Updated 4 days ago",
    size: "512 KB",
  },
];

export function MentorDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Logika pencarian berdasarkan Nama File ATAU Nama Mentee
  const filteredDocuments = globalDocumentsData.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.menteeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Documents Library"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Header & Upload Action */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Global Documents Repository
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and preview documents uploaded across all your assigned mentees.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 self-start rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-ally-primary/90 sm:self-auto"
            >
              <Plus size={16} />
              Upload Document
            </button>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by file name or mentee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-ally-primary cursor-pointer sm:w-auto"
              >
                <option value="All">All Categories</option>
                <option value="Essay & Letter">Essay & Letter</option>
                <option value="Academic Record">Academic Record</option>
                <option value="Recommendation">Recommendation</option>
              </select>
              <Filter
                size={14}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              />
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No documents found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-2xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-base leading-snug">
                        {doc.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {/* Mentee Owner Tag */}
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                          <User size={12} />
                          {doc.menteeName}
                        </span>
                        <span>•</span>
                        <span className="rounded-md bg-ally-surface px-2 py-0.5 font-medium text-ally-primary">
                          {doc.category}
                        </span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.updated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye size={13} />
                      Preview
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-ally-primary px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-ally-primary/90"
                    >
                      <ExternalLink size={13} />
                      Open
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}

export default MentorDocumentsPage;