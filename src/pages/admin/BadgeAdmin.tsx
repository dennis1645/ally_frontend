import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Award,
  Edit,
  Eye,
  Gauge,
  Plus,
  Search,
  Star,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";
import {
  createBadge,
  deleteBadge,
  getBadge,
  getBadges,
  updateBadge,
  type BadgeItem,
  type BadgePayload,
} from "../../api/adminApi";

type BadgeFormState = {
  name: string;
  description: string;
  iconUrl: string;
  requiredXp: string;
};

type SortOption =
  | "xp-asc"
  | "xp-desc"
  | "name-asc"
  | "name-desc";

const EMPTY_FORM: BadgeFormState = {
  name: "",
  description: "",
  iconUrl: "",
  requiredXp: "0",
};

function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

function formatDateTime(value: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildFormState(badge: BadgeItem): BadgeFormState {
  return {
    name: badge.name,
    description: badge.description,
    iconUrl: badge.iconUrl ?? "",
    requiredXp: String(badge.requiredXp),
  };
}

function buildPayload(form: BadgeFormState): BadgePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    icon_url: form.iconUrl.trim(),
    required_xp: Number(form.requiredXp),
  };
}

export default function BadgeAdmin() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("xp-asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [form, setForm] = useState<BadgeFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [detailBadge, setDetailBadge] = useState<BadgeItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBadges();
      setBadges(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data badge.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBadges();
  }, []);

  const filteredBadges = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = badges.filter((badge) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        badge.name.toLowerCase().includes(normalizedSearch) ||
        badge.description.toLowerCase().includes(normalizedSearch) ||
        String(badge.requiredXp).includes(normalizedSearch)
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "xp-desc":
          return b.requiredXp - a.requiredXp;

        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        case "xp-asc":
        default:
          return a.requiredXp - b.requiredXp;
      }
    });
  }, [badges, searchQuery, sortOption]);

  const badgeStats = useMemo(() => {
    if (badges.length === 0) {
      return {
        total: 0,
        highestXp: 0,
        averageXp: 0,
        starterBadge: null as BadgeItem | null,
      };
    }

    const highestXp = Math.max(...badges.map((badge) => badge.requiredXp));
    const totalXp = badges.reduce(
      (total, badge) => total + badge.requiredXp,
      0,
    );
    const starterBadge = [...badges].sort(
      (a, b) => a.requiredXp - b.requiredXp,
    )[0];

    return {
      total: badges.length,
      highestXp,
      averageXp: Math.round(totalXp / badges.length),
      starterBadge,
    };
  }, [badges]);

  const openCreateForm = () => {
    setEditingBadge(null);
    setForm(EMPTY_FORM);
    setError(null);
    setSuccessMessage(null);
    setFormOpen(true);
  };

  const openEditForm = async (badge: BadgeItem) => {
    try {
      setProcessingId(`edit-${badge.id}`);
      setError(null);
      setSuccessMessage(null);

      const freshBadge = await getBadge(badge.id);

      setEditingBadge(freshBadge);
      setForm(buildFormState(freshBadge));
      setFormOpen(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail badge untuk diedit.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openDetail = async (badge: BadgeItem) => {
    try {
      setDetailLoading(true);
      setError(null);
      setSuccessMessage(null);

      const freshBadge = await getBadge(badge.id);
      setDetailBadge(freshBadge);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail badge.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingBadge(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = buildPayload(form);

    if (!payload.name) {
      setError("Badge name is required.");
      return;
    }

    if (!payload.description) {
      setError("Badge description is required.");
      return;
    }

    if (!payload.icon_url) {
      setError("Icon URL is required.");
      return;
    }

    if (
      !Number.isFinite(payload.required_xp) ||
      payload.required_xp < 0
    ) {
      setError("Required XP must be 0 or greater.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      if (editingBadge) {
        await updateBadge(editingBadge.id, payload);
        setSuccessMessage(`"${payload.name}" berhasil diperbarui.`);
      } else {
        await createBadge(payload);
        setSuccessMessage(`"${payload.name}" berhasil dibuat.`);
      }

      setFormOpen(false);
      setEditingBadge(null);
      setForm(EMPTY_FORM);

      await loadBadges();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : editingBadge
            ? "Gagal memperbarui badge."
            : "Gagal membuat badge.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (badge: BadgeItem) => {
    const confirmed = window.confirm(
      `Delete badge "${badge.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(`delete-${badge.id}`);
      setError(null);
      setSuccessMessage(null);

      await deleteBadge(badge.id);
      setSuccessMessage(`"${badge.name}" berhasil dihapus.`);

      if (detailBadge && String(detailBadge.id) === String(badge.id)) {
        setDetailBadge(null);
      }

      await loadBadges();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus badge.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <UserLayout
      title="Badge & Gamification Management"
      subtitle="Kelola badge dan XP requirement platform"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Badge & Gamification Management
            </h1>
            <p className="text-sm text-gray-500">
              Kelola badge, ikon, deskripsi, dan minimum XP yang dibutuhkan user.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>Create New Badge</span>
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
            Memuat badge...
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Badges
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {badgeStats.total}
              </h3>
              <span className="text-xs font-medium text-blue-600">
                Badge tersedia di katalog
              </span>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Award size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Highest Requirement
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {formatNumber(badgeStats.highestXp)} XP
              </h3>
              <span className="text-xs font-medium text-amber-600">
                Requirement tertinggi
              </span>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Trophy size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Average Requirement
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {formatNumber(badgeStats.averageXp)} XP
              </h3>
              <span className="text-xs font-medium text-indigo-600">
                Rata-rata semua badge
              </span>
            </div>
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <Gauge size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Starter Badge
              </p>
              <h3 className="mt-1 max-w-[180px] truncate text-lg font-bold text-gray-800">
                {badgeStats.starterBadge?.name ?? "—"}
              </h3>
              <span className="text-xs font-medium text-emerald-600">
                {badgeStats.starterBadge
                  ? `${formatNumber(badgeStats.starterBadge.requiredXp)} XP`
                  : "Belum ada badge"}
              </span>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Star size={24} />
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
              placeholder="Search badge name, description, or XP..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <span className="text-xs font-medium text-gray-500">
              Sort:
            </span>
            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="xp-asc">XP: Low to High</option>
              <option value="xp-desc">XP: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-b-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="p-4">Badge & Description</th>
                  <th className="p-4">Required XP</th>
                  <th className="p-4">Updated At</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {!loading && filteredBadges.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-10 text-center text-sm text-gray-400"
                    >
                      No badges found.
                    </td>
                  </tr>
                )}

                {filteredBadges.map((badge) => (
                  <tr
                    key={badge.id}
                    className="text-gray-800 transition hover:bg-gray-50"
                  >
                    <td className="max-w-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          {badge.iconUrl ? (
                            <img
                              src={badge.iconUrl}
                              alt={`${badge.name} badge`}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Award size={22} className="text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-gray-900">
                            {badge.name}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                            {badge.description || "—"}
                          </p>
                          <span className="mt-1 block font-mono text-[10px] text-gray-400">
                            ID: {badge.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {formatNumber(badge.requiredXp)} XP
                      </span>
                    </td>

                    <td className="p-4 text-xs text-gray-500">
                      {formatDateTime(badge.updatedAt)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="View badge detail"
                          disabled={detailLoading}
                          onClick={() => void openDetail(badge)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit badge"
                          disabled={processingId === `edit-${badge.id}`}
                          onClick={() => void openEditForm(badge)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete badge"
                          disabled={processingId === `delete-${badge.id}`}
                          onClick={() => void handleDelete(badge)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingBadge ? "Edit Badge" : "Create New Badge"}
                </h2>
                <p className="text-xs text-gray-500">
                  {editingBadge
                    ? `Updating badge ID ${editingBadge.id}`
                    : "Create a new XP-based achievement badge."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Badge Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Elite Scholar"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Describe how the user earns this badge..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Icon URL
                </label>
                <input
                  type="url"
                  value={form.iconUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      iconUrl: event.target.value,
                    }))
                  }
                  placeholder="https://ui-avatars.com/api/?name=Elite..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {form.iconUrl.trim() && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <img
                        src={form.iconUrl.trim()}
                        alt="Badge icon preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Icon Preview
                      </p>
                      <p className="text-xs text-gray-500">
                        This URL will be stored as icon_url.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Required XP
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.requiredXp}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      requiredXp: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingBadge
                      ? "Save Changes"
                      : "Create Badge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Badge Detail
                </h2>
                <p className="text-xs text-gray-500">
                  GET /api/admin/badges/{detailBadge.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailBadge(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                  {detailBadge.iconUrl ? (
                    <img
                      src={detailBadge.iconUrl}
                      alt={`${detailBadge.name} badge`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Award size={32} className="text-gray-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {detailBadge.name}
                  </h3>
                  <span className="mt-2 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {formatNumber(detailBadge.requiredXp)} XP required
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Description
                  </p>
                  <p className="mt-1 text-gray-700">
                    {detailBadge.description || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Icon URL
                  </p>
                  <p className="mt-1 break-all text-blue-600">
                    {detailBadge.iconUrl ?? "—"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Created At
                    </p>
                    <p className="mt-1 text-gray-700">
                      {formatDateTime(detailBadge.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Updated At
                    </p>
                    <p className="mt-1 text-gray-700">
                      {formatDateTime(detailBadge.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setDetailBadge(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const badge = detailBadge;
                    setDetailBadge(null);
                    void openEditForm(badge);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Edit Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}