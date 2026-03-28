"use client";

import {
  useCreateClassMutation,
  useCreateStudentMutation,
  useGetClassesQuery,
} from "@/gql/graphql";
import { useState } from "react";

export default function Test2Page() {
  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const { data, loading, refetch } = useGetClassesQuery();
  console.log(data, "data");
  const [createClass, { loading: creatingClass }] = useCreateClassMutation();
  const [createStudent, { loading: creatingStudent }] =
    useCreateStudentMutation();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500 font-medium">
        <div className="animate-pulse">Уншиж байна...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-slate-900">
            Системийн тохиргоо
          </h1>
          <p className="text-slate-500 text-sm">
            Анги болон сурагчдын бүртгэлийг эндээс удирдана уу.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="group p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-slate-700">
                Шинэ анги
              </h2>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ангийн нэр (Жишээ нь: 12A)"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
              <button
                disabled={creatingClass || !className}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={async () => {
                  await createClass({ variables: { name: className } });
                  setClassName("");
                  refetch();
                }}
              >
                Анги үүсгэх
              </button>
            </div>
          </section>

          <section className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-slate-700">
                Сурагч бүртгэх
              </h2>
            </div>

            <div className="space-y-4">
              <select
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 outline-none appearance-none"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Анги сонгох...</option>
                {data?.getClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Сурагчийн нэр"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 outline-none transition-all"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Имэйл хаяг"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 outline-none transition-all"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />

              <button
                disabled={
                  creatingStudent ||
                  !selectedClassId ||
                  !studentName ||
                  !studentEmail.trim()
                }
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                onClick={async () => {
                  await createStudent({
                    variables: {
                      classId: selectedClassId,
                      name: studentName,
                      email: studentEmail,
                    },
                  });
                  setStudentName("");
                  setStudentEmail("");
                  alert("Амжилттай бүртгэгдлээ");
                }}
              >
                Бүртгэх
              </button>
            </div>
          </section>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 px-2">
            Идэвхтэй ангиуд
          </h2>
          <div className="flex flex-wrap gap-3">
            {data?.getClasses.length === 0 && (
              <p className="text-slate-400 italic text-sm">
                Одоогоор анги үүсгээгүй байна.
              </p>
            )}
            {data?.getClasses.map((c) => (
              <div
                key={c.id}
                className="px-6 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-default"
              >
                {c.name}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
