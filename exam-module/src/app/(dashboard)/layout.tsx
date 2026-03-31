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
      <AppSidebar />

      <div className="flex flex-col flex-1 min-h-screen bg-slate-50/30 min-w-0 relative">
        <Navbar />

        <main className="w-full px-3 sm:px-8 py-6 sm:py-8">
          <ServiceWorkerRegister />
          {children}
          <Toaster richColors position="top-right" />
        </main>
      </div>
    </SidebarProvider>
  );
}
