import React, { useState } from 'react';
import './HydrationCalculator.css';

const HydrationCalculator: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [waterTarget, setWaterTarget] = useState<number | null>(null);

  const calculateWater = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return;
    }

    // Convert to kg if in lbs
    const weightInKg = unit === 'lbs' ? weightNum / 2.20462 : weightNum;

    // Base formula: 0.033L per kg bodyweight
    let baseWater = weightInKg * 0.033;

    // Adjust for activity level
    if (activityLevel === 'active') {
      baseWater *= 1.2; // +20% for active individuals
    } else if (activityLevel === 'moderate') {
      baseWater *= 1.1; // +10% for moderate activity
    }

    // Round to 1 decimal place
    const target = Math.round(baseWater * 10) / 10;
    setWaterTarget(target);
  };

  const getGlassCount = (liters: number) => {
    // 1 glass = ~250ml
    return Math.ceil(liters * 4);
  };

  const getHydrationTips = () => {
    return [
      'Drink a glass of water immediately after waking up',
      'Keep a water bottle with you throughout the day',
      'Drink water before, during, and after workouts',
      'Set hourly reminders to drink water',
      'Eat water-rich foods (cucumber, watermelon, oranges)'
    ];
  };

  return (
    <div className="hydration-calculator">
      <div className="calculator-header">
        <h3>Hydration Calculator</h3>
        <p className="calculator-subtitle">Calculate your daily water intake goal based on bodyweight and activity</p>
      </div>

      <div className="calculator-input-section">
        <div className="calculator-input-group">
          <label className="input-label">Your Weight</label>
          <div className="input-wrapper">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              className="calculator-input"
              min="0"
              step="0.1"
            />
            <div className="unit-selector">
              <button
                className={`unit-btn ${unit === 'kg' ? 'active' : ''}`}
                onClick={() => setUnit('kg')}
              >
                kg
              </button>
              <button
                className={`unit-btn ${unit === 'lbs' ? 'active' : ''}`}
                onClick={() => setUnit('lbs')}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        <div className="calculator-input-group">
          <label className="input-label">Activity Level</label>
          <div className="activity-selector">
            <button
              className={`activity-btn ${activityLevel === 'sedentary' ? 'active' : ''}`}
              onClick={() => setActivityLevel('sedentary')}
            >
              Sedentary
            </button>
            <button
              className={`activity-btn ${activityLevel === 'moderate' ? 'active' : ''}`}
              onClick={() => setActivityLevel('moderate')}
            >
              Moderate
            </button>
            <button
              className={`activity-btn ${activityLevel === 'active' ? 'active' : ''}`}
              onClick={() => setActivityLevel('active')}
            >
              Active
            </button>
          </div>
        </div>

        <button onClick={calculateWater} className="calculate-btn">
          Calculate Water Goal
        </button>
      </div>

      {waterTarget !== null && (
        <div className="calculator-results">
          <div className="result-main">
            <div className="result-label">Daily Water Goal</div>
            <div className="result-value">{waterTarget}L</div>
            <div className="result-secondary">≈ {getGlassCount(waterTarget)} glasses (250ml each)</div>
          </div>

          <div className="hydration-breakdown">
            <h4>Hydration Schedule:</h4>
            <div className="schedule-grid">
              <div className="schedule-item">
                <span className="schedule-time">Morning (6-9 AM)</span>
                <span className="schedule-amount">{Math.round(waterTarget * 0.25 * 10) / 10}L</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-time">Midday (9 AM-1 PM)</span>
                <span className="schedule-amount">{Math.round(waterTarget * 0.25 * 10) / 10}L</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-time">Afternoon (1-6 PM)</span>
                <span className="schedule-amount">{Math.round(waterTarget * 0.30 * 10) / 10}L</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-time">Evening (6-10 PM)</span>
                <span className="schedule-amount">{Math.round(waterTarget * 0.20 * 10) / 10}L</span>
              </div>
            </div>
          </div>

          <div className="hydration-tips">
            <h4>Hydration Tips:</h4>
            <ul>
              {getHydrationTips().map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="dehydration-signs">
            <h4>Signs of Dehydration:</h4>
            <div className="signs-grid">
              <div className="sign-item">🥵 Dry mouth</div>
              <div className="sign-item">😴 Fatigue</div>
              <div className="sign-item">🤕 Headache</div>
              <div className="sign-item">🌚 Dark urine</div>
              <div className="sign-item">😵 Dizziness</div>
              <div className="sign-item">🔥 Increased thirst</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HydrationCalculator;
