"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SsyuAvatar from "@/components/SsyuAvatar";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/team/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "로그인에 실패했습니다.");
      return;
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gradient-to-b from-ssyu-yellow/30 via-ssyu-cream to-ssyu-cream">
      <div className="animate-float mb-1 rounded-full p-2 bg-white/60 shadow-lg">
        <SsyuAvatar level={1} size={130} animate={false} className="!rounded-full" />
      </div>
      <h1 className="font-display text-2xl text-ssyu-brown mt-4">쓔 키우기 프로젝트</h1>
      <p className="text-[13px] text-ssyu-brown/50 mt-1 mb-6">우리 팀 쓔를 정책마스터로 키워보세요!</p>

      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6 space-y-3">
        <input
          className="w-full rounded-xl border-2 border-ssyu-brown/10 bg-ssyu-cream/50 px-4 py-3 text-[15px] outline-none focus:border-ssyu-orange transition-colors"
          placeholder="팀 코드 (예: seoul)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoCapitalize="none"
        />
        <input
          className="w-full rounded-xl border-2 border-ssyu-brown/10 bg-ssyu-cream/50 px-4 py-3 text-[15px] outline-none focus:border-ssyu-orange transition-colors"
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-game bg-ssyu-orange text-white py-3.5 text-base"
        >
          {loading ? "쓔를 깨우는 중..." : "시작하기"}
        </button>
      </form>
      <p className="text-[11px] text-ssyu-brown/30 mt-6">중소벤처기업부 청년인턴 정책 체험 프로그램</p>
    </div>
  );
}
