import React, { useState } from 'react';
import { Habit, RunData } from '../types';
import { AssetModal } from './AssetModal';
import EnhancedRunTracker from './EnhancedRunTracker';
import { useStore } from '../store/useStore';
import './HabitCard.css';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: (habitId: string) => Promise<{ success: boolean; message?: string }>;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, onComplete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showRunTracker, setShowRunTracker] = useState(false);

  const { saveRun } = useStore();

  const isWalkingHabit = habit.title.toLowerCase().includes('10,000 steps') ||
                         habit.title.toLowerCase().includes('walk');

  const handleSaveRun = async (runData: RunData) => {
    await saveRun(runData);
    // Optionally auto-complete the habit if distance >= 8km (approximately 10k steps)
    if (runData.distance >= 8000 && !isCompleted) {
      await onComplete(habit.id);
    }
  };

  const handleComplete = async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);
    const result = await onComplete(habit.id);
    setIsLoading(false);

    if (!result.success && result.message) {
      alert(result.message);
    }
  };

  return (
    <div className={`habit-card ${isCompleted ? 'habit-card--completed' : ''}`}>
      <div className="habit-card__main" onClick={() => setShowDetails(!showDetails)}>
        <div className="habit-card__left">
          <div
            className={`habit-card__checkbox ${isCompleted ? 'habit-card__checkbox--checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
          >
            {isCompleted && '✓'}
          </div>
          <div className="habit-card__content">
            <h3 className="habit-card__title">{habit.title}</h3>
            <div className="habit-card__meta">
              <span className={`habit-card__difficulty habit-card__difficulty--${habit.difficulty}`}>
                {habit.difficulty.toUpperCase()}
              </span>
              <span className="habit-card__frequency">
                {habit.frequency.type === 'daily' && 'Daily'}
                {habit.frequency.type === 'weekly' && 'Weekly'}
                {habit.frequency.type === 'days_per_week' && `${habit.frequency.count}x/week`}
                {habit.frequency.type === 'monthly' && 'Monthly'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="habit-card__details fade-in">
          <div className="habit-card__detail-section">
            <strong>Why:</strong>
            <p>{habit.why}</p>
          </div>
          <div className="habit-card__detail-section">
            <strong>How:</strong>
            <p>{habit.how}</p>
          </div>
          {isWalkingHabit && (
            <button
              className="habit-card__asset-btn habit-card__asset-btn--track"
              onClick={(e) => {
                e.stopPropagation();
                setShowRunTracker(true);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c-4.4 0-8 3.6-8 8 0 5.4 8 14 8 14s8-8.6 8-14c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
              </svg>
              Track Run 🗺️
            </button>
          )}

          <button
            className="habit-card__asset-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowAssetModal(true);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Assets
          </button>
        </div>
      )}

      <AssetModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        habitKey={habit.title}
        habitName={habit.title}
        habitId={habit.id}
      />

      {isWalkingHabit && (
        <EnhancedRunTracker
          isOpen={showRunTracker}
          onClose={() => setShowRunTracker(false)}
          onSaveRun={handleSaveRun}
        />
      )}
    </div>
  );
};
