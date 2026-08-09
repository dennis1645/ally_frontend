import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Archive,
  Building2,
  Edit,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  ImagePlus,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createUniversity,
  deleteUniversity,
  getUniversities,
  restoreUniversity,
  updateUniversity,
  type University,
  type UniversityFormPayload,
} from "../../api/adminApi";

import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

type UniversityFormState = {
  name: string;
  country: string;
  city: string;
  description: string;
  admissionProcess: string;
  admissionRequirements: string;
  officialWebsite: string;
  image: File | null;
};

const EMPTY_FORM: UniversityFormState = {
  name: "",
  country: "",
  city: "",
  description: "",
  admissionProcess: "",
  admissionRequirements: "",
  officialWebsite: "",
  image: null,
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function buildPayload(form: UniversityFormState): UniversityFormPayload {
  return {
    name: form.name.trim(),
    country: form.country.trim(),
    city: form.city.trim(),
    description: form.description.trim(),
    admission_process: form.admissionProcess.trim(),
    admission_requirements: form.admissionRequirements.trim(),
    official_website: form.officialWebsite.trim(),
    image: form.image,
  };
}

export default function UniversityAdmin() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] =
    useState<University | null>(null);
  const [form, setForm] = useState<UniversityFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUniversities();
      setUniversities(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data universitas.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const countries = useMemo(() => {
    return Array.from(
      new Set(
        universities
          .map((university) => university.country.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [universities]);

  const filteredUniversities = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return universities.filter((university) => {
      const matchesSearch =
        !normalizedSearch ||
        university.name.toLowerCase().includes(normalizedSearch) ||
        university.country.toLowerCase().includes(normalizedSearch) ||
        university.city.toLowerCase().includes(normalizedSearch) ||
        university.description.toLowerCase().includes(normalizedSearch);

      const matchesCountry =
        filterCountry === "All" || university.country === filterCountry;

      return matchesSearch && matchesCountry;
    });
  }, [universities, searchQuery, filterCountry]);

  const activeUniversities = universities.filter(
    (university) => !university.isDeleted,
  ).length;

  const archivedUniversities = universities.filter(
    (university) => university.isDeleted,
  ).length;

  const linkedScholarships = universities.reduce(
    (total, university) => total + university.linkedScholarshipsCount,
    0,
  );

  const openCreateForm = () => {
    setEditingUniversity(null);
    setForm(EMPTY_FORM);
    setError(null);
    setSuccessMessage(null);
    setFormOpen(true);
  };

  const openEditForm = (university: University) => {
    setEditingUniversity(university);
    setForm({
      name: university.name,
      country: university.country,
      city: university.city,
      description: university.description,
      admissionProcess: university.admissionProcess,
      admissionRequirements: university.admissionRequirements,
      officialWebsite: university.officialWebsite,
      image: null,
    });
    setError(null);
    setSuccessMessage(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingUniversity(null);
    setForm(EMPTY_FORM);
  };

  const updateFormField = (
    key: Exclude<keyof UniversityFormState, "image">,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("University name is required.");
      return;
    }

    if (!editingUniversity && !form.country.trim()) {
      setError("Country is required when creating a university.");
      return;
    }

    if (!editingUniversity && !form.city.trim()) {
      setError("City is required when creating a university.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const payload = buildPayload(form);

      if (editingUniversity) {
        await updateUniversity(editingUniversity.id, payload);
        setSuccessMessage(`"${form.name.trim()}" was updated.`);
      } else {
        await createUniversity(payload);
        setSuccessMessage(`"${form.name.trim()}" was created.`);
      }

      setFormOpen(false);
      setEditingUniversity(null);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : editingUniversity
            ? "Failed to update university."
            : "Failed to create university.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (university: University) => {
    const confirmed = window.confirm(
      `Soft delete "${university.name}"?\n\nThe university can be restored later.`,
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `delete-${university.id}`;

    try {
      setProcessingId(actionKey);
      setError(null);
      setSuccessMessage(null);

      await deleteUniversity(university.id);

      // Keep the soft-deleted row visible locally so Restore remains
      // available even if GET /api/universities omits trashed records.
      setUniversities((current) =>
        current.map((item) =>
          String(item.id) === String(university.id)
            ? {
                ...item,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      setSuccessMessage(`"${university.name}" was soft deleted.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete university.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (university: University) => {
    const actionKey = `restore-${university.id}`;

    try {
      setProcessingId(actionKey);
      setError(null);
      setSuccessMessage(null);

      await restoreUniversity(university.id);
      setSuccessMessage(`"${university.name}" was restored.`);
      await loadData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to restore university.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <UserLayout
      title="University Management"
      subtitle="Kelola universitas dan asosiasi beasiswa"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              University Management
            </h1>
            <p className="text-sm text-gray-500">
              Kelola data universitas, proses admission, website, dan gambar kampus.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>Add New University</span>
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
            Memuat data universitas...
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingUniversity ? "Edit University" : "Add New University"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {editingUniversity
                    ? `Updating university ID ${editingUniversity.id}`
                    : "Create a new university record using the admin API."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close university form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  University Name <span className="text-rose-500">*</span>
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateFormField("name", event.target.value)}
                  placeholder="Universitas Indonesia"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Country {!editingUniversity && <span className="text-rose-500">*</span>}
                </span>
                <input
                  type="text"
                  value={form.country}
                  onChange={(event) => updateFormField("country", event.target.value)}
                  placeholder="Indonesia"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  City {!editingUniversity && <span className="text-rose-500">*</span>}
                </span>
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) => updateFormField("city", event.target.value)}
                  placeholder="Depok, Jawa Barat"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Official Website
                </span>
                <input
                  type="url"
                  value={form.officialWebsite}
                  onChange={(event) =>
                    updateFormField("officialWebsite", event.target.value)
                  }
                  placeholder="https://ui.ac.id"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateFormField("description", event.target.value)
                  }
                  placeholder="University description..."
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Admission Process
                </span>
                <textarea
                  rows={4}
                  value={form.admissionProcess}
                  onChange={(event) =>
                    updateFormField("admissionProcess", event.target.value)
                  }
                  placeholder="Describe the admission process..."
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Admission Requirements
                </span>
                <textarea
                  rows={4}
                  value={form.admissionRequirements}
                  onChange={(event) =>
                    updateFormField("admissionRequirements", event.target.value)
                  }
                  placeholder="Describe the admission requirements..."
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ImagePlus size={16} />
                  University Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setForm((current) => ({ ...current, image: file }));
                  }}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:font-semibold file:text-blue-700"
                />

                {editingUniversity?.imageUrl && !form.image && (
                  <p className="mt-2 text-xs text-gray-500">
                    Leave this empty to keep the existing image.
                  </p>
                )}

                {form.image && (
                  <p className="mt-2 text-xs font-medium text-blue-600">
                    Selected: {form.image.name}
                  </p>
                )}
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {saving
                  ? "Saving..."
                  : editingUniversity
                    ? "Save Changes"
                    : "Create University"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Active Universities
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {formatCount(activeUniversities)}
              </h3>
              <span className="text-xs font-medium text-emerald-600">
                Available in catalogue
              </span>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Building2 size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Countries Covered
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {formatCount(countries.length)}
              </h3>
              <span className="text-xs text-gray-500">Based on current API data</span>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Globe size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Linked Scholarships
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {formatCount(linkedScholarships)}
              </h3>
              <span className="text-xs font-medium text-blue-600">
                Across all universities
              </span>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <GraduationCap size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Archived / Soft Deleted
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {formatCount(archivedUniversities)}
              </h3>
              <span className="text-xs font-medium text-rose-500">
                Can be restored
              </span>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
              <Archive size={24} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-t-xl border border-b-0 border-gray-100 bg-white p-4 sm:flex-row">
          <div className="relative w-full sm:w-96">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search university, city, or country..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <span className="text-xs font-medium text-gray-500">Country:</span>
            <select
              value={filterCountry}
              onChange={(event) => setFilterCountry(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
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
                  <th className="p-4">University</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Admission Information</th>
                  <th className="p-4">Scholarships</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {!loading && filteredUniversities.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      No universities found.
                    </td>
                  </tr>
                )}

                {filteredUniversities.map((university) => {
                  const deleteKey = `delete-${university.id}`;
                  const restoreKey = `restore-${university.id}`;

                  return (
                    <tr
                      key={university.id}
                      className={`transition hover:bg-gray-50 ${
                        university.isDeleted
                          ? "bg-gray-50/60 text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex min-w-[250px] items-center gap-3">
                          {university.imageUrl ? (
                            <img
                              src={university.imageUrl}
                              alt={university.name}
                              className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                              {getInitials(university.name) || "UN"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                              <span className="line-clamp-1">{university.name}</span>
                              {university.officialWebsite && (
                                <a
                                  href={university.officialWebsite}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open official website"
                                  className="shrink-0 text-gray-400 transition hover:text-blue-600"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              ID: {university.id}
                            </span>
                            {university.description && (
                              <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-relaxed text-gray-500">
                                {university.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <MapPin size={15} className="text-gray-400" />
                          <span>{university.city || "—"}</span>
                        </div>
                        <span className="mt-1 block text-xs text-gray-400">
                          {university.country || "Country not provided"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="max-w-xs space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <FileText size={14} className="mt-0.5 shrink-0 text-blue-500" />
                            <span className="line-clamp-2 text-gray-600">
                              {university.admissionProcess || "Admission process not provided"}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <GraduationCap
                              size={14}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />
                            <span className="line-clamp-2 text-gray-600">
                              {university.admissionRequirements ||
                                "Requirements not provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-blue-600">
                          <GraduationCap size={16} />
                          <span>
                            {formatCount(university.linkedScholarshipsCount)} linked
                          </span>
                        </div>
                        {university.totalInterestedMentees > 0 && (
                          <span className="mt-1 block text-xs text-gray-400">
                            {formatCount(university.totalInterestedMentees)} interested users
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {university.isDeleted ? (
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                            Soft Deleted
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {!university.isDeleted && (
                            <button
                              type="button"
                              onClick={() => openEditForm(university)}
                              title="Update University"
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Edit size={16} />
                            </button>
                          )}

                          {university.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => void handleRestore(university)}
                              disabled={processingId === restoreKey}
                              title="Restore University"
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <RefreshCw
                                size={16}
                                className={
                                  processingId === restoreKey ? "animate-spin" : ""
                                }
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void handleDelete(university)}
                              disabled={processingId === deleteKey}
                              title="Soft Delete University"
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}