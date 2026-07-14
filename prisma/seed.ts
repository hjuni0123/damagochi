import { PrismaClient, MissionCategory, ItemCategory, Rarity, AchievementCondition, QuestType, QuestTrigger } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEAMS = [
  { code: "seoul", name: "서울청", region: "서울" },
  { code: "busan", name: "부산청", region: "부산" },
  { code: "daegu", name: "대구청", region: "대구" },
  { code: "incheon", name: "인천청", region: "인천" },
  { code: "gwangju", name: "광주청", region: "광주" },
  { code: "daejeon", name: "대전청", region: "대전" },
  { code: "ulsan", name: "울산청", region: "울산" },
  { code: "chungbuk", name: "충북청", region: "충북" },
];

const DEFAULT_TEAM_PASSWORD = "ssyu1234";
const DEFAULT_ADMIN_PASSWORD = "admin1234";

const ITEMS: { name: string; category: ItemCategory; price: number; emoji: string; color: string; rarity: Rarity }[] = [
  // outfits
  { name: "정장", category: "OUTFIT", price: 180, emoji: "🕴️", color: "#2c3e50", rarity: "COMMON" },
  { name: "탐험복", category: "OUTFIT", price: 160, emoji: "🥾", color: "#8d6e63", rarity: "COMMON" },
  { name: "후드티", category: "OUTFIT", price: 100, emoji: "👕", color: "#5c6bc0", rarity: "COMMON" },
  { name: "우비", category: "OUTFIT", price: 120, emoji: "🧥", color: "#ffd54f", rarity: "COMMON" },
  { name: "중기부 점퍼", category: "OUTFIT", price: 220, emoji: "🧥", color: "#1e88e5", rarity: "RARE" },
  { name: "한복", category: "OUTFIT", price: 300, emoji: "👘", color: "#e57373", rarity: "EPIC" },
  // hats
  { name: "모자", category: "HAT", price: 80, emoji: "🧢", color: "#90a4ae", rarity: "COMMON" },
  { name: "왕관", category: "HAT", price: 300, emoji: "👑", color: "#ffd700", rarity: "EPIC" },
  { name: "안전모", category: "HAT", price: 90, emoji: "⛑️", color: "#fbc02d", rarity: "COMMON" },
  { name: "셰프모자", category: "HAT", price: 110, emoji: "👨‍🍳", color: "#f5f5f5", rarity: "RARE" },
  { name: "밀짚모자", category: "HAT", price: 70, emoji: "👒", color: "#d7ccc8", rarity: "COMMON" },
  { name: "캡모자", category: "HAT", price: 75, emoji: "🧢", color: "#ef5350", rarity: "COMMON" },
  // face
  { name: "선글라스", category: "FACE", price: 90, emoji: "🕶️", color: "#212121", rarity: "COMMON" },
  { name: "안경", category: "FACE", price: 60, emoji: "👓", color: "#616161", rarity: "COMMON" },
  { name: "볼터치", category: "FACE", price: 40, emoji: "😊", color: "#f8bbd0", rarity: "COMMON" },
  { name: "수염", category: "FACE", price: 50, emoji: "🧔", color: "#5d4037", rarity: "RARE" },
  // accessory
  { name: "노트북", category: "ACCESSORY", price: 130, emoji: "💻", color: "#78909c", rarity: "COMMON" },
  { name: "가방", category: "ACCESSORY", price: 150, emoji: "🎒", color: "#a1887f", rarity: "COMMON" },
  { name: "커피", category: "ACCESSORY", price: 30, emoji: "☕", color: "#6d4c41", rarity: "COMMON" },
  { name: "온누리 장바구니", category: "ACCESSORY", price: 70, emoji: "🧺", color: "#66bb6a", rarity: "COMMON" },
  { name: "서류철", category: "ACCESSORY", price: 60, emoji: "📁", color: "#ffb74d", rarity: "COMMON" },
  { name: "메달", category: "ACCESSORY", price: 250, emoji: "🎖️", color: "#ffca28", rarity: "EPIC" },
  // background
  { name: "사무실", category: "BACKGROUND", price: 100, emoji: "🏢", color: "#cfd8dc", rarity: "COMMON" },
  { name: "시장", category: "BACKGROUND", price: 120, emoji: "🏮", color: "#ffab91", rarity: "COMMON" },
  { name: "백년가게", category: "BACKGROUND", price: 150, emoji: "🏪", color: "#bcaaa4", rarity: "RARE" },
  { name: "전통시장", category: "BACKGROUND", price: 150, emoji: "🥕", color: "#ffcc80", rarity: "RARE" },
  { name: "회의실", category: "BACKGROUND", price: 110, emoji: "🖥️", color: "#b0bec5", rarity: "COMMON" },
  { name: "창업센터", category: "BACKGROUND", price: 180, emoji: "🚀", color: "#90caf9", rarity: "RARE" },
  { name: "공원", category: "BACKGROUND", price: 130, emoji: "🌳", color: "#a5d6a7", rarity: "COMMON" },
  // emotion
  { name: "웃음", category: "EMOTION", price: 20, emoji: "😄", color: "#fff59d", rarity: "COMMON" },
  { name: "졸림", category: "EMOTION", price: 20, emoji: "😴", color: "#b39ddb", rarity: "COMMON" },
  { name: "화남", category: "EMOTION", price: 20, emoji: "😠", color: "#ef9a9a", rarity: "COMMON" },
  { name: "신남", category: "EMOTION", price: 20, emoji: "🤩", color: "#80deea", rarity: "COMMON" },
  { name: "감동", category: "EMOTION", price: 20, emoji: "🥹", color: "#f48fb1", rarity: "COMMON" },
];

