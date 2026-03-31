"use client";

import { useState, useMemo } from "react";
import type { GetExamQuery } from "@/gql/graphql";
import {
  useCreateExamMutation,
  useGetExamCreateOptionsQuery,
  useTopicsBySubjectQuery,
  GetExamsDocument,
  useCreateSubjectMutation,
  useCreateTopicMutation,
  GetExamCreateOptionsDocument,
  useGetExamQuery,
  useUpdateexamMutation,
  type GetExamQuery,
} from "@/gql/graphql";

type ExamRow = GetExamQuery["exams"][number];
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const [createExam, { loading: creating }] = useCreateExamMutation({
    refetchQueries: [{ query: GetExamsDocument }],
  });

  const [createSubject, { loading: subjectCreating }] =
    useCreateSubjectMutation({
      refetchQueries: [{ query: GetExamCreateOptionsDocument }],
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

      return matchSearch && matchSubject && matchTopic;
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

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await createSubject({ variables: { name: newSubjectName.trim() } });
      toast.success(`"${newSubjectName}" хичээл бүртгэгдлээ`);
      setNewSubjectName("");
    } catch {
      toast.error("Хичээл бүртгэхэд алдаа гарлаа");
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim() || !subjectId) return;
    await createTopic({
      variables: {
        name: newTopicName.trim(),
        subjectId,
        grade: parseInt(topicGrade),
      },
    });
    setNewTopicName("");
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
    if (!canSubmitExam) return;

    try {
      if (editingExam) {
        await updateExam({
          variables: {
            id: editingExam.id,
            name: examName.trim(),
            subjectId,
            topicId,
          },
        });
        // Амжилттай зассан мэдэгдэл
        toast.success("Шалгалт амжилттай шинэчлэгдлээ", {
          description: `${examName} шалгалтын мэдээлэл хадгалагдлаа.`,
        });
      } else {
        await createExam({
          variables: {
            name: examName.trim(),
            creatorId,
            subjectId,
            topicId,
          },
        });
        // Амжилттай үүсгэсэн мэдэгдэл
        toast.success("Шинэ шалгалт үүсгэгдлээ");
      }

      setEditingExam(null);
      resetAndClose();
    } catch (error) {
      // Алдаа гарсан үеийн мэдэгдэл
      toast.error("Алдаа гарлаа", {
        description:
          "Мэдээллийг хадгалахад техникийн алдаа гарлаа. Дахин оролдоно уу.",
      });
      console.error(error);
    }
  };
  return (
    <div className="p-8 min-h-screen bg-[#fafbfc]">
      <div className="mb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Шалгалтын сан
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium uppercase tracking-wider">
              Удирдах хэсэг
            </p>
          </div>
          <Button
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white h-11 px-6 rounded-xl shadow-lg transition-all active:scale-95"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" /> Шинэ бүртгэл
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-10">
          <div className="relative w-72">
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
              className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
            >
              <option value="">Хичээл сонгох</option>
              {optionsData?.subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative w-64">
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-slate-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {subjectId ? "Бүх сэдэв" : "Хичээл сонгоно уу"}
              </option>
              {topicsData?.topics?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="ml-auto flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">
              Хуваарилагдсан
            </span>
            <Switch
              checked={showAssigned}
              onCheckedChange={setShowAssigned}
              className="data-[state=checked]:bg-[#4f46e5]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {exams.map((exam) => (
            <div key={exam.id} className="group relative pt-5">
              <div className="absolute top-7 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-white"
                    >
                      <MoreVertical className="h-4 w-4 text-slate-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-1" align="end">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm font-medium gap-2 px-2 h-9"
                      onClick={() => handleEditClick(exam as Exam)}
                    >
                      <Edit2 className="h-4 w-4" /> Засах
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="absolute top-0 left-0 w-[45%] h-6 bg-[#dbeafe] rounded-t-2xl group-hover:bg-[#cfe2ff]" />
              <div className="bg-[#dbeafe] group-hover:bg-[#cfe2ff] h-44 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-5 flex flex-col justify-end border border-blue-100 shadow-md transition-all group-hover:-translate-y-1">
                <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-blue-200/50 w-full shadow-sm">
                  <p className="text-[14px] font-bold text-slate-800 truncate">
                    {exam.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md p-0 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <SheetHeader className="p-6 pb-2">
              <SheetTitle className="text-xl font-bold">
                Сан баяжуулах
              </SheetTitle>
              <SheetDescription>
                Шалгалт болон хичээлийн хөтөлбөр удирдах.
              </SheetDescription>
              <TabsList className="grid w-full grid-cols-2 mt-4 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="exam" className="rounded-lg font-semibold">
                  Шалгалт
                </TabsTrigger>
                <TabsTrigger
                  value="material"
                  className="rounded-lg font-semibold"
                >
                  Хичээл & Сэдэв
                </TabsTrigger>
              </TabsList>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <TabsContent
                value="exam"
                className="space-y-5 mt-0 animate-in fade-in duration-300"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Type className="size-3.5" /> Шалгалтын нэр{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Жишээ: Математик — Улирлын шалгалт"
                    value={examName}
                    disabled={!!editingExam}
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
                    <BookOpen className="size-3.5" /> Хичээл{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectId}
                    disabled={!!editingExam}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setTopicId("");
                    }}
                    className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
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
                    <Layers className="size-3.5" /> Сэдэв{" "}
                    <span className="text-red-500">*</span>
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
                      <p className="text-[10px] text-gray-400">
                        Урьдчилсан харагдац
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="material"
                className="space-y-8 mt-0 animate-in fade-in duration-300"
              >
                <div className="space-y-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <label className="text-[11px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="size-4" /> 01. Хичээл бүртгэх
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Жишээ: Биологи"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="h-11 rounded-xl bg-white border-indigo-200"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateSubject}
                      disabled={!newSubjectName.trim() || subjectCreating}
                      className="bg-indigo-600 h-11 px-5 rounded-xl shrink-0"
                    >
                      {subjectCreating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Нэмэх"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="size-4" /> 02. Сэдэв бүртгэх
                  </label>
                  <div className="space-y-4">
                    {/* Хичээл сонгох */}
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      <option value="">Аль хичээлд нэмэх вэ?</option>
                      {optionsData?.subjects?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <Input
                      placeholder="Сэдвийн нэр"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="h-11 rounded-xl bg-white border-slate-200"
                    />

                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <select
                          value={topicGrade}
                          onChange={(e) => setTopicGrade(e.target.value)}
                          className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                            <option key={g} value={g}>
                              {g}-р анги
                            </option>
                          ))}
                        </select>
                        <span className="absolute left-4 top-3.5 text-[10px] font-bold text-slate-400 uppercase pointer-events-none">
                          Анги:
                        </span>
                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>

                      <Button
                        onClick={handleCreateTopic}
                        disabled={
                          !newTopicName.trim() || !subjectId || topicCreating
                        }
                        className="bg-slate-800 hover:bg-slate-900 h-11 px-6 rounded-xl shrink-0"
                      >
                        {topicCreating ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Хадгалах"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            {activeTab === "exam" && (
              <SheetFooter className="p-6 border-t bg-slate-50/50">
                <Button
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold gap-2"
                  disabled={!canSubmitExam || creating || updating}
                  onClick={handleSaveExam}
                >
                  {creating || updating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : editingExam ? (
                    <Edit2 className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {editingExam ? "Өөрчлөлт хадгалах" : "Шалгалт үүсгэх"}
                </Button>
              </SheetFooter>
            )}
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
