import type { Rank, XPProgress } from "../types";

export const RANKS: Rank[] = [
  { name: "Code Novice", min: 0, max: 100, color: "bg-gray-100 text-gray-800" },
  {
    name: "Code Apprentice",
    min: 100,
    max: 500,
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Code Contributor",
    min: 500,
    max: 1500,
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Code Master",
    min: 1500,
    max: 3000,
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Code Expert",
    min: 3000,
    max: 5000,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "Open Source Legend",
    min: 5000,
    max: Number.POSITIVE_INFINITY,
    color: "bg-orange-100 text-orange-800",
  },
];

export const getRankFromXP = (xp: number): Rank => {
  return RANKS.find((rank) => xp >= rank.min && xp < rank.max) || RANKS[0];
};

export const getNextRank = (xp: number): Rank | null => {
  const currentRankIndex = RANKS.findIndex(
    (rank) => xp >= rank.min && xp < rank.max
  );
  return currentRankIndex < RANKS.length - 1
    ? RANKS[currentRankIndex + 1]
    : null;
};

export const getXPProgress = (xp: number): XPProgress => {
  const currentRank = getRankFromXP(xp);
  const nextRank = getNextRank(xp);

  if (!nextRank) return { progress: 100, xpToNext: 0 };

  const progressInCurrentRank = xp - currentRank.min;
  const totalRankRange = nextRank.min - currentRank.min;
  const progress = (progressInCurrentRank / totalRankRange) * 100;
  const xpToNext = nextRank.min - xp;

  return { progress, xpToNext };
};
