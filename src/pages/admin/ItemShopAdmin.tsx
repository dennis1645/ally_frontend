import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  Coins,
  CreditCard,
  Edit,
  Eye,
  ImageIcon,
  Package,
  Plus,
  Search,
  Store,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import UserLayout from "../../components/layout/UserLayout";
import {
  createShopItem,
  deleteShopItem,
  getShopItem,
  getShopItems,
  updateShopItem,
  type ShopItem,
  type ShopItemPayload,
  type ShopItemType,
} from "../../api/adminApi";
import { adminSidebarItems } from "./adminSidebarItems";

type FormMode = "create" | "edit";

type ShopItemFormState = {
  name: string;
  itemType: "subscription" | "token_package";
  description: string;
  priceRupiah: string;
  priceXp: string;
  tokenReward: string;
  durationDays: string;
  stockQuantity: string;
  imageUrl: string;
  isActive: boolean;
};

const EMPTY_FORM: ShopItemFormState = {
  name: "",
  itemType: "subscription",
  description: "",
  priceRupiah: "0",
  priceXp: "0",
  tokenReward: "0",
  durationDays: "365",
  stockQuantity: "9999",
  imageUrl: "",
  isActive: true,
};

function createDefaultForm(
  itemType: "subscription" | "token_package",
): ShopItemFormState {
  return {
    ...EMPTY_FORM,
    itemType,
    durationDays:
      itemType === "subscription" ? "365" : "",
    stockQuantity:
      itemType === "subscription" ? "9999" : "999",
  };
}

function formFromItem(item: ShopItem): ShopItemFormState {
  return {
    name: item.name,
    itemType:
      item.itemType === "subscription"
        ? "subscription"
        : "token_package",
    description: item.description,
    priceRupiah: String(item.priceRupiah),
    priceXp: String(item.priceXp),
    tokenReward: String(item.tokenReward),
    durationDays:
      item.durationDays === null
        ? ""
        : String(item.durationDays),
    stockQuantity: String(item.stockQuantity),
    imageUrl: item.imageUrl ?? "",
    isActive: item.isActive,
  };
}

