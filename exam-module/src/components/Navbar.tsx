"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";
import { LogOut, ChevronDown } from "lucide-react";

interface StoredUser {
  name: string;
  lastName: string;
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

function getInitials(name: string, lastName: string) {
  return `${(name[0] ?? "").toUpperCase()}${(lastName[0] ?? "").toUpperCase()}`;
}

const PAGE_TITLES: Record<string, string> = {
  "/my-classes": "Анги",
  "/exam": "Шалгалт",
  "/materials": "Шалгалтын материал",
  "/employees": "Ажилтнууд",
  "/library": "Номын сан",
  "/admin": "Админ",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(() => readUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onStorage = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const title = PAGE_TITLES[pathname] ?? "Ажилтны портал";
  const initials = user ? getInitials(user.name, user.lastName) : "?";
  const fullName = user ? `${user.name} ${user.lastName}` : "";
  const roleName = user?.role === "manager" ? "Менежер" : "Багш";

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    router.replace("/login");
  };

  return (
    <header className="flex h-14 items-center gap-4  bg-[#F3F3F8] px-4 sm:px-6 sticky top-0 z-10 w-full shadow-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left — sidebar trigger + page title */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
            {title}
          </h1>
        </div>

        {/* Right — avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {/* Avatar circle */}
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm ring-2 ring-white">
              <span className="text-[11px] font-bold text-white leading-none">
                {initials}
              </span>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-slate-700 leading-tight">
                {fullName || "Хэрэглэгч"}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {roleName}
              </span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 z-50">
              {/* User info section */}
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">{roleName}</p>
              </div>
              {/* Logout */}
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Гарах
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
