type OneSignalGlobal = {
  push: (...args: any[]) => void;
};

declare global {
  interface Window {
    OneSignal?: OneSignalGlobal;
  }
}

const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "";

export async function initOneSignal(externalUserId?: string) {
  if (!appId || typeof window === "undefined") {
    return { ok: false, message: "OneSignal not configured" };
  }

  // Load SDK if not already present
  if (!window.OneSignal) {
    await loadScript("https://cdn.onesignal.com/sdks/OneSignalSDK.js");
  }
  const OneSignal = window.OneSignal || (window.OneSignal = { push: () => undefined });

  OneSignal.push(function () {
    OneSignal.push(["init", { appId, safari_web_id: undefined }]);
    if (externalUserId) {
      OneSignal.push(["setExternalUserId", externalUserId]);
    }
  });

  OneSignal.push(() => {
    OneSignal.push(["registerForPushNotifications"]);
  });

  return { ok: true, message: "Push notification prompt sent" };
}

async function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}
