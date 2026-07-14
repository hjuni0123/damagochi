"use client";

import { useEffect, useState } from "react";

type Team = { id: string; code: string; name: string; region: string; xp: number; coins: number };

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({ code: "", name: "", region: "", password: "ssyu1234" });
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/teams");
    const data = await res.json();
    setTeams(data.teams ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "생성 실패");
      return;
    }
    setForm({ code: "", name: "", region: "", password: "ssyu1234" });
    load();
  }

  async function updateField(id: string, field: "xp" | "coins", value: number) {
    await fetch(`/api/admin/teams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">팀 관리</h1>

      <form onSubmit={createTeam} className="rounded-2xl bg-white p-4 shadow space-y-3">
        <h2 className="font-bold">새 팀 추가</h2>
        <div className="grid grid-cols-2 gap-2">
          <input className="rounded-lg border px-3 py-2" placeholder="로그인 코드 (예: seoul)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="팀 이름 (예: 서울청)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="권역 (예: 서울)" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="초기 비밀번호" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="rounded-xl bg-ssyu-brown text-white font-bold px-4 py-2">추가</button>
      </form>

      <div className="rounded-2xl bg-white shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-black/50 border-b">
              <th className="p-3">코드</th>
              <th className="p-3">팀명</th>
              <th className="p-3">권역</th>
              <th className="p-3">XP</th>
              <th className="p-3">코인</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3 font-mono">{t.code}</td>
                <td className="p-3 font-semibold">{t.name}</td>
                <td className="p-3">{t.region}</td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={t.xp}
                    className="w-20 rounded border px-2 py-1"
                    onBlur={(e) => updateField(t.id, "xp", Number(e.target.value))}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={t.coins}
                    className="w-20 rounded border px-2 py-1"
                    onBlur={(e) => updateField(t.id, "coins", Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
