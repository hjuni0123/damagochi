import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["BAEKNYEON", "ONNURI", "MARKET", "TEAM", "POLICY_EVENT", "OTHER"]).optional(),
  xpReward: z.number().int().min(0).optional(),
  coinReward: z.number().int().min(0).optional(),
  requiresPhoto: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const mission = await prisma.mission.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, mission });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  await prisma.mission.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
