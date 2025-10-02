import { format, parseISO, startOfDay, addHours, isAfter, isBefore } from 'date-fns';
import { UserProgress, Habit } from '../types';
import prdConfig from '../../prd.json';

const GRACE_PERIOD_HOURS = prdConfig.streak_rules.grace_period_hours;
const MIN_COMPLETION_RATE = prdConfig.streak_rules.minimum_completion_rate;

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return format(yesterday, 'yyyy-MM-dd');
}

export function isWithinGracePeriod(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour < GRACE_PERIOD_HOURS;
}

export function getEffectiveDate(): string {
  // If within grace period (before 3 AM), consider it yesterday
  if (isWithinGracePeriod()) {
    return getYesterdayDateString();
  }
  return getTodayDateString();
}

export function canMarkTask(
  habitId: string,
  userProgress: UserProgress,
  currentDate: string = getTodayDateString()
): { canMark: boolean; reason?: string } {
  const now = Date.now();

  // Check anti-gaming cooldown
  const lastMarkTime = userProgress.last_mark_time[habitId];
  if (lastMarkTime) {
    const timeSinceLastMark = (now - lastMarkTime) / 1000; // in seconds
    if (timeSinceLastMark < prdConfig.anti_gaming.require_time_between_marks) {
      return {
        canMark: false,
        reason: 'Please wait 5 minutes between marking tasks',
      };
    }
  }

  // Check if already completed today
  const effectiveDate = getEffectiveDate();
  const alreadyCompleted = userProgress.completed_tasks.some(
    (task) => task.habitId === habitId && task.date === effectiveDate
  );

  if (alreadyCompleted) {
    return {
      canMark: false,
      reason: 'Task already completed today',
    };
  }

  // Prevent future completion
  if (prdConfig.anti_gaming.prevent_future_completion) {
    const taskDate = parseISO(currentDate);
    const today = startOfDay(new Date());

    if (isAfter(taskDate, today)) {
      return {
        canMark: false,
        reason: 'Cannot complete future tasks',
      };
    }
  }

  // Check retroactive limit
  const taskDate = parseISO(currentDate);
  const maxRetroactiveDate = addHours(
    startOfDay(new Date()),
    -prdConfig.anti_gaming.max_retroactive_hours
  );

  if (isBefore(taskDate, maxRetroactiveDate)) {
    return {
      canMark: false,
      reason: 'Task is too old to mark retroactively',
    };
  }

  return { canMark: true };
}

export function calculateStreak(userProgress: UserProgress, activeHabits: Habit[]): number {
  if (userProgress.completed_tasks.length === 0) return 0;

  // Group tasks by date
  const tasksByDate: Record<string, Set<string>> = {};
  userProgress.completed_tasks.forEach((task) => {
    if (!tasksByDate[task.date]) {
      tasksByDate[task.date] = new Set();
    }
    tasksByDate[task.date].add(task.habitId);
  });

  // Get required daily habits (not optional, type is daily)
  const requiredDailyHabits = activeHabits.filter(
    (habit) =>
      habit.frequency.type === 'daily' &&
      !habit.frequency.optional &&
      userProgress.selected_pillars.includes(habit.category)
  );

  const requiredCount = requiredDailyHabits.length;
  const minCompletions = Math.ceil(requiredCount * MIN_COMPLETION_RATE);

  let streak = 0;
  let currentDate = startOfDay(new Date());

  // Check if within grace period for today
  if (isWithinGracePeriod()) {
    currentDate = startOfDay(parseISO(getYesterdayDateString()));
  }

  // Count backwards from today
  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const completedOnDate = tasksByDate[dateStr]?.size || 0;

    if (completedOnDate >= minCompletions) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getDailyProgress(
  userProgress: UserProgress,
  activeHabits: Habit[]
): { completed: number; total: number; percentage: number } {
  const effectiveDate = getEffectiveDate();

  const completedToday = userProgress.completed_tasks.filter(
    (task) => task.date === effectiveDate
  );

  const dailyHabits = activeHabits.filter(
    (habit) =>
      habit.frequency.type === 'daily' &&
      !habit.frequency.optional &&
      userProgress.selected_pillars.includes(habit.category)
  );

  const completed = completedToday.length;
  const total = dailyHabits.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

export function getWeeklyProgress(
  userProgress: UserProgress,
  habitId: string
): { completed: number; required: number } {
  const count = userProgress.weekly_task_tracking[habitId] || 0;
  // You'd need to pass the habit to get required count
  return { completed: count, required: 0 };
}

export function shouldBreakStreak(
  userProgress: UserProgress,
  activeHabits: Habit[]
): boolean {
  const yesterday = getYesterdayDateString();
  const tasksYesterday = userProgress.completed_tasks.filter(
    (task) => task.date === yesterday
  );

  const requiredDailyHabits = activeHabits.filter(
    (habit) =>
      habit.frequency.type === 'daily' &&
      !habit.frequency.optional &&
      userProgress.selected_pillars.includes(habit.category)
  );

  const requiredCount = requiredDailyHabits.length;
  const minCompletions = Math.ceil(requiredCount * MIN_COMPLETION_RATE);

  return tasksYesterday.length < minCompletions;
}

export function getHeatmapData(
  userProgress: UserProgress,
  days: number = 365
): Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }> {
  const data: Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }> = [];
  const tasksByDate: Record<string, number> = {};

  // Count tasks by date
  userProgress.completed_tasks.forEach((task) => {
    tasksByDate[task.date] = (tasksByDate[task.date] || 0) + 1;
  });

  // Generate data for last N days
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = tasksByDate[dateStr] || 0;

    // Calculate intensity level (0-4) - GitHub style
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) level = 1;
    if (count >= 5) level = 2;
    if (count >= 10) level = 3;
    if (count >= 15) level = 4;

    data.push({ date: dateStr, count, level });
  }

  return data;
}
