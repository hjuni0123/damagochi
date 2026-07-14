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
    fetch("/api/activity").then((r) => r.json()).then((d) => setActivity((d.logs ?? []).slice(0, 6)));
  }, []);

  if (loading || !me) {
    return <div className="p-6 text-center text-black/40">불러오는 중...</div>;
  }

  return (
    <div className="p-4 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white shadow-sm p-5 flex flex-col items-center text-center"
      >
        <div className="text-xs font-bold text-ssyu-orange bg-ssyu-orange/10 px-3 py-1 rounded-full mb-2">
          Lv.{me.level} {me.levelName}
        </div>
        <SsyuAvatar level={me.level} items={me.items} teamName={me.name} size={180} />
        <div className="w-full mt-4">
          <div className="flex justify-between text-xs font-semibold text-black/50 mb-1">
            <span>XP</span>
            <span>
              {me.xpInto} / {me.xpSpan || "MAX"}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-black/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ssyu-yellow to-ssyu-orange"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(me.xpRatio * 100)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4 w-full">
          <div className="flex-1 rounded-2xl bg-ssyu-yellow/20 py-2.5">
            <div className="text-lg font-extrabold">🪙 {me.coins}</div>
            <div className="text-[11px] text-black/50 font-semibold">쓔코인</div>
          </div>
          <div className="flex-1 rounded-2xl bg-ssyu-mint/20 py-2.5">
            <div className="text-lg font-extrabold">🏅 {me.badgeCount}</div>
            <div className="text-[11px] text-black/50 font-semibold">획득 배지</div>
          </div>
        </div>
      </motion.div>

      <div className="rounded-3xl bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">오늘의 퀘스트</h2>
          <Link href="/quests" className="text-xs text-ssyu-orange font-semibold">
            전체보기
          </Link>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {daily.map((tq) => (
              <motion.div
                key={tq.id}
                layout
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                  tq.completed ? "bg-ssyu-mint/20" : "bg-black/[0.03]"
                }`}
              >
                <span className={tq.completed ? "line-through text-black/40" : "font-semibold"}>
                  {tq.completed ? "✅" : "⬜"} {tq.quest.title}
                </span>
                <span className="text-xs text-black/40">
                  {tq.progress}/{tq.quest.targetCount}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {daily.length === 0 && <p className="text-sm text-black/40">퀘스트를 불러오는 중...</p>}
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">실시간 알림</h2>
          <Link href="/notifications" className="text-xs text-ssyu-orange font-semibold">
            전체보기
          </Link>
        </div>
        <div className="space-y-1.5">
          {activity.map((log) => (
            <p key={log.id} className="text-xs text-black/60">
              {log.message}
            </p>
          ))}
          {activity.length === 0 && <p className="text-sm text-black/40">아직 알림이 없습니다.</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/missions" className="rounded-2xl bg-ssyu-orange text-white font-bold py-4 text-center shadow-sm">
          📸 미션 인증하기
        </Link>
        <Link href="/shop" className="rounded-2xl bg-ssyu-purple text-white font-bold py-4 text-center shadow-sm">
          🎨 쓔 꾸미기
        </Link>
      </div>
    </div>
  );
}
