import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { getProgressToNextLevel } from '../utils/xpSystem';
import prdConfig from '../../prd.json';
import './Profile.css';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userProgress, resetProgress } = useStore();
  const [showResetModal, setShowResetModal] = useState(false);

  if (!userProgress) {
    return <div className="container">Loading...</div>;
  }

  const levelProgress = getProgressToNextLevel(userProgress.total_xp, userProgress.level);
  const allBadges = prdConfig.gamification.badges;

  const handleReset = async () => {
    await resetProgress();
    setShowResetModal(false);
    navigate('/onboarding');
  };

  return (
    <div className="profile">
      <div className="container">
        {/* Header */}
        <div className="profile__header">
          <button className="profile__back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h1 className="profile__title">Profile</h1>
        </div>

        {/* Stats Section */}
        <div className="profile__section">
          <h2 className="profile__section-title">Statistics</h2>
          <div className="profile__stats-grid">
            <div className="profile__stat">
              <div className="profile__stat-label">Current Streak</div>
              <div className="profile__stat-value">{userProgress.current_streak} days</div>
            </div>
            <div className="profile__stat">
              <div className="profile__stat-label">Longest Streak</div>
              <div className="profile__stat-value">{userProgress.longest_streak} days</div>
            </div>
            <div className="profile__stat">
              <div className="profile__stat-label">Level</div>
              <div className="profile__stat-value">{userProgress.level}</div>
            </div>
            <div className="profile__stat">
              <div className="profile__stat-label">Total XP</div>
              <div className="profile__stat-value">{userProgress.total_xp}</div>
            </div>
            <div className="profile__stat">
              <div className="profile__stat-label">Tasks Completed</div>
              <div className="profile__stat-value">{userProgress.completed_tasks.length}</div>
            </div>
            <div className="profile__stat">
              <div className="profile__stat-label">Badges Earned</div>
              <div className="profile__stat-value">{userProgress.badges_earned.length}/{allBadges.length}</div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="profile__section">
          <h2 className="profile__section-title">Level Progress</h2>
          <div className="profile__level-box">
            <div className="profile__level-info">
              <span>Level {userProgress.level}</span>
              <span>{levelProgress.current} / {levelProgress.needed} XP</span>
            </div>
            <div className="profile__level-bar">
              <div
                className="profile__level-fill"
                style={{ width: `${levelProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="profile__section">
          <h2 className="profile__section-title">Badges</h2>
          <div className="profile__badges-grid">
            {allBadges.map((badge) => (
              <Badge
                key={badge.id}
                badge={badge}
                earned={userProgress.badges_earned.includes(badge.id)}
              />
            ))}
          </div>
        </div>

        {/* Selected Pillars */}
        <div className="profile__section">
          <h2 className="profile__section-title">Active Pillars</h2>
          <div className="profile__pillars">
            {userProgress.selected_pillars.map((pillarId) => {
              const pillar = useStore.getState().pillars.find((p) => p.id === pillarId);
              return pillar ? (
                <div key={pillar.id} className="profile__pillar-tag">
                  {pillar.icon} {pillar.name}
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Account Info */}
        <div className="profile__section">
          <h2 className="profile__section-title">Account</h2>
          <div className="profile__info">
            <div className="profile__info-row">
              <span className="profile__info-label">Join Date:</span>
              <span className="profile__info-value">
                {userProgress.join_date
                  ? new Date(userProgress.join_date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="profile__info-row">
              <span className="profile__info-label">Timezone:</span>
              <span className="profile__info-value">{userProgress.timezone}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="profile__section profile__danger-zone">
          <h2 className="profile__section-title">Danger Zone</h2>
          <p className="profile__warning">
            Resetting your progress will delete all your data permanently. This action cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setShowResetModal(true)}>
            Reset All Progress
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Progress?"
      >
        <div className="profile__reset-modal">
          <p>
            Are you absolutely sure you want to reset all your progress? This will delete:
          </p>
          <ul className="profile__reset-list">
            <li>All completed tasks</li>
            <li>Your {userProgress.current_streak}-day streak</li>
            <li>{userProgress.total_xp} XP and Level {userProgress.level}</li>
            <li>All {userProgress.badges_earned.length} earned badges</li>
          </ul>
          <p className="profile__reset-warning">
            This action is permanent and cannot be undone.
          </p>
          <div className="profile__reset-actions">
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
