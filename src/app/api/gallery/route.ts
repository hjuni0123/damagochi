import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { levelForXp } from "@/lib/levels";
import { getEquippedItems } from "@/lib/teamView";

export async function GET() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const myLikes = await prisma.like.findMany({ where: { teamId: team.id } });
  const likedSet = new Set(myLikes.map((l) => l.targetTeamId));

  const gallery = await Promise.all(
    teams.map(async (t) => {
      const [likeCount, items, comments] = await Promise.all([
        prisma.like.count({ where: { targetTeamId: t.id } }),
        getEquippedItems(t.id),
        prisma.comment.findMany({
          where: { targetTeamId: t.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { team: { select: { name: true } } },
        }),
      ]);
      const info = levelForXp(t.xp);
      return {
        teamId: t.id,
        name: t.name,
        region: t.region,
        level: info.level,
        levelName: info.name,
        items,
        likeCount,
        likedByMe: likedSet.has(t.id),
        comments,
      };
    })
  );

  return NextResponse.json({ gallery });
}
