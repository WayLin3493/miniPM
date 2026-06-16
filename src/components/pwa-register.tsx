"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    const canRegister = process.env.NODE_ENV === "production" && "serviceWorker" in navigator && window.isSecureContext;
    if (canRegister) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);
  return null;
}
