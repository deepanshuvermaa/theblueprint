import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const percentageRounded = Math.round(percentage);

  return (
    <div className="progress-bar-container">
      {label && <div className="progress-label">{label}</div>}

      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="progress-text">
          {current}/{total} - {percentageRounded}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
