import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider, useSearch } from './context/SearchContext';
import { Sidebar, SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './components/Sidebar';
import { Footer } from './components/Footer';
import { EmergencyBanner } from './components/EmergencyBanner';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { TrustDashboardModal } from './components/TrustDashboardModal';
import { GuidedChatDrawer } from './components/GuidedChatDrawer';
import { AnimatedIntro } from './components/AnimatedIntro';
import { SavedComparisonsModal } from './components/SavedComparisonsModal';
import { AuthPage } from './pages/AuthPage';
import { JourneyContextBar } from './components/JourneyContextBar';
import { appointmentRepo, Appointment } from './services/appointmentRepository';
import { MessageSquare, Sparkles, Menu, Heart, Clock } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CostEstimatorPage } from './pages/CostEstimatorPage';
import { HospitalDiscoveryPage } from './pages/HospitalDiscoveryPage';
import { SchemeNavigatorPage } from './pages/SchemeNavigatorPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { UserProfilePage } from './pages/UserProfilePage';

const PROTECTED_TABS = ['dashboard', 'estimate', 'hospitals', 'schemes', 'comparison', 'profile'];

const getInitialTabFromUrl = (): string => {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.replace(/^\//, '');
  if (PROTECTED_TABS.includes(path) || path === 'methodology') {
    return path;
  }
  return 'landing';
};

const AppContent: React.FC = () => {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const { searchState, setSearchQuery, setTreatment, setLocation } = useSearch();

  const [activeTab, setActiveTab] = useState<string>(getInitialTabFromUrl);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/login';
  });
  const pendingRedirectRef = useRef<string | null>(null);

  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [isTrustOpen, setIsTrustOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSavedComparisonsOpen, setIsSavedComparisonsOpen] = useState(false);
  const [judgeToast, setJudgeToast] = useState<string | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [upcomingReminder, setUpcomingReminder] = useState<Appointment | null>(null);

  // Left Sidebar state: responsive collapse for tablets, slide-out drawer for mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // First visit animated intro
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('caresaathi_intro_seen');
  });

  // Protected route navigation helper with URL synchronization
  const navigateToTab = (targetTab: string) => {
    if (PROTECTED_TABS.includes(targetTab)) {
      if (!user && !token) {
        pendingRedirectRef.current = targetTab;
        window.history.pushState(null, '', '/login');
        setIsAuthOpen(true);
        return;
      }
    }
    setIsAuthOpen(false);
    setActiveTab(targetTab);
    const targetPath = targetTab === 'landing' ? '/' : `/${targetTab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Direct URL access / page refresh route protection
  useEffect(() => {
    if (isAuthLoading) return;

    const currentPath = window.location.pathname.replace(/^\//, '');
    if (currentPath === 'login') {
      setIsAuthOpen(true);
      return;
    }

    const currentTab = currentPath === '' || currentPath === 'welcome' ? 'landing' : currentPath;

    if (PROTECTED_TABS.includes(currentTab)) {
      if (!user && !token) {
        // Direct URL access without authentication: redirect via replaceState to avoid Back navigation loop
        pendingRedirectRef.current = currentTab;
        window.history.replaceState(null, '', '/login');
        setIsAuthOpen(true);
        setActiveTab('landing');
        return;
      }
      setActiveTab(currentTab);
      setIsAuthOpen(false);
    } else {
      setActiveTab(currentTab);
      setIsAuthOpen(false);
    }
  }, [isAuthLoading, user, token]);

  // Handle browser Back / Forward (popstate) without navigation loops
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname.replace(/^\//, '');
      if (currentPath === 'login') {
        setIsAuthOpen(true);
        return;
      }

      const targetTab = currentPath === '' || currentPath === 'welcome' ? 'landing' : currentPath;

      if (PROTECTED_TABS.includes(targetTab)) {
        if (!user && !token) {
          // Unauthenticated attempt to navigate back to protected page
          pendingRedirectRef.current = targetTab;
          window.history.replaceState(null, '', '/login');
          setIsAuthOpen(true);
          setActiveTab('landing');
          return;
        }
      }

      setIsAuthOpen(false);
      setActiveTab(targetTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, token]);

  // Check for upcoming appointments within 24 hours on load
  useEffect(() => {
    appointmentRepo.getMyAppointments().then(list => {
      const now = Date.now();
      const imminent = list.find(a => {
        if (a.status === 'Cancelled' || a.status === 'Completed') return false;
        const time = a.slot_start ? new Date(a.slot_start).getTime() : 0;
        const diff = (time - now) / 3600000;
        return diff >= 0 && diff <= 24;
      });
      if (imminent) setUpcomingReminder(imminent);
    });
  }, [activeTab]);

  // Handle intro completion: "Get Started" transitions into authentication
  const handleIntroComplete = () => {
    localStorage.setItem('caresaathi_intro_seen', 'true');
    setShowIntro(false);
    if (!user && !token) {
      pendingRedirectRef.current = 'dashboard';
      window.history.pushState(null, '', '/login');
      setIsAuthOpen(true);
    } else {
      navigateToTab('dashboard');
    }
  };

  // Successful authentication transitions smoothly to pending or dashboard page
  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    const destination = pendingRedirectRef.current || 'dashboard';
    pendingRedirectRef.current = null;
    setActiveTab(destination);
    window.history.pushState(null, '', `/${destination}`);
  };

  // Close auth modal & restore public URL
  const handleAuthClose = () => {
    setIsAuthOpen(false);
    pendingRedirectRef.current = null;
    if (window.location.pathname === '/login') {
      const fallback = activeTab === 'landing' ? '/' : `/${activeTab}`;
      window.history.pushState(null, '', fallback);
    }
  };

  const handleVoiceConfirm = (transcript: string) => {
    setSearchQuery(transcript);
    navigateToTab('dashboard');
  };

  const handleRxConfirm = (treatmentName: string) => {
    setSearchQuery(treatmentName);
    setTreatment('custom', treatmentName);
    navigateToTab('dashboard');
  };

  const triggerEmergency = (msg: string) => {
    setEmergencyMessage(msg);
  };

  const handleRunJudgeDemo = () => {
    setTreatment('knee_replacement', 'Total Knee Replacement (TKR)');
    setLocation('Hyderabad', '');
    setSearchQuery('Total Knee Replacement in Hyderabad');
    navigateToTab('dashboard');
    setJudgeToast('🎯 Judge Demo Scenario Loaded: Total Knee Replacement (TKR) in Hyderabad | Target: ₹2.5 Lakh Income, White Card / Aarogyasri Scheme');
    setTimeout(() => {
      setJudgeToast(null);
    }, 7000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', backgroundColor: 'var(--color-warm-bg)' }}>
      {/* 1. First Visit Animated Intro Screen */}
      {showIntro && (
        <AnimatedIntro onComplete={handleIntroComplete} />
      )}

      {/* 2. Enforced Authentication Page / Modal */}
      {isAuthOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          overflowY: 'auto',
          backgroundColor: '#FAFAF7'
        }}>
          <AuthPage
            onSuccess={handleAuthSuccess}
            onContinueAsGuest={() => {
              // Redirect to login demo mode rather than unauthenticated bypass
              handleAuthSuccess();
            }}
            onClose={handleAuthClose}
          />
        </div>
      )}

      {/* Emergency Alert Banner */}
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
          top: '20px',
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
          animation: 'slideDown 0.3s ease-out',
          maxWidth: '90vw'
        }}>
          <Sparkles size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
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

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
        onOpenSearch={() => navigateToTab('dashboard')}
        onOpenTrustDashboard={() => setIsTrustOpen(true)}
        onOpenChatDrawer={() => setIsChatOpen(true)}
        onRunJudgeDemo={handleRunJudgeDemo}
        onOpenAuth={() => {
          pendingRedirectRef.current = activeTab;
          window.history.pushState(null, '', '/login');
          setIsAuthOpen(true);
        }}
        onOpenSavedComparisons={() => setIsSavedComparisonsOpen(true)}
      />

      {/* 2. Main Application Content Layout (occupies remaining width beside sidebar) */}
      <div
        className={`app-main-layout ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}
        style={{
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflowX: 'hidden'
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .app-main-layout.expanded {
              margin-left: ${SIDEBAR_EXPANDED_WIDTH}px;
              width: calc(100% - ${SIDEBAR_EXPANDED_WIDTH}px);
            }
            .app-main-layout.collapsed {
              margin-left: ${SIDEBAR_COLLAPSED_WIDTH}px;
              width: calc(100% - ${SIDEBAR_COLLAPSED_WIDTH}px);
            }
            .mobile-top-bar {
              display: none !important;
            }
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            .app-main-layout.expanded {
              margin-left: ${SIDEBAR_EXPANDED_WIDTH}px;
              width: calc(100% - ${SIDEBAR_EXPANDED_WIDTH}px);
            }
            .app-main-layout.collapsed {
              margin-left: ${SIDEBAR_COLLAPSED_WIDTH}px;
              width: calc(100% - ${SIDEBAR_COLLAPSED_WIDTH}px);
            }
            .mobile-top-bar {
              display: none !important;
            }
          }
          @media (max-width: 767px) {
            .app-main-layout {
              margin-left: 0 !important;
              width: 100% !important;
            }
            .mobile-top-bar {
              display: flex !important;
            }
          }
          .simple-mode {
            font-size: 1.08rem !important;
          }
          .simple-mode h1 { font-size: 2.3rem !important; font-weight: 800 !important; }
          .simple-mode h2 { font-size: 1.85rem !important; }
          .simple-mode .btn { padding: 12px 22px !important; font-size: 1rem !important; }
        `}</style>

        {/* Mobile Top Bar */}
        <header
          className="mobile-top-bar"
          style={{
            height: '56px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsMobileNavOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-navy)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <div
              onClick={() => navigateToTab('landing')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-teal)'
              }}>
                <Heart size={16} fill="var(--color-teal)" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-navy)' }}>
                CareSaathi <span style={{ color: 'var(--color-teal)' }}>AI</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user ? (
              <div
                onClick={() => navigateToTab('profile')}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-teal)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title={user.name || user.email}
              >
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            ) : (
              <button
                onClick={() => {
                  pendingRedirectRef.current = activeTab;
                  window.history.pushState(null, '', '/login');
                  setIsAuthOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Journey Context Bar & Simple Mode (Shown across care navigation stages) */}
        {activeTab !== 'landing' && (
          <JourneyContextBar
            currentStage={activeTab === 'dashboard' || activeTab === 'estimate' ? 1 : activeTab === 'hospitals' ? 2 : activeTab === 'schemes' || activeTab === 'comparison' ? 3 : 4}
            onNavigateTab={tab => navigateToTab(tab)}
            isSimpleMode={isSimpleMode}
            onToggleSimpleMode={() => setIsSimpleMode(!isSimpleMode)}
          />
        )}

        {/* 24-Hour Urgent Reminder In-App Banner */}
        {upcomingReminder && activeTab !== 'profile' && (
          <div style={{
            backgroundColor: '#EFF6FF',
            borderBottom: '1px solid #BFDBFE',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.86rem',
            color: '#1E40AF',
            zIndex: 79
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#2563EB" />
              <span>
                <strong>Upcoming Hospital Appointment:</strong> {upcomingReminder.facility_name} on{' '}
                {new Date(upcomingReminder.slot_start || '').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                {new Date(upcomingReminder.slot_start || '').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button
              onClick={() => navigateToTab('profile')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563EB',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              View Appointment
            </button>
          </div>
        )}

        {/* Main Routed Page Content */}
        <main className={isSimpleMode ? 'simple-mode' : ''} style={{ flex: 1, width: '100%', minWidth: 0 }}>
          {activeTab === 'landing' && (
            <LandingPage
              onStartSearch={() => navigateToTab('dashboard')}
              onExploreCost={() => navigateToTab('estimate')}
              onExploreHospitals={() => navigateToTab('hospitals')}
              onExploreSchemes={() => navigateToTab('schemes')}
              onHowItWorks={() => navigateToTab('methodology')}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenRx={() => setIsRxOpen(true)}
              onNavigateTab={tab => navigateToTab(tab)}
              onTriggerEmergency={triggerEmergency}
            />
          )}

          {activeTab === 'estimate' && <CostEstimatorPage />}
          {activeTab === 'hospitals' && <HospitalDiscoveryPage />}
          {activeTab === 'schemes' && <SchemeNavigatorPage />}
          {activeTab === 'comparison' && <ComparisonPage onBackToSearch={() => navigateToTab('hospitals')} />}
          {activeTab === 'methodology' && <MethodologyPage />}
          {activeTab === 'profile' && <UserProfilePage onNavigateTab={tab => navigateToTab(tab)} />}
        </main>

        {/* Footer */}
        <Footer
          setActiveTab={navigateToTab}
          onReplayIntro={() => setShowIntro(true)}
        />
      </div>

      {/* Floating CareSaathi Chat Action Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: searchState.comparisonList.length > 0 && activeTab !== 'comparison' ? '88px' : '24px',
          right: '24px',
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
          transition: 'all 0.2s ease'
        }}
        title="Open CareSaathi WhatsApp-style Assistant"
      >
        <MessageSquare size={18} color="#25D366" />
        <span>Ask CareSaathi</span>
      </button>

      {/* Floating Comparison Bar */}
      {searchState.comparisonList.length > 0 && activeTab !== 'comparison' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '24px',
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
            onClick={() => navigateToTab('comparison')}
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
          navigateToTab('comparison');
        }}
      />

      <GuidedChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTriggerEmergency={triggerEmergency}
        onSelectEstimate={_tId => {
          navigateToTab('dashboard');
          setIsChatOpen(false);
        }}
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
