import React from 'react';
import './Heatmap.css';

interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface HeatmapProps {
  data: HeatmapData[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const generateLast365Days = (): Date[] => {
    const days: Date[] = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    return days;
  };

  const getLevel = (dateStr: string): number => {
    const item = data.find(d => d.date === dateStr);
    return item ? item.level : 0;
  };

  const getCount = (dateStr: string): number => {
    const item = data.find(d => d.date === dateStr);
    return item ? item.count : 0;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLevelClass = (level: number): string => {
    switch (level) {
      case 0: return 'heatmap-cell-empty';
      case 1: return 'heatmap-cell-level1';
      case 2: return 'heatmap-cell-level2';
      case 3: return 'heatmap-cell-level3';
      case 4: return 'heatmap-cell-level4';
      default: return 'heatmap-cell-empty';
    }
  };

  const days = generateLast365Days();
  const weeks: Date[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h3>365 Day Streak</h3>
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <div className="legend-cell heatmap-cell-empty"></div>
          <div className="legend-cell heatmap-cell-level1"></div>
          <div className="legend-cell heatmap-cell-level2"></div>
          <div className="legend-cell heatmap-cell-level3"></div>
          <div className="legend-cell heatmap-cell-level4"></div>
          <span className="legend-label">More</span>
        </div>
      </div>

      <div className="heatmap-wrapper">
        <div className="heatmap-day-labels">
          {weekDays.map((day, idx) => (
            <div key={idx} className="day-label">
              {day}
            </div>
          ))}
        </div>

        <div className="heatmap-grid">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="heatmap-week">
              {week.map((day, dayIdx) => {
                const dateStr = formatDate(day);
                const level = getLevel(dateStr);
                const count = getCount(dateStr);

                return (
                  <div
                    key={dayIdx}
                    className={`heatmap-cell ${getLevelClass(level)}`}
                    data-tooltip={`${formatDisplayDate(day)}: ${count} tasks`}
                  >
                    <div className="tooltip">
                      {formatDisplayDate(day)}<br />
                      {count} {count === 1 ? 'task' : 'tasks'}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
