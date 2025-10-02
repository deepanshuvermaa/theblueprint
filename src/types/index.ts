export type FrequencyType = 'daily' | 'weekly' | 'days_per_week' | 'monthly';
export type DifficultyType = 'easy' | 'medium' | 'hard';

export interface Frequency {
  type: FrequencyType;
  count?: number;
  flexible: boolean;
  optional: boolean;
}

export interface Milestone {
  day: number;
  upgrade: string;
}

export interface Scaling {
  enabled: boolean;
  milestones: Milestone[];
}

export interface Habit {
  id: string;
  title: string;
  why: string;
  how: string;
  frequency: Frequency;
  difficulty: DifficultyType;
  category: string;
  skills?: string[];
  scaling?: Scaling;
}

export interface Pillar {
  id: string;
  name: string;
  icon: string;
  habits: Habit[];
}

export interface Badge {
  id: string;
  streak?: number;
  special?: boolean;
  title: string;
  icon: string;
  description?: string;
}

export interface CompletedTask {
  habitId: string;
  date: string; // ISO format
  timestamp: number;
  xpEarned: number;
}

export interface SavedLink {
  id: string;
  habitId: string;
  url: string;
  title: string;
  description?: string;
  addedAt: number; // timestamp
}

export interface RunData {
  id: string;
  date: string;
  distance: number; // meters
  duration: number; // seconds
  calories: number;
  pace: number; // min/km
  route: Array<{ lat: number; lng: number; timestamp: number }>;
  newStreets: number;
  timestamp: number;
}

export interface UserProgress {
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  completed_tasks: CompletedTask[];
  streak_freezes_remaining: number;
  badges_earned: string[];
  join_date: string | null;
  timezone: string;
  selected_pillars: string[];
  onboarding_completed: boolean;
  last_completed_date: string | null;
  weekly_task_tracking: Record<string, number>; // habitId -> count for current week
  monthly_task_tracking: Record<string, number>; // habitId -> count for current month
  last_mark_time: Record<string, number>; // habitId -> timestamp for anti-gaming
  pillar_unlock_milestones_shown: number[]; // Track which milestone prompts have been shown
  saved_links: SavedLink[]; // User's custom resource links
  runs: RunData[]; // GPS tracked runs
  total_distance: number; // Total meters walked/run
  streets_explored: string[]; // Street IDs discovered
}

export interface OnboardingStep {
  type: 'welcome' | 'pillar_selection' | 'commitment';
  message: string;
  min?: number;
  max?: number;
  duration_days?: number;
}

export interface PRDConfig {
  app_name: string;
  version: string;
  theme: {
    style: string;
    colors: {
      background: string;
      text: string;
      accent: string;
      heatmap: {
        empty: string;
        low: string;
        medium: string;
        high: string;
      };
    };
    fonts: string;
    design_rules: string;
  };
  streak_rules: {
    grace_period_hours: number;
    minimum_completion_rate: number;
    weekend_mode: boolean;
    timezone_aware: boolean;
    prevent_future_completion: boolean;
    require_time_between_marks_seconds: number;
  };
  xp_system: {
    difficulty_tiers: {
      easy: number;
      medium: number;
      hard: number;
    };
    level_up_formula: string;
    weekly_task_multiplier: number;
    monthly_task_multiplier: number;
  };
  onboarding: {
    steps: OnboardingStep[];
  };
  pillars: Pillar[];
  gamification: {
    badges: Badge[];
    streak_insurance: {
      enabled: boolean;
      cost_xp: number;
      max_uses_per_month: number;
      unlock_level: number;
      description: string;
    };
    sunday_challenge: {
      enabled: boolean;
      title: string;
      multiplier: number;
      badge: string;
      unlock_level: number;
    };
  };
  notifications: {
    motivation: string[];
  };
}
