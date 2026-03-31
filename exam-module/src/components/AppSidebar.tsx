"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Users, LayoutGrid, FileText, BookOpen, UserCog } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StoredUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
}

function readUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(() => readUser());
  const [ready, setReady] = useState(false);

  // Mark ready after first client render and subscribe to storage events
  useEffect(() => {
    // Re-read in case SSR snapshot differs
    const current = readUser();
    if (JSON.stringify(current) !== JSON.stringify(user)) {
      setUser(current);
    }
    setReady(true);

    const onStorage = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to login if no user is found after mount
  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, user, router]);

  const userRole = user?.role ?? null;
 

  const allMenuItems = [
    {
      title: "Анги",
      icon: Users,
      path: "/my-classes",
      roles: ["manager", "teacher"],
    },
    {
      title: "Шалгалт",
      icon: LayoutGrid,
      path: "/exam",
      roles: ["manager", "teacher"],
    },
    {
      title: "Шалгалтын материал",
      icon: FileText,
      path: "/materials",
      roles: ["manager", "teacher"],
    },
    {
      title: "Ажилтнууд",
      icon: UserCog,
      path: "/employees",
      roles: ["manager"],
    },
    {
      title: "Номын сан",
      icon: BookOpen,
      path: "/library",
      roles: ["manager"],
    },
  ];

  // Only show items matching the user's role; hide everything until ready
  const menuItems = useMemo(() => {
    if (!ready || !userRole) return [];
    return allMenuItems.filter((item) => item.roles.includes(userRole));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userRole]);

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
                ? "bg-[#E1DFF9] from-[#E1DFF9]/35 via-[#E1DFF9]/15 to-transparent rounded-xl shadow-sm backdrop-blur-sm"
                : "hover:bg-[#E1DFF9]/10 rounded-xl",
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-colors",
                isActive
                  ? "text-[#16033D]"
                  : "text-[#16033D]/70 group-hover:text-[#16033D]",
              )}
            />
            <span
              className={cn(
                "flex-1 font-medium text-[16px] transition-colors",
                isActive
                  ? "text-[#16033D]"
                  : "text-[#16033D]/70 group-hover:text-[#16033D",
              )}
            >
              {item.title}
            </span>
          </div>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar className="border-none overflow-hidden  ">
      <SidebarHeader className="p-8 bg-[#F3F3F8]">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full border-2  flex items-center justify-center bg-white">
            <div className="h-5 w-5 rounded-sm border-2 border-slate-400" />
          </div>
          <span className="font-bold text-lg text-[#16033D] tracking-tight">
            LMS 3.0
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#F3F3F8] text-[#16033D] px-0 pt-2">
        <SidebarMenu className="gap-1">
          {renderMenuItems(menuItems)}
        </SidebarMenu>
      </SidebarContent>

      
    </Sidebar>
  );
}
