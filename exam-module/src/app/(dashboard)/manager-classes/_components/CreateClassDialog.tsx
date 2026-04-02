"use client";

import { useState } from "react";
import {
  useCreateClassMutation,
  useGetStaffUsersQuery,
  useAssignTeacherToClassMutation,
  useGetClassesQuery,
} from "@/gql/graphql";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
}

const GROUP_OPTIONS = ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж"];

export function CreateClassDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);

  const [grade, setGrade] = useState("");
  const [group, setGroup] = useState("");
  const [room, setRoom] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const { data: staffData } = useGetStaffUsersQuery();
  const { data: classesData } = useGetClassesQuery();
  const [createClass, { loading: creating }] = useCreateClassMutation();
  const [assignTeacher, { loading: assigning }] =
    useAssignTeacherToClassMutation();

  const isDuplicate = () => {
    const fullName = room
      ? `${grade}${group} (${room} тоот)`
      : `${grade}${group}`;
    return classesData?.getClasses?.some((c) => c.name === fullName);
  };

  const handleCreate = async () => {
    if (!grade || !group || !selectedTeacherId) {
      toast.error("Мэдээллээ бүрэн бөглөнө үү!");
      return;
    }

    if (isDuplicate()) {
      toast.warning("Энэ анги аль хэдийн бүртгэгдсэн байна.");
      return;
    }

    const fullName = room
      ? `${grade}${group} (${room} тоот)`
      : `${grade}${group}`;

    try {
      const { data } = await createClass({
        variables: { name: fullName },
      });

      const newClassId = data?.createClass?.id;

      if (newClassId) {
        await assignTeacher({
          variables: {
            classId: newClassId,
            teacherId: selectedTeacherId,
          },
        });
      }

      toast.success(`${fullName} амжилттай үүслээ.`);

      setGrade("");
      setGroup("");
      setRoom("");
      setSelectedTeacherId("");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error("Анги үүсгэхэд алдаа гарлаа.");
      console.error(err);
    }
  };

  const isValid =
    grade && group && selectedTeacherId && !creating && !assigning;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#21005D] text-[14px] font-medium  text-white rounded-full gap-2 h-11 px-3 py-2">
          <Plus className="w-5 h-5" /> Анги нэмэх
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[458px] bg-gray-50  rounded-[2rem] p-8 border-none">
        <DialogHeader>
          <DialogTitle className="text-[20px]  font-semibold text-black pb-4">
            Анги үүсгэх
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="grid gap-2">
            <Label className="text-[14px] font-medium ">Ангийн нэр *</Label>
            <Input
              placeholder="Анги оруулна уу"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-[36px] rounded-xl bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid  gap-2">
              <Label className="text-[14px]  font-medium ">Бүлэг сонгох*</Label>
              <Select onValueChange={setGroup} value={group}>
                <SelectTrigger className="h-[36px] rounded-xl bg-white">
                  <SelectValue placeholder="Сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g} бүлэг
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-[14px] font-medium  text-slate-400">
                Тоот (Заавал биш)
              </Label>
              <Input
                placeholder="124"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="h-[36px] rounded-xl bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-[14px] font-medium ">
              Анги удирдсан багш*
            </Label>
            <Select
              onValueChange={setSelectedTeacherId}
              value={selectedTeacherId}
            >
              <SelectTrigger className="h-[36px] rounded-xl bg-white">
                <SelectValue placeholder="Багшийг сонгоно уу" />
              </SelectTrigger>
              <SelectContent>
                {staffData?.staffUsers?.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.lastName} {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex ml-8 bg-gray-50 flex-row justify-between items-center w-full pt-6">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-slate-500"
          >
            Буцах
          </Button>
          <Button
            className="bg-[#21005D]   text-white rounded-full px-8 h-12 font-semibold transition-all "
            onClick={handleCreate}
            disabled={!isValid}
          >
            {creating || assigning ? (
              <>
                <Loader2 className=" h-4 w-4 animate-spin" />
                Түр хүлээнэ үү...
              </>
            ) : (
              "Хадгалах"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
