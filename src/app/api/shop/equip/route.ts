import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ itemId: z.string().min(1), equipped: z.boolean() });

export async function POST(req: NextRequest) {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const teamItem = await prisma.teamItem.findUnique({
    where: { teamId_itemId: { teamId: team.id, itemId: parsed.data.itemId } },
    include: { item: true },
  });
  if (!teamItem) return NextResponse.json({ error: "보유하지 않은 아이템입니다." }, { status: 404 });

  if (parsed.data.equipped) {
    await prisma.teamItem.updateMany({
      where: { teamId: team.id, item: { category: teamItem.item.category }, equipped: true },
      data: { equipped: false },
    });
  }

  await prisma.teamItem.update({
    where: { id: teamItem.id },
    data: { equipped: parsed.data.equipped },
  });

  return NextResponse.json({ ok: true });
}
