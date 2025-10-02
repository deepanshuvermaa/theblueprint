import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { Pillar } from '../types';
import './PillarUnlockModal.css';

interface PillarUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePillars: Pillar[];
  currentStreak: number;
  onSelectPillar: (pillarId: string) => void;
}

const PillarUnlockModal: React.FC<PillarUnlockModalProps> = ({
  isOpen,
  onClose,
  availablePillars,
  currentStreak,
  onSelectPillar,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedPillar) {
      onSelectPillar(selectedPillar);
      setSelectedPillar(null);
      onClose();
    }
  };

  const handleSkip = () => {
    setSelectedPillar(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title={`🎉 ${currentStreak}-Day Milestone!`}>
      <div className="pillar-unlock-modal">
        <p className="pillar-unlock-message">
          You've reached a {currentStreak}-day streak! Ready to level up?
        </p>
        <p className="pillar-unlock-subtitle">
          Add another pillar to expand your habits and grow even stronger.
        </p>

        <div className="pillar-unlock-grid">
          {availablePillars.map((pillar) => (
            <div
              key={pillar.id}
              className={`pillar-unlock-card ${
                selectedPillar === pillar.id ? 'pillar-unlock-card--selected' : ''
              }`}
              onClick={() => setSelectedPillar(pillar.id)}
            >
              <div className="pillar-unlock-icon">{pillar.icon}</div>
              <div className="pillar-unlock-name">{pillar.name}</div>
              <div className="pillar-unlock-count">{pillar.habits.length} habits</div>
            </div>
          ))}
        </div>

        <div className="pillar-unlock-actions">
          <Button variant="secondary" onClick={handleSkip}>
            Maybe Later
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPillar}>
            Add Pillar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PillarUnlockModal;
