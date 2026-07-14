import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(["OUTFIT", "HAT", "FACE", "ACCESSORY", "BACKGROUND", "EMOTION"]).optional(),
  price: z.number().int().min(0).optional(),
  emoji: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  rarity: z.enum(["COMMON", "RARE", "EPIC"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const item = await prisma.item.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  await prisma.item.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
