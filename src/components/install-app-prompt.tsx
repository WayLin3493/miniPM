"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "minipm-install-dismissed";
const DISMISS_DAYS = 7;

function isStandaloneMode() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(nav.standalone);
}

function isIosSafari() {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  return isIos && isSafari;
}

function isDismissedRecently() {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
  if (!dismissedAt) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [standalone, setStandalone] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    setShowIosTip(isIosSafari());
    setDismissed(isDismissedRecently());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      if (!isDismissedRecently()) {
        setDismissed(false);
      }
    };

    const onAppInstalled = () => {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      setDismissed(true);
      setStandalone(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canShow = useMemo(() => !standalone && !dismissed && (installEvent || showIosTip), [dismissed, installEvent, showIosTip, standalone]);

  if (!canShow) return null;

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      setDismissed(true);
    }
    setInstallEvent(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  return (
    <div className="fixed inset-x-0 bottom-[5.8rem] z-30 mx-auto w-full max-w-[480px] px-4">
      <div className="island-card flex items-center gap-3 rounded-[1.5rem] border-leaf-200 bg-white/94 p-3 shadow-soft">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-leaf-500 text-white shadow-button">
          {installEvent ? <Download className="h-5 w-5" /> : <Share className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">安装 MiniPM</p>
          <p className="mt-0.5 text-xs font-bold leading-5 text-slate-500">
            {installEvent ? "放到手机桌面，打开更像 App。" : "iPhone 可通过分享菜单添加到主屏幕。"}
          </p>
        </div>
        {installEvent ? (
          <button className="pressable rounded-2xl bg-leaf-500 px-4 py-2 text-sm font-black text-white shadow-button" type="button" onClick={install}>
            安装
          </button>
        ) : null}
        <button aria-label="关闭安装提示" className="rounded-full p-2 text-slate-400" type="button" onClick={dismiss}>
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
