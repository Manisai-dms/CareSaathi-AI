import React, { useState } from 'react';
import { Building2, Heart, Award, Clock, ShieldCheck, Check, Info, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { TierComparisonItemDTO } from '../services/api';
import { AnimatedRupeeCounter } from './AnimatedRupeeCounter';

interface TierComparisonViewProps {
  tierComparisons: TierComparisonItemDTO[];
  treatmentName: string;
}

export const TierComparisonView: React.FC<TierComparisonViewProps> = ({
  tierComparisons,
  treatmentName
}) => {
  const [expandedBreakdown, setExpandedBreakdown] = useState<Record<number, boolean>>({});

  if (!tierComparisons || tierComparisons.length === 0) return null;

  const toggleBreakdown = (idx: number) => {
    setExpandedBreakdown(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getTierIcon = (tier: TierComparisonItemDTO) => {
    const key = tier.category_key || '';
    if (key === 'government' || tier.tier_name.includes('Government')) {
      return <Building2 size={22} color="#2C8C83" />;
    }
    if (key === 'premium' || tier.tier_name.includes('Premium')) {
      return <Award size={22} color="#D97706" />;
    }
    if (key === 'charitable' || tier.tier_name.includes('Trust') || tier.tier_name.includes('Charitable')) {
      return <Heart size={22} color="#10B981" />;
    }
    return <Building2 size={22} color="#12304A" />;
  };

  const getTierBadge = (tier: TierComparisonItemDTO) => {
    const key = tier.category_key || '';
    if (key === 'government' || tier.tier_name.includes('Government')) {
      return <span style={{ backgroundColor: '#E7F3EF', color: '#2C8C83', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>1. Government Hospitals</span>;
    }
    if (key === 'private' || (tier.tier_name.includes('Private') && !tier.tier_name.includes('Premium'))) {
      return <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>2. Private Hospitals</span>;
    }
    if (key === 'premium' || tier.tier_name.includes('Premium')) {
      return <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>3. Premium Hospitals</span>;
    }
    return <span style={{ backgroundColor: '#F0FDF4', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>4. Charitable / Trust</span>;
  };

  return (
    <div className="card cost-estimator-card-elevation" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            Hospital Tier Price Comparison
          </div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', margin: '0 0 4px 0' }}>
            Government, Private & Premium Hospital Cost Estimates
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-grey)', margin: 0 }}>
            Itemized pricing estimates, statutory sources, and coverage policies for <strong>{treatmentName}</strong>.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {tierComparisons.map((tier, idx) => {
          const isExpanded = !!expandedBreakdown[idx];
          const bd = tier.cost_breakdown;

          return (
            <div
              key={idx}
              className="cost-estimator-card-elevation"
              style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-warm-bg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                boxShadow: '0 2px 6px rgba(18, 48, 74, 0.04)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getTierIcon(tier)}
                </div>
                {getTierBadge(tier)}
              </div>

              <h4 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '8px', lineHeight: 1.3 }}>
                {tier.tier_name}
              </h4>

              {/* Price Range Box */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '12px 14px',
                border: '1px solid #E2E8F0',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-grey)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Estimated Range
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {tier.price_type || 'Reference Estimate'}
                  </span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  <AnimatedRupeeCounter value={tier.min_price} freeSubsidizedText="₹0 (Govt Subsidized)" />
                  {" "}—{" "}
                  <AnimatedRupeeCounter value={tier.max_price} />
                </div>
              </div>

              {/* Source & Freshness Metadata */}
              <div style={{
                fontSize: '0.76rem',
                color: '#64717D',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: '8px 10px',
                borderRadius: '6px',
                marginBottom: '12px',
                border: '1px solid rgba(226, 232, 240, 0.6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, color: '#12304A' }}>Source:</span>
                  <span>{tier.last_updated || 'March 2026'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {tier.source_name || 'PM-JAY HBP 2.2 / State Gazette'}
                  </span>
                  {tier.source_url && (
                    <a
                      href={tier.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2C8C83', display: 'inline-flex', alignItems: 'center' }}
                      title="View source schedule"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                {tier.confidence_explanation && (
                  <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#475569', fontStyle: 'italic' }}>
                    Confidence: <strong>{tier.confidence_level || 'Medium'}</strong> — {tier.confidence_explanation}
                  </div>
                )}
              </div>

              {/* Breakdown Toggle */}
              {bd && (
                <div style={{ marginBottom: '14px' }}>
                  <button
                    onClick={() => toggleBreakdown(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2C8C83',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <span>{isExpanded ? 'Hide Cost Breakdown' : 'View Itemized Cost Breakdown'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <span>Surgeon, OT & Anesthesia:</span>
                        <strong>₹{bd.surgeon_ot_anesthesia.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <span>Room & Inpatient Care:</span>
                        <strong>₹{bd.room_and_nursing.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <span>Diagnostics & Pre-Op Labs:</span>
                        <strong>₹{bd.diagnostics_and_lab.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <span>Medicines & Consumables:</span>
                        <strong>₹{bd.medicines_and_consumables.toLocaleString('en-IN')}</strong>
                      </div>
                      {bd.implant_or_prosthesis > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F1F5F9', color: '#B45309' }}>
                          <span>Implants / Prosthetics:</span>
                          <strong>₹{bd.implant_or_prosthesis.toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64717D' }}>
                        <span>Admin & Facility Taxes:</span>
                        <span>₹{bd.tax_and_admin.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Characteristics details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', flex: 1, marginBottom: '14px' }}>
                <div>
                  <strong style={{ color: 'var(--color-navy)' }}>🏥 Scheme Support:</strong>
                  <div style={{ color: 'var(--color-text-grey)', marginTop: '2px' }}>{tier.scheme_support}</div>
                </div>

                <div>
                  <strong style={{ color: 'var(--color-navy)' }}>🛌 Ward & Amenities:</strong>
                  <div style={{ color: 'var(--color-text-grey)', marginTop: '2px' }}>{tier.ward_amenity}</div>
                </div>

                <div>
                  <strong style={{ color: 'var(--color-navy)' }}>⏱️ Scheduling / Wait Time:</strong>
                  <div style={{ color: 'var(--color-text-grey)', marginTop: '2px' }}>{tier.waiting_time}</div>
                </div>

                <div>
                  <strong style={{ color: 'var(--color-navy)' }}>⭐ Key Clinical Advantage:</strong>
                  <div style={{ color: '#2C8C83', fontWeight: 600, marginTop: '2px' }}>{tier.key_advantage}</div>
                </div>
              </div>

              {/* Extra Expenses & Exclusions */}
              {((tier.extra_expenses && tier.extra_expenses.length > 0) || (tier.exclusions && tier.exclusions.length > 0)) && (
                <div style={{
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: '10px',
                  marginBottom: '10px',
                  fontSize: '0.72rem'
                }}>
                  {tier.extra_expenses && tier.extra_expenses.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#B45309' }}>Potential Extra Costs: </span>
                      <span style={{ color: '#64717D' }}>{tier.extra_expenses.join('; ')}</span>
                    </div>
                  )}
                  {tier.exclusions && tier.exclusions.length > 0 && (
                    <div>
                      <span style={{ fontWeight: 700, color: '#991B1B' }}>Exclusions: </span>
                      <span style={{ color: '#64717D' }}>{tier.exclusions.join('; ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Exemplar Facilities in Hyderabad */}
              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '10px',
                fontSize: '0.75rem',
                color: 'var(--color-text-grey)'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Example Hospitals: </span>
                {tier.exemplar_facility}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
