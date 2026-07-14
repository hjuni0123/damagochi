import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  xp: z.number().int().min(0).optional(),
  coins: z.number().int().min(0).optional(),
  password: z.string().min(4).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const { password, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (password) data.passwordHash = await hashPassword(password);

  const team = await prisma.team.update({ where: { id }, data });
  return NextResponse.json({ ok: true, team });
}
