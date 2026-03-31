"use client";

import { useState } from "react";
import { useCreateStudentMutation } from "@/gql/graphql";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  classId: string;
  onSuccess: () => void;
}

export function AddStudentDialog({ classId, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
  });

  const [createStudent, { loading }] = useCreateStudentMutation();

  const handleAdd = async () => {
    if (!formData.firstName || !formData.email) {
      toast.error("Нэр болон Мэйл хаяг заавал байх ёстой!");
      return;
    }

    const toastId = toast.loading("Сурагчийг бүртгэж байна...");

    try {
      // Mutation-ийн variables хэсэг
      await createStudent({
        variables: {
          classId: classId,
          email: formData.email,
          phone: formData.phone,
          // Овог нэрийг нийлүүлж "name" талбарт илгээх
          name: formData.lastName
            ? `${formData.lastName} ${formData.firstName}`
            : formData.firstName,
        },
      });

      toast.success("Сурагч амжилттай бүртгэгдлээ.", { id: toastId });

      // Төлөв цэвэрлэх
      setFormData({ lastName: "", firstName: "", email: "", phone: "" });
      setOpen(false);
      onSuccess(); // Хүснэгтийг refetch хийнэ
    } catch (err) {
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.", { id: toastId });
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#3b4df2] hover:bg-[#2a3bc2] text-white rounded-xl gap-2 shadow-sm transition-all active:scale-95">
          <UserPlus className="w-4 h-4" /> Сурагч нэмэх
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 pb-2">
            Сурагч бүртгэх
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-600">Овог</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Жишээ: Бат"
                className="h-11 rounded-xl bg-slate-50 border-none"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-600">Нэр*</Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Жишээ: Дорж"
                className="h-11 rounded-xl bg-slate-50 border-none"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-600">Мэйл хаяг*</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="example@mail.com"
              className="h-11 rounded-xl bg-slate-50 border-none"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-600">Утасны дугаар</Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="8899..."
              className="h-11 rounded-xl bg-slate-50 border-none"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Буцах
          </Button>
          <Button
            className="bg-[#1a065e] hover:bg-[#2a0a8e] text-white rounded-full px-10 h-12 font-semibold shadow-lg transition-all active:scale-95"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Бүртгэх"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
