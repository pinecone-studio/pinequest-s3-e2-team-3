"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";
import { LogOut, ChevronDown, ArrowRightLeft, Loader2 } from "lucide-react";
import { useLoginMutation } from "@/gql/graphql";

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

const DEMO_CREDENTIALS = {
  manager: { username: "user123", password: "pass123" },
  teacher: { username: "teacherUser", password: "teacherPass" },
} as const;

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(() => readUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loginMutation] = useLoginMutation();

  useEffect(() => {
    const onStorage = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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

  const initials = user ? getInitials(user.name, user.lastName) : "?";
  const fullName = user ? `${user.name} ${user.lastName}` : "";
  const isManager = user?.role === "manager";
  const roleName = isManager ? "Менежер" : "Багш";

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    router.replace("/login");
  };

  const handleSwitchRole = async () => {
    const target = isManager ? "teacher" : "manager";
    const creds = DEMO_CREDENTIALS[target];
    setSwitching(true);
    try {
      const { data } = await loginMutation({
        variables: { username: creds.username, password: creds.password },
      });
      const result = data?.login;
      if (result?.success && result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
        window.dispatchEvent(new Event("storage"));
        window.location.reload();
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="flex h-[48px] items-center bg-[#F3F3F8] px-4 sm:px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3"></div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSwitchRole}
            disabled={switching}
            title={isManager ? "Багш руу шилжих" : "Менежер рүү шилжих"}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
          >
            {switching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRightLeft className="h-3.5 w-3.5" />
            )}
            {isManager ? "Багш" : "Менежер"}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/50"
            >
              <div className="relative h-9 w-9 rounded-full bg-[#16033D] flex items-center justify-center shadow-sm border-2 border-white">
                <span className="text-[12px] font-bold text-white">
                  {initials}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-xl z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-slate-800">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-400">{roleName}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Гарах
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
