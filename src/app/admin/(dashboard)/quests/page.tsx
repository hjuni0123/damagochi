"use client";

import { useEffect, useState } from "react";

type Quest = {
  id: string;
  type: string;
  title: string;
  description: string;
  triggerType: string;
  category: string | null;
  targetCount: number;
  xpReward: number;
  coinReward: number;
  active: boolean;
};

const TRIGGERS = [
  { value: "SUBMISSION", label: "미션 인증" },
  { value: "COMMENT", label: "댓글 남기기" },
  { value: "ATTENDANCE", label: "출석" },
];

const CATEGORIES = ["", "BAEKNYEON", "ONNURI", "MARKET", "TEAM", "POLICY_EVENT", "OTHER"];

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [form, setForm] = useState({
    type: "DAILY",
    title: "",
    description: "",
    triggerType: "SUBMISSION",
    category: "",
    targetCount: 1,
    xpReward: 15,
    coinReward: 20,
  });

  async function load() {
    const res = await fetch("/api/admin/quests");
    const data = await res.json();
    setQuests(data.quests ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, category: form.category || undefined }),
    });
    setForm({ ...form, title: "", description: "" });
    load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/quests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">퀘스트 관리</h1>
      <p className="text-sm text-black/60">팀마다 매일/매주 활성 퀘스트 중 일부가 랜덤으로 배정됩니다.</p>

      <form onSubmit={create} className="rounded-2xl bg-white p-4 shadow space-y-3">
        <h2 className="font-bold">새 퀘스트 추가</h2>
        <div className="grid sm:grid-cols-3 gap-2">
          <select className="rounded-lg border px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="DAILY">일일</option>
            <option value="WEEKLY">주간</option>
          </select>
          <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 sm:col-span-3" placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="rounded-lg border px-3 py-2" value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })}>
            {TRIGGERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {form.triggerType === "SUBMISSION" && (
            <select className="rounded-lg border px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">전체 카테고리</option>
              {CATEGORIES.filter(Boolean).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <input type="number" className="rounded-lg border px-3 py-2" placeholder="XP" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} />
          <input type="number" className="rounded-lg border px-3 py-2" placeholder="코인" value={form.coinReward} onChange={(e) => setForm({ ...form, coinReward: Number(e.target.value) })} />
        </div>
        <button className="rounded-xl bg-ssyu-brown text-white font-bold px-4 py-2">추가</button>
      </form>

      <div className="grid gap-3">
        {quests.map((q) => (
          <div key={q.id} className={`rounded-2xl bg-white shadow p-4 flex items-center gap-3 ${!q.active ? "opacity-50" : ""}`}>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-ssyu-yellow/40">{q.type === "DAILY" ? "일일" : "주간"}</span>
            <div className="flex-1">
              <div className="font-bold">{q.title}</div>
              <div className="text-xs text-black/50">+{q.xpReward} XP · +{q.coinReward} 코인</div>
            </div>
            <button onClick={() => toggle(q.id, q.active)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/10">
              {q.active ? "비활성화" : "활성화"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
