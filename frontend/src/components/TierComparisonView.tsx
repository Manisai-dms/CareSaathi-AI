import React from 'react';
import { Building2, Heart, Award, Clock, ShieldCheck, Check } from 'lucide-react';
import { TierComparisonItemDTO } from '../services/api';

interface TierComparisonViewProps {
  tierComparisons: TierComparisonItemDTO[];
  treatmentName: string;
}

export const TierComparisonView: React.FC<TierComparisonViewProps> = ({
  tierComparisons,
  treatmentName
}) => {
  if (!tierComparisons || tierComparisons.length === 0) return null;

  const getTierIcon = (name: string) => {
    if (name.includes("Government")) return <Building2 size={22} color="var(--color-teal)" />;
    if (name.includes("Charitable") || name.includes("Trust")) return <Heart size={22} color="#D97706" />;
    return <Award size={22} color="var(--color-navy)" />;
  };

  const getTierBadge = (name: string) => {
    if (name.includes("Government")) return <span className="badge badge-teal">Public Sector</span>;
    if (name.includes("Charitable") || name.includes("Trust")) return <span className="badge badge-warning">Non-Profit Trust</span>;
    return <span className="badge badge-navy">Private Corporate</span>;
  };

  return (
    <div className="card" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            Institutional Sector Comparison
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>
            Government vs Trust vs Private Hospital Tiers
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
            Comparative trade-offs in costs, waiting times, ward amenities, and scheme coverage for <strong>{treatmentName}</strong>.
          </p>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '18px' }}>
        {tierComparisons.map((tier, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-warm-bg)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            {/* Tier Top Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'white',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getTierIcon(tier.tier_name)}
              </div>
              {getTierBadge(tier.tier_name)}
            </div>

            <h4 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: '8px', lineHeight: 1.3 }}>
              {tier.tier_name}
            </h4>

            {/* Price Box */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              marginBottom: '14px'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>
                Indicative Cost Range
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy)', marginTop: '2px' }}>
                {tier.min_price === 0 ? "₹0 (Free / Subsidized)" : `₹${tier.min_price.toLocaleString('en-IN')}`}
                {" "}— ₹{tier.max_price.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Characteristics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', flex: 1, marginBottom: '14px' }}>
              <div>
                <strong style={{ color: 'var(--color-navy)' }}>🏥 Scheme Coverage:</strong>
                <div style={{ color: 'var(--color-text-grey)', marginTop: '2px' }}>{tier.scheme_support}</div>
              </div>

              <div>
                <strong style={{ color: 'var(--color-navy)' }}>🛏️ Ward & Amenities:</strong>
                <div style={{ color: 'var(--color-text-grey)', marginTop: '2px' }}>{tier.ward_amenity}</div>
              </div>

              <div>
                <strong style={{ color: 'var(--color-navy)' }}>⏱️ Scheduling / Wait Time:</strong>
                <div style={{ color: 'var(--color-text-grey)', marginTop: '2px' }}>{tier.waiting_time}</div>
              </div>

              <div>
                <strong style={{ color: 'var(--color-teal-dark)' }}>⭐ Key Advantage:</strong>
                <div style={{ color: 'var(--color-navy)', marginTop: '2px', fontWeight: 600 }}>{tier.key_advantage}</div>
              </div>
            </div>

            {/* Exemplar Hospital Tag */}
            <div style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '10px',
              fontSize: '0.75rem',
              color: 'var(--color-text-grey)'
            }}>
              <strong>Benchmark Facilities:</strong> {tier.exemplar_facility}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
