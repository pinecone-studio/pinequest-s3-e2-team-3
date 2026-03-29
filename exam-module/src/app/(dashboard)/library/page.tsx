"use client";

import { useState, useMemo } from "react";
import {
  useGetExamsQuery,
  useCreateExamMutation,
  useGetExamCreateOptionsQuery,
  useTopicsBySubjectQuery,
  GetExamsDocument,
} from "@/gql/graphql";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Search,
  Plus,
  BookOpen,
  FileText,
  Clock,
  MoreVertical,
  Loader2,
} from "lucide-react";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #c3b1e1, #8b9dd4)",
  "linear-gradient(135deg, #a8c0e8, #7b9fd4)",
  "linear-gradient(135deg, #9bb8e0, #6fa3d8)",
  "linear-gradient(135deg, #b8a8d8, #9088c8)",
  "linear-gradient(135deg, #c0b0e0, #9878c8)",
  "linear-gradient(135deg, #a0b8e8, #7898d8)",
  "linear-gradient(135deg, #e8b4b8, #d48b8b)",
  "linear-gradient(135deg, #b8e8c0, #8bd49b)",
] as const;

function gradientForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return CARD_GRADIENTS[Math.abs(h) % CARD_GRADIENTS.length];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [examName, setExamName] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");

  const { data, loading, error } = useGetExamsQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: optionsData } = useGetExamCreateOptionsQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: topicsData } = useTopicsBySubjectQuery({
    variables: { subjectId },
    skip: !subjectId,
  });

  const [createExam, { loading: creating }] = useCreateExamMutation({
    refetchQueries: [{ query: GetExamsDocument }],
  });

  const exams = useMemo(() => {
    const all = data?.exams ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((e) => e.name.toLowerCase().includes(q));
  }, [data?.exams, search]);

  const handleCreate = async () => {
    if (!examName.trim() || !creatorId || !subjectId || !topicId) return;
    await createExam({
      variables: {
        name: examName.trim(),
        creatorId,
        subjectId,
        topicId,
      },
    });
    setExamName("");
    setCreatorId("");
    setSubjectId("");
    setTopicId("");
    setOpen(false);
  };

  const canSubmit =
    examName.trim().length > 0 &&
    creatorId.length > 0 &&
    subjectId.length > 0 &&
    topicId.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Шалгалтын сан</h1>
          <p className="text-sm text-gray-500 mt-1">
            Бүх шалгалтын материалуудын нэгдсэн сан
          </p>
        </div>
        <Button className="gap-2 w-fit" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Шинэ шалгалт
        </Button>
      </div>

      {/* ── New exam sheet ── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Шинэ шалгалт үүсгэх</SheetTitle>
            <SheetDescription>
              Шалгалтын нэрийг оруулна уу. Дараа нь асуулт нэмэх боломжтой.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 py-2 flex-1 overflow-y-auto">
            {/* Exam name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Шалгалтын нэр <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Жишээ: Математик — Улирлын шалгалт"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>

            {/* Creator */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Зохиогч <span className="text-red-500">*</span>
              </label>
              <select
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
              >
                <option value="">Багш сонгох…</option>
                {(optionsData?.staffUsers ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.lastName ? `${u.lastName[0]}. ` : ""}
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Хичээл <span className="text-red-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopicId("");
                }}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
              >
                <option value="">Хичээл сонгох…</option>
                {(optionsData?.subjects ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic (depends on subject) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Сэдэв <span className="text-red-500">*</span>
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {subjectId ? "Сэдэв сонгох…" : "Эхлээд хичээл сонгоно уу"}
                </option>
                {(topicsData?.topics ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.grade}-р анги)
                  </option>
                ))}
              </select>
            </div>

            {/* Preview card */}
            {examName.trim() && (
              <div className="rounded-xl overflow-hidden border shadow-sm">
                <div
                  className="h-24 flex items-end p-3"
                  style={{
                    background: gradientForId(examName),
                  }}
                >
                  <div className="flex items-center justify-center size-8 rounded-lg bg-white/25 backdrop-blur-sm">
                    <FileText className="size-4 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {examName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Урьдчилсан харагдац
                  </p>
                </div>
              </div>
            )}
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Болих
              </Button>
            </SheetClose>
            <Button
              className="flex-1 gap-2"
              disabled={!canSubmit || creating}
              onClick={handleCreate}
            >
              {creating && <Loader2 className="size-4 animate-spin" />}
              Үүсгэх
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm">
          <div className="flex items-center justify-center size-11 rounded-lg bg-violet-100">
            <BookOpen className="size-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : (data?.exams ?? []).length}
            </p>
            <p className="text-xs text-gray-500">Нийт шалгалт</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm">
          <div className="flex items-center justify-center size-11 rounded-lg bg-blue-100">
            <FileText className="size-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : exams.length}
            </p>
            <p className="text-xs text-gray-500">Хайлтын үр дүн</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm">
          <div className="flex items-center justify-center size-11 rounded-lg bg-emerald-100">
            <Clock className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {loading
                ? "—"
                : (data?.exams ?? []).length > 0
                  ? formatDate(
                      data!.exams.reduce((latest, e) =>
                        e.createdAt > latest.createdAt ? e : latest,
                      ).createdAt,
                    )
                  : "—"}
            </p>
            <p className="text-xs text-gray-500">Сүүлд нэмэгдсэн</p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Шалгалтын нэрээр хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <p className="text-sm text-gray-500 whitespace-nowrap">
          {exams.length} шалгалт
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">Алдаа: {error.message}</p>
        </div>
      )}

      {/* Loading grid */}
      {loading && !data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden bg-white border shadow-sm"
            >
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam cards grid */}
      {(!loading || data) && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="group rounded-xl overflow-hidden bg-white border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              >
                {/* Gradient banner */}
                <div
                  className="h-36 relative flex items-end p-4"
                  style={{ background: gradientForId(exam.id) }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <div className="relative">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-white/25 backdrop-blur-sm mb-2">
                      <FileText className="size-5 text-white" />
                    </div>
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                  >
                    <MoreVertical className="size-4 text-white" />
                  </button>
                </div>

                {/* Card body */}
                <div className="p-3.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {exam.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(exam.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {exams.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center size-16 rounded-full bg-slate-100 mb-4">
                <BookOpen className="size-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Шалгалт олдсонгүй
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                {search
                  ? "Хайлтын үр дүн олдсонгүй. Өөр түлхүүр үгээр хайна уу."
                  : "Одоогоор шалгалтын санд материал байхгүй байна."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
