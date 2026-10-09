import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { api, MetadataResponse } from '../services/api';

export const MethodologyPage: React.FC = () => {
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);

  useEffect(() => {
    api.getMetadata().then(setMetadata).catch(console.error);
  }, []);

  return (
    <div className="section" style={{ paddingTop: '30px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div className="badge badge-teal" style={{ marginBottom: '8px' }}>
            Auditable Transparency & Trust Architecture
          </div>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Data Sources, Methodology & Limitations
          </h1>
          <p style={{ color: 'var(--color-text-grey)', fontSize: '1.08rem', lineHeight: 1.6 }}>
            CareSaathi AI is built on principles of responsible AI, verifiable public datasets, and transparent evidence reporting. Here is exactly how our platform works under the hood.
          </p>
        </div>

        {/* Live System Metadata Card */}
        {metadata && (
          <div className="card card-blue" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Database size={20} color="var(--color-navy)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>
                System Architecture & Database Master Status
              </h3>
            </div>
            <div className="grid-4" style={{ gap: '14px' }}>
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>Verified Facilities</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>{metadata.total_facilities} Institutions</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>Canonical Treatments</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>{metadata.total_treatments} Procedures</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>Financial Schemes</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>{metadata.supported_schemes} Programs</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)' }}>Runtime Mode</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-teal)' }}>Verified Demo Mode</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Confidence Scoring Methodology */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', marginBottom: '12px' }}>
            1. Evidence-Based Confidence Methodology
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-grey)', lineHeight: 1.6, marginBottom: '20px' }}>
            We do not manufacture arbitrary confidence percentages simply to make the AI look intelligent. Confidence tiers reflect empirical data verification:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              backgroundColor: 'var(--color-mint-subtle)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #b8ded4'
            }}>
              <span className="badge badge-success" style={{ flexShrink: 0, marginTop: '2px' }}>High Confidence</span>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-navy)', lineHeight: 1.5 }}>
                Direct, official published tariff schedule with matching procedure details (e.g. NIMS Gazette, LVPEI Trust schedule, DME free care protocols). Verified with public documentation and updated within the last 6 months.
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              backgroundColor: 'var(--color-light-blue)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #d2e4f3'
            }}>
              <span className="badge badge-navy" style={{ flexShrink: 0, marginTop: '2px' }}>Medium Confidence</span>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-navy)', lineHeight: 1.5 }}>
                Derived from comparable healthcare tier benchmarks, insurance TPA corporate schedules, or regional surveys for standard dual-sharing bed admissions in the selected city.
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              backgroundColor: '#FEF3C7',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #FCD34D'
            }}>
              <span className="badge badge-warning" style={{ flexShrink: 0, marginTop: '2px' }}>Low Confidence</span>
              <div style={{ fontSize: '0.88rem', color: '#92400E', lineHeight: 1.5 }}>
                Sparse, unverified, or weakly comparable data. When confidence is low, CareSaathi AI explicitly marks the estimate as illustrative and recommends contacting the hospital billing desk directly.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Authoritative Data Sources */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', marginBottom: '12px' }}>
            2. Primary Data Sources & Portals
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-grey)', lineHeight: 1.6, marginBottom: '18px' }}>
            Our pricing and empanelment knowledge bases are constructed using publicly documented and legitimate health sources:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                name: "National Health Authority (NHA) — PM-JAY",
                desc: "Health Benefit Package (HBP) master containing 1,949+ procedure codes and national package ceilings.",
                url: "https://pmjay.gov.in"
              },
              {
                name: "Aarogyasri Health Care Trust (Telangana)",
                desc: "State public health insurance tariff catalogue covering 1,672+ secondary and tertiary medical/surgical treatments.",
                url: "https://aarogyasri.telangana.gov.in"
              },
              {
                name: "Nizam's Institute of Medical Sciences (NIMS)",
                desc: "Official published hospital charges and diagnostic fee schedules for autonomous state super-specialty care.",
                url: "https://nims.edu.in"
              },
              {
                name: "OpenStreetMap & Overpass API",
                desc: "Geospatial database used to identify hospital coordinates, pin codes, and calculate spatial travel distances.",
                url: "https://www.openstreetmap.org"
              },
              {
                name: "Central Government Health Scheme (CGHS)",
                desc: "Empanelled rate cards for major Indian metropolitan clusters (Hyderabad, Delhi, Bangalore).",
                url: "https://cghs.nic.in"
              }
            ].map(src => (
              <div
                key={src.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--color-warm-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-navy)' }}>
                    {src.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
                    {src.desc}
                  </div>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  <ExternalLink size={13} />
                  <span>Official Portal</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Responsible AI Principles & Boundaries */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', marginBottom: '12px' }}>
            3. Responsible AI Principles & System Limitations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: 'var(--color-navy)', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>Non-Diagnostic Boundary:</strong> CareSaathi AI is an informational cost and care navigation tool. It does not provide medical diagnoses, clinical treatment recommendations, or prescriptions.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>Symptom vs Treatment Disambiguation:</strong> Natural language queries describing symptoms (e.g. "fever for five days") are explicitly flagged as symptom descriptions and mapped to basic clinical consultation, rather than inventing surgical procedures or fatal diagnoses.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>Emergency Triage Protocol:</strong> Whenever acute critical symptoms (chest pain, breathlessness, sudden paralysis, severe bleeding) are detected, cost comparison is subordinated to emergency ambulance assistance (108).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <CheckCircle2 size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>No Fabrication of Quotations:</strong> Prices reflect indicative ranges. If a private hospital has not published its tariff publicly, it is classified as a reference-based estimate rather than a synthetic quotation.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Lock size={18} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong>Privacy by Design:</strong> No personally identifiable health data (prescriptions, income figures, Aadhaar numbers) is stored on server databases without explicit user consent.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
