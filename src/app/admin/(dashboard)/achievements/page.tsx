"use client";

import { useEffect, useState } from "react";

type Achievement = {
  id: string;
  key: string;
  title: string;
  hiddenHint: string;
  description: string;
  icon: string;
  coinReward: number;
  conditionType: string;
  conditionCategory: string | null;
  conditionCount: number;
};

const CONDITIONS = [
  { value: "MISSION_CATEGORY_COUNT", label: "특정 카테고리 미션 N회" },
  { value: "TOTAL_SUBMISSIONS", label: "전체 미션 인증 N회" },
  { value: "DAILY_STREAK", label: "N일 연속 활동" },
  { value: "TEAM_ALL_QUESTS", label: "퀘스트 전체 완료" },
];

const CATEGORIES = ["BAEKNYEON", "ONNURI", "MARKET", "TEAM", "POLICY_EVENT", "OTHER"];

export default function AchievementsPage() {
  const [list, setList] = useState<Achievement[]>([]);
  const [form, setForm] = useState({
    key: "",
    title: "",
    hiddenHint: "???",
    description: "",
    icon: "🏆",
    coinReward: 100,
    conditionType: "MISSION_CATEGORY_COUNT",
    conditionCategory: "BAEKNYEON",
    conditionCount: 3,
  });

  async function load() {
    const res = await fetch("/api/admin/achievements");
    const data = await res.json();
    setList(data.achievements ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...form, key: "", title: "", description: "" });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/achievements/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">업적 관리</h1>
      <p className="text-sm text-black/60">업적은 사용자 화면에서 달성 전까지 &quot;???&quot;로 숨겨집니다.</p>

      <form onSubmit={create} className="rounded-2xl bg-white p-4 shadow space-y-3">
        <h2 className="font-bold">새 업적 추가</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="rounded-lg border px-3 py-2" placeholder="고유 key (영문)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="업적 이름" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="숨김 힌트" value={form.hiddenHint} onChange={(e) => setForm({ ...form, hiddenHint: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="아이콘 이모지" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <input type="number" className="rounded-lg border px-3 py-2" placeholder="보상 코인" value={form.coinReward} onChange={(e) => setForm({ ...form, coinReward: Number(e.target.value) })} />
          <select className="rounded-lg border px-3 py-2" value={form.conditionType} onChange={(e) => setForm({ ...form, conditionType: e.target.value })}>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {form.conditionType === "MISSION_CATEGORY_COUNT" && (
            <select className="rounded-lg border px-3 py-2" value={form.conditionCategory} onChange={(e) => setForm({ ...form, conditionCategory: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <input type="number" className="rounded-lg border px-3 py-2" placeholder="달성 횟수" value={form.conditionCount} onChange={(e) => setForm({ ...form, conditionCount: Number(e.target.value) })} />
        </div>
        <button className="rounded-xl bg-ssyu-brown text-white font-bold px-4 py-2">추가</button>
      </form>

      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white shadow p-4 flex items-center gap-3">
            <span className="text-2xl">{a.icon}</span>
            <div className="flex-1">
              <div className="font-bold">{a.title}</div>
              <div className="text-xs text-black/50">{a.description} · +{a.coinReward} 코인</div>
            </div>
            <button onClick={() => remove(a.id)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-500">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
