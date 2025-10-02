import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserProgress, CompletedTask } from '../types';

interface TheBlueprintDB extends DBSchema {
  userProgress: {
    key: string;
    value: UserProgress;
  };
  completedTasks: {
    key: number;
    value: CompletedTask;
    indexes: { 'by-date': string; 'by-habit': string };
  };
}

const DB_NAME = 'the-blueprint-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<TheBlueprintDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<TheBlueprintDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<TheBlueprintDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // User progress store
      if (!db.objectStoreNames.contains('userProgress')) {
        db.createObjectStore('userProgress');
      }

      // Completed tasks store
      if (!db.objectStoreNames.contains('completedTasks')) {
        const taskStore = db.createObjectStore('completedTasks', {
          keyPath: 'timestamp',
          autoIncrement: false,
        });
        taskStore.createIndex('by-date', 'date');
        taskStore.createIndex('by-habit', 'habitId');
      }
    },
  });

  return dbInstance;
}

// User Progress Methods
export async function saveUserProgress(progress: UserProgress): Promise<void> {
  const db = await initDB();
  await db.put('userProgress', progress, 'current');
  // Also save to localStorage as backup
  localStorage.setItem('user_progress', JSON.stringify(progress));
}

export async function getUserProgress(): Promise<UserProgress | null> {
  try {
    const db = await initDB();
    const progress = await db.get('userProgress', 'current');
    return progress || null;
  } catch (error) {
    console.error('Error reading from IndexedDB, falling back to localStorage:', error);
    const stored = localStorage.getItem('user_progress');
    return stored ? JSON.parse(stored) : null;
  }
}

export async function addCompletedTask(task: CompletedTask): Promise<void> {
  const db = await initDB();
  await db.put('completedTasks', task);
}

export async function getCompletedTasksByDate(date: string): Promise<CompletedTask[]> {
  const db = await initDB();
  const index = db.transaction('completedTasks').store.index('by-date');
  return await index.getAll(date);
}

export async function getCompletedTasksByHabit(habitId: string): Promise<CompletedTask[]> {
  const db = await initDB();
  const index = db.transaction('completedTasks').store.index('by-habit');
  return await index.getAll(habitId);
}

export async function clearAllData(): Promise<void> {
  const db = await initDB();
  await db.clear('userProgress');
  await db.clear('completedTasks');
  localStorage.removeItem('user_progress');
}

export function getInitialUserProgress(): UserProgress {
  return {
    current_streak: 0,
    longest_streak: 0,
    total_xp: 0,
    level: 1,
    completed_tasks: [],
    streak_freezes_remaining: 0,
    badges_earned: [],
    join_date: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    selected_pillars: [],
    onboarding_completed: false,
    last_completed_date: null,
    weekly_task_tracking: {},
    monthly_task_tracking: {},
    last_mark_time: {},
    pillar_unlock_milestones_shown: [],
    saved_links: [],
    runs: [],
    total_distance: 0,
    streets_explored: [],
  };
}
