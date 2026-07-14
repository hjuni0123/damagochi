import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { progressQuests } from "@/lib/quests";

const schema = z.object({ targetTeamId: z.string().min(1), message: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { teamId: team.id, targetTeamId: parsed.data.targetTeamId, message: parsed.data.message },
  });

  const completedQuests = await progressQuests(team.id, "COMMENT");

  return NextResponse.json({ ok: true, comment, completedQuests });
}
