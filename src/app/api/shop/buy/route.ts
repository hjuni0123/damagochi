import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ itemId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const item = await prisma.item.findUnique({ where: { id: parsed.data.itemId } });
  if (!item) return NextResponse.json({ error: "존재하지 않는 아이템입니다." }, { status: 404 });

  const already = await prisma.teamItem.findUnique({
    where: { teamId_itemId: { teamId: team.id, itemId: item.id } },
  });
  if (already) return NextResponse.json({ error: "이미 보유한 아이템입니다." }, { status: 400 });

  const freshTeam = await prisma.team.findUniqueOrThrow({ where: { id: team.id } });
  if (freshTeam.coins < item.price) {
    return NextResponse.json({ error: "쓔코인이 부족합니다." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.team.update({ where: { id: team.id }, data: { coins: { decrement: item.price } } }),
    prisma.teamItem.create({ data: { teamId: team.id, itemId: item.id } }),
    prisma.activityLog.create({
      data: { teamId: team.id, type: "ITEM_PURCHASE", message: `${team.name} 팀이 '${item.name}'을(를) 구매했습니다!` },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
