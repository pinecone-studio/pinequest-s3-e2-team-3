"use client";

import React from "react";
import { SidebarProvider } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/AppSidebar";
import ServiceWorkerRegister from "../../components/ServiceWorkerRegister";
import Navbar from "../../components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#F3F3F8] overflow-hidden">
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0 relative h-full">
          <Navbar />
          <main className="flex-1 bg-white rounded-tl-[70px] shadow-sm ml-7 overflow-y-auto transition-all duration-300">
            <div className=" py-8  min-h-full">
              <ServiceWorkerRegister />
              {children}
            </div>
            <Toaster richColors position="top-right" />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
