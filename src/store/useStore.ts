import { create } from 'zustand';
import { UserProgress, Habit, Pillar, CompletedTask, SavedLink, RunData } from '../types';
import prdConfig from '../../prd.json';
import {
  getUserProgress,
  saveUserProgress,
  getInitialUserProgress,
  addCompletedTask,
} from '../utils/storage';
import {
  getEffectiveDate,
  canMarkTask,
  calculateStreak,
  getDailyProgress,
} from '../utils/streakEngine';
import {
  calculateTaskXP,
  calculateLevel,
  checkLevelUp,
  checkBadgeUnlock,
  isSundayChallenge,
} from '../utils/xpSystem';

interface AppState {
  // Data
  userProgress: UserProgress | null;
  pillars: Pillar[];
  isLoading: boolean;

  // Actions
  initializeApp: () => Promise<void>;
  selectPillars: (pillarIds: string[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  markHabitComplete: (habitId: string) => Promise<{ success: boolean; message?: string }>;
  getActiveHabits: () => Habit[];
  getCurrentStreak: () => number;
  getTodayProgress: () => { completed: number; total: number; percentage: number };
  resetProgress: () => Promise<void>;
  addPillar: (pillarId: string) => Promise<void>;
  markMilestoneShown: (milestone: number) => Promise<void>;
  addSavedLink: (link: Omit<SavedLink, 'id' | 'addedAt'>) => Promise<void>;
  removeSavedLink: (linkId: string) => Promise<void>;
  getSavedLinksByHabit: (habitId: string) => SavedLink[];
  saveRun: (run: RunData) => Promise<void>;
  getRuns: () => RunData[];
  getTotalDistance: () => number;
}

export const useStore = create<AppState>((set, get) => ({
  userProgress: null,
  pillars: prdConfig.pillars as Pillar[],
  isLoading: true,

  initializeApp: async () => {
    set({ isLoading: true });
    try {
      let progress = await getUserProgress();

      if (!progress) {
        progress = getInitialUserProgress();
        await saveUserProgress(progress);
      }

      // Update level based on total XP
      const calculatedLevel = calculateLevel(progress.total_xp);
      if (calculatedLevel !== progress.level) {
        progress.level = calculatedLevel;
        await saveUserProgress(progress);
      }

      set({ userProgress: progress, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ isLoading: false });
    }
  },

  selectPillars: async (pillarIds: string[]) => {
    const { userProgress } = get();
    if (!userProgress) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      selected_pillars: pillarIds,
    };

    await saveUserProgress(updatedProgress);
    set({ userProgress: updatedProgress });
  },

  completeOnboarding: async () => {
    const { userProgress } = get();
    if (!userProgress) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      onboarding_completed: true,
    };

    await saveUserProgress(updatedProgress);
    set({ userProgress: updatedProgress });
  },

  markHabitComplete: async (habitId: string) => {
    const { userProgress, getActiveHabits } = get();
    if (!userProgress) {
      return { success: false, message: 'User progress not initialized' };
    }

    const effectiveDate = getEffectiveDate();

    // Check if can mark
    const checkResult = canMarkTask(habitId, userProgress, effectiveDate);
    if (!checkResult.canMark) {
      return { success: false, message: checkResult.reason };
    }

    // Find the habit
    const activeHabits = getActiveHabits();
    const habit = activeHabits.find((h) => h.id === habitId);
    if (!habit) {
      return { success: false, message: 'Habit not found' };
    }

    // Calculate XP
    const isSunday = isSundayChallenge(userProgress.level);
    const xpEarned = calculateTaskXP(habit, isSunday);

    // Create completed task
    const completedTask: CompletedTask = {
      habitId,
      date: effectiveDate,
      timestamp: Date.now(),
      xpEarned,
    };

    // Update progress
    const newTotalXP = userProgress.total_xp + xpEarned;
    const levelUpResult = checkLevelUp(userProgress.total_xp, newTotalXP);

    // Calculate new streak
    const tempProgress = {
      ...userProgress,
      completed_tasks: [...userProgress.completed_tasks, completedTask],
    };
    const newStreak = calculateStreak(tempProgress, activeHabits);

    // Check for badge unlocks
    const newBadges = checkBadgeUnlock(userProgress, newStreak);

    // Update weekly/monthly tracking
    const weeklyTracking = { ...userProgress.weekly_task_tracking };
    const monthlyTracking = { ...userProgress.monthly_task_tracking };

    if (habit.frequency.type === 'days_per_week' || habit.frequency.type === 'weekly') {
      weeklyTracking[habitId] = (weeklyTracking[habitId] || 0) + 1;
    }

    if (habit.frequency.type === 'monthly') {
      monthlyTracking[habitId] = (monthlyTracking[habitId] || 0) + 1;
    }

    // Update last mark time
    const lastMarkTime = { ...userProgress.last_mark_time };
    lastMarkTime[habitId] = Date.now();

    const updatedProgress: UserProgress = {
      ...userProgress,
      completed_tasks: [...userProgress.completed_tasks, completedTask],
      total_xp: newTotalXP,
      level: levelUpResult.newLevel,
      current_streak: newStreak,
      longest_streak: Math.max(userProgress.longest_streak, newStreak),
      last_completed_date: effectiveDate,
      badges_earned: [...userProgress.badges_earned, ...newBadges],
      weekly_task_tracking: weeklyTracking,
      monthly_task_tracking: monthlyTracking,
      last_mark_time: lastMarkTime,
    };

    await saveUserProgress(updatedProgress);
    await addCompletedTask(completedTask);

    set({ userProgress: updatedProgress });

    let message = `+${xpEarned} XP`;
    if (levelUpResult.leveledUp) {
      message += ` • Level ${levelUpResult.newLevel}!`;
    }
    if (newBadges.length > 0) {
      message += ` • New badge unlocked!`;
    }

    return { success: true, message };
  },

  getActiveHabits: () => {
    const { userProgress, pillars } = get();
    if (!userProgress) return [];

    const activeHabits: Habit[] = [];
    pillars.forEach((pillar) => {
      if (userProgress.selected_pillars.includes(pillar.id)) {
        activeHabits.push(...pillar.habits);
      }
    });

    return activeHabits;
  },

  getCurrentStreak: () => {
    const { userProgress, getActiveHabits } = get();
    if (!userProgress) return 0;

    const activeHabits = getActiveHabits();
    return calculateStreak(userProgress, activeHabits);
  },

  getTodayProgress: () => {
    const { userProgress, getActiveHabits } = get();
    if (!userProgress) return { completed: 0, total: 0, percentage: 0 };

    const activeHabits = getActiveHabits();
    return getDailyProgress(userProgress, activeHabits);
  },

  resetProgress: async () => {
    const freshProgress = getInitialUserProgress();
    await saveUserProgress(freshProgress);
    set({ userProgress: freshProgress });
  },

  addPillar: async (pillarId: string) => {
    const { userProgress } = get();
    if (!userProgress) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      selected_pillars: [...userProgress.selected_pillars, pillarId],
    };

    await saveUserProgress(updatedProgress);
    set({ userProgress: updatedProgress });
  },

  markMilestoneShown: async (milestone: number) => {
    const { userProgress } = get();
    if (!userProgress) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      pillar_unlock_milestones_shown: [
        ...userProgress.pillar_unlock_milestones_shown,
        milestone,
      ],
    };

    await saveUserProgress(updatedProgress);
    set({ userProgress: updatedProgress });
  },

