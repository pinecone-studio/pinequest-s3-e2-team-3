import React from "react";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/AppSidebar";
import ServiceWorkerRegister from "../../components/ServiceWorkerRegister";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <div className="flex flex-col flex-1 min-h-screen bg-slate-50/30 min-w-0 relative">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6 sticky top-0 z-10 w-full shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center text-sm font-medium text-slate-800">
              <SidebarTrigger />
              <h1 className="mt-1 ml-4 text-lg font-semibold">
                Ажилтны портал
              </h1>
            </div>
          </div>
        </header>

        <main className="w-full px-3 sm:px-8 py-6 sm:py-8">
          <ServiceWorkerRegister />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
