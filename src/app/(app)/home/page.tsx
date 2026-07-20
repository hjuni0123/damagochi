"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SsyuAvatar from "@/components/SsyuAvatar";
import { useMe } from "@/lib/meContext";

type TeamQuest = {
  id: string;
  progress: number;
  completed: boolean;
  quest: { title: string; targetCount: number; xpReward: number; coinReward: number; type: string };
};

type ActivityLog = { id: string; message: string; createdAt: string; type: string };

export default function HomePage() {
  const { me, loading } = useMe();
  const router = useRouter();
  const [daily, setDaily] = useState<TeamQuest[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/quests").then((r) => r.json()).then((d) => setDaily(d.daily ?? []));
    fetch("/api/activity").then((r) => r.json()).then((d) => setActivity((d.logs ?? []).slice(0, 4)));
    const t = setInterval(() => setTick((v) => v + 1), 4000);
    return () => clearInterval(t);
  }, []);

  if (loading || !me) {
    return (
      <div className="p-10 flex flex-col items-center gap-3 text-ssyu-brown/40">
        <span className="text-4xl animate-bounce">🥚</span>
        <span className="font-display">쓔를 깨우는 중...</span>
      </div>
    );
  }

  const doneCount = daily.filter((q) => q.completed).length;
  const statusLines = [
    `${me.name} 쓔`,
    me.nextLevel ? `NEXT LV ${me.xpSpan - me.xpInto}XP` : "MAX LEVEL!",
    `퀘스트 ${doneCount}/${daily.length}`,
    activity[0]?.message ?? "오늘도 무럭무럭!",
  ];

  return (
    <div className="px-4 pt-1 pb-4 space-y-4">
      {/* ===== Tamagotchi device ===== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
        <div className="tama-shell w-full max-w-[340px] px-7 pt-8 pb-6">
          {/* brand */}
          <div className="text-center font-pixel text-[10px] text-[#8a4a1f] tracking-widest mb-3">SSYU · {me.code.toUpperCase()}</div>

          {/* screen */}
          <div className="tama-bezel">
            <div className="tama-lcd px-3 pt-2 pb-2.5">
              {/* status bar */}
              <div className="relative z-[1] flex items-center justify-between font-pixel text-[9px]">
                <span>LV.{me.level}</span>
                <span>🪙{me.coins}</span>
              </div>

              {/* character */}
              <div className="relative z-[1] flex justify-center py-0.5">
                <div className="animate-pixel-walk" style={{ imageRendering: "pixelated" }}>
                  <SsyuAvatar level={me.level} items={me.items} size={150} bare />
                </div>
              </div>

              {/* xp hearts */}
              <div className="relative z-[1] flex justify-center gap-1 text-[11px] mb-1" aria-label="XP">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ opacity: me.xpRatio * 5 > i ? 1 : 0.22 }}>❤️</span>
                ))}
              </div>

              {/* scrolling status line */}
              <div className="relative z-[1] border-t-2 border-[#8a9b62]/60 pt-1.5 text-center">
                <span key={tick % statusLines.length} className="tama-lcd-text text-[10px] animate-pop inline-block">
                  {statusLines[tick % statusLines.length]}
                </span>
              </div>
            </div>
          </div>

          {/* physical buttons */}
          <div className="flex justify-center items-end gap-7 mt-5">
            {[
              { label: "미션", href: "/missions", icon: "📸" },
              { label: "꾸미기", href: "/shop", icon: "🎨" },
              { label: "랭킹", href: "/ranking", icon: "🏆" },
            ].map((b, i) => (
              <div key={b.href} className={`flex flex-col items-center gap-1.5 ${i === 1 ? "-mb-1" : ""}`}>
                <button onClick={() => router.push(b.href)} className="tama-btn text-xl" aria-label={b.label}>
                  {b.icon}
                </button>
                <span className="font-pixel text-[8px] text-[#8a4a1f]">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* quests */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-display text-[15px]">
            오늘의 퀘스트 <span className="text-ssyu-orange">{doneCount}/{daily.length}</span>
          </h2>
          <Link href="/quests" className="font-display text-xs text-ssyu-brown/40">전체보기 ›</Link>
        </div>
        <div className="space-y-1.5">
          {daily.map((tq) => (
            <div
              key={tq.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] border ${
                tq.completed ? "bg-ssyu-mint/10 border-ssyu-mint/30" : "bg-ssyu-cream border-ssyu-brown/8"
              }`}
            >
              <span className={tq.completed ? "line-through text-ssyu-brown/35" : ""}>
                {tq.completed ? "✅" : "🎯"} {tq.quest.title}
              </span>
              <span className="font-display text-[11px] text-ssyu-brown/40">
                {tq.progress}/{tq.quest.targetCount}
              </span>
            </div>
          ))}
          {daily.length === 0 && <p className="text-sm text-ssyu-brown/35">퀘스트를 불러오는 중...</p>}
        </div>
      </div>

      {/* activity */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-[15px]">🔔 소식</h2>
          <Link href="/notifications" className="font-display text-xs text-ssyu-brown/40">전체보기 ›</Link>
        </div>
        <div className="space-y-2">
          {activity.map((log) => (
            <p key={log.id} className="text-[12px] text-ssyu-brown/60 leading-snug">{log.message}</p>
          ))}
          {activity.length === 0 && <p className="text-sm text-ssyu-brown/35">아직 소식이 없어요.</p>}
        </div>
      </div>
    </div>
  );
}