const MISSIONS: { title: string; description: string; category: MissionCategory; xpReward: number; coinReward: number }[] = [
  { title: "백년가게 방문 인증", description: "백년가게를 방문하고 인증샷을 남겨주세요.", category: "BAEKNYEON", xpReward: 40, coinReward: 50 },
  { title: "온누리상품권 사용 인증", description: "온누리상품권을 사용한 영수증/사진을 인증해주세요.", category: "ONNURI", xpReward: 30, coinReward: 40 },
  { title: "전통시장 탐방 인증", description: "전통시장 방문 사진을 인증해주세요.", category: "MARKET", xpReward: 25, coinReward: 30 },
  { title: "팀 미션 완료", description: "팀 단위로 부여된 미션을 완료하고 인증해주세요.", category: "TEAM", xpReward: 50, coinReward: 60 },
  { title: "정책 행사 참여 인증", description: "중기부 정책 행사 참여 인증샷을 남겨주세요.", category: "POLICY_EVENT", xpReward: 80, coinReward: 100 },
];

const ACHIEVEMENTS: {
  key: string;
  title: string;
  hiddenHint: string;
  description: string;
  icon: string;
  coinReward: number;
  conditionType: AchievementCondition;
  conditionCategory?: MissionCategory;
  conditionCount: number;
}[] = [
  {
    key: "onnuri_master",
    title: "온누리 마스터",
    hiddenHint: "온누리와 관련된 미션을 반복해보세요.",
    description: "온누리상품권 미션 3회 인증",
    icon: "🏆",
    coinReward: 100,
    conditionType: "MISSION_CATEGORY_COUNT",
    conditionCategory: "ONNURI",
    conditionCount: 3,
  },
  {
    key: "baeknyeon_explorer",
    title: "백년가게 탐험가",
    hiddenHint: "여러 백년가게를 다녀보세요.",
    description: "백년가게 미션 3회 인증",
    icon: "🏆",
    coinReward: 100,
    conditionType: "MISSION_CATEGORY_COUNT",
    conditionCategory: "BAEKNYEON",
    conditionCount: 3,
  },
  {
    key: "market_wanderer",
    title: "시장 탐방러",
    hiddenHint: "전통시장을 자주 찾아가 보세요.",
    description: "전통시장 미션 3회 인증",
    icon: "🏆",
    coinReward: 100,
    conditionType: "MISSION_CATEGORY_COUNT",
    conditionCategory: "MARKET",
    conditionCount: 3,
  },
  {
    key: "best_teamwork",
    title: "최고의 팀워크",
    hiddenHint: "팀 미션을 여러 번 완료해보세요.",
    description: "팀 미션 5회 인증",
    icon: "🏆",
    coinReward: 150,
    conditionType: "MISSION_CATEGORY_COUNT",
    conditionCategory: "TEAM",
    conditionCount: 5,
  },
  {
    key: "diligent_king",
    title: "성실왕",
    hiddenHint: "매일 꾸준히 활동해보세요.",
    description: "7일 연속 활동",
    icon: "🏆",
    coinReward: 200,
    conditionType: "DAILY_STREAK",
    conditionCount: 7,
  },
  {
    key: "first_steps",
    title: "첫 발걸음",
    hiddenHint: "첫 인증을 남겨보세요.",
    description: "첫 미션 인증 완료",
    icon: "🌱",
    coinReward: 30,
    conditionType: "TOTAL_SUBMISSIONS",
    conditionCount: 1,
  },
  {
    key: "policy_veteran",
    title: "정책 베테랑",
    hiddenHint: "정책 현장을 두루 경험해보세요.",
    description: "미션 인증 20회 달성",
    icon: "🎖️",
    coinReward: 250,
    conditionType: "TOTAL_SUBMISSIONS",
    conditionCount: 20,
  },
  {
    key: "quest_perfectionist",
    title: "퀘스트 완벽주의자",
    hiddenHint: "모든 퀘스트를 놓치지 마세요.",
    description: "배정된 퀘스트를 모두 완료",
    icon: "✨",
    coinReward: 80,
    conditionType: "TEAM_ALL_QUESTS",
    conditionCount: 3,
  },
];

