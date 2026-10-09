import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  User, 
  Globe, 
  MapPin, 
  Layers, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  Eye
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { searchState, clearComparison } = useSearch();

  const handleClearHistory = () => {
    localStorage.removeItem('caresaathi_search_state');
    clearComparison();
    alert("Local search preferences and saved comparisons have been cleared.");
    window.location.reload();
  };

  return (
    <div className="section" style={{ paddingTop: '30px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div className="badge badge-teal" style={{ marginBottom: '8px' }}>
            User Settings & Consent
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
            Preferences & Saved Care
          </h1>
          <p style={{ color: 'var(--color-text-grey)', fontSize: '1.02rem' }}>
            Customize your language, locality, and accessibility preferences. All preferences are stored strictly in your local browser storage.
          </p>
        </div>

        {/* Language Selection Card */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Globe size={18} color="var(--color-teal)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>Regional Language Preference</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)', marginBottom: '16px' }}>
            Choose the language for application guidance, cost explanations, and scheme descriptions:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { code: 'en', label: 'English', sub: 'Default' },
              { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
              { code: 'hi', label: 'हिंदी', sub: 'Hindi' }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code as any)}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${language === l.code ? 'var(--color-teal)' : 'var(--color-border)'}`,
                  backgroundColor: language === l.code ? 'var(--color-mint)' : 'var(--color-white)',
                  color: language === l.code ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{l.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>{l.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Comparisons Card */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--color-teal)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>Saved Hospital Comparisons</h3>
            </div>
            {searchState.comparisonList.length > 0 && (
              <button onClick={clearComparison} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-coral)' }}>
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {searchState.comparisonList.length === 0 ? (
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)', padding: '12px 0' }}>
              No hospitals currently pinned for comparison. Use "+ Compare" on any facility card.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {searchState.comparisonList.map(f => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-warm-bg)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{f.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)' }}>{f.locality} • {f.ownership}</div>
                  </div>
                  <span className="badge badge-teal">In Comparison</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Privacy & Consent Clearing */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={18} color="var(--color-teal)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>Privacy & Data Sovereignty</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)', lineHeight: 1.5, marginBottom: '16px' }}>
            CareSaathi AI operates on a zero-tracking principle. Your searched procedures, audio transcripts, and prescription images are not logged to persistent advertising profiles. You can reset your local device cache at any time:
          </p>
          <button onClick={handleClearHistory} className="btn btn-secondary" style={{ color: '#991B1B', borderColor: '#FCA5A5' }}>
            <Trash2 size={16} />
            <span>Clear Local Browsing & Search Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
