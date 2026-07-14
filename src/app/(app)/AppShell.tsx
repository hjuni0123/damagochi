"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MeProvider, useMe } from "@/lib/meContext";

const NAV = [
  { href: "/home", label: "홈", icon: "🏠" },
  { href: "/missions", label: "미션", icon: "📸" },
  { href: "/shop", label: "쓔꾸미기", icon: "🎨" },
  { href: "/ranking", label: "랭킹", icon: "🏆" },
  { href: "/more", label: "더보기", icon: "✨" },
];

function Header() {
  const { me } = useMe();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/team/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-ssyu-cream/95 backdrop-blur border-b border-black/5 px-4 py-2.5 flex items-center justify-between">
      <Link href="/home" className="font-extrabold text-ssyu-brown flex items-center gap-1.5">
        <span>🐣</span>
        <span>쓔 키우기</span>
      </Link>
      <div className="flex items-center gap-2">
        {me && (
          <>
            <span className="text-xs font-bold bg-ssyu-yellow/50 px-2.5 py-1 rounded-full">
              Lv.{me.level} {me.name}
            </span>
            <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-full shadow-sm">🪙 {me.coins}</span>
          </>
        )}
        <button onClick={logout} className="text-xs text-black/40 hover:text-black/70 px-1">
          로그아웃
        </button>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 bg-white border-t border-black/5 flex justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
      {NAV.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
              active ? "text-ssyu-orange bg-ssyu-orange/10" : "text-black/40"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full bg-ssyu-cream">
        <Header />
        <main className="flex-1 pb-4">{children}</main>
        <BottomNav />
      </div>
    </MeProvider>
  );
}