function parseNonNegativeNumber(
  value: string,
  fieldLabel: string,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldLabel} harus berupa angka 0 atau lebih.`);
  }

  return parsed;
}

function buildPayload(form: ShopItemFormState): ShopItemPayload {
  const name = form.name.trim();
  const description = form.description.trim();

  if (!name) {
    throw new Error("Nama item wajib diisi.");
  }

  if (!description) {
    throw new Error("Deskripsi item wajib diisi.");
  }

  const priceRupiah = parseNonNegativeNumber(
    form.priceRupiah,
    "Harga Rupiah",
  );

  const priceXp = parseNonNegativeNumber(
    form.priceXp,
    "Harga XP",
  );

  const tokenReward = parseNonNegativeNumber(
    form.tokenReward,
    "Token reward",
  );

  const stockQuantity = parseNonNegativeNumber(
    form.stockQuantity,
    "Jumlah stok",
  );

  let durationDays: number | null = null;

  if (form.itemType === "subscription") {
    if (!form.durationDays.trim()) {
      throw new Error(
        "Duration days wajib diisi untuk subscription.",
      );
    }

    durationDays = parseNonNegativeNumber(
      form.durationDays,
      "Duration days",
    );
  }

  const imageUrl = form.imageUrl.trim();

  return {
    name,
    item_type: form.itemType,
    description,
    price_rupiah: priceRupiah,
    price_xp: priceXp,
    token_reward: tokenReward,
    duration_days: durationDays,
    stock_quantity: stockQuantity,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    is_active: form.isActive,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
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

function itemTypeLabel(type: ShopItemType): string {
  if (type === "subscription") {
    return "Subscription";
  }

  if (type === "token_package") {
    return "Token Package";
  }

  return type;
}

export default function ItemShopAdmin() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState<ShopItemFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ShopItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await getShopItems();
      setItems(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data item toko.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch);

      const matchesType =
        filterType === "All" || item.itemType === filterType;

      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, filterType]);

  const activeCount = items.filter((item) => item.isActive).length;
  const subscriptionCount = items.filter(
    (item) => item.itemType === "subscription",
  ).length;
  const tokenPackageCount = items.filter(
    (item) => item.itemType === "token_package",
  ).length;
  const totalStock = items.reduce(
    (total, item) => total + item.stockQuantity,
    0,
  );

  const openCreateForm = (
    type: "subscription" | "token_package",
  ) => {
    setFormMode("create");
    setEditingId(null);
    setForm(createDefaultForm(type));
    setFormError(null);
    setSuccessMessage(null);
    setFormOpen(true);
  };

  const openEditForm = async (item: ShopItem) => {
    try {
      setProcessingId(`edit-${item.id}`);
      setError(null);
      setSuccessMessage(null);

      const fullItem = await getShopItem(item.id);

      setFormMode("edit");
      setEditingId(fullItem.id);
      setForm(formFromItem(fullItem));
      setFormError(null);
      setFormOpen(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail item untuk diedit.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openDetail = async (item: ShopItem) => {
    setDetailOpen(true);
    setDetailItem(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const fullItem = await getShopItem(item.id);
      setDetailItem(fullItem);
    } catch (err: unknown) {
      setDetailError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail item.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFormError(null);
      setError(null);
      setSuccessMessage(null);

      const payload = buildPayload(form);

      if (formMode === "create") {
        await createShopItem(payload);
        setSuccessMessage(`"${payload.name}" berhasil dibuat.`);
      } else {
        if (editingId === null) {
          throw new Error("ID item yang diedit tidak ditemukan.");
        }

        await updateShopItem(editingId, payload);
        setSuccessMessage(`"${payload.name}" berhasil diperbarui.`);
      }

      setFormOpen(false);
      await loadItems();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan item toko.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ShopItem) => {
    const confirmed = window.confirm(
      `Hapus "${item.name}" dari shop?\n\nAksi ini menggunakan DELETE dan tidak ada endpoint restore untuk Shop Items.`,
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `delete-${item.id}`;

    try {
      setProcessingId(actionKey);
      setError(null);
      setSuccessMessage(null);

      await deleteShopItem(item.id);
      setSuccessMessage(`"${item.name}" berhasil dihapus.`);
      await loadItems();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus item toko.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <UserLayout
      title="Item Shop Management"
      subtitle="Kelola subscription dan paket Token Mentor"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Item Shop Management
            </h1>
            <p className="text-sm text-gray-500">
              Kelola subscription premium dan paket Token Mentor yang tersedia di Ally Shop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCreateForm("token_package")}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700"
            >
              <CreditCard size={16} />
              <span>Create Token Package</span>
            </button>

            <button
              type="button"
              onClick={() => openCreateForm("subscription")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={16} />
              <span>Create Subscription</span>
            </button>
          </div>
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

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Catalog"
            value={`${activeCount} Items`}
            note={`${items.length} total records`}
            icon={<Store size={24} />}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Subscriptions"
            value={`${subscriptionCount} Plans`}
            note="Premium access products"
            icon={<CreditCard size={24} />}
            iconClassName="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            label="Token Packages"
            value={`${tokenPackageCount} Packs`}
            note="Mentor booking tokens"
            icon={<Coins size={24} />}
            iconClassName="bg-amber-50 text-amber-600"
          />

          <StatCard
            label="Total Stock"
            value={totalStock.toLocaleString("id-ID")}
            note="Across all shop items"
            icon={<Package size={24} />}
            iconClassName="bg-emerald-50 text-emerald-600"
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-t-xl border border-b-0 border-gray-100 bg-white p-4 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search shop item..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <span className="text-xs font-medium text-gray-500">
              Item Type:
            </span>
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="token_package">Token Package</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-b-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="p-4">Item</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Benefit</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-gray-400"
                    >
                      Memuat item toko...
                    </td>
                  </tr>
                )}

                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-gray-400"
                    >
                      No shop items found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="text-gray-800 transition hover:bg-gray-50"
                    >
                      <td className="max-w-xs p-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon size={18} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">
                              {item.name}
                            </div>
                            <div className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                              {item.description || "No description"}
                            </div>
                            <span className="text-xs text-gray-400">
                              ID: {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                            item.itemType === "subscription"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {itemTypeLabel(item.itemType)}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(item.priceRupiah)}
                        </div>
                        {item.priceXp > 0 && (
                          <div className="mt-1 text-xs font-medium text-indigo-600">
                            {item.priceXp.toLocaleString("id-ID")} XP
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1 font-semibold text-amber-700">
                          <Coins size={14} />
                          {item.tokenReward} Token
                        </div>
                        {item.itemType === "subscription" && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays size={13} />
                            {item.durationDays ?? 0} days
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-medium text-gray-700">
                        {item.stockQuantity.toLocaleString("id-ID")}
                      </td>

                      <td className="p-4">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="View Shop Item Detail"
                            onClick={() => void openDetail(item)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Edit Shop Item"
                            disabled={processingId === `edit-${item.id}`}
                            onClick={() => void openEditForm(item)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete Shop Item"
                            disabled={processingId === `delete-${item.id}`}
                            onClick={() => void handleDelete(item)}
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
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {formMode === "create"
                    ? "Create Shop Item"
                    : "Edit Shop Item"}
                </h2>
                <p className="text-sm text-gray-500">
                  {form.itemType === "subscription"
                    ? "Premium subscription product"
                    : "Mentor token package"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Item Name" required>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Premium 1 Tahun"
                  />
                </FormField>

                <FormField label="Item Type" required>
                  <select
                    value={form.itemType}
                    onChange={(event) => {
                      const itemType = event.target.value as
                        | "subscription"
                        | "token_package";

                      setForm((current) => ({
                        ...current,
                        itemType,
                        durationDays:
                          itemType === "subscription"
                            ? current.durationDays || "365"
                            : "",
                      }));
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="subscription">Subscription</option>
                    <option value="token_package">Token Package</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Description" required>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi manfaat item..."
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Price (Rupiah)" required>
                  <input
                    type="number"
                    min="0"
                    value={form.priceRupiah}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priceRupiah: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>

                <FormField label="Price (XP)" required>
                  <input
                    type="number"
                    min="0"
                    value={form.priceXp}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priceXp: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>

                <FormField label="Token Reward" required>
                  <input
                    type="number"
                    min="0"
                    value={form.tokenReward}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tokenReward: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>

                <FormField
                  label="Duration (Days)"
                  required={form.itemType === "subscription"}
                >
                  <input
                    type="number"
                    min="0"
                    disabled={form.itemType !== "subscription"}
                    value={form.durationDays}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        durationDays: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder={
                      form.itemType === "subscription" ? "365" : "N/A"
                    }
                  />
                </FormField>

                <FormField label="Stock Quantity" required>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stockQuantity: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>

                <FormField label="Status">
                  <label className="flex h-10 items-center gap-3 rounded-lg border border-gray-200 px-3">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">
                      Active in shop
                    </span>
                  </label>
                </FormField>
              </div>

              <FormField label="Image URL">
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/images/item.png"
                />
              </FormField>

              {form.imageUrl.trim() && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Image Preview
                  </p>
                  <img
                    src={form.imageUrl.trim()}
                    alt="Shop item preview"
                    className="h-40 w-full rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : formMode === "create"
                    ? "Create Item"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Shop Item Detail
                </h2>
                <p className="text-sm text-gray-500">
                  Loaded from GET /api/admin/shop-items/:id
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {detailLoading && (
                <div className="py-12 text-center text-sm text-gray-400">
                  Loading item detail...
                </div>
              )}

              {detailError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {detailError}
                </div>
              )}

              {!detailLoading && detailItem && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-gray-100 text-gray-400">
                      {detailItem.imageUrl ? (
                        <img
                          src={detailItem.imageUrl}
                          alt={detailItem.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={30} />
                      )}
                    </div>

                    <div>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {itemTypeLabel(detailItem.itemType)}
                      </span>
                      <h3 className="mt-3 text-2xl font-bold text-gray-900">
                        {detailItem.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {detailItem.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailField
                      label="Price"
                      value={formatCurrency(detailItem.priceRupiah)}
                    />
                    <DetailField
                      label="XP Price"
                      value={`${detailItem.priceXp.toLocaleString("id-ID")} XP`}
                    />
                    <DetailField
                      label="Token Reward"
                      value={`${detailItem.tokenReward} Token`}
                    />
                    <DetailField
                      label="Duration"
                      value={
                        detailItem.durationDays === null
                          ? "N/A"
                          : `${detailItem.durationDays} days`
                      }
                    />
                    <DetailField
                      label="Stock"
                      value={detailItem.stockQuantity.toLocaleString("id-ID")}
                    />
                    <DetailField
                      label="Status"
                      value={detailItem.isActive ? "Active" : "Inactive"}
                    />
                    <DetailField
                      label="Created"
                      value={formatDate(detailItem.createdAt)}
                    />
                    <DetailField
                      label="Last Updated"
                      value={formatDate(detailItem.updatedAt)}
                    />
                  </div>

                  {detailItem.imageUrl && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Image URL
                      </p>
                      <a
                        href={detailItem.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-sm font-medium text-blue-600 hover:underline"
                      >
                        {detailItem.imageUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <h3 className="mt-1 text-2xl font-bold text-gray-800">{value}</h3>
        <span className="text-xs font-medium text-gray-500">{note}</span>
      </div>
      <div className={`rounded-lg p-3 ${iconClassName}`}>{icon}</div>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-gray-800">{value}</p>
    </div>
  );
}