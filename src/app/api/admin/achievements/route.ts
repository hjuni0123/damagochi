import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  hiddenHint: z.string().default("???"),
  description: z.string().min(1),
  icon: z.string().default("🏆"),
  coinReward: z.number().int().min(0).default(0),
  conditionType: z.enum(["MISSION_CATEGORY_COUNT", "TOTAL_SUBMISSIONS", "DAILY_STREAK", "TEAM_ALL_QUESTS"]),
  conditionCategory: z.enum(["BAEKNYEON", "ONNURI", "MARKET", "TEAM", "POLICY_EVENT", "OTHER"]).optional(),
  conditionCount: z.number().int().min(1).default(1),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const achievements = await prisma.achievement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ achievements });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const achievement = await prisma.achievement.create({ data: parsed.data });
  return NextResponse.json({ ok: true, achievement });
}
