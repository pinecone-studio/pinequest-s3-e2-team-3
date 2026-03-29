"use client";


import { useState, useMemo } from "react";
import {
  useGetStaffUsersQuery,
  useGetClassesQuery,
  useCreateTeacherMutation,
  useAssignTeacherToClassMutation,
  useRemoveTeacherFromClassMutation,
  useDeleteTeacherMutation,
  GetStaffUsersDocument,
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
  X,
  Trash2,
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

  // detail sheet state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const [assignClassId, setAssignClassId] = useState("");

  // form state
  const [formName, setFormName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formClassIds, setFormClassIds] = useState<string[]>([]);

  const { data, loading, error } = useGetStaffUsersQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: classData } = useGetClassesQuery({
    fetchPolicy: "cache-and-network",
  });

  const [createTeacher, { loading: creating }] = useCreateTeacherMutation({
    refetchQueries: [{ query: GetStaffUsersDocument }],
  });

  const [assignTeacher, { loading: assigning }] =
    useAssignTeacherToClassMutation({
      refetchQueries: [{ query: GetStaffUsersDocument }],
    });

  const [removeTeacher, { loading: removing }] =
    useRemoveTeacherFromClassMutation({
      refetchQueries: [{ query: GetStaffUsersDocument }],
    });

  const [deleteTeacherMut, { loading: deleting }] = useDeleteTeacherMutation({
    refetchQueries: [{ query: GetStaffUsersDocument }],
  });

  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classData?.getClasses ?? []) {
      map.set(c.id, c.name);
    }
    return map;
  }, [classData?.getClasses]);

  const teachers = useMemo(() => {
    const all = data?.staffUsers ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.lastName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q),
    );
  }, [data?.staffUsers, search]);

  const resetForm = () => {
    setFormName("");
    setFormLastName("");
    setFormEmail("");
    setFormSubject("");
    setFormClassIds([]);
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formLastName.trim() || !formEmail.trim()) return;
    const result = await createTeacher({
      variables: {
        name: formName.trim(),
        lastName: formLastName.trim(),
        email: formEmail.trim(),
        subjects: formSubject ? [formSubject] : [],
      },
    });
    // Assign selected classes to the new teacher
    const newTeacherId = result.data?.createTeacher?.id;
    if (newTeacherId && formClassIds.length > 0) {
      for (const cid of formClassIds) {
        await assignTeacher({
          variables: { teacherId: newTeacherId, classId: cid },
        });
      }
    }
    resetForm();
    setOpen(false);
  };

  const canSubmit =
    formName.trim().length > 0 &&
    formLastName.trim().length > 0 &&
    formEmail.trim().length > 0;

  const selectedTeacher = useMemo(
    () =>
      (data?.staffUsers ?? []).find((t) => t.id === selectedTeacherId) ?? null,
    [data?.staffUsers, selectedTeacherId],
  );

  // classes not yet assigned to the selected teacher
  const availableClasses = useMemo(() => {
    if (!selectedTeacher) return [];
    const assigned = new Set(selectedTeacher.classIds);
    return (classData?.getClasses ?? []).filter((c) => !assigned.has(c.id));
  }, [selectedTeacher, classData?.getClasses]);

  const handleAssign = async () => {
    if (!selectedTeacherId || !assignClassId) return;
    await assignTeacher({
      variables: { teacherId: selectedTeacherId, classId: assignClassId },
    });
    setAssignClassId("");
  };

  const handleRemove = async (classId: string) => {
    if (!selectedTeacherId) return;
    await removeTeacher({
      variables: { teacherId: selectedTeacherId, classId },
    });
  };

  const openDetail = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setAssignClassId("");
    setDetailOpen(true);
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm("Энэ багшийг устгахдаа итгэлтэй байна уу?")) return;
    await deleteTeacherMut({ variables: { teacherId } });
    setDetailOpen(false);
    setSelectedTeacherId(null);
  };

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

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Овог <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Багшийн овог"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
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

            {/* Class assignment */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Анги хуваарилах
              </label>
              {(classData?.getClasses ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  Анги үүсгээгүй байна.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {(classData?.getClasses ?? []).map((c) => {
                      const isSelected = formClassIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setFormClassIds((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== c.id)
                                : [...prev, c.id],
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            isSelected
                              ? "bg-slate-700 text-white border-slate-700 ring-2 ring-slate-700/20"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <GraduationCap className="size-3" />
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                  {formClassIds.length > 0 && (
                    <p className="text-xs text-gray-400">
                      {formClassIds.length} анги сонгогдсон
                    </p>
                  )}
                </>
              )}
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

      {/* ── Teacher detail / assign class sheet ── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selectedTeacher
                ? `${selectedTeacher.name} ${selectedTeacher.lastName}`
                : "Багшийн мэдээлэл"}
            </SheetTitle>
            <SheetDescription>
              Багшийн мэдээлэл болон ангид хуваарилалт
            </SheetDescription>
          </SheetHeader>

          {selectedTeacher && (
            <div className="flex flex-col gap-5 px-4 py-2 flex-1 overflow-y-auto">
              {/* Info */}
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback
                    className={`text-lg font-semibold ${colorForId(selectedTeacher.id)}`}
                  >
                    {getInitials(
                      `${selectedTeacher.name} ${selectedTeacher.lastName}`,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedTeacher.name} {selectedTeacher.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedTeacher.email}
                  </p>
                </div>
              </div>

              {/* Subjects */}
              {selectedTeacher.subjects.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Мэргэжил</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeacher.subjects.map((sv) => {
                      const sub = SUBJECTS.find((s) => s.value === sv);
                      return (
                        <span
                          key={sv}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sub?.color ?? "bg-gray-100 text-gray-700"}`}
                        >
                          <BookOpen className="size-3" />
                          {sub?.label ?? sv}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assigned classes */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Хуваарилагдсан ангиуд
                </p>
                {selectedTeacher.classIds.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Одоогоор анги хуваарилагдаагүй байна.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.classIds.map((cid) => (
                      <span
                        key={cid}
                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {classMap.get(cid) ?? cid}
                        <button
                          type="button"
                          onClick={() => handleRemove(cid)}
                          disabled={removing}
                          className="inline-flex items-center justify-center size-4 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Ангиас хасах"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign new class */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Ангид хуваарилах
                </p>
                {availableClasses.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Бүх анги хуваарилагдсан эсвэл анги үүсгээгүй байна.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={assignClassId}
                      onChange={(e) => setAssignClassId(e.target.value)}
                      className="flex-1 h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Анги сонгох…</option>
                      {availableClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={!assignClassId || assigning}
                      onClick={handleAssign}
                      className="gap-1.5"
                    >
                      {assigning ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}
                      Нэмэх
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <SheetFooter>
            {selectedTeacher && (
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                disabled={deleting}
                onClick={() => handleDelete(selectedTeacher.id)}
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Устгах
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Хаах
              </Button>
            </SheetClose>
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
              {loading ? "—" : teachers.length}
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
                : (data?.staffUsers ?? []).filter((t) => t.email).length}
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
            {teachers.length} үр дүн
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
                {teachers.map((teacher) => {
                  const realSubjects = teacher.subjects ?? [];
                  const subject =
                    realSubjects.length > 0
                      ? (SUBJECTS.find((s) => s.value === realSubjects[0]) ??
                        subjectForId(teacher.id))
                      : subjectForId(teacher.id);
                  const classNames = teacher.classIds
                    .map((cid) => classMap.get(cid))
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback
                              className={`text-xs font-semibold ${colorForId(teacher.id)}`}
                            >
                              {getInitials(
                                `${teacher.name} ${teacher.lastName}`,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {teacher.name} {teacher.lastName}
                            </p>
                            <p className="text-xs text-gray-400 sm:hidden">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {classNames || "—"}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetail(teacher.id)}
                        >
                          Дэлгэрэнгүй
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty state */}
            {teachers.length === 0 && !loading && (
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
