import { NextResponse } from "next/server";
import { destroyTeamSession } from "@/lib/auth";

export async function POST() {
  await destroyTeamSession();
  return NextResponse.json({ ok: true });
}
