"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { EquippedItem } from "@/components/SsyuAvatar";

export type Me = {
  id: string;
  code: string;
  name: string;
  region: string;
  xp: number;
  coins: number;
  level: number;
  levelName: string;
  levelEmoji: string;
  nextLevel: { level: number; name: string; xpRequired: number } | null;
  xpInto: number;
  xpSpan: number;
  xpRatio: number;
  items: EquippedItem[];
  badgeCount: number;
};

type MeContextValue = {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const MeContext = createContext<MeContextValue>({ me: null, loading: true, refresh: async () => {} });

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.ok) {
      setMe(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    fetch("/api/attendance", { method: "POST" }).catch(() => {});
  }, [refresh]);

  return <MeContext.Provider value={{ me, loading, refresh }}>{children}</MeContext.Provider>;
}

export function useMe() {
  return useContext(MeContext);
}
