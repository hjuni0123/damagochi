import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const missionId = formData.get("missionId");
  const caption = formData.get("caption");
  const file = formData.get("photo");

  if (typeof missionId !== "string" || !missionId) {
    return NextResponse.json({ error: "미션을 선택해주세요." }, { status: 400 });
  }

  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission || !mission.active) {
    return NextResponse.json({ error: "존재하지 않는 미션입니다." }, { status: 404 });
  }

  let photoUrl: string | null = null;

  if (mission.requiresPhoto) {
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "인증 사진을 첨부해주세요." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "지원하지 않는 이미지 형식입니다." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "이미지 용량은 8MB 이하여야 합니다." }, { status: 400 });
    }
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    photoUrl = `/uploads/${filename}`;
  }

  const submission = await prisma.missionSubmission.create({
    data: {
      teamId: team.id,
      missionId: mission.id,
      photoUrl,
      caption: typeof caption === "string" ? caption.slice(0, 300) : "",
    },
  });

  return NextResponse.json({ ok: true, submission });
}
