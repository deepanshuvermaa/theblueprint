import React, { useState, useEffect, useRef } from 'react';
import './BreathingTimer.css';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
  rounds: number;
}

const BREATH_PATTERNS: BreathPattern[] = [
  {
    name: 'Box Breathing (4-4-4-4)',
    description: 'Military technique for stress relief and focus',
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    rounds: 4
  },
  {
    name: 'Wim Hof Breathing (4-0-4-0)',
    description: 'Energizing breathwork for vitality',
    inhale: 4,
    hold: 0,
    exhale: 4,
    rest: 0,
    rounds: 30
  },
  {
    name: 'Relaxation Breathing (4-7-8)',
    description: 'Dr. Andrew Weil technique for sleep and anxiety',
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 0,
    rounds: 4
  },
  {
    name: 'Power Breathing (5-2-5-2)',
    description: 'Balanced breathing for energy and calm',
    inhale: 5,
    hold: 2,
    exhale: 5,
    rest: 2,
    rounds: 5
  }
];

const BreathingTimer: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getPhaseConfig = (phase: BreathPhase) => {
    switch (phase) {
      case 'inhale': return { duration: selectedPattern.inhale, next: 'hold' as BreathPhase };
      case 'hold': return { duration: selectedPattern.hold, next: 'exhale' as BreathPhase };
      case 'exhale': return { duration: selectedPattern.exhale, next: 'rest' as BreathPhase };
      case 'rest': return { duration: selectedPattern.rest, next: 'inhale' as BreathPhase };
    }
  };

  useEffect(() => {
    if (isActive && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setPhaseTime(prev => {
          const config = getPhaseConfig(currentPhase);

          if (prev >= config.duration) {
            // Move to next phase
            if (currentPhase === 'rest' || (currentPhase === 'exhale' && config.duration === 0)) {
              // Round completed
              if (currentRound >= selectedPattern.rounds) {
                setIsCompleted(true);
                setIsActive(false);
                return 0;
              } else {
                setCurrentRound(r => r + 1);
              }
            }

            // Skip phases with 0 duration
            let nextPhase = config.next;
            while (getPhaseConfig(nextPhase).duration === 0) {
              nextPhase = getPhaseConfig(nextPhase).next;
            }

            setCurrentPhase(nextPhase);
            return 0;
          }

          return prev + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase, currentRound, isCompleted, selectedPattern]);

  const startTimer = () => {
    setIsActive(true);
    setIsCompleted(false);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setCurrentRound(1);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setCurrentRound(1);
  };

  const getPhaseLabel = (phase: BreathPhase): string => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
    }
  };

  const getPhaseColor = (phase: BreathPhase): string => {
    switch (phase) {
      case 'inhale': return '#4CAF50';
      case 'hold': return '#2196F3';
      case 'exhale': return '#FF9800';
      case 'rest': return '#9C27B0';
    }
  };

  const currentPhaseDuration = getPhaseConfig(currentPhase).duration;
  const progress = currentPhaseDuration > 0 ? (phaseTime / currentPhaseDuration) * 100 : 0;

  return (
    <div className="breathing-timer">
      <div className="calculator-header">
        <h3>Breath Workout Timer</h3>
        <p className="calculator-subtitle">Follow guided breathing patterns for relaxation and energy</p>
      </div>

      {!isActive && !isCompleted && (
        <div className="pattern-selector">
          <label className="input-label">Choose Breathing Pattern:</label>
          <div className="pattern-grid">
            {BREATH_PATTERNS.map((pattern) => (
              <button
                key={pattern.name}
                className={`pattern-btn ${selectedPattern.name === pattern.name ? 'active' : ''}`}
                onClick={() => setSelectedPattern(pattern)}
              >
                <div className="pattern-name">{pattern.name}</div>
                <div className="pattern-description">{pattern.description}</div>
                <div className="pattern-rounds">{pattern.rounds} rounds</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="breathing-visualizer">
        <div
          className="breathing-circle"
          style={{
            transform: `scale(${0.5 + (progress / 200)})`,
            backgroundColor: getPhaseColor(currentPhase),
            opacity: 0.2 + (progress / 200)
          }}
        />
        <div className="breathing-content">
          <div className="phase-label" style={{ color: getPhaseColor(currentPhase) }}>
            {getPhaseLabel(currentPhase)}
          </div>
          <div className="phase-timer">
            {Math.ceil(currentPhaseDuration - phaseTime)}s
          </div>
          <div className="round-counter">
            Round {currentRound} / {selectedPattern.rounds}
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {!isActive && !isCompleted && (
          <button onClick={startTimer} className="control-btn start-btn">
            Start Breathing
          </button>
        )}

        {isActive && (
          <>
            <button onClick={pauseTimer} className="control-btn pause-btn">
              Pause
            </button>
            <button onClick={resetTimer} className="control-btn reset-btn">
              Reset
            </button>
          </>
        )}

        {!isActive && !isCompleted && currentRound > 1 && (
          <button onClick={startTimer} className="control-btn resume-btn">
            Resume
          </button>
        )}
      </div>

      {isCompleted && (
        <div className="completion-message">
          <div className="completion-icon">✓</div>
          <div className="completion-text">Breathing session complete!</div>
          <div className="completion-stats">
            Completed {selectedPattern.rounds} rounds of {selectedPattern.name}
          </div>
          <button onClick={resetTimer} className="control-btn restart-btn">
            Start New Session
          </button>
        </div>
      )}

      <div className="breathing-benefits">
        <h4>Benefits of Breathwork:</h4>
        <ul>
          <li><strong>Reduces stress:</strong> Activates parasympathetic nervous system</li>
          <li><strong>Improves focus:</strong> Increases oxygen flow to the brain</li>
          <li><strong>Enhances energy:</strong> Optimizes cellular respiration</li>
          <li><strong>Better sleep:</strong> Calms the mind and body</li>
          <li><strong>Emotional regulation:</strong> Balances mood and anxiety</li>
        </ul>
      </div>
    </div>
  );
};

export default BreathingTimer;
