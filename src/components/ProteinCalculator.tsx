import React, { useState } from 'react';
import './ProteinCalculator.css';

const ProteinCalculator: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [proteinTarget, setProteinTarget] = useState<number | null>(null);

  const calculateProtein = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return;
    }

    // Convert to kg if in lbs
    const weightInKg = unit === 'lbs' ? weightNum / 2.20462 : weightNum;

    // 1g protein per kg bodyweight
    const target = Math.round(weightInKg);
    setProteinTarget(target);
  };

  const getMealExamples = (target: number) => {
    if (target < 60) {
      return [
        { meal: '100g chicken breast', protein: '31g' },
        { meal: '2 large eggs', protein: '13g' },
        { meal: '1 cup Greek yogurt', protein: '17g' }
      ];
    } else if (target < 80) {
      return [
        { meal: '150g chicken breast', protein: '46g' },
        { meal: '3 large eggs', protein: '19g' },
        { meal: '1 scoop whey protein', protein: '25g' }
      ];
    } else {
      return [
        { meal: '200g chicken breast', protein: '62g' },
        { meal: '4 large eggs', protein: '25g' },
        { meal: '1.5 scoops whey protein', protein: '38g' },
        { meal: '150g tuna', protein: '40g' }
      ];
    }
  };

  return (
    <div className="protein-calculator">
      <div className="calculator-header">
        <h3>Protein Calculator</h3>
        <p className="calculator-subtitle">Calculate your daily protein target based on bodyweight</p>
      </div>

      <div className="calculator-input-group">
        <div className="input-wrapper">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter your weight"
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

        <button onClick={calculateProtein} className="calculate-btn">
          Calculate
        </button>
      </div>

      {proteinTarget !== null && (
        <div className="calculator-results">
          <div className="result-main">
            <div className="result-label">Daily Protein Target</div>
            <div className="result-value">{proteinTarget}g</div>
            <div className="result-note">1g per kg bodyweight for muscle maintenance & growth</div>
          </div>

          <div className="meal-examples">
            <h4>Example Meals to Hit {proteinTarget}g:</h4>
            <div className="meal-list">
              {getMealExamples(proteinTarget).map((meal, idx) => (
                <div key={idx} className="meal-item">
                  <span className="meal-name">{meal.meal}</span>
                  <span className="meal-protein">{meal.protein}</span>
                </div>
              ))}
            </div>
            <div className="total-example">
              Total: {getMealExamples(proteinTarget).reduce((sum, meal) =>
                sum + parseInt(meal.protein), 0)}g protein
            </div>
          </div>

          <div className="protein-tips">
            <h4>Pro Tips:</h4>
            <ul>
              <li>Spread protein intake across 3-4 meals for optimal absorption</li>
              <li>Aim for 20-40g protein per meal</li>
              <li>Post-workout: consume protein within 2 hours</li>
              <li>Lean sources: chicken, fish, eggs, Greek yogurt, whey protein</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProteinCalculator;
