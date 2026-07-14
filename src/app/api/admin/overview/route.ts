import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const [pendingCount, teamCount, totalApproved, activeEvents] = await Promise.all([
    prisma.missionSubmission.count({ where: { status: "PENDING" } }),
    prisma.team.count(),
    prisma.missionSubmission.count({ where: { status: "APPROVED" } }),
    prisma.randomEvent.findMany({ where: { expiresAt: { gt: new Date() } } }),
  ]);

  return NextResponse.json({ pendingCount, teamCount, totalApproved, activeEvents });
}
