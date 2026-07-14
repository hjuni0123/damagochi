import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  code: z.string().min(1).toLowerCase(),
  name: z.string().min(1),
  region: z.string().min(1),
  password: z.string().min(4).default("ssyu1234"),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, region: true, xp: true, coins: true, createdAt: true },
  });
  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const existing = await prisma.team.findUnique({ where: { code: parsed.data.code } });
  if (existing) return NextResponse.json({ error: "이미 존재하는 팀 코드입니다." }, { status: 400 });

  const team = await prisma.team.create({
    data: {
      code: parsed.data.code,
      name: parsed.data.name,
      region: parsed.data.region,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });
  return NextResponse.json({ ok: true, team });
}