const QUESTS: { type: QuestType; title: string; description: string; triggerType: QuestTrigger; category?: MissionCategory; targetCount: number; xpReward: number; coinReward: number }[] = [
  { type: "DAILY", title: "인증 1회", description: "오늘 미션을 1회 인증해보세요.", triggerType: "SUBMISSION", targetCount: 1, xpReward: 15, coinReward: 20 },
  { type: "DAILY", title: "팀원 댓글 남기기", description: "다른 팀 갤러리에 댓글을 남겨보세요.", triggerType: "COMMENT", targetCount: 1, xpReward: 10, coinReward: 15 },
  { type: "DAILY", title: "출석", description: "오늘 접속해서 출석체크를 해보세요.", triggerType: "ATTENDANCE", targetCount: 1, xpReward: 10, coinReward: 10 },
  { type: "WEEKLY", title: "백년가게 탐방", description: "이번 주 백년가게 미션을 인증해보세요.", triggerType: "SUBMISSION", category: "BAEKNYEON", targetCount: 1, xpReward: 40, coinReward: 50 },
  { type: "WEEKLY", title: "온누리 상품권 사용", description: "이번 주 온누리 미션을 인증해보세요.", triggerType: "SUBMISSION", category: "ONNURI", targetCount: 1, xpReward: 40, coinReward: 50 },
  { type: "WEEKLY", title: "전통시장 나들이", description: "이번 주 전통시장 미션을 인증해보세요.", triggerType: "SUBMISSION", category: "MARKET", targetCount: 1, xpReward: 40, coinReward: 50 },
  { type: "WEEKLY", title: "팀 점심 인증", description: "이번 주 팀 미션을 인증해보세요.", triggerType: "SUBMISSION", category: "TEAM", targetCount: 1, xpReward: 45, coinReward: 55 },
];

async function main() {
  console.log("Seeding admin...");
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10) },
  });

  console.log("Seeding teams...");
  for (const t of TEAMS) {
    await prisma.team.upsert({
      where: { code: t.code },
      update: {},
      create: { ...t, passwordHash: await bcrypt.hash(DEFAULT_TEAM_PASSWORD, 10) },
    });
  }

  console.log("Seeding items...");
  for (const item of ITEMS) {
    const exists = await prisma.item.findFirst({ where: { name: item.name } });
    if (!exists) await prisma.item.create({ data: item });
  }

  console.log("Seeding missions...");
  for (const m of MISSIONS) {
    const exists = await prisma.mission.findFirst({ where: { title: m.title } });
    if (!exists) await prisma.mission.create({ data: m });
  }

  console.log("Seeding achievements...");
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a });
  }

  console.log("Seeding quests...");
  for (const q of QUESTS) {
    const exists = await prisma.quest.findFirst({ where: { title: q.title } });
    if (!exists) await prisma.quest.create({ data: q });
  }

  console.log("Seed complete.");
  console.log(`Team login codes: ${TEAMS.map((t) => t.code).join(", ")} / password: ${DEFAULT_TEAM_PASSWORD}`);
  console.log(`Admin login: admin / ${DEFAULT_ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
