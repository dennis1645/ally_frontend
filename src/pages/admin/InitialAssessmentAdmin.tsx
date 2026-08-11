import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit,
  FileSpreadsheet,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  clearAllDiagnosticQuestions,
  createDiagnosticQuestion,
  deleteDiagnosticQuestion,
  getDiagnosticQuestions,
  importDiagnosticQuestionsCsv,
  updateDiagnosticQuestion,
  type DiagnosticOptionPayload,
  type DiagnosticQuestion,
  type DiagnosticQuestionPayload,
} from "../../api/adminApi";
import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

type FormOption = {
  optionText: string;
  scoreWeight: number;
  weaknessTag: string;
  strengthTag: string;
};

type QuestionFormState = {
  questionText: string;
  category: string;
  orderNumber: number;
  options: FormOption[];
};

function createEmptyOption(): FormOption {
  return {
    optionText: "",
    scoreWeight: 0,
    weaknessTag: "",
    strengthTag: "",
  };
}

function formatCategory(category: string): string {
  if (!category) {
    return "Uncategorized";
  }

  return category
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function makePayload(
  form: QuestionFormState,
): DiagnosticQuestionPayload {
  const options: DiagnosticOptionPayload[] =
    form.options.map((option) => ({
      option_text: option.optionText.trim(),
      score_weight: Number(option.scoreWeight),
      weakness_tag:
        option.weaknessTag.trim() || null,
      strength_tag:
        option.strengthTag.trim() || null,
    }));

  return {
    question_text: form.questionText.trim(),
    category: form.category.trim().toLowerCase(),
    order_number: Number(form.orderNumber),
    options,
  };
}

export default function InitialAssessmentAdmin() {
  const [questions, setQuestions] = useState<
    DiagnosticQuestion[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<
    string | number | null
  >(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<
    string | null
  >(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<DiagnosticQuestion | null>(null);
  const [form, setForm] = useState<QuestionFormState>({
    questionText: "",
    category: "academic",
    orderNumber: 1,
    options: [createEmptyOption()],
  });

  const importFileInputRef = useRef<HTMLInputElement>(null);

  async function loadQuestions(
    mode: "initial" | "refresh" | "silent" = "initial",
  ) {
    if (mode === "initial") {
      setLoading(true);
    }

    if (mode === "refresh") {
      setRefreshing(true);
    }

    try {
      setError(null);
      const data = await getDiagnosticQuestions();
      setQuestions(data);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to load diagnostic questions.",
        ),
      );
    } finally {
      if (mode === "initial") {
        setLoading(false);
      }

      if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void loadQuestions("initial");
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        questions
          .map((question) => question.category)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const totalOptions = useMemo(
    () =>
      questions.reduce(
        (total, question) =>
          total + question.options.length,
        0,
      ),
    [questions],
  );

  const activeQuestions = useMemo(
    () =>
      questions.filter((question) => question.isActive)
        .length,
    [questions],
  );

  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase();

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = question.questionText
        .toLowerCase()
        .includes(normalizedSearch);

      const matchesCategory =
        filterCategory === "all" ||
        question.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [
    questions,
    normalizedSearch,
    filterCategory,
  ]);

  function openCreateModal() {
    const nextOrder =
      questions.length > 0
        ? Math.max(
            ...questions.map(
              (question) => question.orderNumber,
            ),
          ) + 1
        : 1;

    setEditingQuestion(null);
    setForm({
      questionText: "",
      category: categories[0] ?? "academic",
      orderNumber: nextOrder,
      options: [createEmptyOption()],
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(question: DiagnosticQuestion) {
    setEditingQuestion(question);
    setForm({
      questionText: question.questionText,
      category: question.category,
      orderNumber: question.orderNumber,
      options:
        question.options.length > 0
          ? question.options.map((option) => ({
              optionText: option.optionText,
              scoreWeight: option.scoreWeight,
              weaknessTag: option.weaknessTag ?? "",
              strengthTag: option.strengthTag ?? "",
            }))
          : [createEmptyOption()],
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingQuestion(null);
    setFormError(null);
  }

  function updateFormOption(
    index: number,
    patch: Partial<FormOption>,
  ) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, ...patch }
          : option,
      ),
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [
        ...current.options,
        createEmptyOption(),
      ],
    }));
  }

  function removeOption(index: number) {
    setForm((current) => {
      if (current.options.length <= 1) {
        return current;
      }

      return {
        ...current,
        options: current.options.filter(
          (_, optionIndex) => optionIndex !== index,
        ),
      };
    });
  }

  async function handleSubmit() {
    setFormError(null);
    setSuccess(null);

    if (!form.questionText.trim()) {
      setFormError("Question text is required.");
      return;
    }

    if (!form.category.trim()) {
      setFormError("Category is required.");
      return;
    }

    if (
      !Number.isFinite(Number(form.orderNumber)) ||
      Number(form.orderNumber) < 1
    ) {
      setFormError(
        "Order number must be at least 1.",
      );
      return;
    }

    if (form.options.length === 0) {
      setFormError(
        "Add at least one answer option.",
      );
      return;
    }

    const invalidOption = form.options.find(
      (option) =>
        !option.optionText.trim() ||
        !Number.isFinite(Number(option.scoreWeight)),
    );

    if (invalidOption) {
      setFormError(
        "Every option needs text and a valid score weight.",
      );
      return;
    }

    try {
      setSaving(true);
      const payload = makePayload(form);

      if (editingQuestion) {
        await updateDiagnosticQuestion(
          editingQuestion.id,
          payload,
        );
        setSuccess("Question updated successfully.");
      } else {
        await createDiagnosticQuestion(payload);
        setSuccess("Question created successfully.");
      }

      setModalOpen(false);
      setEditingQuestion(null);
      await loadQuestions("silent");
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          editingQuestion
            ? "Failed to update the question."
            : "Failed to create the question.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    question: DiagnosticQuestion,
  ) {
    const confirmed = window.confirm(
      `Delete question #${question.id}?\n\n${question.questionText}`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(question.id);
      setError(null);
      setSuccess(null);

      await deleteDiagnosticQuestion(question.id);
      setSuccess("Question deleted successfully.");
      await loadQuestions("silent");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to delete the question.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleImportCsv(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel";

    if (!isCsv) {
      setError(
        "Please select a .csv file for the diagnostic question import.",
      );
      event.target.value = "";
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      await importDiagnosticQuestionsCsv(file);
      setSuccess(
        `"${file.name}" was imported successfully.`,
      );
      await loadQuestions("silent");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to import diagnostic questions from CSV.",
        ),
      );
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  }

  async function handleClearAll() {
    if (questions.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Clear all ${questions.length} diagnostic questions?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);
      setError(null);
      setSuccess(null);

      await clearAllDiagnosticQuestions();
      setQuestions([]);
      setSuccess(
        "All diagnostic questions were cleared successfully.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to clear diagnostic questions.",
        ),
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <UserLayout
      title="Initial Assessment Management"
      subtitle="Manage diagnostic questions and mentee readiness"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Initial Assessment Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage the questions and scoring options used in
              the mentee initial diagnostic assessment.
            </p>
          </div>

          <div className="flex w-full flex-nowrap items-center gap-3 overflow-x-auto pb-1 lg:w-auto lg:justify-end">
            <button
              type="button"
              onClick={() => void loadQuestions("refresh")}
              disabled={refreshing || loading}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={() => void handleClearAll()}
              disabled={
                clearing ||
                loading ||
                questions.length === 0
              }
              title="Delete all diagnostic questions"
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-rose-200 px-3.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <AlertTriangle size={16} />
              )}
              Clear All Questions
            </button>

            <input
              ref={importFileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleImportCsv(event)}
            />

            <button
              type="button"
              onClick={() => importFileInputRef.current?.click()}
              disabled={importing}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
              Import CSV
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Create Question
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <span>{error}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError(null)}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <span>{success}</span>
            <button
              type="button"
              aria-label="Dismiss success message"
              onClick={() => setSuccess(null)}
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Questions
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {questions.length}
              </h3>
              <span className="text-xs font-medium text-blue-600">
                Diagnostic question bank
              </span>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <HelpCircle size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Active Questions
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {activeQuestions}
              </h3>
              <span className="text-xs text-gray-500">
                is_active = 1
              </span>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Categories
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {categories.length}
              </h3>
              <span className="text-xs text-gray-500">
                Derived from API data
              </span>
            </div>
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <Layers size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Answer Options
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-800">
                {totalOptions}
              </h3>
              <span className="text-xs text-gray-500">
                Across all questions
              </span>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Layers size={24} />
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
              placeholder="Search diagnostic questions..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <span className="text-xs font-medium text-gray-500">
              Category:
            </span>
            <select
              value={filterCategory}
              onChange={(event) =>
                setFilterCategory(event.target.value)
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
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
                  <th className="p-4">Order</th>
                  <th className="p-4">Question ID &amp; Text</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Max Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Updated At</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-10 text-center text-sm text-gray-400"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Loading diagnostic questions...
                      </span>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredQuestions.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-10 text-center text-sm text-gray-400"
                      >
                        {questions.length === 0
                          ? "No diagnostic questions found."
                          : "No questions match the current search and filter."}
                      </td>
                    </tr>
                  )}

                {!loading &&
                  filteredQuestions.map((question) => (
                    <tr
                      key={question.id}
                      className="text-gray-800 transition hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold text-gray-500">
                        {question.orderNumber}
                      </td>

                      <td className="max-w-md p-4">
                        <span className="mb-0.5 block text-xs font-semibold text-gray-400">
                          #{question.id}
                        </span>
                        <div className="font-medium text-gray-900">
                          {question.questionText}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {formatCategory(question.category)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          {question.questionType} ({question.optionsCount} options)
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-indigo-600">
                        {question.weightScore} pts
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            question.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {question.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap p-4 text-xs text-gray-500">
                        {formatDate(question.updatedAt)}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Edit question"
                            onClick={() =>
                              openEditModal(question)
                            }
                            disabled={deletingId !== null}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete question"
                            onClick={() =>
                              void handleDelete(question)
                            }
                            disabled={deletingId !== null}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === question.id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
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

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="diagnostic-question-modal-title"
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <h2
                  id="diagnostic-question-modal-title"
                  className="text-xl font-bold text-gray-900"
                >
                  {editingQuestion
                    ? `Edit Question #${editingQuestion.id}`
                    : "Create Diagnostic Question"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  The form maps directly to the admin diagnostic-question API payload.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Question Text
                </label>
                <textarea
                  value={form.questionText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      questionText: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Enter the diagnostic question..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    placeholder="academic, language, scholarship..."
                    list="diagnostic-category-options"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <datalist id="diagnostic-category-options">
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      />
                    ))}
                  </datalist>
                  <p className="mt-1 text-xs text-gray-400">
                    Sent to the API in lowercase.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Order Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.orderNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        orderNumber: Number(
                          event.target.value,
                        ),
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Answer Options
                    </h3>
                    <p className="text-xs text-gray-500">
                      score_weight affects readiness scoring. Weakness and strength tags can be left empty.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    <Plus size={15} />
                    Add Option
                  </button>
                </div>

                <div className="space-y-4">
                  {form.options.map((option, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 bg-gray-50/60 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-gray-700">
                          Option {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          disabled={form.options.length <= 1}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Remove option ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_140px]">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Option Text
                          </label>
                          <input
                            type="text"
                            value={option.optionText}
                            onChange={(event) =>
                              updateFormOption(index, {
                                optionText:
                                  event.target.value,
                              })
                            }
                            placeholder="Answer option"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Score Weight
                          </label>
                          <input
                            type="number"
                            value={option.scoreWeight}
                            onChange={(event) =>
                              updateFormOption(index, {
                                scoreWeight: Number(
                                  event.target.value,
                                ),
                              })
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Weakness Tag
                          </label>
                          <input
                            type="text"
                            value={option.weaknessTag}
                            onChange={(event) =>
                              updateFormOption(index, {
                                weaknessTag:
                                  event.target.value,
                              })
                            }
                            placeholder="e.g. low_gpa"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Strength Tag
                          </label>
                          <input
                            type="text"
                            value={option.strengthTag}
                            onChange={(event) =>
                              updateFormOption(index, {
                                strengthTag:
                                  event.target.value,
                              })
                            }
                            placeholder="e.g. excellent_gpa"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}
                {editingQuestion
                  ? "Save Changes"
                  : "Create Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}