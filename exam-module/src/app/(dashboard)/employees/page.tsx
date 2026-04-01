"use client";

export const runtime = "edge";

import { useState, useMemo } from "react";
import {
  useGetStaffUsersQuery,
  useGetClassesQuery,
  useCreateTeacherMutation,
  useAssignTeacherToClassMutation,
  useRemoveTeacherFromClassMutation,
  useDeleteTeacherMutation,
  GetStaffUsersDocument,
  UserRole,
} from "@/gql/graphql";
import { Loader2, Search, Plus, X, Trash2 } from "lucide-react";
// ── Subject / specialty helpers ──────────────────────────────────────────────

const SUBJECTS = [
  { value: "math", label: "Математик" },
  { value: "physics", label: "Физик" },
  { value: "chemistry", label: "Хими" },
  { value: "biology", label: "Биологи" },
  { value: "history", label: "Түүх" },
  { value: "english", label: "Англи хэл" },
  { value: "mongolian", label: "Монгол хэл" },
  { value: "it", label: "Мэдээлэл зүй" },
  { value: "art", label: "Урлаг" },
  { value: "pe", label: "Биеийн тамир" },
  { value: "math_teacher", label: "Математикийн багш" },
  { value: "physics_teacher", label: "Физикийн багш" },
  { value: "chemistry_teacher", label: "Химийн багш" },
] as const;

