"use client";

import { useEffect, useState } from "react";

type EventRow = { id: string; type: string; label: string; expiresAt: string };
type Presets = Record<string, { label: string; hours: number }>;

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [presets, setPresets] = useState<Presets>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setEvents(data.events ?? []);
    setPresets(data.presets ?? {});
  }

  useEffect(() => {
    load();
  }, []);

  async function trigger(type: string) {
    setBusy(type);
    await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setBusy(null);
    load();
  }

  // eslint-disable-next-line react-hooks/purity -- filtering by wall-clock time for display only, not used for memoization
  const active = events.filter((e) => new Date(e.expiresAt).getTime() > Date.now());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">랜덤 이벤트</h1>
      <p className="text-sm text-black/60">클릭 한 번으로 전체 팀에게 24시간 동안 적용되는 이벤트를 발동합니다.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {Object.entries(presets).map(([type, preset]) => (
          <button
            key={type}
            disabled={busy === type}
            onClick={() => trigger(type)}
            className="rounded-2xl bg-white shadow p-5 text-left hover:bg-ssyu-yellow/20 transition disabled:opacity-50"
          >
            <div className="text-lg font-bold">{preset.label}</div>
            <div className="text-xs text-black/50 mt-1">{preset.hours}시간 동안 전체 팀 적용</div>
          </button>
        ))}
      </div>

      <div>
        <h2 className="font-bold mb-2">현재 활성 이벤트</h2>
        {active.length === 0 && <p className="text-sm text-black/50">진행 중인 이벤트가 없습니다.</p>}
        <div className="space-y-2">
          {active.map((e) => (
            <div key={e.id} className="rounded-xl bg-white shadow p-3 flex items-center justify-between text-sm">
              <span>{e.label}</span>
              <span className="text-black/40">~{new Date(e.expiresAt).toLocaleString("ko-KR")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
