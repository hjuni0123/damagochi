import { prisma } from "@/lib/prisma";
import { MissionCategory, QuestType } from "@/generated/prisma";

export function dailyPeriodKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function weeklyPeriodKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function periodKeyFor(type: QuestType, date = new Date()) {
  return type === "DAILY" ? dailyPeriodKey(date) : weeklyPeriodKey(date);
}

const DAILY_QUEST_SLOTS = 3;
const WEEKLY_QUEST_SLOTS = 3;

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

/** Lazily assign this team's quest set for the current day/week if not already assigned. */
export async function ensureTeamQuests(teamId: string) {
  for (const type of ["DAILY", "WEEKLY"] as QuestType[]) {
    const periodKey = periodKeyFor(type);
    const existing = await prisma.teamQuest.findMany({
      where: { teamId, periodKey, quest: { type } },
    });
    if (existing.length > 0) continue;

    const pool = await prisma.quest.findMany({ where: { type, active: true } });
    const slots = type === "DAILY" ? DAILY_QUEST_SLOTS : WEEKLY_QUEST_SLOTS;
    const chosen = pickRandom(pool, Math.min(slots, pool.length));
    for (const quest of chosen) {
      try {
        await prisma.teamQuest.create({
          data: { teamId, questId: quest.id, periodKey },
        });
      } catch {
        // concurrent request already assigned this team's quests for the period; ignore.
      }
    }
  }

  return prisma.teamQuest.findMany({
    where: {
      teamId,
      OR: [
        { periodKey: dailyPeriodKey(), quest: { type: "DAILY" } },
        { periodKey: weeklyPeriodKey(), quest: { type: "WEEKLY" } },
      ],
    },
    include: { quest: true },
    orderBy: { quest: { type: "asc" } },
  });
}

export type QuestCompletion = { teamQuestId: string; questTitle: string; xpReward: number; coinReward: number };

/** Advance progress on all active quests matching a trigger, returns newly-completed quests. */
export async function progressQuests(
  teamId: string,
  trigger: "SUBMISSION" | "COMMENT" | "ATTENDANCE",
  category?: MissionCategory | null
): Promise<QuestCompletion[]> {
  await ensureTeamQuests(teamId);

  const candidates = await prisma.teamQuest.findMany({
    where: {
      teamId,
      completed: false,
      quest: { triggerType: trigger },
      OR: [
        { periodKey: dailyPeriodKey(), quest: { type: "DAILY" } },
        { periodKey: weeklyPeriodKey(), quest: { type: "WEEKLY" } },
      ],
    },
    include: { quest: true },
  });

  const completions: QuestCompletion[] = [];

  for (const tq of candidates) {
    if (tq.quest.category && category && tq.quest.category !== category) continue;
    if (tq.quest.category && !category) continue;

    const progress = tq.progress + 1;
    const completed = progress >= tq.quest.targetCount;
    await prisma.teamQuest.update({
      where: { id: tq.id },
      data: { progress, completed, completedAt: completed ? new Date() : null },
    });

    if (completed) {
      await prisma.team.update({
        where: { id: teamId },
        data: { xp: { increment: tq.quest.xpReward }, coins: { increment: tq.quest.coinReward } },
      });
      completions.push({
        teamQuestId: tq.id,
        questTitle: tq.quest.title,
        xpReward: tq.quest.xpReward,
        coinReward: tq.quest.coinReward,
      });
    }
  }

  return completions;
}
