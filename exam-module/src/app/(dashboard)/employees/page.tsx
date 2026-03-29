"use client";

import { useState, useMemo } from "react";
import {
  useGetStudentsQuery,
  useGetClassesQuery,
  useCreateStudentMutation,
  GetStudentsDocument,
} from "@/gql/graphql";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  Mail,
  GraduationCap,
  Loader2,
  BookOpen,
} from "lucide-react";

// ── Subject / specialty helpers ──────────────────────────────────────────────

const SUBJECTS = [
  { value: "math", label: "Математик", color: "bg-blue-100 text-blue-700" },
  { value: "physics", label: "Физик", color: "bg-indigo-100 text-indigo-700" },
  {
    value: "chemistry",
    label: "Хими",
    color: "bg-emerald-100 text-emerald-700",
  },
  { value: "biology", label: "Биологи", color: "bg-green-100 text-green-700" },
  { value: "history", label: "Түүх", color: "bg-amber-100 text-amber-700" },
  {
    value: "english",
    label: "Англи хэл",
    color: "bg-violet-100 text-violet-700",
  },
  {
    value: "mongolian",
    label: "Монгол хэл",
    color: "bg-rose-100 text-rose-700",
  },
  { value: "it", label: "Мэдээлэл зүй", color: "bg-cyan-100 text-cyan-700" },
  { value: "art", label: "Урлаг", color: "bg-fuchsia-100 text-fuchsia-700" },
  {
    value: "pe",
    label: "Биеийн тамир",
    color: "bg-orange-100 text-orange-700",
  },
] as const;

/** Deterministic subject badge based on teacher id — placeholder until backend has a real field */
function subjectForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return SUBJECTS[Math.abs(h) % SUBJECTS.length];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-teal-100 text-teal-700",
];

function colorForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formSubject, setFormSubject] = useState("");

  const { data, loading, error } = useGetStudentsQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: classData } = useGetClassesQuery({
    fetchPolicy: "cache-and-network",
  });

  const [createStudent, { loading: creating }] = useCreateStudentMutation({
    refetchQueries: [{ query: GetStudentsDocument }],
  });

  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classData?.getClasses ?? []) {
      map.set(c.id, c.name);
    }
    return map;
  }, [classData?.getClasses]);

  const students = useMemo(() => {
    const all = data?.getStudents ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q),
    );
  }, [data?.getStudents, search]);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormClassId("");
    setFormSubject("");
  };

  const handleCreate = async () => {
    if (
      !formName.trim() ||
      !formClassId ||
      !formEmail.trim() ||
      !formPhone.trim()
    )
      return;
    await createStudent({
      variables: {
        name: formName.trim(),
        classId: formClassId,
        email: formEmail.trim(),
        phone: formPhone.trim(),
      },
    });
    resetForm();
    setOpen(false);
  };

  const canSubmit =
    formName.trim().length > 0 &&
    formClassId.length > 0 &&
    formEmail.trim().length > 0 &&
    formPhone.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Багш нар</h1>
          <p className="text-sm text-gray-500 mt-1">
            Бүртгэлтэй багш нарын жагсаалт
          </p>
        </div>
        <Button className="gap-2 w-fit" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Багш нэмэх
        </Button>
      </div>

      {/* ── Add teacher sheet ── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Шинэ багш нэмэх</SheetTitle>
            <SheetDescription>Багшийн мэдээллийг оруулна уу.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 py-2 flex-1 overflow-y-auto">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Нэр <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Багшийн нэр"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Имэйл <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="teacher@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Утас <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="99001122"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Анги <span className="text-red-500">*</span>
              </label>
              <select
                value={formClassId}
                onChange={(e) => setFormClassId(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
              >
                <option value="">Анги сонгох…</option>
                {(classData?.getClasses ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Мэргэжил / Хичээл
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() =>
                      setFormSubject((prev) =>
                        prev === s.value ? "" : s.value,
                      )
                    }
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      formSubject === s.value
                        ? `${s.color} border-current ring-2 ring-current/20`
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
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
              Хадгалах
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm">
          <div className="flex items-center justify-center size-11 rounded-lg bg-violet-100">
            <Users className="size-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : students.length}
            </p>
            <p className="text-xs text-gray-500">Нийт багш</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm">
          <div className="flex items-center justify-center size-11 rounded-lg bg-blue-100">
            <GraduationCap className="size-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : classMap.size}
            </p>
            <p className="text-xs text-gray-500">Нийт анги</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm">
          <div className="flex items-center justify-center size-11 rounded-lg bg-emerald-100">
            <Mail className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {loading
                ? "—"
                : (data?.getStudents ?? []).filter((s) => s.email).length}
            </p>
            <p className="text-xs text-gray-500">Имэйлтэй</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Нэр, имэйлээр хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <p className="text-sm text-gray-500 whitespace-nowrap">
            {students.length} үр дүн
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4">
            <p className="text-sm text-red-600">Алдаа: {error.message}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !data && (
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {(!loading || data) && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Багш</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Имэйл</th>
                  <th className="px-4 py-3 hidden md:table-cell">Анги</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Мэргэжил</th>
                  <th className="px-4 py-3 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => {
                  const subject = subjectForId(student.id);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback
                              className={`text-xs font-semibold ${colorForId(student.id)}`}
                            >
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-400 sm:hidden">
                              {student.email ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-sm text-gray-600">
                          {student.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {classMap.get(student.classId) ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${subject.color}`}
                        >
                          <BookOpen className="size-3" />
                          {subject.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button variant="ghost" size="sm">
                          Дэлгэрэнгүй
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty state */}
            {students.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex items-center justify-center size-16 rounded-full bg-slate-100 mb-4">
                  <Users className="size-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Багш олдсонгүй
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {search
                    ? "Хайлтын үр дүн олдсонгүй. Өөр түлхүүр үгээр хайна уу."
                    : "Одоогоор бүртгэлтэй багш байхгүй байна."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
