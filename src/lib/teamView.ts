import { prisma } from "@/lib/prisma";
import type { EquippedItem } from "@/components/SsyuAvatar";

export async function getEquippedItems(teamId: string): Promise<EquippedItem[]> {
  const teamItems = await prisma.teamItem.findMany({
    where: { teamId, equipped: true },
    include: { item: true },
  });
  return teamItems.map((ti) => ({
    category: ti.item.category as EquippedItem["category"],
    emoji: ti.item.emoji,
    color: ti.item.color,
    name: ti.item.name,
  }));
}
