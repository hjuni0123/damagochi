import { prisma } from "@/lib/prisma";
import { levelForXp } from "@/lib/levels";
import { progressQuests } from "@/lib/quests";
import { AchievementCondition, MissionCategory } from "@/generated/prisma";

async function logActivity(teamId: string | null, type: "LEVEL_UP" | "ITEM_PURCHASE" | "ACHIEVEMENT" | "MISSION_APPROVED" | "EVENT", message: string) {
  await prisma.activityLog.create({ data: { teamId, type, message } });
}

async function getActiveMultipliers(category: MissionCategory) {
  const now = new Date();
  const events = await prisma.randomEvent.findMany({ where: { expiresAt: { gt: now } } });
  let xpMult = 1;
  let coinMult = 1;
  let bonusCoins = 0;

  for (const event of events) {
    if (event.type === "COIN_DOUBLE") coinMult *= 2;
    if (event.type === "ONNURI_DOUBLE" && category === "ONNURI") coinMult *= 2;
    if (event.type === "XP_TRIPLE_CATEGORY" && (!event.category || event.category === category)) xpMult *= 3;
    if (event.type === "RANDOM_REWARD") bonusCoins += Math.floor(Math.random() * 41) + 10; // 10~50
  }

  return { xpMult, coinMult, bonusCoins };
}

export async function approveMissionSubmission(submissionId: string, reviewNote = "") {
  const submission = await prisma.missionSubmission.findUnique({
    where: { id: submissionId },
    include: { mission: true, team: true },
  });
  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "PENDING") throw new Error("Submission already reviewed");

  const { xpMult, coinMult, bonusCoins } = await getActiveMultipliers(submission.mission.category);
  const xpAwarded = Math.round(submission.mission.xpReward * xpMult);
  const coinAwarded = Math.round(submission.mission.coinReward * coinMult) + bonusCoins;

  const beforeLevel = levelForXp(submission.team.xp).level;

  await prisma.missionSubmission.update({
    where: { id: submissionId },
    data: { status: "APPROVED", reviewedAt: new Date(), reviewNote, xpAwarded, coinAwarded },
  });

  const updatedTeam = await prisma.team.update({
    where: { id: submission.teamId },
    data: { xp: { increment: xpAwarded }, coins: { increment: coinAwarded } },
  });

  await logActivity(
    submission.teamId,
    "MISSION_APPROVED",
    `${submission.team.name} 쓔가 '${submission.mission.title}' 미션을 완료했습니다! (+${xpAwarded} XP, +${coinAwarded} 코인)`
  );

  const afterLevel = levelForXp(updatedTeam.xp).level;
  if (afterLevel > beforeLevel) {
    const info = levelForXp(updatedTeam.xp);
    await logActivity(submission.teamId, "LEVEL_UP", `${submission.team.name} 쓔가 레벨업했습니다! Lv.${info.level} ${info.name}`);
  }

  const completedQuests = await progressQuests(submission.teamId, "SUBMISSION", submission.mission.category);
  for (const q of completedQuests) {
    await logActivity(submission.teamId, "MISSION_APPROVED", `${submission.team.name} 팀이 퀘스트 '${q.questTitle}'을 완료했습니다! (+${q.xpReward} XP, +${q.coinReward} 코인)`);
  }

  const unlocked = await checkAchievements(submission.teamId);

  return { xpAwarded, coinAwarded, leveledUp: afterLevel > beforeLevel, completedQuests, unlocked };
}

export async function rejectMissionSubmission(submissionId: string, reviewNote = "") {
  const submission = await prisma.missionSubmission.findUnique({ where: { id: submissionId } });
  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "PENDING") throw new Error("Submission already reviewed");
  await prisma.missionSubmission.update({
    where: { id: submissionId },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewNote },
  });
}

export async function checkAchievements(teamId: string) {
  const achievements = await prisma.achievement.findMany();
  const already = await prisma.teamAchievement.findMany({ where: { teamId } });
  const alreadyIds = new Set(already.map((a) => a.achievementId));
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });

  const unlockedNow: string[] = [];

  for (const ach of achievements) {
    if (alreadyIds.has(ach.id)) continue;
    let satisfied = false;

    if (ach.conditionType === AchievementCondition.MISSION_CATEGORY_COUNT && ach.conditionCategory) {
      const count = await prisma.missionSubmission.count({
        where: { teamId, status: "APPROVED", mission: { category: ach.conditionCategory } },
      });
      satisfied = count >= ach.conditionCount;
    } else if (ach.conditionType === AchievementCondition.TOTAL_SUBMISSIONS) {
      const count = await prisma.missionSubmission.count({ where: { teamId, status: "APPROVED" } });
      satisfied = count >= ach.conditionCount;
    } else if (ach.conditionType === AchievementCondition.DAILY_STREAK) {
      satisfied = (await currentStreak(teamId)) >= ach.conditionCount;
    } else if (ach.conditionType === AchievementCondition.TEAM_ALL_QUESTS) {
      const totalQuests = await prisma.teamQuest.count({ where: { teamId } });
      const completedQuests = await prisma.teamQuest.count({ where: { teamId, completed: true } });
      satisfied = totalQuests > 0 && totalQuests === completedQuests && completedQuests >= ach.conditionCount;
    }

    if (satisfied) {
      await prisma.teamAchievement.create({ data: { teamId, achievementId: ach.id } });
      await prisma.team.update({ where: { id: teamId }, data: { coins: { increment: ach.coinReward } } });
      await logActivity(teamId, "ACHIEVEMENT", `${team.name} 팀이 업적 '${ach.title}'을 달성했습니다! ${ach.icon}`);
      unlockedNow.push(ach.id);
    }
  }

  return unlockedNow;
}

async function currentStreak(teamId: string): Promise<number> {
  const submissions = await prisma.missionSubmission.findMany({
    where: { teamId, status: "APPROVED" },
    select: { reviewedAt: true },
    orderBy: { reviewedAt: "desc" },
  });
  const days = new Set(
    submissions.filter((s) => s.reviewedAt).map((s) => s.reviewedAt!.toISOString().slice(0, 10))
  );
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export async function recordAttendance(teamId: string) {
  const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
  const today = new Date().toISOString().slice(0, 10);
  if (team.lastAttendance && team.lastAttendance.toISOString().slice(0, 10) === today) {
    return { alreadyRecorded: true, completedQuests: [] as Awaited<ReturnType<typeof progressQuests>> };
  }
  const completedQuests = await progressQuests(teamId, "ATTENDANCE");
  await prisma.team.update({ where: { id: teamId }, data: { lastAttendance: new Date() } });
  for (const q of completedQuests) {
    await logActivity(teamId, "MISSION_APPROVED", `${team.name} 팀이 퀘스트 '${q.questTitle}'을 완료했습니다! (+${q.xpReward} XP, +${q.coinReward} 코인)`);
  }
  await checkAchievements(teamId);
  return { alreadyRecorded: false, completedQuests };
}
