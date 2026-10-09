import React, { useState } from 'react';
import { HelpCircle, FileCheck, CheckSquare, Square, Printer, CheckCircle2 } from 'lucide-react';
import { ChecklistDataDTO } from '../services/api';

interface ChecklistsCardProps {
  checklists: ChecklistDataDTO;
  treatmentName: string;
}

export const ChecklistsCard: React.FC<ChecklistsCardProps> = ({
  checklists,
  treatmentName
}) => {
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  const toggleQuestion = (idx: number) => {
    setCheckedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleDoc = (idx: number) => {
    setCheckedDocs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="card" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
            Patient Empowerment Toolkits
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>
            Admission Readiness & Billing Checklists
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
            Empower your family with pre-admission questions and mandatory scheme verification documents.
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>
        {/* Column 1: Questions to Ask */}
        <div style={{
          backgroundColor: 'var(--color-warm-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <HelpCircle size={18} color="var(--color-teal)" />
            <h4 style={{ fontSize: '0.98rem', color: 'var(--color-navy)' }}>
              Questions to Ask the Hospital Billing Desk:
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checklists.questions_to_ask.map((q, idx) => {
              const isDone = !!checkedQuestions[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleQuestion(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 10px',
                    backgroundColor: isDone ? 'var(--color-mint-subtle)' : 'var(--color-white)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ marginTop: '2px', color: isDone ? 'var(--color-teal)' : 'var(--color-text-grey)' }}>
                    {isDone ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <span style={{
                    fontSize: '0.82rem',
                    color: isDone ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                    textDecoration: isDone ? 'line-through' : 'none',
                    lineHeight: 1.4
                  }}>
                    {q}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Documents to Carry */}
        <div style={{
          backgroundColor: 'var(--color-warm-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileCheck size={18} color="var(--color-teal)" />
            <h4 style={{ fontSize: '0.98rem', color: 'var(--color-navy)' }}>
              Mandatory Documents to Carry (Cashless Pre-Auth):
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {checklists.documents_to_carry.map((doc, idx) => {
              const isDone = !!checkedDocs[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleDoc(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 10px',
                    backgroundColor: isDone ? 'var(--color-mint-subtle)' : 'var(--color-white)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ marginTop: '2px', color: isDone ? 'var(--color-teal)' : 'var(--color-text-grey)' }}>
                    {isDone ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <span style={{
                    fontSize: '0.82rem',
                    color: isDone ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                    textDecoration: isDone ? 'line-through' : 'none',
                    lineHeight: 1.4
                  }}>
                    {doc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
