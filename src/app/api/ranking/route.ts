import { NextRequest, NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { levelForXp } from "@/lib/levels";
import { getEquippedItems } from "@/lib/teamView";

export async function GET(req: NextRequest) {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") ?? "growth";
  const teams = await prisma.team.findMany();

  const rows = await Promise.all(
    teams.map(async (t) => {
      const [likes, achievements, submissions, items] = await Promise.all([
        prisma.like.count({ where: { targetTeamId: t.id } }),
        prisma.teamAchievement.count({ where: { teamId: t.id } }),
        prisma.missionSubmission.count({ where: { teamId: t.id, status: "APPROVED" } }),
        getEquippedItems(t.id),
      ]);
      const info = levelForXp(t.xp);
      return {
        teamId: t.id,
        name: t.name,
        region: t.region,
        level: info.level,
        levelName: info.name,
        xp: t.xp,
        likes,
        achievements,
        submissions,
        items,
      };
    })
  );

  const sortKey: Record<string, (r: (typeof rows)[number]) => number> = {
    growth: (r) => r.xp,
    decoration: (r) => r.likes,
    achievement: (r) => r.achievements,
    participation: (r) => r.submissions,
  };
  const key = sortKey[type] ?? sortKey.growth;
  rows.sort((a, b) => key(b) - key(a));

  return NextResponse.json({ type, ranking: rows });
}
