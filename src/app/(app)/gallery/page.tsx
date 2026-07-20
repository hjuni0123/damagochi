"use client";

import { useEffect, useState } from "react";
import SsyuAvatar from "@/components/SsyuAvatar";
import type { EquippedItem } from "@/components/SsyuAvatar";

type GalleryTeam = {
  teamId: string;
  name: string;
  region: string;
  level: number;
  levelName: string;
  items: EquippedItem[];
  likeCount: number;
  likedByMe: boolean;
  comments: { id: string; message: string; team: { name: string } }[];
};

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryTeam[]>([]);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  async function load() {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setGallery(data.gallery ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleLike(targetTeamId: string) {
    setGallery((prev) =>
      prev.map((t) =>
        t.teamId === targetTeamId
          ? { ...t, likedByMe: !t.likedByMe, likeCount: t.likeCount + (t.likedByMe ? -1 : 1) }
          : t
      )
    );
    await fetch("/api/gallery/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetTeamId }),
    });
  }

  async function submitComment(targetTeamId: string) {
    if (!commentText.trim()) return;
    await fetch("/api/gallery/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetTeamId, message: commentText.trim() }),
    });
    setCommentText("");
    setOpenComment(null);
    load();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-display text-xl">쓔 갤러리</h1>
      <p className="text-sm text-ssyu-brown/50">다른 팀의 쓔를 구경하고 응원해보세요!</p>

      <div className="grid grid-cols-2 gap-3">
        {gallery.map((t) => (
          <div key={t.teamId} className="card p-3 flex flex-col items-center">
            <SsyuAvatar level={t.level} items={t.items} teamName={t.name} size={130} />
            <div className="text-xs text-ssyu-brown/40 mt-1">{t.levelName}</div>
            <button
              onClick={() => toggleLike(t.teamId)}
              className={`mt-2 w-full rounded-xl text-xs font-bold py-1.5 ${
                t.likedByMe ? "bg-ssyu-pink text-white" : "bg-black/5 text-ssyu-brown"
              }`}
            >
              {t.likedByMe ? "❤️" : "🤍"} {t.likeCount}
            </button>
            <button
              onClick={() => setOpenComment(openComment === t.teamId ? null : t.teamId)}
              className="mt-1 w-full rounded-xl text-xs font-bold py-1.5 bg-black/5 text-ssyu-brown"
            >
              💬 댓글 {t.comments.length}
            </button>
            {openComment === t.teamId && (
              <div className="mt-2 w-full space-y-1.5">
                {t.comments.map((c) => (
                  <p key={c.id} className="text-[11px] text-ssyu-brown/50 truncate">
                    <span className="font-bold">{c.team.name}:</span> {c.message}
                  </p>
                ))}
                <div className="flex gap-1">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="응원 댓글..."
                    className="flex-1 rounded-lg border border-black/10 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => submitComment(t.teamId)}
                    className="rounded-lg bg-ssyu-brown text-white text-xs font-bold px-2"
                  >
                    등록
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
