"use client";

import { useEffect, useState } from "react";

type TeamQuest = {
  id: string;
  progress: number;
  completed: boolean;
  quest: { title: string; description: string; targetCount: number; xpReward: number; coinReward: number; type: string };
};

function QuestList({ list }: { list: TeamQuest[] }) {
  if (list.length === 0) return <p className="text-sm text-black/40">배정된 퀘스트가 없습니다.</p>;
  return (
    <div className="space-y-2">
      {list.map((tq) => (
        <div key={tq.id} className={`rounded-2xl p-4 shadow-sm ${tq.completed ? "bg-ssyu-mint/20" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold">{tq.completed ? "✅" : "🎯"} {tq.quest.title}</span>
            <span className="text-xs font-bold text-black/40">{tq.progress}/{tq.quest.targetCount}</span>
          </div>
          <p className="text-xs text-black/50 mt-1">{tq.quest.description}</p>
          <div className="text-xs font-bold text-ssyu-orange mt-1">+{tq.quest.xpReward}XP · +{tq.quest.coinReward}🪙</div>
        </div>
      ))}
    </div>
  );
}

export default function QuestsPage() {
  const [daily, setDaily] = useState<TeamQuest[]>([]);
  const [weekly, setWeekly] = useState<TeamQuest[]>([]);

  useEffect(() => {
    fetch("/api/quests")
      .then((r) => r.json())
      .then((d) => {
        setDaily(d.daily ?? []);
        setWeekly(d.weekly ?? []);
      });
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">퀘스트</h1>
      <section>
        <h2 className="font-bold mb-2">일일 퀘스트</h2>
        <QuestList list={daily} />
      </section>
      <section>
        <h2 className="font-bold mb-2">주간 퀘스트</h2>
        <QuestList list={weekly} />
      </section>
    </div>
  );
}
