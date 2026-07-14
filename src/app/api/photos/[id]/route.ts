import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [team, admin] = await Promise.all([getCurrentTeam(), getCurrentAdmin()]);
  if (!team && !admin) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const submission = await prisma.missionSubmission.findUnique({
    where: { id },
    select: { photoData: true, photoMime: true },
  });
  if (!submission?.photoData) return NextResponse.json({ error: "사진이 없습니다." }, { status: 404 });

  return new NextResponse(Buffer.from(submission.photoData), {
    headers: {
      "Content-Type": submission.photoMime ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
