import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-content">
        {icon && <div className="stats-icon">{icon}</div>}
        <div className="stats-info">
          <div className="stats-value">{value}</div>
          <div className="stats-label">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