  addSavedLink: async (link: Omit<SavedLink, 'id' | 'addedAt'>) => {
    const { userProgress } = get();
    if (!userProgress) return;

    const newLink: SavedLink = {
      ...link,
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: Date.now(),
    };

    const updatedProgress: UserProgress = {
      ...userProgress,
      saved_links: [...userProgress.saved_links, newLink],
    };

    await saveUserProgress(updatedProgress);
    set({ userProgress: updatedProgress });
  },

  removeSavedLink: async (linkId: string) => {
    const { userProgress } = get();
    if (!userProgress) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      saved_links: userProgress.saved_links.filter((link) => link.id !== linkId),
    };

    await saveUserProgress(updatedProgress);
    set({ userProgress: updatedProgress });
  },

  getSavedLinksByHabit: (habitId: string) => {
    const { userProgress } = get();
    if (!userProgress) return [];

    return userProgress.saved_links.filter((link) => link.habitId === habitId);
  },

  saveRun: async (run: RunData) => {
    const { userProgress } = get();
    if (!userProgress) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      runs: [...userProgress.runs, run],
      total_distance: userProgress.total_distance + run.distance,
    };

    await saveUserProgress(updatedProgress);
    set({ userProgress: updatedProgress });
  },

  getRuns: () => {
    const { userProgress } = get();
    if (!userProgress) return [];
    return userProgress.runs;
  },

  getTotalDistance: () => {
    const { userProgress } = get();
    if (!userProgress) return 0;
    return userProgress.total_distance;
  },
}));
