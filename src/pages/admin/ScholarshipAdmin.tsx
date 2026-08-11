import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  GraduationCap,
  ImagePlus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createScholarship,
  deleteScholarship,
  getScholarships,
  getUniversities,
  restoreScholarship,
  updateScholarship,
  type Scholarship,
  type ScholarshipFormPayload,
  type University,
} from "../../api/adminApi";

import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

type ScholarshipFormState = {
  name: string;
  providerCountry: string;
  description: string;
  fundingType: string;
  degreeLevel: string;
  startDate: string;
  deadlineDate: string;
  officialWebsite: string;
  publicationStatus: string;
  universityIds: string[];
  image: File | null;
};

const EMPTY_FORM: ScholarshipFormState = {
  name: "",
  providerCountry: "",
  description: "",
  fundingType: "fully_funded",
  degreeLevel: "master",
  startDate: "",
  deadlineDate: "",
  officialWebsite: "",
  publicationStatus: "published",
  universityIds: [],
  image: null,
};

function formatFundingType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDegreeLevel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function applicationStatusBadge(status: Scholarship["applicationStatus"]) {
  if (status === "Open") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
        <CheckCircle2 size={12} /> Open
      </span>
    );
  }

  if (status === "Upcoming") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
        <Clock size={12} /> Upcoming
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      <AlertCircle size={12} /> Closed
    </span>
  );
}

