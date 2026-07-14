"use client";

import { useEffect, useState } from "react";

type Mission = {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  coinReward: number;
  requiresPhoto: boolean;
  active: boolean;
};

const CATEGORIES = [
  { value: "BAEKNYEON", label: "백년가게" },
  { value: "ONNURI", label: "온누리" },
  { value: "MARKET", label: "전통시장" },
  { value: "TEAM", label: "팀미션" },
  { value: "POLICY_EVENT", label: "정책행사" },
  { value: "OTHER", label: "기타" },
];

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [form, setForm] = useState({ title: "", description: "", category: "OTHER", xpReward: 30, coinReward: 30, requiresPhoto: true });

  async function load() {
    const res = await fetch("/api/admin/missions");
    const data = await res.json();
    setMissions(data.missions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", category: "OTHER", xpReward: 30, coinReward: 30, requiresPhoto: true });
    load();
  }

  async function update(id: string, data: Partial<Mission>) {
    await fetch(`/api/admin/missions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">미션 관리</h1>

      <form onSubmit={create} className="rounded-2xl bg-white p-4 shadow space-y-3">
        <h2 className="font-bold">새 미션 추가</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="rounded-lg border px-3 py-2" placeholder="미션 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="rounded-lg border px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="number" className="rounded-lg border px-3 py-2" placeholder="XP" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} />
          <input type="number" className="rounded-lg border px-3 py-2" placeholder="코인" value={form.coinReward} onChange={(e) => setForm({ ...form, coinReward: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.requiresPhoto} onChange={(e) => setForm({ ...form, requiresPhoto: e.target.checked })} />
            사진 인증 필요
          </label>
        </div>
        <button className="rounded-xl bg-ssyu-brown text-white font-bold px-4 py-2">추가</button>
      </form>

      <div className="grid gap-3">
        {missions.map((m) => (
          <div key={m.id} className={`rounded-2xl bg-white shadow p-4 flex flex-wrap items-center gap-3 ${!m.active ? "opacity-50" : ""}`}>
            <div className="flex-1 min-w-[140px]">
              <div className="font-bold">{m.title}</div>
              <div className="text-xs text-black/50">{CATEGORIES.find((c) => c.value === m.category)?.label}</div>
            </div>
            <label className="text-xs text-black/60">XP
              <input type="number" defaultValue={m.xpReward} className="ml-1 w-16 rounded border px-2 py-1" onBlur={(e) => update(m.id, { xpReward: Number(e.target.value) })} />
            </label>
            <label className="text-xs text-black/60">코인
              <input type="number" defaultValue={m.coinReward} className="ml-1 w-16 rounded border px-2 py-1" onBlur={(e) => update(m.id, { coinReward: Number(e.target.value) })} />
            </label>
            <button
              onClick={() => update(m.id, { active: !m.active })}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/10"
            >
              {m.active ? "비활성화" : "활성화"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
