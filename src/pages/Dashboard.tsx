import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { HabitCard } from '../components/HabitCard';
import ProgressBar from '../components/ProgressBar';
import Heatmap from '../components/Heatmap';
import StatsCard from '../components/StatsCard';
import PillarUnlockModal from '../components/PillarUnlockModal';
import { getHeatmapData, getEffectiveDate } from '../utils/streakEngine';
import { getProgressToNextLevel } from '../utils/xpSystem';
import prdConfig from '../../prd.json';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    userProgress,
    getActiveHabits,
    getCurrentStreak,
    getTodayProgress,
    markHabitComplete,
    addPillar,
    markMilestoneShown,
    pillars,
  } = useStore();

  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [showPillarUnlock, setShowPillarUnlock] = useState(false);

  useEffect(() => {
    if (!userProgress?.onboarding_completed) {
      navigate('/onboarding');
      return;
    }

    // Set random motivational quote
    const quotes = prdConfig.notifications.motivation;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMotivationalQuote(randomQuote);

    // Check for pillar unlock milestones (7, 14, 21, 30 days)
    const currentStreak = getCurrentStreak();
    const milestones = [7, 14, 21, 30];
    const unlockedPillarsCount = userProgress.selected_pillars.length;
    const totalPillars = pillars.length;

    // Only show if user hasn't unlocked all pillars
    if (unlockedPillarsCount < totalPillars) {
      for (const milestone of milestones) {
        if (
          currentStreak >= milestone &&
          !userProgress.pillar_unlock_milestones_shown.includes(milestone)
        ) {
          setShowPillarUnlock(true);
          markMilestoneShown(milestone);
          break;
        }
      }
    }
  }, [userProgress, navigate, getCurrentStreak, markMilestoneShown, pillars]);

  if (!userProgress) {
    return (
      <div className="dashboard">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const activeHabits = getActiveHabits();
  const currentStreak = getCurrentStreak();
  const todayProgress = getTodayProgress();
  const heatmapData = getHeatmapData(userProgress, 365);
  const levelProgress = getProgressToNextLevel(userProgress.total_xp, userProgress.level);
  const effectiveDate = getEffectiveDate();

  // Group habits by pillar
  const habitsByPillar: Record<string, typeof activeHabits> = {};
  activeHabits.forEach((habit) => {
    if (!habitsByPillar[habit.category]) {
      habitsByPillar[habit.category] = [];
    }
    habitsByPillar[habit.category].push(habit);
  });

  // Check which habits are completed today
  const completedToday = new Set(
    userProgress.completed_tasks
      .filter((task) => task.date === effectiveDate)
      .map((task) => task.habitId)
  );

  const isSunday = new Date().getDay() === 0;
  const isSundayChallenge =
    isSunday &&
    prdConfig.gamification.sunday_challenge.enabled &&
    userProgress.level >= prdConfig.gamification.sunday_challenge.unlock_level;

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard__header">
          <div className="dashboard__title-section">
            <h1 className="dashboard__title">THE BLUEPRINT</h1>
            <p className="dashboard__subtitle">it takes just 30 days</p>
            <p className="dashboard__quote">{motivationalQuote}</p>
          </div>
          <button
            className="dashboard__menu-btn"
            onClick={() => navigate('/profile')}
          >
            ☰
          </button>
        </div>

        {/* Stats Row */}
        <div className="dashboard__stats">
          <StatsCard label="Current Streak" value={`${currentStreak} days`} icon="🔥" />
          <StatsCard label="Level" value={userProgress.level.toString()} icon="⭐" />
          <StatsCard label="Total XP" value={userProgress.total_xp.toString()} icon="💎" />
        </div>

        {/* Level Progress */}
        <div className="dashboard__section">
          <ProgressBar
            label={`Level ${userProgress.level} Progress`}
            current={levelProgress.current}
            total={levelProgress.needed}
          />
        </div>

        {/* Today's Progress */}
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">
            Today's Progress {isSundayChallenge && '🔥 SUNDAY CHALLENGE (3X XP)'}
          </h2>
          <ProgressBar
            current={todayProgress.completed}
            total={todayProgress.total}
          />
        </div>

        {/* Habits by Pillar */}
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">Today's Habits</h2>
          {Object.entries(habitsByPillar).map(([pillarId, habits]) => {
            const pillar = useStore.getState().pillars.find((p) => p.id === pillarId);
            if (!pillar) return null;

            // Filter daily habits for today
            const dailyHabits = habits.filter(
              (h) => h.frequency.type === 'daily' && !h.frequency.optional
            );

            if (dailyHabits.length === 0) return null;

            return (
              <div key={pillarId} className="dashboard__pillar-section">
                <h3 className="dashboard__pillar-title">
                  {pillar.icon} {pillar.name}
                </h3>
                {dailyHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={completedToday.has(habit.id)}
                    onComplete={markHabitComplete}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Heatmap */}
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">Your Journey</h2>
          <Heatmap data={heatmapData} />
        </div>
      </div>

      {/* Pillar Unlock Modal */}
      <PillarUnlockModal
        isOpen={showPillarUnlock}
        onClose={() => setShowPillarUnlock(false)}
        availablePillars={pillars.filter(
          (p) => !userProgress.selected_pillars.includes(p.id)
        )}
        currentStreak={currentStreak}
        onSelectPillar={(pillarId) => {
          addPillar(pillarId);
          setShowPillarUnlock(false);
        }}
      />
    </div>
  );
};
