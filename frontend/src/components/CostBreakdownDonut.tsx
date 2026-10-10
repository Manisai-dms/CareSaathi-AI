import React, { useState } from 'react';
import { CostBreakdownDTO } from '../services/api';
import { PieChart, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedRupeeCounter } from './AnimatedRupeeCounter';

interface CostBreakdownDonutProps {
  breakdown: CostBreakdownDTO;
  minPrice: number;
  maxPrice: number;
  treatmentName: string;
}

interface SliceData {
  name: string;
  value: number;
  color: string;
  percent: number;
}

export const CostBreakdownDonut: React.FC<CostBreakdownDonutProps> = ({
  breakdown,
  minPrice,
  maxPrice,
  treatmentName
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawSlices = [
    { name: 'Surgeon, OT & Anesthesia', value: breakdown.surgeon_ot_anesthesia, color: '#183247' },
    { name: 'Implant / Prosthesis (NPPA Cap)', value: breakdown.implant_or_prosthesis, color: '#438F84' },
    { name: 'Inpatient Room & Nursing', value: breakdown.room_and_nursing, color: '#0284C7' },
    { name: 'Diagnostics & Lab Tests', value: breakdown.diagnostics_and_lab, color: '#64717D' },
    { name: 'Medicines & Consumables', value: breakdown.medicines_and_consumables, color: '#D97706' },
    { name: 'Rehabilitation & Admin', value: (breakdown.rehabilitation_physiotherapy || 0) + breakdown.tax_and_admin, color: '#D97962' }
  ].filter(s => s.value > 0);

  const total = rawSlices.reduce((acc, s) => acc + s.value, 0) || 100;
  const slices: SliceData[] = rawSlices.map(s => ({
    ...s,
    percent: Math.round((s.value / total) * 100)
  }));

  // SVG Donut calculation
  const size = 260;
  const strokeWidth = 38;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="card" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            Interactive Tariff Distribution
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', margin: 0 }}>
            Procedure Cost Breakdown Donut
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)', margin: '4px 0 0' }}>
            Engineered from statutory PM-JAY HBP 2.2 schedules and NPPA ceiling price orders.
          </p>
        </div>
        <span className="badge badge-navy">
          ✓ Real Engine Output
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              {slices.map((slice, i) => {
                const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                cumulativePercent += slice.percent;
                const isHovered = hoveredIdx === i;

                return (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                      cursor: 'pointer',
                      opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </g>
          </svg>

          {/* Donut Center Display */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '20px'
          }}>
            {hoveredIdx !== null ? (
              <>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)', fontWeight: 600 }}>
                  {slices[hoveredIdx].name}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: slices[hoveredIdx].color, marginTop: '2px' }}>
                  {slices[hoveredIdx].percent}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                  ₹{slices[hoveredIdx].value.toLocaleString('en-IN')}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Indicative Median
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
                  ₹{Math.round((minPrice + maxPrice) / 2).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-teal-dark)', fontWeight: 600 }}>
                  Total Package
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div style={{ flex: '1 1 240px', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slices.map((slice, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: isHovered ? 'var(--color-mint)' : 'var(--color-warm-bg)',
                  border: isHovered ? '1px solid var(--color-teal)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: slice.color
                  }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-navy)', fontWeight: isHovered ? 700 : 500 }}>
                    {slice.name}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    {slice.percent}%
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)' }}>
                    ₹{slice.value.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
