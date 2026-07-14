"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MeProvider, useMe } from "@/lib/meContext";

const NAV = [
  { href: "/home", label: "홈", icon: "🏠" },
  { href: "/missions", label: "미션", icon: "📸" },
  { href: "/shop", label: "꾸미기", icon: "🎨" },
  { href: "/ranking", label: "랭킹", icon: "🏆" },
  { href: "/more", label: "더보기", icon: "🍀" },
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
    <header className="sticky top-0 z-20 bg-ssyu-cream/90 backdrop-blur-md px-4 pt-3 pb-2 flex items-center justify-between">
      <Link href="/home" className="font-display text-lg text-ssyu-brown flex items-center gap-1">
        <span className="text-xl">🐣</span>
        <span>쓔 키우기</span>
      </Link>
      <div className="flex items-center gap-1.5">
        {me && (
          <>
            <span className="font-display text-[13px] bg-white border border-ssyu-yellow/60 text-ssyu-brown px-2.5 py-1 rounded-full shadow-sm">
              Lv.{me.level}
            </span>
            <span className="font-display text-[13px] bg-white border border-ssyu-yellow/60 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="text-ssyu-orange">🪙</span>
              {me.coins.toLocaleString()}
            </span>
          </>
        )}
        <button onClick={logout} className="text-[11px] text-ssyu-brown/40 px-1.5">
          로그아웃
        </button>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1 bg-gradient-to-t from-ssyu-cream via-ssyu-cream/95 to-transparent">
      <div className="card flex justify-around py-1.5 px-1 !rounded-3xl">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0 px-3 py-1 rounded-2xl transition-all duration-150 ${
                active ? "bg-ssyu-yellow/90 -translate-y-0.5 shadow-sm" : ""
              }`}
            >
              <span className={`text-[22px] leading-tight ${active ? "" : "grayscale opacity-60"}`}>{item.icon}</span>
              <span className={`font-display text-[10px] ${active ? "text-ssyu-brown" : "text-ssyu-brown/40"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full">
        <Header />
        <main className="flex-1 pb-2">{children}</main>
        <BottomNav />
      </div>
    </MeProvider>
  );
}
