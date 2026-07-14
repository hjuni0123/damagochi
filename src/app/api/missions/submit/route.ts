import { NextRequest, NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_SIZE = 4 * 1024 * 1024; // 4MB (stored in DB)

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

  let photoData: Uint8Array<ArrayBuffer> | null = null;
  let photoMime: string | null = null;

  if (mission.requiresPhoto) {
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "인증 사진을 첨부해주세요." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "지원하지 않는 이미지 형식입니다." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "이미지 용량은 4MB 이하여야 합니다." }, { status: 400 });
    }
    photoData = new Uint8Array(await file.arrayBuffer());
    photoMime = file.type;
  }

  const submission = await prisma.missionSubmission.create({
    data: {
      teamId: team.id,
      missionId: mission.id,
      photoData,
      photoMime,
      caption: typeof caption === "string" ? caption.slice(0, 300) : "",
    },
  });

  if (photoData) {
    await prisma.missionSubmission.update({
      where: { id: submission.id },
      data: { photoUrl: `/api/photos/${submission.id}` },
    });
  }

  return NextResponse.json({ ok: true, submission: { id: submission.id } });
}
