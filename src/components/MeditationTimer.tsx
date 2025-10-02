import React, { useState, useEffect, useRef } from 'react';
import './MeditationTimer.css';

const MEDITATION_DURATIONS = [5, 10, 15, 20, 30];

const MeditationTimer: React.FC = () => {
  const [duration, setDuration] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasPlayedStartGong, setHasPlayedStartGong] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTimeRemaining(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isActive && !isCompleted) {
      // Play start gong on first tick
      if (!hasPlayedStartGong) {
        playGong('start');
        setHasPlayedStartGong(true);
      }

      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Play end gong
            playGong('end');
            setIsCompleted(true);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
  }, [isActive, isCompleted, hasPlayedStartGong]);

  const playGong = (type: 'start' | 'end') => {
    // Create a gong sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const biquadFilter = audioContext.createBiquadFilter();

    oscillator.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Gong sound characteristics
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 2);
    oscillator.type = 'sine';

    biquadFilter.type = 'lowpass';
    biquadFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
    biquadFilter.Q.setValueAtTime(10, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3);

    // Play twice for end gong
    if (type === 'end') {
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        const filter2 = audioContext.createBiquadFilter();

        osc2.connect(filter2);
        filter2.connect(gain2);
        gain2.connect(audioContext.destination);

        osc2.frequency.setValueAtTime(200, audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 2);
        osc2.type = 'sine';

        filter2.type = 'lowpass';
        filter2.frequency.setValueAtTime(1000, audioContext.currentTime);
        filter2.Q.setValueAtTime(10, audioContext.currentTime);

        gain2.gain.setValueAtTime(0.5, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);

        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 3);
      }, 1500);
    }
  };

  const startMeditation = () => {
    setIsActive(true);
    setIsCompleted(false);
    setHasPlayedStartGong(false);
    setTimeRemaining(duration * 60);
  };

  const pauseMeditation = () => {
    setIsActive(false);
  };

  const resumeMeditation = () => {
    setIsActive(true);
  };

  const resetMeditation = () => {
    setIsActive(false);
    setIsCompleted(false);
    setHasPlayedStartGong(false);
    setTimeRemaining(duration * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

  return (
    <div className="meditation-timer">
      <div className="calculator-header">
        <h3>Meditation Timer</h3>
        <p className="calculator-subtitle">Mindful meditation with opening and closing gong sounds</p>
      </div>

      {!isActive && !isCompleted && timeRemaining === duration * 60 && (
        <div className="duration-selector">
          <label className="input-label">Select Duration:</label>
          <div className="duration-grid">
            {MEDITATION_DURATIONS.map((mins) => (
              <button
                key={mins}
                className={`meditation-duration-btn ${duration === mins ? 'active' : ''}`}
                onClick={() => setDuration(mins)}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="meditation-display">
        <div className="meditation-circle-container">
          <svg className="meditation-progress-ring" width="280" height="280">
            <circle
              className="meditation-progress-bg"
              cx="140"
              cy="140"
              r="120"
            />
            <circle
              className="meditation-progress-bar"
              cx="140"
              cy="140"
              r="120"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            />
          </svg>
          <div className="meditation-time-display">
            <div className="meditation-time">{formatTime(timeRemaining)}</div>
            <div className="meditation-label">
              {isActive ? 'Meditating...' : isCompleted ? 'Complete' : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {!isActive && !isCompleted && timeRemaining === duration * 60 && (
          <button onClick={startMeditation} className="control-btn start-btn">
            Begin Meditation
          </button>
        )}

        {isActive && (
          <>
            <button onClick={pauseMeditation} className="control-btn pause-btn">
              Pause
            </button>
            <button onClick={resetMeditation} className="control-btn reset-btn">
              Reset
            </button>
          </>
        )}

        {!isActive && timeRemaining < duration * 60 && timeRemaining > 0 && !isCompleted && (
          <>
            <button onClick={resumeMeditation} className="control-btn resume-btn">
              Resume
            </button>
            <button onClick={resetMeditation} className="control-btn reset-btn">
              Reset
            </button>
          </>
        )}
      </div>

      {isCompleted && (
        <div className="completion-message">
          <div className="completion-icon">🧘</div>
          <div className="completion-text">Meditation complete</div>
          <div className="completion-stats">
            You meditated for {duration} minutes
          </div>
          <button onClick={resetMeditation} className="control-btn restart-btn">
            Meditate Again
          </button>
        </div>
      )}

      <div className="meditation-guide">
        <h4>Meditation Guide:</h4>
        <div className="guide-steps">
          <div className="guide-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Posture:</strong> Sit comfortably with spine straight, hands resting on knees
            </div>
          </div>
          <div className="guide-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Breathing:</strong> Close eyes and focus on natural breath flow
            </div>
          </div>
          <div className="guide-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Awareness:</strong> Notice thoughts without judgment, gently return to breath
            </div>
          </div>
          <div className="guide-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Closing:</strong> When gong sounds, slowly open eyes and take a deep breath
            </div>
          </div>
        </div>
      </div>

      <div className="meditation-benefits">
        <h4>Benefits of Meditation:</h4>
        <ul>
          <li><strong>Mental clarity:</strong> Improves focus and concentration</li>
          <li><strong>Stress reduction:</strong> Lowers cortisol levels</li>
          <li><strong>Emotional balance:</strong> Increases self-awareness and calm</li>
          <li><strong>Better sleep:</strong> Promotes relaxation and rest</li>
          <li><strong>Brain health:</strong> Enhances neuroplasticity and cognitive function</li>
        </ul>
      </div>
    </div>
  );
};

export default MeditationTimer;
