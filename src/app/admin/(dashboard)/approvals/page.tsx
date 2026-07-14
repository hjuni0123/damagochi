"use client";

import { useEffect, useState } from "react";

type Submission = {
  id: string;
  photoUrl: string | null;
  caption: string;
  submittedAt: string;
  mission: { title: string; category: string; xpReward: number; coinReward: number };
  team: { name: string; region: string };
};

export default function ApprovalsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/submissions?status=PENDING");
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id);
    await fetch(`/api/admin/submissions/${id}/${action}`, { method: "POST" });
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setBusyId(null);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">승인 대기 ({submissions.length})</h1>
      <p className="text-sm text-black/60">
        사진 확인 → 승인 클릭 한 번이면 XP·코인·업적·랭킹이 자동으로 반영됩니다.
      </p>

      {loading && <p className="text-black/50">불러오는 중...</p>}
      {!loading && submissions.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-black/50">대기 중인 인증이 없습니다 🎉</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {submissions.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white shadow overflow-hidden">
            {s.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.photoUrl} alt="인증 사진" className="w-full h-48 object-cover" />
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ssyu-brown">{s.team.name}</span>
                <span className="text-xs text-black/40">{new Date(s.submittedAt).toLocaleString("ko-KR")}</span>
              </div>
              <div className="text-sm font-semibold text-ssyu-orange">{s.mission.title}</div>
              {s.caption && <p className="text-sm text-black/70">{s.caption}</p>}
              <div className="text-xs text-black/50">+{s.mission.xpReward} XP · +{s.mission.coinReward} 코인</div>
              <div className="flex gap-2 pt-2">
                <button
                  disabled={busyId === s.id}
                  onClick={() => act(s.id, "approve")}
                  className="flex-1 rounded-xl bg-ssyu-mint text-white font-bold py-2 disabled:opacity-50"
                >
                  승인
                </button>
                <button
                  disabled={busyId === s.id}
                  onClick={() => act(s.id, "reject")}
                  className="flex-1 rounded-xl bg-black/10 text-ssyu-brown font-bold py-2 disabled:opacity-50"
                >
                  반려
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
