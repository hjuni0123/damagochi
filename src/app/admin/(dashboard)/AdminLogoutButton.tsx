"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="text-sm font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
    >
      로그아웃
    </button>
  );
}
