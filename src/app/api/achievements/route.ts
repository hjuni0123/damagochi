import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const all = await prisma.achievement.findMany({ orderBy: { createdAt: "asc" } });
  const unlocked = await prisma.teamAchievement.findMany({ where: { teamId: team.id } });
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  return NextResponse.json({
    achievements: all.map((a) => {
      const isUnlocked = unlockedMap.has(a.id);
      return {
        id: a.id,
        icon: a.icon,
        coinReward: a.coinReward,
        unlocked: isUnlocked,
        unlockedAt: unlockedMap.get(a.id) ?? null,
        title: isUnlocked ? a.title : "???",
        description: isUnlocked ? a.description : a.hiddenHint,
      };
    }),
  });
}
