"use client";

import { useEffect, useState } from "react";
import SsyuAvatar from "@/components/SsyuAvatar";
import type { EquippedItem } from "@/components/SsyuAvatar";

type RankingRow = {
  teamId: string;
  name: string;
  region: string;
  level: number;
  levelName: string;
  xp: number;
  items: EquippedItem[];
};

export default function HallOfFamePage() {
  const [rows, setRows] = useState<RankingRow[]>([]);

  useEffect(() => {
    fetch("/api/ranking?type=growth")
      .then((r) => r.json())
      .then((d) => setRows(d.ranking ?? []));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="text-center space-y-1 py-4">
        <div className="text-3xl">🎖️</div>
        <h1 className="text-xl font-bold">명예의 전당</h1>
        <p className="text-sm text-black/50">모두가 함께 키운 쓔들을 한자리에 모았습니다</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.teamId} className="rounded-3xl bg-gradient-to-b from-white to-ssyu-yellow/20 shadow p-3 flex flex-col items-center">
            <SsyuAvatar level={r.level} items={r.items} teamName={r.name} size={140} animate={false} />
            <div className="mt-2 text-xs font-bold text-ssyu-orange">Lv.{r.level} {r.levelName}</div>
            <div className="text-[11px] text-black/40">{r.region} · {r.xp} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}
