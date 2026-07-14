"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  const [daily, setDaily] = useState<TeamQuest[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetch("/api/quests").then((r) => r.json()).then((d) => setDaily(d.daily ?? []));
    fetch("/api/activity").then((r) => r.json()).then((d) => setActivity((d.logs ?? []).slice(0, 5)));
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

  return (
    <div className="px-4 pt-1 pb-4 space-y-4">
      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden p-5 pt-6 flex flex-col items-center text-center"
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ssyu-yellow/25 to-transparent" />
        <div className="relative font-display text-sm text-white bg-ssyu-orange px-4 py-1 rounded-full shadow-sm mb-3">
          Lv.{me.level} · {me.levelName}
        </div>
        <div className="relative rounded-full p-1.5 bg-gradient-to-b from-ssyu-yellow/70 to-ssyu-orange/40 shadow-inner">
          <SsyuAvatar level={me.level} items={me.items} size={190} className="!rounded-full" />
        </div>
        <h1 className="font-display text-xl mt-3">{me.name} 쓔</h1>

        {/* xp bar */}
        <div className="w-full mt-3">
          <div className="flex justify-between items-baseline font-display text-[12px] text-ssyu-brown/50 mb-1 px-0.5">
            <span>XP {me.xp.toLocaleString()}</span>
            <span>
              {me.nextLevel ? `다음 레벨까지 ${(me.xpSpan - me.xpInto).toLocaleString()}` : "최고 레벨!"}
            </span>
          </div>
          <div className="relative h-4 w-full rounded-full bg-ssyu-brown/8 border border-ssyu-brown/8 overflow-hidden">
            <motion.div
              className="xp-shine relative h-full rounded-full bg-gradient-to-r from-ssyu-yellow to-ssyu-orange"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(4, Math.round(me.xpRatio * 100))}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-4 w-full">
          <div className="flex-1 rounded-2xl bg-ssyu-yellow/15 border border-ssyu-yellow/40 py-2.5">
            <div className="font-display text-lg">🪙 {me.coins.toLocaleString()}</div>
            <div className="text-[11px] text-ssyu-brown/50">쓔코인</div>
          </div>
          <div className="flex-1 rounded-2xl bg-ssyu-mint/10 border border-ssyu-mint/30 py-2.5">
            <div className="font-display text-lg">🏅 {me.badgeCount}</div>
            <div className="text-[11px] text-ssyu-brown/50">획득 배지</div>
          </div>
        </div>
      </motion.div>

      {/* cta */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/missions" className="btn-game bg-ssyu-orange text-white py-3.5 text-center text-[15px]">
          📸 미션 인증하기
        </Link>
        <Link href="/shop" className="btn-game bg-ssyu-purple text-white py-3.5 text-center text-[15px]">
          🎨 쓔 꾸미기
        </Link>
      </div>

      {/* quests */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-display text-[15px]">
            오늘의 퀘스트 <span className="text-ssyu-orange">{doneCount}/{daily.length}</span>
          </h2>
          <Link href="/quests" className="font-display text-xs text-ssyu-brown/40">
            전체보기 ›
          </Link>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence>
            {daily.map((tq) => (
              <motion.div
                key={tq.id}
                layout
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] border ${
                  tq.completed
                    ? "bg-ssyu-mint/10 border-ssyu-mint/30"
                    : "bg-ssyu-cream border-ssyu-brown/8"
                }`}
              >
                <span className={tq.completed ? "line-through text-ssyu-brown/35" : ""}>
                  {tq.completed ? "✅" : "🎯"} {tq.quest.title}
                </span>
                <span className="font-display text-[11px] text-ssyu-brown/40">
                  {tq.progress}/{tq.quest.targetCount}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {daily.length === 0 && <p className="text-sm text-ssyu-brown/35">퀘스트를 불러오는 중...</p>}
        </div>
      </div>

      {/* activity */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-[15px]">🔔 소식</h2>
          <Link href="/notifications" className="font-display text-xs text-ssyu-brown/40">
            전체보기 ›
          </Link>
        </div>
        <div className="space-y-2">
          {activity.map((log) => (
            <p key={log.id} className="text-[12px] text-ssyu-brown/60 leading-snug">
              {log.message}
            </p>
          ))}
          {activity.length === 0 && <p className="text-sm text-ssyu-brown/35">아직 소식이 없어요.</p>}
        </div>
      </div>
    </div>
  );
}
