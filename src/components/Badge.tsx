import React from 'react';
import { Badge as BadgeType } from '../types';
import './Badge.css';

interface BadgeProps {
  badge: BadgeType;
  earned: boolean;
}

const Badge: React.FC<BadgeProps> = ({ badge, earned }) => {
  return (
    <div className={`badge ${earned ? 'badge-earned' : 'badge-locked'}`}>
      <div className="badge-icon">{badge.icon}</div>
      <div className="badge-info">
        <div className="badge-title">{badge.title}</div>
        {badge.streak && (
          <div className="badge-requirement">
            {badge.streak} day streak
          </div>
        )}
        {badge.description && (
          <div className="badge-description">{badge.description}</div>
        )}
        {!earned && <div className="badge-status">Locked</div>}
      </div>
    </div>
  );
};

export default Badge;
