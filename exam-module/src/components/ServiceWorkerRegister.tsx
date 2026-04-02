"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register the service worker on the /active-exam page.
    // Registering it globally causes /_next/static/ assets to be served
    // from cache on ALL pages, which breaks hot-reloads and shows stale UI.
    if (!("serviceWorker" in navigator)) return;
    if (!window.location.pathname.startsWith("/active-exam")) {
      // If we're NOT on active-exam, unregister any existing SW so it
      // doesn't intercept static assets on other pages.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[SW] registered, scope:", reg.scope);
      })
      .catch((err) => console.error("[SW] registration failed:", err));

    // When coming back online, sync any offline-saved answers & proctor logs
    const handleOnline = async () => {
      try {
        const { syncOfflineAnswers, syncOfflineProctorLogs } =
          await import("@/app/active-exam/_components/useExamIntegrity");
        void syncOfflineAnswers();
        void syncOfflineProctorLogs();
      } catch (e) {
        console.warn("[ServiceWorkerRegister] sync error:", e);
      }
    };

    window.addEventListener("online", handleOnline);
    // Also try immediately in case we're already online and have pending data
    void handleOnline();

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
