import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ targetTeamId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  if (parsed.data.targetTeamId === team.id) {
    return NextResponse.json({ error: "본인 팀은 좋아요할 수 없습니다." }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: { teamId_targetTeamId: { teamId: team.id, targetTeamId: parsed.data.targetTeamId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { teamId: team.id, targetTeamId: parsed.data.targetTeamId } });
  return NextResponse.json({ liked: true });
}