function subjectLabel(value: string) {
  return SUBJECTS.find((s) => s.value === value)?.label ?? value;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // detail modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const [assignClassId, setAssignClassId] = useState("");

  // form state
  const [formName, setFormName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"teacher" | "manager">("teacher");
  const [formSubject, setFormSubject] = useState("");

  const { data, loading } = useGetStaffUsersQuery({
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
  const [removeTeacher] = useRemoveTeacherFromClassMutation({
    refetchQueries: [{ query: GetStaffUsersDocument }],
  });
  const [deleteTeacherMut, { loading: deleting }] = useDeleteTeacherMutation({
    refetchQueries: [{ query: GetStaffUsersDocument }],
  });

  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classData?.getClasses ?? []) map.set(c.id, c.name);
    return map;
  }, [classData?.getClasses]);

  const teachers = useMemo(() => {
    const all = data?.staffUsers ?? [];
    let result = all;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.lastName.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q),
      );
    }
    if (subjectFilter) {
      result = result.filter((t) => t.subjects?.includes(subjectFilter));
    }
    return result;
  }, [data?.staffUsers, search, subjectFilter]);

  const resetForm = () => {
    setFormName("");
    setFormLastName("");
    setFormEmail("");
    setFormRole("teacher");
    setFormSubject("");
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formLastName.trim() || !formEmail.trim()) return;
    await createTeacher({
      variables: {
        name: formName.trim(),
        lastName: formLastName.trim(),
        email: formEmail.trim(),
        subjects: formSubject ? [formSubject] : [],
        role: formRole === "manager" ? UserRole.Manager : UserRole.Teacher,
      },
    });
    resetForm();
    setModalOpen(false);
    setSuccessOpen(true);
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

  const handleDelete = async (teacherId: string) => {
    if (!confirm("Энэ багшийг устгахдаа итгэлтэй байна уу?")) return;
    await deleteTeacherMut({ variables: { teacherId } });
    setDetailOpen(false);
    setSelectedTeacherId(null);
  };

  // unique subject values from all teachers for filter dropdown
  const allSubjectValues = useMemo(() => {
    const set = new Set<string>();
    for (const t of data?.staffUsers ?? []) {
      for (const s of t.subjects ?? []) set.add(s);
    }
    return Array.from(set);
  }, [data?.staffUsers]);

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Ажилтан</h1>
          <p className="text-[14px] text-gray-400 mt-0.5">
            Сургуулийн багш, менежер нэмэх
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3b2fa0] text-white text-sm font-medium hover:bg-[#2e2480] transition-colors"
        >
          <Plus className="size-4" />
          Ажилтан нэмэх
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mt-5 mb-4">
        <div className="relative flex-1 ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            placeholder="Багшийн нэр, и-мэйлээр хайх"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3b2fa0] focus:ring-2 focus:ring-[#3b2fa0]/10 bg-white"
          />
        </div>
        <div className="ml-auto">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-9 pl-3 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-[#3b2fa0] appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="">Бүх багш нар</option>
            {allSubjectValues.map((v) => (
              <option key={v} value={v}>
                {subjectLabel(v)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-sm font-semibold text-[#3b2fa0]">
                Нэр
              </th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-[#3b2fa0]">
                И-Мэйл
              </th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-[#3b2fa0]">
                Заах хичээл
              </th>
              <th className="text-right px-5 py-3 text-sm font-semibold text-[#3b2fa0]">
                Хичээл ордог нийт анги
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading &&
              !data &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-5 py-3.5">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  </td>
                </tr>
              ))}
            {teachers.map((teacher) => {
              const primarySubject = teacher.subjects?.[0] ?? "";
              return (
                <tr
                  key={teacher.id}
                  className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedTeacherId(teacher.id);
                    setAssignClassId("");
                    setDetailOpen(true);
                  }}
                >
                  <td className="px-5 py-3.5 text-sm text-gray-800 font-medium">
                    {teacher.lastName.slice(0, 1)}. {teacher.name}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {teacher.email}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {primarySubject ? subjectLabel(primarySubject) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f0eeff] text-[#3b2fa0] text-sm font-semibold">
                      {teacher.classIds.length}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!loading && teachers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-gray-400"
                >
                  Ажилтан олдсонгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add employee modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Ажилтан нэмэх
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Овог <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Доржпалам"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3b2fa0] focus:ring-2 focus:ring-[#3b2fa0]/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Нэр <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Булгантуяа"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3b2fa0] focus:ring-2 focus:ring-[#3b2fa0]/10"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                И-Мэйл <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="bulgantuyadoorjpalam@gmail.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3b2fa0] focus:ring-2 focus:ring-[#3b2fa0]/10"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Мэргэжил <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-[#3b2fa0] appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                  }}
                >
                  <option value="">Сонгох</option>
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Буцах
              </button>
              <button
                disabled={!canSubmit || creating}
                onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#3b2fa0] text-white text-sm font-medium hover:bg-[#2e2480] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating && <Loader2 className="size-4 animate-spin" />}
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Teacher detail modal ── */}
      {detailOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedTeacher.lastName.slice(0, 1)}. {selectedTeacher.name}
              </h2>
              <button
                onClick={() => {
                  setDetailOpen(false);
                  setSelectedTeacherId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {selectedTeacher.email}
            </p>

            {/* Assigned classes */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Ордог ангиуд
              </p>
              {selectedTeacher.classIds.length === 0 ? (
                <p className="text-sm text-gray-400">Анги байхгүй</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.classIds.map((cid) => (
                    <span
                      key={cid}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f0eeff] text-[#3b2fa0] text-sm font-medium"
                    >
                      {classMap.get(cid) ?? cid}
                      <button
                        onClick={() => handleRemove(cid)}
                        className="ml-1 text-[#3b2fa0]/60 hover:text-red-500"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Assign class */}
            {availableClasses.length > 0 && (
              <div className="flex gap-2 mb-6">
                <select
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="flex-1 h-9 pl-3 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-[#3b2fa0] appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                  }}
                >
                  <option value="">Анги сонгох</option>
                  {availableClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!assignClassId || assigning}
                  onClick={handleAssign}
                  className="px-4 py-2 rounded-lg bg-[#3b2fa0] text-white text-sm font-medium hover:bg-[#2e2480] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {assigning ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Нэмэх"
                  )}
                </button>
              </div>
            )}

            {/* Delete */}
            <div className="flex justify-end">
              <button
                disabled={deleting}
                onClick={() => handleDelete(selectedTeacher.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-[#f0eeff]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b2fa0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Амжилттай нэмэгдлээ
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Ажилтан амжилттай бүртгэгдлээ.
            </p>
            <button
              onClick={() => setSuccessOpen(false)}
              className="px-6 py-2 rounded-lg bg-[#3b2fa0] text-white text-sm font-medium hover:bg-[#2e2480] transition-colors"
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
