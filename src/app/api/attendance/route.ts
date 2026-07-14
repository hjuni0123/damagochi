import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { recordAttendance } from "@/lib/game";

export async function POST() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const result = await recordAttendance(team.id);
  return NextResponse.json(result);
}
