import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  Layers,
  Sliders,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { mentorSidebarItems } from "../../components/layout/MentorSidebar";
import UserLayout from "../../components/layout/UserLayout";
import {
  getMentorAvailabilitiesApi,
  createMentorAvailabilitiesApi,
  type MentorAvailabilitySlot,
} from "../../api/mentorApi";

// Preset slot waktu umum untuk kemudahan mentor
const DEFAULT_PRESET_SLOTS = [
  { start: "08:00", end: "09:00", label: "08:00 - 09:00 WIB" },
  { start: "09:00", end: "10:00", label: "09:00 - 10:00 WIB" },
  { start: "10:00", end: "11:00", label: "10:00 - 11:00 WIB" },
  { start: "11:00", end: "12:00", label: "11:00 - 12:00 WIB" },
  { start: "13:00", end: "14:00", label: "13:00 - 14:00 WIB" },
  { start: "14:00", end: "15:00", label: "14:00 - 15:00 WIB" },
  { start: "15:30", end: "16:30", label: "15:30 - 16:30 WIB" },
  { start: "19:00", end: "20:00", label: "19:00 - 20:00 WIB" },
];

export function MentorAvailabilityPage() {
  const [slots, setSlots] = useState<MentorAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([
    new Date().toISOString().split("T")[0],
  ]);

  // Mode Pengaturan Jam: "uniform" (sama semua) vs "custom" (beda per tanggal)
  const [timeMode, setTimeMode] = useState<"uniform" | "custom">("uniform");

  // State untuk Mode Uniform (Jam sama untuk seluruh tanggal yang dipilih)
  const [uniformTimeSlots, setUniformTimeSlots] = useState<
    { start_time: string; end_time: string }[]
  >([{ start_time: "14:00", end_time: "15:00" }]);

  // State untuk Mode Custom (Jam berbeda per tanggal)
  const [customTimeSlots, setCustomTimeSlots] = useState<
    Record<string, { start_time: string; end_time: string }[]>
  >({});

  // Input Custom Slot Tambahan
  const [customStart, setCustomStart] = useState("09:00");
  const [customEnd, setCustomEnd] = useState("10:00");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter Tanggal di Daftar Ketersediaan Samping
  const [filterDate, setFilterDate] = useState<string>("all");

  async function fetchSlots() {
    setLoading(true);
    setError(null);
    try {
      const response = await getMentorAvailabilitiesApi();
      if (response?.data) {
        setSlots(response.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load availability slots", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat ketersediaan slot dari server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSlots();
  }, []);

  // --- LOGIKA HELPER KALENDER ---
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  function handlePrevMonth() {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  }

  function toggleDateSelection(dateStr: string) {
    if (selectedDates.includes(dateStr)) {
      if (selectedDates.length > 1) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      }
    } else {
      setSelectedDates([...selectedDates, dateStr]);

      // Inisialisasi slot custom jika di mode custom
      if (!customTimeSlots[dateStr]) {
        setCustomTimeSlots((prev) => ({
          ...prev,
          [dateStr]: [{ start_time: "14:00", end_time: "15:00" }],
        }));
      }
    }
  }

  function handlePresetToggle(start: string, end: string, dateStr?: string) {
    if (timeMode === "uniform") {
      const exists = uniformTimeSlots.some(
        (s) => s.start_time === start && s.end_time === end
      );
      if (exists) {
        setUniformTimeSlots(
          uniformTimeSlots.filter(
            (s) => !(s.start_time === start && s.end_time === end)
          )
        );
      } else {
        setUniformTimeSlots([
          ...uniformTimeSlots,
          { start_time: start, end_time: end },
        ]);
      }
    } else if (dateStr) {
      const currentList = customTimeSlots[dateStr] || [];
      const exists = currentList.some(
        (s) => s.start_time === start && s.end_time === end
      );
      const updated = exists
        ? currentList.filter(
            (s) => !(s.start_time === start && s.end_time === end)
          )
        : [...currentList, { start_time: start, end_time: end }];

      setCustomTimeSlots({
        ...customTimeSlots,
        [dateStr]: updated,
      });
    }
  }

  function addCustomTimeRange(dateStr?: string) {
    if (!customStart || !customEnd) return;
    if (customStart >= customEnd) {
      setError("Jam mulai harus lebih awal dari jam selesai.");
      return;
    }

    if (timeMode === "uniform") {
      const exists = uniformTimeSlots.some(
        (s) => s.start_time === customStart && s.end_time === customEnd
      );
      if (!exists) {
        setUniformTimeSlots([
          ...uniformTimeSlots,
          { start_time: customStart, end_time: customEnd },
        ]);
      }
    } else if (dateStr) {
      const currentList = customTimeSlots[dateStr] || [];
      const exists = currentList.some(
        (s) => s.start_time === customStart && s.end_time === customEnd
      );
      if (!exists) {
        setCustomTimeSlots({
          ...customTimeSlots,
          [dateStr]: [
            ...currentList,
            { start_time: customStart, end_time: customEnd },
          ],
        });
      }
    }
  }

  async function handleSaveAvailabilities() {
    if (selectedDates.length === 0) {
      setError("Silakan pilih minimal satu tanggal di kalender.");
      return;
    }

    const payloadList: {
      available_date: string;
      start_time: string;
      end_time: string;
    }[] = [];

    if (timeMode === "uniform") {
      if (uniformTimeSlots.length === 0) {
        setError("Silakan atur atau pilih minimal satu slot jam.");
        return;
      }
      for (const d of selectedDates) {
        for (const t of uniformTimeSlots) {
          payloadList.push({
            available_date: d,
            start_time: t.start_time,
            end_time: t.end_time,
          });
        }
      }
    } else {
      for (const d of selectedDates) {
        const slotsForDate = customTimeSlots[d] || [];
        for (const t of slotsForDate) {
          payloadList.push({
            available_date: d,
            start_time: t.start_time,
            end_time: t.end_time,
          });
        }
      }

      if (payloadList.length === 0) {
        setError("Silakan pilih minimal satu slot jam pada tanggal yang dipilih.");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await createMentorAvailabilitiesApi(payloadList);
      setSuccessMsg(
        res.message || `${payloadList.length} slot ketersediaan berhasil disimpan!`
      );
      fetchSlots();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan slot ketersediaan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Menghitung jumlah slot yang sudah ada per tanggal
  const existingSlotCounts = slots.reduce((acc, slot) => {
    acc[slot.available_date] = (acc[slot.available_date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredSlots =
    filterDate === "all"
      ? slots
      : slots.filter((s) => s.available_date === filterDate);

  return (
    <UserLayout
      title="Availability Management"
      subtitle="Atur Jadwal & Slot Waktu Luang Konsultasi Mentor"
      sidebarItems={mentorSidebarItems}
    >
      <section className="min-h-[calc(100vh-80px)] bg-ally-background p-6 lg:p-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3 shadow-xs">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-3 shadow-xs">
            <CheckCircle size={20} />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.3fr_1fr]">
          {/* ==============================================================
              KIRI: KALENDER INTERAKTIF & PENGATURAN JAM
          ============================================================== */}
          <div className="space-y-6">
            {/* KALENDER BULANAN INTERAKTIF */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-ally-surface text-ally-primary">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      1. Pilih Tanggal di Kalender
                    </h3>
                    <p className="text-xs text-slate-500">
                      Klik tanggal untuk memilih/membatalkan. Bisa memilih beberapa tanggal sekaligus.
                    </p>
                  </div>
                </div>

                {/* Navigasi Bulan */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-bold text-slate-800 min-w-[120px] text-center">
                    {monthNames[month]} {year}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Grid Hari Kalender */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <div>Min</div>
                <div>Sen</div>
                <div>Sel</div>
                <div>Rab</div>
                <div>Kam</div>
                <div>Jum</div>
                <div>Sab</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for starting day offset */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-12 rounded-2xl bg-slate-50/40" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                    dayNum
                  ).padStart(2, "0")}`;

                  const isSelected = selectedDates.includes(dateStr);
                  const activeCount = existingSlotCounts[dateStr] || 0;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => toggleDateSelection(dateStr)}
                      className={`relative h-14 rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-ally-primary text-white border-ally-primary shadow-md scale-102"
                          : activeCount > 0
                          ? "bg-emerald-50 text-slate-900 border-emerald-300 hover:border-emerald-400"
                          : "bg-slate-50/70 text-slate-800 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {dayNum}
                      </span>

                      {activeCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-emerald-200 text-emerald-800"
                          }`}
                        >
                          {activeCount} slot
                        </span>
                      )}

                      {isSelected && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {selectedDates.length} Tanggal Dipilih: {selectedDates.join(", ")}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDates([new Date().toISOString().split("T")[0]])}
                  className="text-ally-primary hover:underline font-bold"
                >
                  Reset Tanggal
                </button>
              </div>
            </div>

            {/* PENGATURAN JAM & MENU MODE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      2. Pilih & Atur Jam Ketersediaan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tentukan jam luang konsultasi untuk tanggal yang telah dipilih.
                    </p>
                  </div>
                </div>

                {/* Tab Menu Mode Jam (Sama Semua vs Beda per Tanggal) */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTimeMode("uniform")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      timeMode === "uniform"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Layers size={13} /> Jam Sama Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode("custom")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      timeMode === "custom"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Sliders size={13} /> Beda per Tanggal
                  </button>
                </div>
              </div>

              {/* MODE 1: UNIFORM (Jam Sama Untuk Semua Tanggal) */}
              {timeMode === "uniform" ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Pilihan Slot Waktu Cepat (Preset):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DEFAULT_PRESET_SLOTS.map((preset, idx) => {
                        const isSelected = uniformTimeSlots.some(
                          (s) =>
                            s.start_time === preset.start &&
                            s.end_time === preset.end
                        );

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              handlePresetToggle(preset.start, preset.end)
                            }
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-between ${
                              isSelected
                                ? "bg-emerald-50 text-emerald-800 border-emerald-400 font-extrabold"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <span>{preset.start} - {preset.end}</span>
                            {isSelected && <Check size={14} className="text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Range Jam Kustom Tambahan */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      + Tambah Rentang Jam Kustom:
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="time"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold outline-none"
                      />
                      <span className="text-xs text-slate-500 font-bold">s/d</span>
                      <input
                        type="time"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addCustomTimeRange()}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Tambah Slot
                      </button>
                    </div>
                  </div>

                  {/* Summary Slot Aktif di Mode Uniform */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-500 mb-1">
                      Slot Jam Aktif ({uniformTimeSlots.length} slot per tanggal):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniformTimeSlots.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"
                        >
                          <Clock size={12} />
                          {s.start_time} - {s.end_time}
                          <button
                            type="button"
                            onClick={() =>
                              setUniformTimeSlots(
                                uniformTimeSlots.filter((_, i) => i !== idx)
                              )
                            }
                            className="ml-1 text-emerald-600 hover:text-emerald-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE 2: CUSTOM (Jam Berbeda per Tanggal) */
                <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1">
                  {selectedDates.map((dateStr) => {
                    const currentSlots = customTimeSlots[dateStr] || [];

                    return (
                      <div
                        key={dateStr}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-sm font-bold text-slate-900">
                            🗓️ Tanggal: {dateStr}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {currentSlots.length} Slot Jam
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {DEFAULT_PRESET_SLOTS.map((preset, idx) => {
                            const isSelected = currentSlots.some(
                              (s) =>
                                s.start_time === preset.start &&
                                s.end_time === preset.end
                            );

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  handlePresetToggle(
                                    preset.start,
                                    preset.end,
                                    dateStr
                                  )
                                }
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-between ${
                                  isSelected
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-400"
                                    : "bg-white text-slate-700 border-slate-200"
                                }`}
                              >
                                <span>{preset.start} - {preset.end}</span>
                                {isSelected && (
                                  <Check size={12} className="text-emerald-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TOMBOL UTAMA SIMPAN KETERSEDIAAN */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveAvailabilities}
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-ally-primary py-3 text-sm font-bold text-white transition hover:bg-ally-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {isSubmitting
                    ? "Menyimpan Slot ke Server..."
                    : `Simpan ${
                        timeMode === "uniform"
                          ? selectedDates.length * uniformTimeSlots.length
                          : Object.values(customTimeSlots).flat().length
                      } Slot Ketersediaan`}
                </button>
              </div>
            </div>
          </div>

          {/* ==============================================================
              KANAN: DAFTAR SLOT KETERSEDIAAN AKTIF (SCROLLABLE FEED)
          ============================================================== */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[calc(100vh-140px)] sticky top-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Daftar Slot Ketersediaan Server
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Slot luang aktif di sistem yang dapat di-booking mentee.
                </p>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                {slots.length} Slot Total
              </span>
            </div>

            {/* Filter Tanggal */}
            <div className="mb-4">
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">Semua Tanggal ({slots.length} Slot)</option>
                {Array.from(new Set(slots.map((s) => s.available_date))).map(
                  (d) => (
                    <option key={d} value={d}>
                      Tanggal: {d} (
                      {slots.filter((s) => s.available_date === d).length} slot)
                    </option>
                  )
                )}
              </select>
            </div>

            {/* List Feed Scrollable */}
            <div className="overflow-y-auto flex-1 space-y-3 pr-1 custom-scrollbar">
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-ally-primary" />
                  <span className="ml-3 text-sm font-semibold text-slate-600">
                    Memuat slot ketersediaan...
                  </span>
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Belum ada slot ketersediaan pada filter tanggal ini.
                </div>
              ) : (
                filteredSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                        <CalendarIcon size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {slot.available_date}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {slot.start_time} - {slot.end_time} WIB
                        </p>
                      </div>
                    </div>

                    <div>
                      {slot.is_booked ? (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          Di-booking
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          Tersedia
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </UserLayout>
  );
}

export default MentorAvailabilityPage;