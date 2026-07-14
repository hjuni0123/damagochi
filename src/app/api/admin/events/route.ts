import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MissionCategory } from "@/generated/prisma";

const EVENT_PRESETS: Record<string, { label: string; hours: number; category?: MissionCategory }> = {
  COIN_DOUBLE: { label: "🎉 오늘 코인 2배", hours: 24 },
  RANDOM_REWARD: { label: "🍀 오늘 랜덤 보상", hours: 24 },
  XP_TRIPLE_CATEGORY: { label: "🔥 백년가게 경험치 3배", hours: 24, category: "BAEKNYEON" },
  ONNURI_DOUBLE: { label: "💰 온누리 더블코인", hours: 24 },
};

const createSchema = z.object({
  type: z.enum(["COIN_DOUBLE", "RANDOM_REWARD", "XP_TRIPLE_CATEGORY", "ONNURI_DOUBLE"]),
  hours: z.number().min(1).max(72).optional(),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const events = await prisma.randomEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ events, presets: EVENT_PRESETS });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const preset = EVENT_PRESETS[parsed.data.type];
  const hours = parsed.data.hours ?? preset.hours;
  const event = await prisma.randomEvent.create({
    data: {
      type: parsed.data.type,
      label: preset.label,
      category: preset.category,
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    },
  });

  await prisma.activityLog.create({ data: { type: "EVENT", message: `운영자가 이벤트를 발동했습니다: ${preset.label}` } });

  return NextResponse.json({ ok: true, event });
}
