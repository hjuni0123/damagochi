import { NextResponse } from "next/server";
import { getCurrentTeam } from "@/lib/auth";
import { ensureTeamQuests } from "@/lib/quests";

export async function GET() {
  const team = await getCurrentTeam();
  if (!team) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const teamQuests = await ensureTeamQuests(team.id);
  return NextResponse.json({
    daily: teamQuests.filter((tq) => tq.quest.type === "DAILY"),
    weekly: teamQuests.filter((tq) => tq.quest.type === "WEEKLY"),
  });
}
