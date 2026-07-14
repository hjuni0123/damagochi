import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  category: z.enum(["BAEKNYEON", "ONNURI", "MARKET", "TEAM", "POLICY_EVENT", "OTHER"]),
  xpReward: z.number().int().min(0),
  coinReward: z.number().int().min(0),
  requiresPhoto: z.boolean().default(true),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const missions = await prisma.mission.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ missions });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const mission = await prisma.mission.create({ data: parsed.data });
  return NextResponse.json({ ok: true, mission });
}
