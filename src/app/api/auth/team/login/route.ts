import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTeamSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  code: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { code: parsed.data.code.trim().toLowerCase() } });
  if (!team || !(await verifyPassword(parsed.data.password, team.passwordHash))) {
    return NextResponse.json({ error: "팀 코드 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  await createTeamSession(team.id);
  return NextResponse.json({ ok: true, team: { id: team.id, name: team.name } });
}
