import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import AdminLogoutButton from "./AdminLogoutButton";

const NAV = [
  { href: "/admin/approvals", label: "승인 대기" },
  { href: "/admin/teams", label: "팀 관리" },
  { href: "/admin/missions", label: "미션" },
  { href: "/admin/items", label: "상점 아이템" },
  { href: "/admin/achievements", label: "업적" },
  { href: "/admin/quests", label: "퀘스트" },
  { href: "/admin/events", label: "랜덤 이벤트" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  // login page renders its own chrome
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] text-ssyu-brown">
      <header className="sticky top-0 z-20 bg-ssyu-brown text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="font-bold text-lg">🛠️ 쓔 키우기 관리자</div>
        <AdminLogoutButton />
      </header>
      <nav className="flex gap-1 overflow-x-auto no-scrollbar px-3 py-2 bg-white border-b border-black/5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold text-ssyu-brown/70 hover:bg-ssyu-yellow/30 hover:text-ssyu-brown transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  );
}
