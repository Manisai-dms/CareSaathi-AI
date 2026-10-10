import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';
import { CostComponentItemDTO } from '../services/api';
import { AnimatedRupeeCounter } from './AnimatedRupeeCounter';

interface ItemizedComponentsTableProps {
  components: CostComponentItemDTO[];
  treatmentName: string;
}

export const ItemizedComponentsTable: React.FC<ItemizedComponentsTableProps> = ({
  components,
  treatmentName
}) => {
  if (!components || components.length === 0) return null;

  const getStatusBadge = (status: string, isVerified: boolean) => {
    if (status.includes("Official")) {
      return <span className="badge badge-success">✓ {status}</span>;
    } else if (status.includes("Reference")) {
      return <span className="badge badge-teal">ℹ {status}</span>;
    } else {
      return <span className="badge badge-warning" style={{ color: '#92400e', background: '#fef3c7' }}>⚠ Illustrative</span>;
    }
  };

  return (
    <div className="card cost-estimator-card-elevation" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            Statutory Public Tariff Master
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>
            Itemized Component Breakdown & Legal Price Caps
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
            Each component mapped to NPPA ceiling price orders, CGHS gazettes, and PM-JAY benefit packages.
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-warm-bg)', borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: 'var(--color-navy)', fontWeight: 700 }}>Component & Description</th>
              <th style={{ padding: '10px 12px', color: 'var(--color-navy)', fontWeight: 700 }}>Estimated Range</th>
              <th style={{ padding: '10px 12px', color: 'var(--color-navy)', fontWeight: 700 }}>Statutory Source / Regulation</th>
              <th style={{ padding: '10px 12px', color: 'var(--color-navy)', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '10px 12px', color: 'var(--color-navy)', fontWeight: 700 }}>Audit Date</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp, idx) => (
              <tr
                key={idx}
                className="cost-estimator-interactive-row"
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: !comp.is_verified ? '#fffdfa' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <td style={{ padding: '12px', maxWidth: '260px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-navy)', marginBottom: '2px' }}>
                    {comp.component_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', lineHeight: 1.4 }}>
                    {comp.description}
                  </div>
                </td>
                <td style={{ padding: '12px', fontWeight: 800, color: 'var(--color-navy)', whiteSpace: 'nowrap' }}>
                  <AnimatedRupeeCounter value={comp.min_cost} /> — <AnimatedRupeeCounter value={comp.max_cost} />
                </td>
                <td style={{ padding: '12px', maxWidth: '240px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.8rem' }}>
                    {comp.source_name}
                  </div>
                  {comp.source_url && (
                    <a
                      href={comp.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.74rem', color: 'var(--color-teal)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                    >
                      <span>Public Record</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                  {getStatusBadge(comp.status_label, comp.is_verified)}
                </td>
                <td style={{ padding: '12px', color: 'var(--color-text-grey)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  {comp.effective_date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '14px',
        padding: '10px 14px',
        backgroundColor: 'var(--color-light-blue)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.78rem',
        color: 'var(--color-navy)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Info size={15} color="var(--color-teal)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Note:</strong> Rows labeled <em>Illustrative</em> represent protocol benchmarks where hospitals have not released public tariffs. Regulated implant components are strictly bound by NPPA price caps.
        </span>
      </div>
    </div>
  );
};
