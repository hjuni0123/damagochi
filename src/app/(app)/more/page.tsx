import Link from "next/link";

const LINKS = [
  { href: "/quests", label: "퀘스트", icon: "🎯", desc: "일일/주간 퀘스트 확인" },
  { href: "/achievements", label: "업적", icon: "🏆", desc: "숨겨진 업적 도전" },
  { href: "/gallery", label: "쓔 갤러리", icon: "🖼️", desc: "다른 팀 쓔 구경하기" },
  { href: "/notifications", label: "알림", icon: "🔔", desc: "실시간 활동 피드" },
  { href: "/hall-of-fame", label: "명예의 전당", icon: "🎖️", desc: "모두의 성장한 쓔 모아보기" },
];

export default function MorePage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">더보기</h1>
      <div className="grid gap-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl bg-white shadow-sm p-4 flex items-center gap-3">
            <span className="text-2xl">{l.icon}</span>
            <div>
              <div className="font-bold">{l.label}</div>
              <div className="text-xs text-black/50">{l.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
