"use client";

import { useState } from "react";
import {
  useCreateExamSessionMutationMutation,
  useGetClassesQuery,
  useGetExamsQuery,
} from "@/gql/graphql";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type FormData = {
  examId: string;
  description: string;
  classId: string;
  creatorId: string;
  date: string;
  startTime: string;
  endTime: string;
};

/** Interprets YYYY-MM-DD + HH:mm as local wall time; if end is not after start on that day, end is the next calendar day. */
function localStartEndToUtcIso(
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
): { startTime: string; endTime: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const startParts = (startTimeStr || "00:00").split(":");
  const endParts = (endTimeStr || "23:59").split(":");
  const sh = Number(startParts[0]) || 0;
  const sm = Number(startParts[1]) || 0;
  const ss = Number(startParts[2]) || 0;
  const eh = Number(endParts[0]) || 0;
  const em = Number(endParts[1]) || 0;
  const es = Number(endParts[2]) || 0;
  const startLocal = new Date(y, m - 1, d, sh, sm, ss);
  let endLocal = new Date(y, m - 1, d, eh, em, es);
  if (endLocal.getTime() <= startLocal.getTime()) {
    endLocal = new Date(endLocal);
    endLocal.setDate(endLocal.getDate() + 1);
  }
  return {
    startTime: startLocal.toISOString(),
    endTime: endLocal.toISOString(),
  };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function NewAssignmentModal({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState<FormData>({
    examId: "",
    description: "",
    classId: "",
    creatorId: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const { data: classesData, loading: classesLoading } = useGetClassesQuery();
  const { data: examsData, loading: examsLoading } = useGetExamsQuery();

  const [createExamSession, { loading: mutationLoading }] =
    useCreateExamSessionMutationMutation({
      refetchQueries: ["GetActiveSession"],
    });

  const fillDemoFields = () => {
    const start = new Date(Date.now() + 60_000);
    const end = new Date(start.getTime() + 60 * 60_000);
    const date = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
    const startTime = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`;
    const endTime = `${pad2(end.getHours())}:${pad2(end.getMinutes())}`;
    setFormData((prev) => ({
      ...prev,
      description: "2026-оны анги дэвших шалгалт",
      date,
      startTime,
      endTime,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.examId ||
      !formData.classId ||
      !formData.date ||
      !formData.description ||
      !formData.creatorId
    ) {
      alert("Та бүх заавал бөглөх талбарыг бөглөнө үү!");
      return;
    }

    const { startTime: formattedStart, endTime: formattedEnd } =
      localStartEndToUtcIso(
        formData.date,
        formData.startTime || "00:00",
        formData.endTime || "23:59",
      );

    try {
      await createExamSession({
        variables: {
          examId: formData.examId,
          classId: formData.classId,
          creatorId: formData.creatorId,
          description: formData.description,
          startTime: formattedStart,
          endTime: formattedEnd,
        },
      });

      alert("Шалгалт амжилттай үүсгэгдлээ!");
      onClose();
    } catch (err) {
      console.error("Алдаа:", err);
      alert("Алдаа гарлаа. Та дахин оролдоно уу.");
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-2xl font-bold text-gray-900">Шалгалт үүсгэх</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600  text-2xl leading-none"
          ></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2 -mt-2 mb-2">
            <button
              type="button"
              onClick={fillDemoFields}
              className="rounded-2xl border border-dashed border-[#65558F] bg-[#FCFBFF] px-4 py-2 text-sm font-medium text-[#65558F] hover:bg-[#F3EDFF] transition"
            >
              Demo бөглөх
            </button>
            <span className="text-xs text-gray-500">
              Нэр, огноо, эхлэх (+1 мин), дуусах (+1 цаг) автоматаар
            </span>
          </div>
          {/* exam section  */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Шалгалтын материал
            </label>
            <select
              value={formData.examId}
              onChange={(e) =>
                setFormData({ ...formData, examId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none bg-white disabled:bg-gray-50"
              required
              disabled={examsLoading}
            >
              <option value="">
                {examsLoading ? "Уншиж байна..." : "Материал сонгоно уу"}
              </option>
              {examsData?.exams?.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Шалгалтын нэр
            </label>
            <input
              type="text"
              placeholder="Шалгалтын нэрээ оруулна уу"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Огноо
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Эхлэх цаг
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Дуусах цаг
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Анги сонгох
            </label>
            <select
              value={formData.classId}
              onChange={(e) =>
                setFormData({ ...formData, classId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 bg-white"
              required
              disabled={classesLoading}
            >
              <option value="">
                {classesLoading ? "Уншиж байна..." : "Ангиа сонгоно уу"}
              </option>
              {classesData?.getClasses?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Creator ID */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">
              Үүсгэгчийн ID (Creator ID)
            </label>
            <input
              type="text"
              placeholder="Хэрэглэгчийн ID оруулна уу"
              value={formData.creatorId}
              onChange={(e) =>
                setFormData({ ...formData, creatorId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition"
            >
              Буцах
            </button>
            <button
              type="submit"
              disabled={mutationLoading}
              className={`flex-1 py-3.5 rounded-2xl font-medium text-white transition ${
                mutationLoading
                  ? "bg-gray-400"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {mutationLoading ? "Илгээж байна..." : "Илгээх"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
