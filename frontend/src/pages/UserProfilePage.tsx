import React, { useState } from 'react';
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
  Calendar,
  Clock
} from 'lucide-react';
import { MyAppointmentsView } from '../components/MyAppointmentsView';

interface UserProfilePageProps {
  onNavigateTab?: (tab: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigateTab }) => {
  const { language, setLanguage, t } = useLanguage();
  const { searchState, clearComparison } = useSearch();

  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'preferences' | 'saved'>('appointments');

  const handleClearHistory = () => {
    localStorage.removeItem('caresaathi_search_state');
    clearComparison();
    alert("Local search preferences and saved comparisons have been cleared.");
    window.location.reload();
  };

  return (
    <div className="section" style={{ paddingTop: '28px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="badge badge-teal" style={{ marginBottom: '8px' }}>
            User Account & Care Management
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', marginBottom: '6px' }}>
            My Appointments & Care Preferences
          </h1>
          <p style={{ color: 'var(--color-text-grey)', fontSize: '0.98rem' }}>
            Manage your hospital bookings, view upcoming appointment reminders, and configure regional language preferences.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setActiveSubTab('appointments')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeSubTab === 'appointments' ? '3px solid #2C8C83' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeSubTab === 'appointments' ? '#12304A' : '#64717D',
              fontWeight: activeSubTab === 'appointments' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={16} color={activeSubTab === 'appointments' ? '#2C8C83' : '#64717D'} />
            <span>My Appointments</span>
          </button>

          <button
            onClick={() => setActiveSubTab('saved')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeSubTab === 'saved' ? '3px solid #2C8C83' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeSubTab === 'saved' ? '#12304A' : '#64717D',
              fontWeight: activeSubTab === 'saved' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} color={activeSubTab === 'saved' ? '#2C8C83' : '#64717D'} />
            <span>Saved Comparisons ({searchState.comparisonList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preferences')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeSubTab === 'preferences' ? '3px solid #2C8C83' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeSubTab === 'preferences' ? '#12304A' : '#64717D',
              fontWeight: activeSubTab === 'preferences' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={16} color={activeSubTab === 'preferences' ? '#2C8C83' : '#64717D'} />
            <span>Language & Privacy</span>
          </button>
        </div>

        {/* 1. Appointments Tab */}
        {activeSubTab === 'appointments' && (
          <MyAppointmentsView onBookNew={() => onNavigateTab?.('hospitals')} />
        )}

        {/* 2. Preferences & Language Tab */}
        {activeSubTab === 'preferences' && (
          <div>
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

            {/* Privacy & Storage Reset Card */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
                Storage & Local Data Reset
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64717D', marginBottom: '14px' }}>
                CareSaathi AI stores session history, local appointments, and pinned hospital comparisons safely in your browser storage. You can clear this data at any time.
              </p>
              <button onClick={handleClearHistory} className="btn btn-secondary btn-sm" style={{ color: '#EF4444', borderColor: '#FCA5A5' }}>
                <Trash2 size={14} />
                <span>Clear All Local Storage & Comparisons</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Saved Hospital Comparisons Tab */}
        {activeSubTab === 'saved' && (
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
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-grey)', padding: '20px 0', textAlign: 'center' }}>
                No hospitals currently pinned for comparison. Use "+ Compare" on any facility card.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {searchState.comparisonList.map(f => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-warm-bg)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--color-navy)' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)', marginTop: '2px' }}>
                        {f.locality}, {f.city} • {f.ownership} Facility
                      </div>
                    </div>
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('comparison')}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        View in Compare
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
