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
  likes: number;
  achievements: number;
  submissions: number;
  items: EquippedItem[];
};

const TABS = [
  { value: "growth", label: "성장랭킹", metric: (r: RankingRow) => `Lv.${r.level}` },
  { value: "decoration", label: "꾸미기랭킹", metric: (r: RankingRow) => `❤️ ${r.likes}` },
  { value: "achievement", label: "업적랭킹", metric: (r: RankingRow) => `🏅 ${r.achievements}` },
  { value: "participation", label: "참여랭킹", metric: (r: RankingRow) => `📸 ${r.submissions}` },
];

const MEDAL = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const [tab, setTab] = useState("growth");
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ranking?type=${tab}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.ranking ?? []);
        setLoading(false);
      });
  }, [tab]);

  const activeTab = TABS.find((t) => t.value === tab)!;

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-display text-xl">랭킹</h1>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-display text-sm transition ${
              tab === t.value ? "bg-ssyu-brown text-white shadow-sm" : "bg-white border border-ssyu-brown/10 text-ssyu-brown/45"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-ssyu-brown/40">불러오는 중...</p>}

      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={r.teamId} className="card p-3 flex items-center gap-3">
            <span className="w-7 text-center font-extrabold text-lg">{MEDAL[idx] ?? idx + 1}</span>
            <SsyuAvatar level={r.level} items={r.items} size={48} animate={false} className="rounded-xl" />
            <div className="flex-1">
              <div className="font-bold text-sm">{r.name}</div>
              <div className="text-xs text-ssyu-brown/40">{r.region} · {r.levelName}</div>
            </div>
            <div className="font-extrabold text-ssyu-orange">{activeTab.metric(r)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
