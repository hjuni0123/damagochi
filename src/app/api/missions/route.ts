import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const missions = await prisma.mission.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  const submissions = await prisma.missionSubmission.findMany({
    where: { teamId: team.id },
    include: { mission: true },
    orderBy: { submittedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ missions, submissions });
}
