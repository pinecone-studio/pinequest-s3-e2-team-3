"use client";

import { UserCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";

export default function Navbar() {
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    "/": "Нүүр",
    "/schedule": "Хуваарь",
    "/my-classes": "Анги",
    "/exam": "Шалгалт",
    "/materials": "Шалгалтын материал",
    "/settings": "Тохиргоо",
  };

  const currentTitle = pageTitles[pathname] || "Ажилтны портал";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 sticky top-0 z-10">
      <div className="flex items-center justify-between w-full">
        <div className="text-sm font-medium text-slate-600 flex">
          <SidebarTrigger />
          <p className="mt-1 ">{currentTitle}</p>
        </div>
        <UserCircle2 />
      </div>
    </header>
  );
}
