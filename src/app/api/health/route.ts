import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [teams, admins] = await Promise.all([prisma.team.count(), prisma.admin.count()]);
    return NextResponse.json({ db: "ok", teams, admins, version: "postgres-v2" });
  } catch (e) {
    return NextResponse.json(
      { db: "error", message: e instanceof Error ? e.message.slice(0, 300) : "unknown", version: "postgres-v2" },
      { status: 500 }
    );
  }
}
