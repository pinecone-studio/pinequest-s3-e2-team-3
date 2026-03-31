"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateExamMaterialMutation,
  useGetClassesQuery,
  useGetSubjectsQuery,
  useTopicsBySubjectQuery,
} from "@/gql/graphql";
import { Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function CreateMaterialDialog({ open, setOpen }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [classId, setClassId] = useState("");

  const { data: classes } = useGetClassesQuery();
  const { data: subjects } = useGetSubjectsQuery();
  const { data: topics } = useTopicsBySubjectQuery({
    variables: { subjectId },
    skip: !subjectId,
  });

  const [createExam, { loading: createLoading }] =
    useCreateExamMaterialMutation();

  const handleCreate = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = storedUser.id;
    if (!name || !subjectId || !topicId)
      return alert("Мэдээллээ бүрэн бөглөнө үү");

    try {
      const res = await createExam({
        variables: {
          name,
          isPublic,
          subjectId,
          topicId,
          creatorId: currentUserId,
        },
        refetchQueries: ["GetExams"],
      });

      if (res.data) {
        setOpen(false);
        setName("");
      }
    } catch (e) {
      console.error("Үүсгэхэд алдаа гарлаа:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[40px] border-none shadow-2xl">
        <div className="p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Шалгалтын материал үүсгэх
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Хичээл<span className="text-red-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setTopicId("");
                  }}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Сонгох</option>
                  {subjects?.subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Сэдэв<span className="text-red-500">*</span>
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={!subjectId}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <option value="">Сонгох</option>
                  {topics?.topics?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Анги<span className="text-red-500">*</span>
              </label>

              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Сонгох</option>
                {classes?.getClasses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Материалын нэр<span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Материалын нэр"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <span className="text-sm font-medium text-gray-700">
                {" "}
                Нийтэд нээлттэй болгох
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Файлаас материал үүсгэх (.docx)
              </p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-gray-100 rounded-[24px] bg-[#F8FAFC] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
              >
                <Upload className="w-8 h-8 text-[#1A065E] mb-2" />
                <span className="text-[#1A065E] font-semibold">
                  Файл сонгох
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept=".docx"
                  onChange={() => {}}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-4">
              <button
                onClick={() => setOpen(false)}
                className="text-base font-bold text-[#1A065E]"
              >
                Буцах
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className="bg-[#11044A] text-white px-10 py-3.5 rounded-full font-bold text-base hover:opacity-90 disabled:opacity-50"
              >
                {createLoading ? "Үүсгэж байна..." : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
