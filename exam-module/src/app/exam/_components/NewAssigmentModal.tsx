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
  date: string;
  startTime: string;
  endTime: string;
};

export default function NewAssignmentModal({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState<FormData>({
    examId: "",
    description: "",
    classId: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.examId ||
      !formData.classId ||
      !formData.date ||
      !formData.description
    ) {
      alert("Та бүх заавал бөглөх талбарыг бөглөнө үү!");
      return;
    }

    const now = new Date();
    const formattedStart = `${formData.date}T${formData.startTime || "00:00"}:00Z`;
    const formattedEnd = `${formData.date}T${formData.endTime || "23:59"}:00Z`;

    const startDate = new Date(formattedStart);
    const endDate = new Date(formattedEnd);

    // Статус тодорхойлох логик
    let status = "scheduled"; // default
    if (now >= startDate && now <= endDate) {
      status = "scheduled";
    } else if (now > endDate) {
      status = "scheduled";
    }

    try {
      await createExamSession({
        variables: {
          examId: formData.examId,
          classId: formData.classId,
          description: formData.description,
          startTime: formattedStart,
          endTime: formattedEnd,
          status: status, // Тодорхойлсон статусаа илгээх
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
