import { DifficultyType, UserProgress, Habit } from '../types';
import prdConfig from '../../prd.json';

const XP_TIERS = prdConfig.xp_system.difficulty_tiers;
const WEEKLY_MULTIPLIER = prdConfig.xp_system.weekly_task_multiplier;
const MONTHLY_MULTIPLIER = prdConfig.xp_system.monthly_task_multiplier;

export function getXPForDifficulty(difficulty: DifficultyType): number {
  return XP_TIERS[difficulty] || 10;
}

export function calculateTaskXP(habit: Habit, isSundayChallenge: boolean = false): number {
  let baseXP = getXPForDifficulty(habit.difficulty);

  // Apply frequency multipliers
  if (habit.frequency.type === 'weekly' || habit.frequency.type === 'days_per_week') {
    baseXP *= WEEKLY_MULTIPLIER;
  } else if (habit.frequency.type === 'monthly') {
    baseXP *= MONTHLY_MULTIPLIER;
  }

  // Apply Sunday challenge multiplier
  if (isSundayChallenge && prdConfig.gamification.sunday_challenge.enabled) {
    baseXP *= prdConfig.gamification.sunday_challenge.multiplier;
  }

  return Math.round(baseXP);
}

export function getXPForNextLevel(currentLevel: number): number {
  // Formula: XP needed = level * 100
  return currentLevel * 100;
}

export function calculateLevel(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;

  while (totalXP >= xpNeeded) {
    xpNeeded += level * 100;
    if (totalXP >= xpNeeded) {
      level++;
    }
  }

  return level;
}

export function getProgressToNextLevel(totalXP: number, currentLevel: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  // Calculate XP at start of current level
  let xpAtLevelStart = 0;
  for (let i = 1; i < currentLevel; i++) {
    xpAtLevelStart += i * 100;
  }

  const current = totalXP - xpAtLevelStart;
  const needed = currentLevel * 100;
  const percentage = Math.min(Math.round((current / needed) * 100), 100);

  return { current, needed, percentage };
}

export function checkLevelUp(oldXP: number, newXP: number): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
} {
  const oldLevel = calculateLevel(oldXP);
  const newLevel = calculateLevel(newXP);

  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}

export function getUnlockedFeatures(level: number): string[] {
  const features: string[] = [];
  const benefits = prdConfig.gamification.xp_system.level_benefits;

  benefits.forEach((benefit) => {
    if (level >= benefit.level) {
      features.push(benefit.unlock);
    }
  });

  return features;
}

export function canUseStreakInsurance(userProgress: UserProgress): {
  canUse: boolean;
  reason?: string;
} {
  const insurance = prdConfig.gamification.streak_insurance;

  if (!insurance.enabled) {
    return { canUse: false, reason: 'Streak insurance is not enabled' };
  }

  if (userProgress.level < insurance.unlock_level) {
    return {
      canUse: false,
      reason: `Unlock at level ${insurance.unlock_level}`,
    };
  }

  if (userProgress.total_xp < insurance.cost_xp) {
    return {
      canUse: false,
      reason: `Need ${insurance.cost_xp} XP`,
    };
  }

  if (userProgress.streak_freezes_remaining >= insurance.max_uses_per_month) {
    return {
      canUse: false,
      reason: `Max ${insurance.max_uses_per_month} uses per month`,
    };
  }

  return { canUse: true };
}

export function purchaseStreakInsurance(userProgress: UserProgress): UserProgress {
  const insurance = prdConfig.gamification.streak_insurance;

  return {
    ...userProgress,
    total_xp: userProgress.total_xp - insurance.cost_xp,
    streak_freezes_remaining: userProgress.streak_freezes_remaining + 1,
  };
}

export function isSundayChallenge(userLevel: number): boolean {
  const sunday = prdConfig.gamification.sunday_challenge;
  if (!sunday.enabled) return false;
  if (userLevel < sunday.unlock_level) return false;

  const today = new Date().getDay();
  return today === 0; // 0 = Sunday
}

export function checkBadgeUnlock(
  userProgress: UserProgress,
  currentStreak: number
): string[] {
  const newBadges: string[] = [];
  const badges = prdConfig.gamification.badges;

  badges.forEach((badge) => {
    // Skip if already earned
    if (userProgress.badges_earned.includes(badge.id)) return;

    // Check streak-based badges
    if (badge.streak && currentStreak >= badge.streak) {
      newBadges.push(badge.id);
    }

    // Check special badges (like Sunday Warrior)
    if (badge.special && badge.id === 'sunday_warrior') {
      // This would be checked when all Sunday tasks are completed
      // Implementation depends on your task completion logic
    }
  });

  return newBadges;
}

export function getBadgeInfo(badgeId: string) {
  return prdConfig.gamification.badges.find((b) => b.id === badgeId);
}
