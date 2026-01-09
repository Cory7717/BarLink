"use client";

import { useEffect } from "react";
import { logAnalyticsEvent } from "@/lib/analytics";

export default function BarProfileClient({ barId }: { barId: string }) {
  useEffect(() => {
    logAnalyticsEvent(barId, "profile_view", "profile");
  }, [barId]);

  return null;
}
