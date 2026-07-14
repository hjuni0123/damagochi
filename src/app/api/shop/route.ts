import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const items = await prisma.item.findMany({ orderBy: [{ category: "asc" }, { price: "asc" }] });
  const owned = await prisma.teamItem.findMany({ where: { teamId: team.id } });
  const ownedMap = new Map(owned.map((o) => [o.itemId, o]));

  return NextResponse.json({
    coins: team.coins,
    items: items.map((item) => ({
      ...item,
      owned: ownedMap.has(item.id),
      equipped: ownedMap.get(item.id)?.equipped ?? false,
    })),
  });
}
