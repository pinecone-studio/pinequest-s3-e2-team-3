"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LayoutGrid,
  FileText,
  Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { title: "Нүүр", icon: LayoutDashboard, path: "/" },
    { title: "Хуваарь", icon: Calendar, path: "/schedule" },
    { title: "Анги", icon: Users, path: "/classes" },
    { title: "Шалгалт", icon: LayoutGrid, path: "/exam" },
    { title: "Шалгалтын материал", icon: FileText, path: "/materials" },
    { title: "Тохиргоо", icon: Settings, path: "/settings" },
  ];

  const renderMenuItems = (items: typeof menuItems) =>
    items.map((item) => {
      const isActive = pathname === item.path;
      return (
        <SidebarMenuItem key={item.title}>
          <div
            onClick={() => item.path && router.push(item.path)}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 transition-all duration-300 group cursor-pointer mx-3",

              isActive
                ? "bg-gradient-to-l from-white/35 via-white/15 to-transparent rounded-xl shadow-sm backdrop-blur-sm"
                : "hover:bg-white/10 rounded-xl",
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-colors",
                isActive
                  ? "text-white"
                  : "text-white/70 group-hover:text-white",
              )}
            />
            <span
              className={cn(
                "flex-1 font-medium text-[16px] transition-colors",
                isActive
                  ? "text-white"
                  : "text-white/70 group-hover:text-white",
              )}
            >
              {item.title}
            </span>
          </div>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar className="border-none overflow-hidden rounded-r-[40px] ">
      <SidebarHeader className="p-8 bg-[#5D5692]">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full border-2  flex items-center justify-center bg-white">
            <div className="h-5 w-5 rounded-sm border-2 border-slate-400" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Learning.M.S
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#5D5692] text-white px-0 pt-2">
        <SidebarMenu className="gap-1">
          {renderMenuItems(menuItems)}
        </SidebarMenu>
      </SidebarContent>

      <div className="bg-[#5D5692] p-6 mt-auto">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
          <div className="h-10 w-10 rounded-full bg-black border-2 border-sky-400 overflow-hidden shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              Д. Булгантуяа
            </span>
            <span className="text-[10px] text-white/50 truncate">
              Математикийн багш
            </span>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
