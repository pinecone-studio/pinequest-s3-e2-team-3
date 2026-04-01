"use client";

import { useState } from "react";
import { useCreateStudentMutation } from "@/gql/graphql";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

    try {
      await createStudent({
        variables: {
          classId: classId,
          email: formData.email,
          phone: formData.phone,
          name: formData.lastName
            ? `${formData.lastName} ${formData.firstName}`
            : formData.firstName,
        },
      });

      toast.success("Сурагч амжилттай бүртгэгдлээ.");
      setFormData({ lastName: "", firstName: "", email: "", phone: "" });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error("Алдаа гарлаа.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1A064E] hover:bg-[#250b6b] text-white rounded-full py-6 px-6 gap-2 shadow-lg shadow-indigo-900/20 transition-all active:scale-95">
          <UserPlus className="w-5 h-5" />
          <span className="font-bold text-[15px]">Сурагч нэмэх</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-10 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-bold text-slate-900 border-b border-slate-100 pb-4 mb-2">
            Сурагч бүртгэх
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-slate-800">
                Овог<span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Жишээ нь : Бат"
                className="h-12 rounded-xl border-slate-200 focus:border-[#1A064E] focus:ring-0 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-slate-800">
                Нэр<span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Жишээ нь : Дорж"
                className="h-12 rounded-xl border-slate-200 focus:border-[#1A064E] focus:ring-0 text-[15px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[14px] font-medium text-slate-800">
              Мэйл хаяг<span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Сурагчийн мэйлийг оруулна уу"
              className="h-12 rounded-xl border-slate-200 focus:border-[#1A064E] focus:ring-0 text-[15px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[14px] font-medium text-slate-800">
              Утасны дугаар<span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Сурагчийн утсыг оруулна уу"
              className="h-12 rounded-xl border-slate-200 focus:border-[#1A064E] focus:ring-0 text-[15px]"
            />
          </div>
        </div>

    
        <div className="flex items-center justify-end gap-6 mt-8">
          <button
            onClick={() => setOpen(false)}
            className="text-[15px] font-bold text-[#1A064E] hover:underline"
          >
            Буцах
          </button>
          <Button
            className="bg-[#1A064E] hover:bg-[#250b6b] text-white rounded-[1.5rem] px-10 h-12 font-bold text-[15px] shadow-lg shadow-indigo-900/20"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Бүртгэх"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
