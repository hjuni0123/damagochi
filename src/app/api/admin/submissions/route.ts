import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubmissionStatus } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const statusParam = req.nextUrl.searchParams.get("status");
  const status = statusParam && ["PENDING", "APPROVED", "REJECTED"].includes(statusParam) ? (statusParam as SubmissionStatus) : undefined;

  const submissions = await prisma.missionSubmission.findMany({
    where: status ? { status } : undefined,
    include: { mission: true, team: true },
    orderBy: { submittedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ submissions });
}
