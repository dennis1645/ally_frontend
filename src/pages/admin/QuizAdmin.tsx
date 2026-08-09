import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  FileQuestion,
  FileSpreadsheet,
  Headphones,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  clearAllPracticeExams,
  deletePracticeExam,
  deletePracticeQuestion,
  getPracticeExam,
  getPracticeExams,
  importPracticeExamsCsv,
  updatePracticeQuestion,
  type PracticeExam,
  type PracticeExamQuestion,
  type UpdatePracticeQuestionPayload,
} from "../../api/adminApi";

import UserLayout from "../../components/layout/UserLayout";
import { adminSidebarItems } from "./adminSidebarItems";

type QuestionFormState = {
  section: string;
  audioUrl: string;
  questionText: string;
  questionType: string;
  scoreWeight: number;
};

const EMPTY_QUESTION_FORM: QuestionFormState = {
  section: "",
  audioUrl: "",
  questionText: "",
  questionType: "multiple_choice",
  scoreWeight: 1,
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function formatLabel(value: string): string {
  if (!value.trim()) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatScore(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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
        <span className="text-xs text-gray-500">{note}</span>
      </div>
      <div className={`rounded-lg p-3 ${iconClassName}`}>{icon}</div>
    </div>
  );
}

export default function QuizAdmin() {
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [examDetails, setExamDetails] = useState<
    Record<string, PracticeExam>
  >({});

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<
    string | number | null
  >(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [expandedExamId, setExpandedExamId] = useState<
    string | number | null
  >(null);

  const [editingQuestion, setEditingQuestion] = useState<
    PracticeExamQuestion | null
  >(null);
  const [editingExamId, setEditingExamId] = useState<
    string | number | null
  >(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(
    EMPTY_QUESTION_FORM,
  );
  const [questionSaving, setQuestionSaving] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadExams(
    mode: "initial" | "refresh" | "silent" = "initial",
  ) {
    try {
      if (mode === "initial") {
        setLoading(true);
      }

      if (mode === "refresh") {
        setRefreshing(true);
      }

      setError(null);

      const data = await getPracticeExams();
      setExams(data);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to load practice exams.",
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
    void loadExams("initial");
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        exams
          .map((exam) => exam.category.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [exams]);

  const filteredExams = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !normalizedSearch ||
        exam.title.toLowerCase().includes(normalizedSearch) ||
        exam.category.toLowerCase().includes(normalizedSearch) ||
        String(exam.id).toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        filterCategory === "all" || exam.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [exams, filterCategory, searchQuery]);

  const totals = useMemo(() => {
    const totalQuestions = exams.reduce(
      (sum, exam) => sum + exam.totalQuestions,
      0,
    );

    const totalAttempts = exams.reduce(
      (sum, exam) => sum + exam.totalAttempts,
      0,
    );

    const scoredExams = exams.filter((exam) => exam.avgScore > 0);
    const averageScore =
      scoredExams.length > 0
        ? scoredExams.reduce((sum, exam) => sum + exam.avgScore, 0) /
          scoredExams.length
        : 0;

    return {
      totalQuestions,
      totalAttempts,
      averageScore,
    };
  }, [exams]);

  function getDisplayedExam(exam: PracticeExam): PracticeExam {
    return examDetails[String(exam.id)] ?? exam;
  }

  async function openExamDetail(exam: PracticeExam) {
    if (String(expandedExamId) === String(exam.id)) {
      setExpandedExamId(null);
      return;
    }

    setExpandedExamId(exam.id);

    if (examDetails[String(exam.id)]) {
      return;
    }

    try {
      setDetailLoadingId(exam.id);
      setError(null);

      const detail = await getPracticeExam(exam.id);

      setExamDetails((current) => ({
        ...current,
        [String(exam.id)]: detail,
      }));
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          `Failed to load practice exam #${String(exam.id)}.`,
        ),
      );
    } finally {
      setDetailLoadingId(null);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const looksLikeCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel";

    if (!looksLikeCsv) {
      setError("Please select a .csv file for the practice exam import.");
      event.target.value = "";
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      await importPracticeExamsCsv(file);

      setSuccess(`"${file.name}" was imported successfully.`);
      setExamDetails({});
      setExpandedExamId(null);
      await loadExams("silent");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to import the practice exam CSV.",
        ),
      );
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  }

  async function handleDeleteExam(exam: PracticeExam) {
    const confirmed = window.confirm(
      `Delete "${exam.title}"?\n\nThis deletes the practice exam together with its contents.`,
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `exam-${String(exam.id)}`;

    try {
      setProcessingId(actionKey);
      setError(null);
      setSuccess(null);

      await deletePracticeExam(exam.id);

      setExams((current) =>
        current.filter((item) => String(item.id) !== String(exam.id)),
      );

      setExamDetails((current) => {
        const next = { ...current };
        delete next[String(exam.id)];
        return next;
      });

      if (String(expandedExamId) === String(exam.id)) {
        setExpandedExamId(null);
      }

      setSuccess(`"${exam.title}" was deleted successfully.`);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to delete the practice exam.",
        ),
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleClearAll() {
    const confirmed = window.confirm(
      `Clear all practice exams and their question banks?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);
      setError(null);
      setSuccess(null);

      await clearAllPracticeExams();

      setExams([]);
      setExamDetails({});
      setExpandedExamId(null);
      setSuccess("All practice exams were cleared successfully.");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to clear all practice exams.",
        ),
      );
    } finally {
      setClearing(false);
    }
  }

  function openQuestionEditor(
    examId: string | number,
    question: PracticeExamQuestion,
  ) {
    setEditingExamId(examId);
    setEditingQuestion(question);
    setQuestionError(null);
    setQuestionForm({
      section: question.section,
      audioUrl: question.audioUrl ?? "",
      questionText: question.questionText,
      questionType: question.questionType,
      scoreWeight: question.scoreWeight,
    });
  }

  function closeQuestionEditor() {
    if (questionSaving) {
      return;
    }

    setEditingQuestion(null);
    setEditingExamId(null);
    setQuestionError(null);
    setQuestionForm(EMPTY_QUESTION_FORM);
  }

  async function refreshExamDetail(examId: string | number) {
    const detail = await getPracticeExam(examId);

    setExamDetails((current) => ({
      ...current,
      [String(examId)]: detail,
    }));

    setExams((current) =>
      current.map((exam) =>
        String(exam.id) === String(examId)
          ? {
              ...exam,
              totalQuestions: detail.totalQuestions,
              totalAttempts: detail.totalAttempts,
              avgScore: detail.avgScore,
              category: detail.category,
              durationMinutes: detail.durationMinutes,
              title: detail.title,
              updatedAt: detail.updatedAt,
            }
          : exam,
      ),
    );
  }

  async function handleQuestionSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingQuestion || editingExamId === null) {
      return;
    }

    if (!questionForm.questionText.trim()) {
      setQuestionError("Question text is required.");
      return;
    }

    if (!questionForm.questionType.trim()) {
      setQuestionError("Question type is required.");
      return;
    }

    if (!Number.isFinite(Number(questionForm.scoreWeight))) {
      setQuestionError("Score weight must be a valid number.");
      return;
    }

    const payload: UpdatePracticeQuestionPayload = {
      section: questionForm.section.trim(),
      audio_url: questionForm.audioUrl.trim() || null,
      question_text: questionForm.questionText.trim(),
      question_type: questionForm.questionType.trim(),
      score_weight: Number(questionForm.scoreWeight),
    };

    try {
      setQuestionSaving(true);
      setQuestionError(null);
      setError(null);
      setSuccess(null);

      await updatePracticeQuestion(editingQuestion.id, payload);
      await refreshExamDetail(editingExamId);

      setSuccess(`Question #${String(editingQuestion.id)} was updated.`);
      closeQuestionEditor();
    } catch (requestError) {
      setQuestionError(
        getErrorMessage(
          requestError,
          "Failed to update the practice question.",
        ),
      );
    } finally {
      setQuestionSaving(false);
    }
  }

  async function handleDeleteQuestion(
    examId: string | number,
    question: PracticeExamQuestion,
  ) {
    const confirmed = window.confirm(
      `Delete question #${String(question.id)}?\n\n${question.questionText}`,
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `question-${String(question.id)}`;

    try {
      setProcessingId(actionKey);
      setError(null);
      setSuccess(null);

      await deletePracticeQuestion(question.id);
      await refreshExamDetail(examId);

      setSuccess(`Question #${String(question.id)} was deleted.`);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to delete the practice question.",
        ),
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <UserLayout
      title="Practice Exam & Quiz Management"
      subtitle="Kelola practice exam, bank soal, dan exercise"
      sidebarItems={adminSidebarItems}
      topbarProps={{ showSearch: false }}
    >
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Practice Exam & Quiz Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Import practice exams from CSV, review exam contents, and manage
              individual practice questions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadExams("refresh")}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
              disabled={clearing}
              className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clearing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <AlertTriangle size={16} />
              )}
              Clear All
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleImport(event)}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
              Import CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Practice Exams"
            value={formatNumber(exams.length)}
            note="Records returned by the exam API"
            icon={<BookOpen size={24} />}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Question Bank"
            value={formatNumber(totals.totalQuestions)}
            note="Questions across loaded exams"
            icon={<FileQuestion size={24} />}
            iconClassName="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            label="Test Attempts"
            value={formatNumber(totals.totalAttempts)}
            note="Attempts reported by exam records"
            icon={<BarChart3 size={24} />}
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            label="Average Score"
            value={`${formatScore(totals.averageScore)}%`}
            note="Average from exams with score data"
            icon={<Headphones size={24} />}
            iconClassName="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="rounded-t-xl border border-b-0 border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search exam title, category, or ID..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">
                Category:
              </span>
              <select
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-b-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="w-10 p-4" />
                  <th className="p-4">Exam</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Questions</th>
                  <th className="p-4">Attempts / Avg</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Loading practice exams...
                      </div>
                    </td>
                  </tr>
                ) : filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <UploadCloud
                        size={34}
                        className="mx-auto text-gray-300"
                      />
                      <p className="mt-3 font-semibold text-gray-700">
                        No practice exams found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {exams.length === 0
                          ? "The API currently returned an empty exam list. Import a CSV to add practice content."
                          : "No records match your current search or category filter."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => {
                    const isExpanded =
                      String(expandedExamId) === String(exam.id);
                    const displayedExam = getDisplayedExam(exam);
                    const detailLoading =
                      String(detailLoadingId) === String(exam.id);
                    const deletingExam =
                      processingId === `exam-${String(exam.id)}`;

                    return (
                      <Fragment key={exam.id}>
                        <tr className="text-gray-800 transition hover:bg-gray-50">
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => void openExamDetail(exam)}
                              className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                              aria-label={`Toggle ${exam.title}`}
                            >
                              {detailLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : isExpanded ? (
                                <ChevronDown size={18} />
                              ) : (
                                <ChevronRight size={18} />
                              )}
                            </button>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-gray-900">
                              {displayedExam.title}
                            </div>
                            <span className="text-xs text-gray-400">
                              Exam ID: {String(displayedExam.id)}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {formatLabel(displayedExam.category)}
                            </span>
                          </td>

                          <td className="p-4 text-gray-600">
                            {displayedExam.durationMinutes > 0
                              ? `${displayedExam.durationMinutes} min`
                              : "—"}
                          </td>

                          <td className="p-4 font-medium text-gray-700">
                            {formatNumber(displayedExam.totalQuestions)}
                          </td>

                          <td className="p-4">
                            <div className="text-xs font-medium text-gray-800">
                              {formatNumber(displayedExam.totalAttempts)} attempts
                            </div>
                            <div className="mt-0.5 text-xs font-semibold text-emerald-600">
                              Avg: {formatScore(displayedExam.avgScore)}%
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => void openExamDetail(exam)}
                                title="Get exam detail"
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => void handleDeleteExam(exam)}
                                disabled={deletingExam}
                                title="Delete exam and its contents"
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingExam ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-gray-50/70">
                            <td colSpan={7} className="border-b border-gray-100 p-4 pl-12">
                              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-800">
                                      Questions in “{displayedExam.title}”
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      Loaded from GET /api/admin/practice-exams/{String(exam.id)}
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium text-gray-500">
                                    {displayedExam.questions.length} loaded question(s)
                                  </span>
                                </div>

                                {detailLoading ? (
                                  <div className="flex items-center gap-2 py-5 text-sm text-gray-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    Loading exam detail...
                                  </div>
                                ) : displayedExam.questions.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-left text-xs">
                                      <thead>
                                        <tr className="border-b border-gray-100 uppercase text-gray-400">
                                          <th className="py-2 pr-3">ID</th>
                                          <th className="py-2 pr-3">Section</th>
                                          <th className="py-2 pr-3">Question</th>
                                          <th className="py-2 pr-3">Type</th>
                                          <th className="py-2 pr-3">Weight</th>
                                          <th className="py-2 text-center">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {displayedExam.questions.map((question) => {
                                          const deletingQuestion =
                                            processingId ===
                                            `question-${String(question.id)}`;

                                          return (
                                            <tr
                                              key={question.id}
                                              className="hover:bg-gray-50"
                                            >
                                              <td className="py-3 pr-3 font-mono text-gray-400">
                                                {String(question.id)}
                                              </td>
                                              <td className="py-3 pr-3 text-gray-600">
                                                {formatLabel(question.section)}
                                              </td>
                                              <td className="max-w-xl py-3 pr-3 font-medium text-gray-800">
                                                <div>{question.questionText || "—"}</div>
                                                {question.audioUrl && (
                                                  <a
                                                    href={question.audioUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                                                  >
                                                    <Headphones size={11} />
                                                    Audio URL
                                                  </a>
                                                )}
                                              </td>
                                              <td className="py-3 pr-3 text-gray-500">
                                                {formatLabel(question.questionType)}
                                              </td>
                                              <td className="py-3 pr-3 font-semibold text-indigo-600">
                                                {formatScore(question.scoreWeight)}
                                              </td>
                                              <td className="py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      openQuestionEditor(
                                                        exam.id,
                                                        question,
                                                      )
                                                    }
                                                    title="Update question"
                                                    className="rounded p-1.5 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
                                                  >
                                                    <Edit3 size={14} />
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      void handleDeleteQuestion(
                                                        exam.id,
                                                        question,
                                                      )
                                                    }
                                                    disabled={deletingQuestion}
                                                    title="Delete question"
                                                    className="rounded p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                  >
                                                    {deletingQuestion ? (
                                                      <Loader2
                                                        size={14}
                                                        className="animate-spin"
                                                      />
                                                    ) : (
                                                      <Trash2 size={14} />
                                                    )}
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                                    No questions were returned in this exam detail.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Practice Question
                </h2>
                <p className="text-xs text-gray-500">
                  Question ID: {String(editingQuestion.id)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeQuestionEditor}
                disabled={questionSaving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuestionSave} className="p-6">
              {questionError && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {questionError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Section
                  </span>
                  <input
                    type="text"
                    value={questionForm.section}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        section: event.target.value,
                      }))
                    }
                    placeholder="listening"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Question Type
                  </span>
                  <input
                    type="text"
                    value={questionForm.questionType}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        questionType: event.target.value,
                      }))
                    }
                    placeholder="multiple_choice"
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Audio URL
                  </span>
                  <input
                    type="url"
                    value={questionForm.audioUrl}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        audioUrl: event.target.value,
                      }))
                    }
                    placeholder="https://example.com/audio/question.mp3"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Question Text
                  </span>
                  <textarea
                    value={questionForm.questionText}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        questionText: event.target.value,
                      }))
                    }
                    required
                    rows={4}
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Score Weight
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={questionForm.scoreWeight}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        scoreWeight: Number(event.target.value),
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeQuestionEditor}
                  disabled={questionSaving}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={questionSaving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {questionSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
}