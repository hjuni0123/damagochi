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
    <div className="min-h-screen flex items-center justify-center bg-ssyu-cream px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg space-y-4">
        <div className="text-center space-y-2 mb-2">
          <div className="flex justify-center">
            <SsyuAvatar level={1} size={110} animate={false} />
          </div>
          <h1 className="text-xl font-bold text-ssyu-brown">쓔 키우기 프로젝트</h1>
          <p className="text-xs text-black/50">팀 코드로 로그인하고 우리 팀 쓔를 키워보세요</p>
        </div>
        <input
          className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-ssyu-orange"
          placeholder="팀 코드 (예: seoul)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoCapitalize="none"
        />
        <input
          className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-ssyu-orange"
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ssyu-orange text-white font-bold py-3 disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
