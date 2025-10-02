import React, { useState, useEffect, useRef } from 'react';
import './StretchingTimer.css';

interface Stretch {
  id: string;
  name: string;
  duration: number;
  bodyPart: string;
}

const STRETCH_ROUTINES: Stretch[] = [
  { id: 's1', name: 'Neck Rotation', duration: 30, bodyPart: 'Neck' },
  { id: 's2', name: 'Shoulder Rolls', duration: 30, bodyPart: 'Shoulders' },
  { id: 's3', name: 'Chest Opener', duration: 30, bodyPart: 'Chest' },
  { id: 's4', name: 'Tricep Stretch', duration: 30, bodyPart: 'Arms' },
  { id: 's5', name: 'Torso Twist', duration: 30, bodyPart: 'Core' },
  { id: 's6', name: 'Hip Flexor Stretch', duration: 30, bodyPart: 'Hips' },
  { id: 's7', name: 'Hamstring Stretch', duration: 30, bodyPart: 'Legs' },
  { id: 's8', name: 'Quad Stretch', duration: 30, bodyPart: 'Legs' },
  { id: 's9', name: 'Calf Stretch', duration: 30, bodyPart: 'Calves' },
  { id: 's10', name: 'Cat-Cow Stretch', duration: 30, bodyPart: 'Spine' }
];

const StretchingTimer: React.FC = () => {
  const [selectedStretches, setSelectedStretches] = useState<Stretch[]>(STRETCH_ROUTINES);
  const [isActive, setIsActive] = useState(false);
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(15);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context for beep sounds
    audioRef.current = new Audio();
  }, []);

  useEffect(() => {
    // Adjust stretches based on session duration
    const stretchesNeeded = Math.floor((sessionDuration * 60) / 30);
    if (stretchesNeeded < STRETCH_ROUTINES.length) {
      setSelectedStretches(STRETCH_ROUTINES.slice(0, stretchesNeeded));
    } else {
      setSelectedStretches(STRETCH_ROUTINES);
    }
  }, [sessionDuration]);

  useEffect(() => {
    if (isActive && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Play beep sound
            playBeep();

            // Move to next stretch
            if (currentStretchIndex < selectedStretches.length - 1) {
              setCurrentStretchIndex(idx => idx + 1);
              return selectedStretches[currentStretchIndex + 1].duration;
            } else {
              // Session complete
              setIsCompleted(true);
              setIsActive(false);
              return 0;
            }
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
  }, [isActive, currentStretchIndex, isCompleted, selectedStretches]);

  const playBeep = () => {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const startSession = () => {
    setIsActive(true);
    setIsCompleted(false);
    setCurrentStretchIndex(0);
    setTimeRemaining(selectedStretches[0].duration);
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const resetSession = () => {
    setIsActive(false);
    setIsCompleted(false);
    setCurrentStretchIndex(0);
    setTimeRemaining(selectedStretches[0].duration);
  };

  const skipStretch = () => {
    if (currentStretchIndex < selectedStretches.length - 1) {
      setCurrentStretchIndex(idx => idx + 1);
      setTimeRemaining(selectedStretches[currentStretchIndex + 1].duration);
    } else {
      setIsCompleted(true);
      setIsActive(false);
    }
  };

  const currentStretch = selectedStretches[currentStretchIndex];
  const progress = currentStretch ? ((currentStretch.duration - timeRemaining) / currentStretch.duration) * 100 : 0;
  const totalTime = selectedStretches.reduce((sum, s) => sum + s.duration, 0);
  const elapsedTime = selectedStretches.slice(0, currentStretchIndex).reduce((sum, s) => sum + s.duration, 0) +
                      (currentStretch ? currentStretch.duration - timeRemaining : 0);
  const totalProgress = (elapsedTime / totalTime) * 100;

  return (
    <div className="stretching-timer">
      <div className="calculator-header">
        <h3>Stretching Timer</h3>
        <p className="calculator-subtitle">15-minute guided stretching routine with interval alerts</p>
      </div>

      {!isActive && !isCompleted && currentStretchIndex === 0 && (
        <div className="session-selector">
          <label className="input-label">Session Duration:</label>
          <div className="duration-buttons">
            <button
              className={`duration-btn ${sessionDuration === 5 ? 'active' : ''}`}
              onClick={() => setSessionDuration(5)}
            >
              5 min
            </button>
            <button
              className={`duration-btn ${sessionDuration === 10 ? 'active' : ''}`}
              onClick={() => setSessionDuration(10)}
            >
              10 min
            </button>
            <button
              className={`duration-btn ${sessionDuration === 15 ? 'active' : ''}`}
              onClick={() => setSessionDuration(15)}
            >
              15 min
            </button>
          </div>
        </div>
      )}

      {(isActive || (currentStretchIndex > 0 && !isCompleted)) && (
        <>
          <div className="overall-progress">
            <div className="progress-header">
              <span>Overall Progress</span>
              <span>{currentStretchIndex + 1} / {selectedStretches.length}</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>

          <div className="current-stretch-display">
            <div className="stretch-body-part">{currentStretch?.bodyPart}</div>
            <div className="stretch-name">{currentStretch?.name}</div>
            <div className="stretch-timer">{timeRemaining}s</div>
            <div className="circular-progress">
              <svg width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="var(--border)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="var(--text-primary)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
            </div>
          </div>
        </>
      )}

      <div className="timer-controls">
        {!isActive && !isCompleted && currentStretchIndex === 0 && (
          <button onClick={startSession} className="control-btn start-btn">
            Start Stretching
          </button>
        )}

        {isActive && (
          <>
            <button onClick={pauseSession} className="control-btn pause-btn">
              Pause
            </button>
            <button onClick={skipStretch} className="control-btn skip-btn">
              Skip Stretch
            </button>
            <button onClick={resetSession} className="control-btn reset-btn">
              Reset
            </button>
          </>
        )}

        {!isActive && currentStretchIndex > 0 && !isCompleted && (
          <>
            <button onClick={resumeSession} className="control-btn resume-btn">
              Resume
            </button>
            <button onClick={resetSession} className="control-btn reset-btn">
              Reset
            </button>
          </>
        )}
      </div>

      {isCompleted && (
        <div className="completion-message">
          <div className="completion-icon">🎉</div>
          <div className="completion-text">Stretching session complete!</div>
          <div className="completion-stats">
            Completed {selectedStretches.length} stretches in {Math.floor(totalTime / 60)} minutes
          </div>
          <button onClick={resetSession} className="control-btn restart-btn">
            Start New Session
          </button>
        </div>
      )}

      {!isActive && !isCompleted && currentStretchIndex === 0 && (
        <div className="stretch-list">
          <h4>Today's Stretching Routine ({selectedStretches.length} stretches):</h4>
          <div className="stretch-items">
            {selectedStretches.map((stretch, idx) => (
              <div key={stretch.id} className="stretch-list-item">
                <span className="stretch-number">{idx + 1}</span>
                <span className="stretch-list-name">{stretch.name}</span>
                <span className="stretch-list-duration">{stretch.duration}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stretching-benefits">
        <h4>Benefits of Daily Stretching:</h4>
        <ul>
          <li><strong>Flexibility:</strong> Improves range of motion in joints</li>
          <li><strong>Posture:</strong> Reduces muscle tension and imbalances</li>
          <li><strong>Injury prevention:</strong> Prepares muscles for activity</li>
          <li><strong>Blood flow:</strong> Increases circulation to muscles</li>
          <li><strong>Stress relief:</strong> Relaxes body and mind</li>
        </ul>
      </div>
    </div>
  );
};

export default StretchingTimer;
