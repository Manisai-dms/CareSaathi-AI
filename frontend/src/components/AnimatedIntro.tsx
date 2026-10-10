// ==============================================================================
// CareSaathi AI - Animated Intro Modal (Unified with Care Core Hero)
// Replaces the legacy centered intro with the new 3D Care Core Hero centerpiece.
// ==============================================================================

import React from 'react';
import { CareCoreHero } from './CareCoreHero';

interface AnimatedIntroProps {
  onComplete: () => void;
}

export const AnimatedIntro: React.FC<AnimatedIntroProps> = ({ onComplete }) => {
  const handleFinish = (query?: string) => {
    try {
      localStorage.setItem('caresaathi_intro_seen', 'true');
    } catch (e) {
      console.warn('Storage error', e);
    }
    onComplete();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CareSaathi AI Healthcare Navigator"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#FAFAF7',
        zIndex: 99999,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: '#438F84 #102A36'
      }}
    >
      <CareCoreHero
        onStartSearch={(q) => handleFinish(q)}
        onSignIn={() => handleFinish()}
        onOpenVoice={() => handleFinish()}
        onOpenRx={() => handleFinish()}
      />
    </div>
  );
};
