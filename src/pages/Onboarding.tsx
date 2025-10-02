import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/Button';
import prdConfig from '../../prd.json';
import './Onboarding.css';

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const navigate = useNavigate();
  const { selectPillars, completeOnboarding, pillars } = useStore();

  const steps = prdConfig.onboarding.steps;
  const currentStep = steps[step];

  const handlePillarToggle = (pillarId: string) => {
    if (selectedPillars.includes(pillarId)) {
      setSelectedPillars(selectedPillars.filter((id) => id !== pillarId));
    } else {
      const max = currentStep.max || 6;
      if (selectedPillars.length < max) {
        setSelectedPillars([...selectedPillars, pillarId]);
      }
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Pillar selection step
      const min = currentStep.min || 2;
      if (selectedPillars.length < min) {
        alert(`Please select at least ${min} pillars`);
        return;
      }
      await selectPillars(selectedPillars);
    }

    if (step === steps.length - 1) {
      // Last step
      await completeOnboarding();
      navigate('/dashboard');
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    if (currentStep.type === 'pillar_selection') {
      const min = currentStep.min || 2;
      return selectedPillars.length >= min;
    }
    return true;
  };

  return (
    <div className="onboarding">
      <div className="onboarding__container">
        <div className="onboarding__progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`onboarding__progress-dot ${
                index === step ? 'onboarding__progress-dot--active' : ''
              } ${index < step ? 'onboarding__progress-dot--completed' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding__content fade-in">
          {currentStep.type === 'welcome' && (
            <div className="onboarding__welcome text-center">
              <h1 className="onboarding__title">THE BLUEPRINT</h1>
              <p className="onboarding__subtitle">it takes just 30 days</p>
              <p className="onboarding__message">{currentStep.message}</p>
            </div>
          )}

          {currentStep.type === 'pillar_selection' && (
            <div className="onboarding__pillars">
              <h2 className="onboarding__heading">Choose Your Path</h2>
              <p className="onboarding__message">{currentStep.message}</p>
              <p className="onboarding__hint">
                Selected: {selectedPillars.length}/{currentStep.max || 6} (Min: {currentStep.min || 2})
              </p>

              <div className="onboarding__pillar-grid">
                {pillars.map((pillar) => (
                  <div
                    key={pillar.id}
                    className={`onboarding__pillar-card ${
                      selectedPillars.includes(pillar.id)
                        ? 'onboarding__pillar-card--selected'
                        : ''
                    }`}
                    onClick={() => handlePillarToggle(pillar.id)}
                  >
                    <div className="onboarding__pillar-icon">{pillar.icon}</div>
                    <div className="onboarding__pillar-name">{pillar.name}</div>
                    <div className="onboarding__pillar-count">
                      {pillar.habits.length} habits
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep.type === 'commitment' && (
            <div className="onboarding__commitment text-center">
              <h2 className="onboarding__heading">Make The Commitment</h2>
              <p className="onboarding__message">{currentStep.message}</p>
              <div className="onboarding__commitment-box">
                <p className="onboarding__commitment-text">
                  I commit to showing up every day for the next {currentStep.duration_days} days.
                </p>
                <p className="onboarding__commitment-text">
                  I understand that consistency beats intensity.
                </p>
                <p className="onboarding__commitment-text">
                  I will not be part of the 90% who quit.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding__actions">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            fullWidth={step === 0}
          >
            {step === steps.length - 1 ? 'Start Building' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
