import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { xpProgress } from "@/lib/levels";
import { getEquippedItems } from "@/lib/teamView";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const progress = xpProgress(team.xp);
  const items = await getEquippedItems(team.id);
  const badgeCount = await prisma.teamAchievement.count({ where: { teamId: team.id } });

  return NextResponse.json({
    id: team.id,
    code: team.code,
    name: team.name,
    region: team.region,
    xp: team.xp,
    coins: team.coins,
    level: progress.current.level,
    levelName: progress.current.name,
    levelEmoji: progress.current.emoji,
    nextLevel: progress.next ? { level: progress.next.level, name: progress.next.name, xpRequired: progress.next.xpRequired } : null,
    xpInto: progress.into,
    xpSpan: progress.span,
    xpRatio: progress.ratio,
    items,
    badgeCount,
  });
}
