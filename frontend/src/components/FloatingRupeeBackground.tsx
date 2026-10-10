import React from 'react';

export interface FloatingRupeeBackgroundProps {
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface ParticleConfig {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  fontSize: string;
  color: string;
  duration: string;
  delay: string;
  driftX: string;
  rotate: string;
  peakOpacity: number;
}

export const FloatingRupeeBackground: React.FC<FloatingRupeeBackgroundProps> = ({
  count = 6,
  className = '',
  style = {}
}) => {
  // Preset aesthetic positions away from center content and buttons
  const particles: ParticleConfig[] = [
    {
      top: '12%',
      left: '4%',
      fontSize: '26px',
      color: '#D6A64F', // Soft gold
      duration: '7.5s',
      delay: '0s',
      driftX: '12px',
      rotate: '8deg',
      peakOpacity: 0.28
    },
    {
      top: '18%',
      right: '5%',
      fontSize: '32px',
      color: '#329B89', // Teal
      duration: '8.2s',
      delay: '1.4s',
      driftX: '-10px',
      rotate: '-6deg',
      peakOpacity: 0.22
    },
    {
      bottom: '15%',
      left: '8%',
      fontSize: '20px',
      color: '#176B5B', // Forest green
      duration: '6.8s',
      delay: '2.8s',
      driftX: '8px',
      rotate: '10deg',
      peakOpacity: 0.20
    },
    {
      bottom: '12%',
      right: '8%',
      fontSize: '28px',
      color: '#D6A64F', // Soft gold
      duration: '9.0s',
      delay: '0.8s',
      driftX: '-14px',
      rotate: '-8deg',
      peakOpacity: 0.25
    },
    {
      top: '48%',
      left: '2%',
      fontSize: '18px',
      color: '#329B89', // Teal
      duration: '7.0s',
      delay: '3.6s',
      driftX: '6px',
      rotate: '5deg',
      peakOpacity: 0.16
    },
    {
      top: '52%',
      right: '3%',
      fontSize: '22px',
      color: '#176B5B', // Forest green
      duration: '8.5s',
      delay: '2.1s',
      driftX: '-8px',
      rotate: '-10deg',
      peakOpacity: 0.18
    },
    {
      top: '8%',
      left: '48%',
      fontSize: '18px',
      color: '#D6A64F', // Soft gold
      duration: '9.5s',
      delay: '4.2s',
      driftX: '10px',
      rotate: '6deg',
      peakOpacity: 0.14
    }
  ];

  const activeParticles = particles.slice(0, count);

  return (
    <div
      className={`floating-rupee-container ${className}`}
      aria-hidden="true"
      style={style}
    >
      {activeParticles.map((p, idx) => (
        <span
          key={idx}
          className="floating-rupee-symbol"
          style={{
            top: p.top,
            bottom: p.bottom,
            left: p.left,
            right: p.right,
            fontSize: p.fontSize,
            color: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            // CSS custom properties passed to keyframe animation
            ['--rupee-drift-x' as string]: p.driftX,
            ['--rupee-rotate' as string]: p.rotate,
            ['--rupee-peak-opacity' as string]: p.peakOpacity
          } as React.CSSProperties}
        >
          ₹
        </span>
      ))}
    </div>
  );
};
