"use client";

import { useEffect, useRef, useState } from "react";
import { useMe } from "@/lib/meContext";

type Mission = { id: string; title: string; description: string; category: string; xpReward: number; coinReward: number; requiresPhoto: boolean };
type Submission = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  photoUrl: string | null;
  xpAwarded: number;
  coinAwarded: number;
  mission: { title: string };
};

const CATEGORY_LABEL: Record<string, string> = {
  BAEKNYEON: "백년가게",
  ONNURI: "온누리",
  MARKET: "전통시장",
  TEAM: "팀미션",
  POLICY_EVENT: "정책행사",
  OTHER: "기타",
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: "심사중", className: "bg-ssyu-yellow/30 text-ssyu-brown" },
  APPROVED: { label: "승인됨", className: "bg-ssyu-mint/30 text-ssyu-brown" },
  REJECTED: { label: "반려됨", className: "bg-black/10 text-ssyu-brown/50" },
};

export default function MissionsPage() {
  const { refresh } = useMe();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Mission | null>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/missions");
    const data = await res.json();
    setMissions(data.missions ?? []);
    setSubmissions(data.submissions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    if (!selected) return;
    setSubmitting(true);
    setMessage("");
    const formData = new FormData();
    formData.append("missionId", selected.id);
    formData.append("caption", caption);
    if (file) formData.append("photo", file);

    const res = await fetch("/api/missions/submit", { method: "POST", body: formData });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setMessage(data.error ?? "제출에 실패했습니다.");
      return;
    }
    setSelected(null);
    setCaption("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await load();
    await refresh();
  }

  return (
    <div className="p-4 space-y-5">
      <h1 className="font-display text-xl">미션 인증</h1>

      <div className="grid gap-3">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="card p-4 text-left flex items-center justify-between hover:ring-2 hover:ring-ssyu-orange/40 transition"
          >
            <div>
              <div className="font-display text-[11px] text-white bg-ssyu-orange/90 inline-block px-2 py-0.5 rounded-full mb-1">{CATEGORY_LABEL[m.category] ?? m.category}</div>
              <div className="font-bold">{m.title}</div>
              <div className="text-xs text-ssyu-brown/50 mt-0.5">{m.description}</div>
            </div>
            <div className="text-right text-xs font-bold text-ssyu-brown/50 whitespace-nowrap">
              +{m.xpReward}XP
              <br />
              +{m.coinReward}🪙
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm card p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg">{selected.title}</h2>
            <p className="text-sm text-ssyu-brown/50">{selected.description}</p>
            {selected.requiresPhoto && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
            )}
            <textarea
              placeholder="한 줄 소감을 남겨보세요 (선택)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm resize-none"
              rows={2}
            />
            {message && <p className="text-sm text-red-500">{message}</p>}
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 rounded-xl bg-black/5 font-bold py-2.5">
                취소
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 btn-game bg-ssyu-orange text-white py-2.5 disabled:opacity-50"
              >
                {submitting ? "제출 중..." : "인증 제출"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-[15px] mb-2">내 인증 기록</h2>
        <div className="space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className="card p-3 flex items-center gap-3">
              {s.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-lg">📝</div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm">{s.mission.title}</div>
                <div className="text-xs text-ssyu-brown/40">{new Date(s.submittedAt).toLocaleDateString("ko-KR")}</div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_LABEL[s.status].className}`}>
                {STATUS_LABEL[s.status].label}
              </span>
            </div>
          ))}
          {submissions.length === 0 && <p className="text-sm text-ssyu-brown/40">아직 제출한 인증이 없습니다.</p>}
        </div>
      </div>
    </div>
  );
}
