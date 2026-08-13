import { useEffect, useState } from "react";
import {
  ExternalLink,
  FileText,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorDocumentsApi,
  uploadMentorDocumentApi,
  deleteMentorDocumentApi,
  type SharedDocumentItem,
} from "../../api/mentorApi";

export function MentorDocumentsPage() {
  const [documents, setDocuments] = useState<SharedDocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Upload State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  async function fetchDocuments() {
    setLoading(true);
    setError(null);
    try {
      const response = await getMentorDocumentsApi();
      if (response?.data) {
        setDocuments(response.data);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch mentor documents", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar dokumen berbagi mentor."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleUploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedFile) {
      setError("Silakan isi judul dokumen dan pilih berkas PDF/DOCX.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await uploadMentorDocumentApi(title, selectedFile);
      setSuccessMsg(res.message || "Dokumen berhasil diunggah.");
      setShowUploadModal(false);
      setTitle("");
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah dokumen.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteDocument(id: number) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await deleteMentorDocumentApi(id);
      setSuccessMsg(res.message || "Dokumen berhasil dihapus.");
      fetchDocuments();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus dokumen.");
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <UserLayout
      title="Mentor Portal"
      subtitle="Shared Mentor Documents"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-3">
            <CheckCircle size={20} />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Header & Upload Action */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Shared Mentor Documents Repository
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Kelola dan bagikan dokumen referensi / panduan mentor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 self-start rounded-full bg-ally-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-ally-primary/90 sm:self-auto"
            >
              <Plus size={16} />
              Unggah Dokumen Barunya
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari berdasarkan judul atau nama file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-ally-primary focus:bg-white"
            />
          </div>

          {/* Document List */}
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-ally-primary" />
              <span className="ml-3 text-sm font-semibold text-slate-600">
                Memuat berkas dokumen mentor...
              </span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada dokumen berbagi yang ditemukan.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-base leading-snug">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.file_name || doc.file_url} {doc.created_at ? `• ${doc.created_at}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink size={13} />
                      Buka Dokumen
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                    >
                      <Trash2 size={13} />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Upload */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Unggah Dokumen Shared Mentor
              </h3>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Judul Dokumen
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Template Panduan Wawancara Beasiswa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-ally-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pilih File (PDF / DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 rounded-full bg-ally-primary py-2.5 text-xs font-bold text-white hover:bg-ally-primary/90 disabled:opacity-50"
                  >
                    {isUploading ? "Mengunggah..." : "Unggah Sekarang"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-full bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-300"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </UserLayout>
  );
}

export default MentorDocumentsPage;