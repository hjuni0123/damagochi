"use client";

import { useEffect, useState } from "react";

type ActivityLog = { id: string; message: string; createdAt: string; type: string };

const TYPE_ICON: Record<string, string> = {
  LEVEL_UP: "🟢",
  ITEM_PURCHASE: "🎉",
  ACHIEVEMENT: "🏆",
  MISSION_APPROVED: "📸",
  EVENT: "✨",
};

export default function NotificationsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">알림</h1>
      <p className="text-sm text-black/50">다른 팀의 활동도 실시간으로 확인해보세요.</p>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl bg-white shadow-sm p-3 flex items-center gap-3">
            <span className="text-xl">{TYPE_ICON[log.type] ?? "🔔"}</span>
            <div className="flex-1">
              <p className="text-sm">{log.message}</p>
              <p className="text-xs text-black/30">{new Date(log.createdAt).toLocaleString("ko-KR")}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-black/40">아직 알림이 없습니다.</p>}
      </div>
    </div>
  );
}
