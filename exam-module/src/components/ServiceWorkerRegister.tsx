"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[SW] registered, scope:", reg.scope);
        })
        .catch((err) => console.error("[SW] registration failed:", err));
    }

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
