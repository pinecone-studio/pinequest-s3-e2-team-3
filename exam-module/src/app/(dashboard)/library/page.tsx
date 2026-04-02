"use client";

import { useState, useMemo } from "react";
import {
  useGetExamCreateOptionsQuery,
  useTopicsBySubjectQuery,
  GetExamsDocument,
  useCreateTopicMutation,
  useGetExamQuery,
  useUpdateexamMutation,
  useGetClassesQuery,
} from "@/gql/graphql";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Plus,
  Loader2,
  ChevronDown,
  Type,
  User,
  BookOpen,
  Layers,
  FileText,
} from "lucide-react";
import { Exam } from "@/gql/graphql";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreVertical, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MaterialCard from "./_components/MaterialCard";

const gradientForId = (name: string) => {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export default function LibraryPage() {
  const router = useRouter();
  const [search] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("exam");
  const [examName, setExamName] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [showAssigned, setShowAssigned] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [topicGrade, setTopicGrade] = useState("10");
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");

  const { data: classesData } = useGetClassesQuery();

  const [updateExam, { loading: updating }] = useUpdateexamMutation({
    refetchQueries: [{ query: GetExamsDocument }],
  });

  const { data, loading } = useGetExamQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: optionsData } = useGetExamCreateOptionsQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: topicsData } = useTopicsBySubjectQuery({
    variables: { subjectId },
    skip: !subjectId,
  });

  const [createTopic, { loading: topicCreating }] = useCreateTopicMutation({
    refetchQueries: ["TopicsBySubject"],
  });

  const exams = useMemo(() => {
    const all = data?.exams ?? [];

    return all.filter((e) => {
      const matchSearch =
        !search.trim() || e.name.toLowerCase().includes(search.toLowerCase());

      const matchSubject = !subjectId || e.subjectId === subjectId;
      const matchTopic = !topicId || e.topicId === topicId;
      const matchPublic = e.isPublic === true;

      return matchSearch && matchSubject && matchTopic && matchPublic;
    });
  }, [data?.exams, search, subjectId, topicId]);
  const canSubmitExam =
    examName.trim().length > 0 &&
    creatorId.length > 0 &&
    subjectId.length > 0 &&
    topicId.length > 0;

  const resetAndClose = () => {
    setExamName("");
    setNewSubjectName("");
    setNewTopicName("");
    setCreatorId("");
    setSubjectId("");
    setTopicId("");
    setOpen(false);
  };

  const handleEditClick = (exam: Exam) => {
    setEditingExam(exam);
    setExamName(exam.name);
    setCreatorId(exam.creatorId ?? "");
    setSubjectId(exam.subjectId ?? "");
    setTopicId(exam.topicId ?? "");
    setActiveTab("exam");
    setOpen(true);
  };

  const handleSaveExam = async () => {
    if (!canSubmitExam || !editingExam) return;

    try {
      await updateExam({
        variables: {
          id: editingExam.id,
          name: examName.trim(),
          subjectId,
          topicId,
        },
      });

      toast.success("Шалгалт амжилттай шинэчлэгдлээ", {
        description: `${examName} шалгалтын мэдээлэл хадгалагдлаа.`,
      });

      setEditingExam(null);
      resetAndClose();
    } catch (error) {
      toast.error("Алдаа гарлаа", {
        description:
          "Мэдээллийг хадгалахад техникийн алдаа гарлаа. Дахин оролдоно уу.",
      });
    }
  };
  return (
    <div className="p-6 min-h-screen px-10">
      <div className="mb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[24px] font-semibold text-black ">
              Шалгалтын сан
            </h1>
            <p className="text-[666666] text-[14px]  font-medium ">
              Удирдах хэсэг
            </p>
          </div>
          <Button
            onClick={() => setTopicDialogOpen(true)}
            className="bg-[#21005D] text-white h-[40px] px-3  text-[14px] font-medium rounded-full"
          >
            <Plus className=" h-5 w-5" /> Сэдэв нэмэх
          </Button>
        </div>

        <div className="flex items-center gap-4 mt-10">
          <div className="relative w-[222px]">
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
              className="w-full h-[36px] px-4 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
            >
              <option value="">Хичээл сонгох</option>
              {optionsData?.subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative w-64">
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full h-[36px] px-4 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-slate-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="">{subjectId ? "Бүх сэдэв" : "сэдэв"}</option>
              {topicsData?.topics?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="ml-auto flex items-center gap-4 bg-white px-4 py-2 rounded-xl ">
            <span className="text-[14px] font-medium text-[#020617]">
              Хуваарилагдсан
            </span>
            <Switch
              checked={showAssigned}
              onCheckedChange={setShowAssigned}
              className="data-[state=checked]:bg-[#21005D]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {exams.map((exam) => (
            <MaterialCard
              key={exam.id}
              material={exam}
              onClick={() => router.push(`/library/${exam.id}`)}
              onEdit={() => handleEditClick(exam)}
            />
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-md p-0 rounded-l-3xl flex flex-col"
        >
          <SheetHeader className="p-6">
            <SheetTitle className="text-xl font-bold">
              Сэдэв, агуулга засах
            </SheetTitle>
            <SheetDescription>
              Шалгалтын үндсэн мэдээлэл болон сэдвийг шинэчлэх
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Type className="size-3.5" /> Шалгалтын нэр
              </label>
              <Input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <User className="size-3.5" /> Зохиогч{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={creatorId}
                disabled={!!editingExam}
                onChange={(e) => setCreatorId(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">Багш сонгох…</option>
                {optionsData?.staffUsers?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.lastName ? `${u.lastName[0]}. ` : ""}
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="size-3.5" /> Хичээл
              </label>
              <select
                value={subjectId}
                disabled
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopicId("");
                }}
                className="h-[36px] w-full rounded-xl border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">Хичээл сонгох…</option>
                {optionsData?.subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Layers className="size-3.5" /> Сэдэв өөрчлөх
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId}
                className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50"
              >
                <option value="">
                  {subjectId ? "Сэдэв сонгох…" : "Эхлээд хичээл сонгоно уу"}
                </option>
                {topicsData?.topics?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.grade}-р анги)
                  </option>
                ))}
              </select>
            </div>

            {examName.trim() && (
              <div className="rounded-xl overflow-hidden border shadow-sm mt-4">
                <div
                  className="h-20 flex items-end p-3"
                  style={{ background: gradientForId(examName) }}
                >
                  <FileText className="size-5 text-white/80" />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {examName}
                  </p>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="p-6 border-t bg-slate-50/50">
            <Button
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold gap-2"
              disabled={!canSubmitExam || updating}
              onClick={handleSaveExam}
            >
              {updating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Edit2 className="size-4" />
              )}
              Өөрчлөлт хадгалах
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent className="bg-gray-50 rounded-[40px] w-[458px] overflow-hidden border-none">
          <DialogHeader className=" border-b border-gray-100">
            <DialogTitle className="text-[20px] pl-2 font-semibold text-left border-b p-3 text-black">
              Сэдэв нэмэх
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-[14px] font-medium text-black">
                Хичээлийн нэр<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full h-[36px] rounded-xl border border-gray-200 px-4 bg-white text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none transition-all"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1rem",
                }}
              >
                <option className="text-[14px]" value="" disabled hidden>
                  Жишээ нь : Математик
                </option>
                {optionsData?.subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[14px] font-medium text-black">
                Анги<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full h-[36px] rounded-xl border border-gray-200 px-4 bg-white text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none transition-all"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1rem",
                }}
              >
                <option className="text-[14px]" value="" disabled hidden>
                  Жишээ нь : 11-р анги
                </option>
                {Array.from(
                  new Set(
                    classesData?.getClasses.map(
                      (cls) => cls.name.match(/^\d+/)?.[0],
                    ),
                  ),
                )
                  .filter(Boolean)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((g) => (
                    <option key={g} value={g}>
                      {g}-р анги
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[14px] font-medium text-black">
                Сэдвийн нэр<span className="text-red-500 ml-0.5">*</span>
              </label>
              <Input
                placeholder="Жишээ нь : Магадлал"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="h-[36px] text-[14px] rounded-xl border-gray-200 px-4 placeholder:text-gray-400  focus-visible:ring-purple-300"
              />
            </div>
          </div>

          <DialogFooter className="px-8   flex flex-row justify-end items-center gap-4 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setTopicDialogOpen(false)}
              className="text-[14px] font-medium  "
            >
              Буцах
            </Button>

            <Button
              disabled={topicCreating}
              className="h-[40px] px-5 w-[95px] rounded-full bg-[#21005D] hover:bg-[#21005D]/90 text-white text-[14px] font-medium"
              onClick={async () => {
                if (!subjectId || !newTopicName || !selectedGrade) {
                  toast.error("Мэдээллээ бүрэн бөглөнө үү");
                  return;
                }

                try {
                  await createTopic({
                    variables: {
                      name: newTopicName,
                      subjectId: subjectId,
                      grade: parseInt(selectedGrade),
                    },
                  });

                  toast.success("Сэдэв амтай нэмэгдлээ");
                  setTopicDialogOpen(false);
                  setNewTopicName("");
                } catch (error) {
                  console.error(error);
                  toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
                }
              }}
            >
              {topicCreating && <Loader2 className="" />}
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
