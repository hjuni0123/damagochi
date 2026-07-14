export type LevelInfo = {
  level: number;
  name: string;
  emoji: string;
  xpRequired: number; // cumulative xp required to reach this level
};

export const LEVELS: LevelInfo[] = [
  { level: 1, name: "알", emoji: "🥚", xpRequired: 0 },
  { level: 2, name: "아기쓔", emoji: "🐣", xpRequired: 100 },
  { level: 3, name: "인턴쓔", emoji: "🐥", xpRequired: 300 },
  { level: 4, name: "정책탐험가", emoji: "🦆", xpRequired: 700 },
  { level: 5, name: "정책파트너", emoji: "🦢", xpRequired: 1500 },
  { level: 6, name: "정책마스터", emoji: "👑", xpRequired: 3100 },
];

export const MAX_LEVEL = LEVELS[LEVELS.length - 1].level;

export function levelForXp(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) current = l;
  }
  return current;
}

export function nextLevelForXp(xp: number): LevelInfo | null {
  const current = levelForXp(xp);
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return LEVELS[idx + 1] ?? null;
}

export function xpProgress(xp: number) {
  const current = levelForXp(xp);
  const next = nextLevelForXp(xp);
  if (!next) {
    return { current, next: null, into: 0, span: 0, ratio: 1 };
  }
  const into = xp - current.xpRequired;
  const span = next.xpRequired - current.xpRequired;
  return { current, next, into, span, ratio: span === 0 ? 1 : into / span };
}