export default function ScholarshipAdmin() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFunding, setFilterFunding] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] =
    useState<Scholarship | null>(null);
  const [form, setForm] = useState<ScholarshipFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [scholarshipData, universityData] = await Promise.all([
        getScholarships(),
        getUniversities(),
      ]);

      setScholarships(scholarshipData);
      setUniversities(universityData.filter((university) => !university.isDeleted));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data beasiswa",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const fundingTypes = useMemo(() => {
    return Array.from(
      new Set(
        scholarships
          .map((scholarship) => scholarship.fundingType)
          .filter(Boolean),
      ),
    ).sort();
  }, [scholarships]);

  const filteredScholarships = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return scholarships.filter((scholarship) => {
      const matchesSearch =
        !normalizedSearch ||
        scholarship.name.toLowerCase().includes(normalizedSearch) ||
        scholarship.providerCountry.toLowerCase().includes(normalizedSearch) ||
        scholarship.degreeLevel.toLowerCase().includes(normalizedSearch);

      const matchesFunding =
        filterFunding === "All" ||
        scholarship.fundingType === filterFunding;

      return matchesSearch && matchesFunding;
    });
  }, [filterFunding, scholarships, searchQuery]);

  const totalActive = scholarships.filter(
    (scholarship) => !scholarship.isDeleted,
  ).length;

  const totalOpen = scholarships.filter(
    (scholarship) =>
      !scholarship.isDeleted && scholarship.applicationStatus === "Open",
  ).length;

  const totalFullyFunded = scholarships.filter(
    (scholarship) =>
      !scholarship.isDeleted &&
      scholarship.fundingType === "fully_funded",
  ).length;

  const totalDeleted = scholarships.filter(
    (scholarship) => scholarship.isDeleted,
  ).length;

  const closeForm = () => {
    if (submitting) {
      return;
    }

    setIsFormOpen(false);
    setEditingScholarship(null);
    setForm(EMPTY_FORM);
  };

  const openCreateForm = () => {
    setError(null);
    setSuccessMessage(null);
    setEditingScholarship(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (scholarship: Scholarship) => {
    setError(null);
    setSuccessMessage(null);
    setEditingScholarship(scholarship);
    setForm({
      name: scholarship.name,
      providerCountry: scholarship.providerCountry,
      description: scholarship.description,
      fundingType: scholarship.fundingType,
      degreeLevel: scholarship.degreeLevel,
      startDate: scholarship.startDate,
      deadlineDate: scholarship.deadlineDate,
      officialWebsite: scholarship.officialWebsite,
      publicationStatus: scholarship.publicationStatus,
      universityIds: scholarship.universityIds.map(String),
      image: null,
    });
    setIsFormOpen(true);
  };

  const toggleUniversity = (id: string | number) => {
    const normalizedId = String(id);

    setForm((current) => ({
      ...current,
      universityIds: current.universityIds.includes(normalizedId)
        ? current.universityIds.filter(
            (universityId) => universityId !== normalizedId,
          )
        : [...current.universityIds, normalizedId],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.deadlineDate < form.startDate) {
      setError("Deadline date cannot be earlier than the start date.");
      return;
    }

    const payload: ScholarshipFormPayload = {
      name: form.name,
      provider_country: form.providerCountry,
      description: form.description,
      funding_type: form.fundingType,
      degree_level: form.degreeLevel,
      start_date: form.startDate,
      deadline_date: form.deadlineDate,
      official_website: form.officialWebsite,
      status: form.publicationStatus,
      image: form.image,
      university_ids: form.universityIds,
    };

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      if (editingScholarship) {
        await updateScholarship(editingScholarship.id, payload);
        setSuccessMessage("Scholarship updated successfully.");
      } else {
        await createScholarship(payload);
        setSuccessMessage("Scholarship created successfully.");
      }

      setIsFormOpen(false);
      setEditingScholarship(null);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : editingScholarship
            ? "Failed to update scholarship."
            : "Failed to create scholarship.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scholarship: Scholarship) => {
    const confirmed = window.confirm(
      `Delete \"${scholarship.name}\"?\n\nYou can restore it using the restore action while the deleted record remains available in this admin view.`,
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `delete-${scholarship.id}`;

    try {
      setProcessingId(actionKey);
      setError(null);
      setSuccessMessage(null);

      await deleteScholarship(scholarship.id);

      // Keep the soft-deleted record visible locally so the admin can
      // immediately use POST /restore-scholarship/:id even when the public
      // GET /api/scholarships endpoint omits trashed rows.
      setScholarships((current) =>
        current.map((item) =>
          String(item.id) === String(scholarship.id)
            ? {
                ...item,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      setSuccessMessage(`\"${scholarship.name}\" was deleted.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete scholarship.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (scholarship: Scholarship) => {
    const actionKey = `restore-${scholarship.id}`;

    try {
      setProcessingId(actionKey);
      setError(null);
      setSuccessMessage(null);

      await restoreScholarship(scholarship.id);
      setSuccessMessage(`\"${scholarship.name}\" was restored.`);
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to restore scholarship.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <UserLayout
      title="Scholarship Management"
      subtitle="Kelola katalog beasiswa dan tenggat waktu pendaftaran"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Scholarship Management
            </h1>
            <p className="text-sm text-gray-500">
              Kelola katalog beasiswa, periode pendaftaran, pendanaan,
              universitas, dan status publikasi.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>Add New Scholarship</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {loading && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Memuat data beasiswa...
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Active Programs
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {totalActive}
              </h3>
              <span className="text-xs font-medium text-blue-600">
                Available records
              </span>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <GraduationCap size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Open Applications
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {totalOpen}
              </h3>
              <span className="text-xs font-medium text-emerald-600">
                Within application window
              </span>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <CalendarCheck size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Fully Funded
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {totalFullyFunded}
              </h3>
              <span className="text-xs font-medium text-amber-600">
                funding_type = fully_funded
              </span>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Deleted Records
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {totalDeleted}
              </h3>
              <span className="text-xs font-medium text-indigo-600">
                Restorable records
              </span>
            </div>
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <Award size={24} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-t-xl border border-b-0 border-gray-100 bg-white p-4 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search scholarship, country, or degree..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <span className="text-xs font-medium text-gray-500">
              Funding:
            </span>
            <select
              value={filterFunding}
              onChange={(event) => setFilterFunding(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Funding</option>
              {fundingTypes.map((fundingType) => (
                <option key={fundingType} value={fundingType}>
                  {formatFundingType(fundingType)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-b-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="p-4">Scholarship</th>
                  <th className="p-4">Funding & Degree</th>
                  <th className="p-4">Application Window</th>
                  <th className="p-4">App Status</th>
                  <th className="p-4">Publication</th>
                  <th className="p-4">Universities</th>
                  <th className="p-4">Record</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {!loading && filteredScholarships.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-10 text-center text-gray-400"
                    >
                      No scholarships found.
                    </td>
                  </tr>
                )}

                {filteredScholarships.map((scholarship) => (
                  <tr
                    key={scholarship.id}
                    className={`transition hover:bg-gray-50 ${
                      scholarship.isDeleted
                        ? "bg-gray-50/60 text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    <td className="max-w-xs p-4">
                      <div className="flex items-start gap-3">
                        {scholarship.imageUrl ? (
                          <img
                            src={scholarship.imageUrl}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-lg border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-500">
                            <GraduationCap size={19} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-semibold">
                            <span className="truncate">{scholarship.name}</span>
                            {scholarship.officialWebsite && (
                              <a
                                href={scholarship.officialWebsite}
                                target="_blank"
                                rel="noreferrer"
                                className="shrink-0 text-gray-400 hover:text-blue-600"
                                title="Open official website"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {scholarship.providerCountry || "Country not provided"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="rounded border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {formatFundingType(scholarship.fundingType)}
                      </span>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatDegreeLevel(scholarship.degreeLevel)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <Clock size={14} className="text-gray-400" />
                        {formatDate(scholarship.startDate)}
                      </div>
                      <div className="mt-1 pl-5 text-xs text-gray-400">
                        to {formatDate(scholarship.deadlineDate)}
                      </div>
                    </td>

                    <td className="p-4">
                      {applicationStatusBadge(scholarship.applicationStatus)}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {scholarship.publicationStatus || "—"}
                      </span>
                    </td>

                    <td className="max-w-[220px] p-4">
                      {scholarship.universityNames.length > 0 ? (
                        <span className="line-clamp-2 text-xs text-gray-600">
                          {scholarship.universityNames.join(", ")}
                        </span>
                      ) : scholarship.universityIds.length > 0 ? (
                        <span className="text-xs text-gray-500">
                          IDs: {scholarship.universityIds.join(", ")}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">None linked</span>
                      )}
                    </td>

                    <td className="p-4">
                      {scholarship.isDeleted ? (
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                          Deleted
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {!scholarship.isDeleted && (
                          <button
                            type="button"
                            title="Update Scholarship"
                            onClick={() => openEditForm(scholarship)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        {scholarship.isDeleted ? (
                          <button
                            type="button"
                            title="Restore Scholarship"
                            disabled={
                              processingId === `restore-${scholarship.id}`
                            }
                            onClick={() => void handleRestore(scholarship)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw
                              size={16}
                              className={
                                processingId === `restore-${scholarship.id}`
                                  ? "animate-spin"
                                  : ""
                              }
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Delete Scholarship"
                            disabled={
                              processingId === `delete-${scholarship.id}`
                            }
                            onClick={() => void handleDelete(scholarship)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingScholarship
                    ? "Update Scholarship"
                    : "Create Scholarship"}
                </h2>
                <p className="text-xs text-gray-500">
                  Data is sent as multipart/form-data to the admin scholarship API.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close scholarship form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Scholarship Name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="LPDP Reguler 2026 - Batch 2"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Provider Country
                  </span>
                  <input
                    required
                    value={form.providerCountry}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        providerCountry: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Indonesia"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Funding Type
                  </span>
                  <input
                    required
                    value={form.fundingType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fundingType: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="fully_funded"
                  />
                  <span className="block text-[11px] text-gray-400">
                    Example from the API: fully_funded
                  </span>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Degree Level
                  </span>
                  <input
                    required
                    value={form.degreeLevel}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        degreeLevel: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="master"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Start Date
                  </span>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Deadline Date
                  </span>
                  <input
                    required
                    type="date"
                    min={form.startDate || undefined}
                    value={form.deadlineDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        deadlineDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Official Website
                  </span>
                  <input
                    required
                    type="url"
                    value={form.officialWebsite}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        officialWebsite: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://lpdp.kemenkeu.go.id"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Publication Status
                  </span>
                  <input
                    required
                    value={form.publicationStatus}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        publicationStatus: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="published"
                  />
                  <span className="block text-[11px] text-gray-400">
                    Example from the API: published
                  </span>
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-gray-700">
                  Description
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Scholarship description..."
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Linked Universities
                    </p>
                    <p className="text-xs text-gray-400">
                      Selected IDs are submitted as university_ids[0], university_ids[1], etc.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {form.universityIds.length} selected
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 p-3">
                  {universities.length === 0 ? (
                    <p className="p-3 text-sm text-gray-400">
                      No universities are currently available from /api/universities.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {universities.map((university) => {
                        const checked = form.universityIds.includes(
                          String(university.id),
                        );

                        return (
                          <label
                            key={university.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                              checked
                                ? "border-blue-200 bg-blue-50"
                                : "border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleUniversity(university.id)}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-gray-800">
                                {university.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                ID {university.id}
                                {university.country
                                  ? ` • ${university.country}`
                                  : ""}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {editingScholarship?.imageUrl && !form.image ? (
                    <img
                      src={editingScholarship.imageUrl}
                      alt="Current scholarship"
                      className="h-20 w-28 rounded-lg border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="grid h-20 w-28 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400">
                      <ImagePlus size={24} />
                    </div>
                  )}

                  <label className="flex-1 space-y-1.5">
                    <span className="text-sm font-semibold text-gray-700">
                      Scholarship Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          image: event.target.files?.[0] ?? null,
                        }))
                      }
                      className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <span className="block text-xs text-gray-400">
                      {form.image
                        ? form.image.name
                        : editingScholarship?.imageUrl
                          ? "Leave empty to keep the current image."
                          : "Choose an image to include it in the multipart request."}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? editingScholarship
                      ? "Saving Changes..."
                      : "Creating..."
                    : editingScholarship
                      ? "Save Changes"
                      : "Create Scholarship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}