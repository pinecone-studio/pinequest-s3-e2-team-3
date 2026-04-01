"use client";

import { useState, useEffect } from "react";
// Генератлагдсан төрлүүдийг импортлох
import {
  useUpdateStudentMutation,
  GetStudentsByClasssQuery,
} from "@/gql/graphql";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Array-аас нэг сурагчийн төрлийг салгаж авах (Unwrap type)
type StudentType = NonNullable<
  GetStudentsByClasssQuery["studentsByClass"]
>[number];

interface EditStudentProps {
  student: StudentType | null; // Сонгогдоогүй үед null байна
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditStudentDialog({
  student,
  open,
  onOpenChange,
  onSuccess,
}: EditStudentProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
      });
    }
  }, [student]);

  const [updateStudent, { loading }] = useUpdateStudentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      await updateStudent({
        variables: {
          id: student.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          // Хэрэв classId заавал шаардлагатай бол student.classId-г дамжуулна
        },
      });

      toast.success("Амжилттай шинэчлэгдлээ");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Алдаа гарлаа");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[1.2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Сурагчийн мэдээлэл засах
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-600 font-medium">
              Нэр
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-600 font-medium">
              Мэйл хаяг
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-600 font-medium">
              Утас
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-slate-500 hover:bg-slate-100"
            >
              Цуцлах
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#5D57D9] hover:bg-[#4c47c4] rounded-xl px-8 text-white transition-all shadow-md active:scale-95"
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
