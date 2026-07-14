import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  type: z.enum(["DAILY", "WEEKLY"]),
  title: z.string().min(1),
  description: z.string().default(""),
  triggerType: z.enum(["SUBMISSION", "COMMENT", "ATTENDANCE"]).default("SUBMISSION"),
  category: z.enum(["BAEKNYEON", "ONNURI", "MARKET", "TEAM", "POLICY_EVENT", "OTHER"]).optional(),
  targetCount: z.number().int().min(1).default(1),
  xpReward: z.number().int().min(0),
  coinReward: z.number().int().min(0),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const quests = await prisma.quest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ quests });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const quest = await prisma.quest.create({ data: parsed.data });
  return NextResponse.json({ ok: true, quest });
}
