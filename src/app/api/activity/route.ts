import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { team: { select: { name: true } } },
  });

  return NextResponse.json({ logs });
}
