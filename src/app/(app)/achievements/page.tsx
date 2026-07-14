"use client";

import { useEffect, useState } from "react";

type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  coinReward: number;
  unlocked: boolean;
};

export default function AchievementsPage() {
  const [list, setList] = useState<Achievement[]>([]);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => setList(d.achievements ?? []));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">업적</h1>
      <p className="text-sm text-black/50">숨겨진 업적을 찾아 달성해보세요!</p>
      <div className="grid grid-cols-2 gap-3">
        {list.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl p-4 text-center shadow-sm ${a.unlocked ? "bg-white" : "bg-black/[0.03] grayscale"}`}
          >
            <div className="text-3xl mb-1">{a.unlocked ? a.icon : "🔒"}</div>
            <div className="font-bold text-sm">{a.title}</div>
            <div className="text-xs text-black/50 mt-1">{a.description}</div>
            {a.unlocked && <div className="text-xs font-bold text-ssyu-orange mt-1">+{a.coinReward}🪙</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
