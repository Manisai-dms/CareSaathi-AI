import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider, useSearch } from './context/SearchContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyBanner } from './components/EmergencyBanner';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { TrustDashboardModal } from './components/TrustDashboardModal';
import { GuidedChatDrawer } from './components/GuidedChatDrawer';
import { AnimatedIntro } from './components/AnimatedIntro';
import { SavedComparisonsModal } from './components/SavedComparisonsModal';
import { AuthPage } from './pages/AuthPage';
import { MessageSquare, Sparkles } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CostEstimatorPage } from './pages/CostEstimatorPage';
import { HospitalDiscoveryPage } from './pages/HospitalDiscoveryPage';
import { SchemeNavigatorPage } from './pages/SchemeNavigatorPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { UserProfilePage } from './pages/UserProfilePage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [isTrustOpen, setIsTrustOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSavedComparisonsOpen, setIsSavedComparisonsOpen] = useState(false);
  const [judgeToast, setJudgeToast] = useState<string | null>(null);

  // Animated intro shows on first visit only
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('caresaathi_intro_seen');
  });

  const { searchState, setSearchQuery, setTreatment, setLocation } = useSearch();
  const { user, isGuest, continueAsGuest } = useAuth();

  const handleIntroComplete = () => {
    localStorage.setItem('caresaathi_intro_seen', 'true');
    setShowIntro(false);
    // If not yet signed in and not a guest, prompt login/sign-up page
    if (!user && !isGuest) {
      setIsAuthOpen(true);
    }
  };

  const handleVoiceConfirm = (transcript: string) => {
    setSearchQuery(transcript);
    setActiveTab('dashboard');
  };

  const handleRxConfirm = (treatmentName: string) => {
    setSearchQuery(treatmentName);
    setTreatment('custom', treatmentName);
    setActiveTab('dashboard');
  };

  const triggerEmergency = (msg: string) => {
    setEmergencyMessage(msg);
  };

  const handleRunJudgeDemo = () => {
    setTreatment('knee_replacement', 'Total Knee Replacement (TKR)');
    setLocation('Hyderabad', '');
    setSearchQuery('Total Knee Replacement in Hyderabad');
    setActiveTab('dashboard');
    setJudgeToast('🎯 Judge Demo Scenario Loaded: Total Knee Replacement (TKR) in Hyderabad | Target: ₹2.5 Lakh Income, White Card / Aarogyasri Scheme');
    setTimeout(() => {
      setJudgeToast(null);
    }, 7000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* First Visit Animated Intro (Framer Motion, max 6s, Skip button, respects prefers-reduced-motion) */}
      {showIntro && (
        <AnimatedIntro onComplete={handleIntroComplete} />
      )}

      {/* Real Auth Modal / Page (Sign In, Create Account, Judge Demo Login, Guest) */}
      {isAuthOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          overflowY: 'auto',
          backgroundColor: '#FAFAF7'
        }}>
          <AuthPage
            onSuccess={() => {
              setIsAuthOpen(false);
              setActiveTab('dashboard');
            }}
            onContinueAsGuest={() => {
              continueAsGuest();
              setIsAuthOpen(false);
              setActiveTab('dashboard');
            }}
            onClose={() => setIsAuthOpen(false)}
          />
        </div>
      )}

      {/* Emergency Alert Banner (if triggered) */}
      {emergencyMessage && (
        <EmergencyBanner
          message={emergencyMessage}
          onDismiss={() => setEmergencyMessage(null)}
        />
      )}

      {/* Judge Demo Banner / Toast */}
      {judgeToast && (
        <div style={{
          position: 'fixed',
          top: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          backgroundColor: '#1E293B',
          color: '#FEF3C7',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
          border: '1px solid #F59E0B',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: 600,
          animation: 'slideDown 0.3s ease-out'
        }}>
          <Sparkles size={18} color="#F59E0B" />
          <span>{judgeToast}</span>
          <button
            onClick={() => setJudgeToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              marginLeft: '8px',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setActiveTab('dashboard')}
        onOpenTrustDashboard={() => setIsTrustOpen(true)}
        onOpenChatDrawer={() => setIsChatOpen(true)}
        onRunJudgeDemo={handleRunJudgeDemo}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSavedComparisons={() => setIsSavedComparisonsOpen(true)}
      />

      {/* Main Routed Page Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'landing' && (
          <LandingPage
            onStartSearch={() => setActiveTab('dashboard')}
            onExploreCost={() => setActiveTab('estimate')}
            onExploreHospitals={() => setActiveTab('hospitals')}
            onExploreSchemes={() => setActiveTab('schemes')}
            onHowItWorks={() => setActiveTab('methodology')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenRx={() => setIsRxOpen(true)}
            onNavigateTab={tab => setActiveTab(tab)}
            onTriggerEmergency={triggerEmergency}
          />
        )}

        {activeTab === 'estimate' && <CostEstimatorPage />}
        {activeTab === 'hospitals' && <HospitalDiscoveryPage />}
        {activeTab === 'schemes' && <SchemeNavigatorPage />}
        {activeTab === 'comparison' && <ComparisonPage onBackToSearch={() => setActiveTab('hospitals')} />}
        {activeTab === 'methodology' && <MethodologyPage />}
        {activeTab === 'profile' && <UserProfilePage />}
      </main>

      {/* Floating CareSaathi Chat Action Button (Bottom Left) */}
      <button
        onClick={() => setIsChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 89,
          backgroundColor: '#075E54',
          color: 'white',
          border: '2px solid #25D366',
          borderRadius: '50px',
          padding: '12px 20px',
          boxShadow: '0 4px 15px rgba(7, 94, 84, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.88rem',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        title="Open CareSaathi WhatsApp-style Assistant"
      >
        <MessageSquare size={18} color="#25D366" />
        <span>Ask CareSaathi</span>
      </button>

      {/* Floating Comparison Bar (when items are selected and not on comparison page) */}
      {searchState.comparisonList.length > 0 && activeTab !== 'comparison' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 90,
          backgroundColor: 'var(--color-navy)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {searchState.comparisonList.length} Facilities Selected
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Ready for side-by-side comparison
            </div>
          </div>
          <button
            onClick={() => setActiveTab('comparison')}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 14px' }}
          >
            Compare Now
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onConfirmText={handleVoiceConfirm}
      />

      <PrescriptionModal
        isOpen={isRxOpen}
        onClose={() => setIsRxOpen(false)}
        onConfirmTreatment={handleRxConfirm}
      />

      <TrustDashboardModal
        isOpen={isTrustOpen}
        onClose={() => setIsTrustOpen(false)}
      />

      <SavedComparisonsModal
        isOpen={isSavedComparisonsOpen}
        onClose={() => setIsSavedComparisonsOpen(false)}
        onOpenComparisonPage={() => {
          setIsSavedComparisonsOpen(false);
          setActiveTab('comparison');
        }}
      />

      <GuidedChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTriggerEmergency={triggerEmergency}
        onSelectEstimate={_tId => {
          setActiveTab('dashboard');
          setIsChatOpen(false);
        }}
      />

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onReplayIntro={() => setShowIntro(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
