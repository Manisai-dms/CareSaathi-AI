import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { 
  Heart, 
  Search, 
  MapPin, 
  FileText, 
  HelpCircle, 
  Layers, 
  Globe, 
  Menu, 
  X,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Sparkles,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenTrustDashboard?: () => void;
  onOpenChatDrawer?: () => void;
  onRunJudgeDemo?: () => void;
  onOpenAuth?: () => void;
  onOpenSavedComparisons?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenTrustDashboard,
  onOpenChatDrawer,
  onRunJudgeDemo,
  onOpenAuth,
  onOpenSavedComparisons
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { searchState } = useSearch();
  const { user, isGuest, logout, savedComparisons } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: t('navHome'), icon: Heart },
    { id: 'dashboard', label: t('navDashboard'), icon: Search },
    { id: 'estimate', label: t('navEstimate'), icon: Layers },
    { id: 'hospitals', label: t('navFindHospitals'), icon: MapPin },
    { id: 'schemes', label: t('navFinancialSupport'), icon: FileText },
    { id: 'methodology', label: t('navHowItWorks'), icon: HelpCircle },
  ];

  return (
    <header style={{
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-mint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-teal)'
          }}>
            <Heart size={24} fill="var(--color-teal)" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              CareSaathi <span style={{ color: 'var(--color-teal)' }}>AI</span>
            </div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              color: 'var(--color-text-grey)',
              marginTop: '2px'
            }}>
              {t('tagline')}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '8px'
        }} className="desktop-nav">
          <style>{`
            @media (min-width: 960px) {
              .desktop-nav { display: flex !important; }
              .mobile-toggle { display: none !important; }
              .horizontal-subnav { display: none !important; }
            }
            @media (max-width: 959px) {
              .desktop-nav { display: none !important; }
              .mobile-toggle { display: flex !important; }
              .horizontal-subnav { display: flex !important; }
            }
            .horizontal-subnav::-webkit-scrollbar { display: none; }
          `}</style>
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--color-mint)' : 'transparent',
                  color: isActive ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--color-teal)' : 'var(--color-text-grey)'} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Judge Demo Button (Desktop) */}
          {onRunJudgeDemo && (
            <button
              onClick={onRunJudgeDemo}
              className="btn btn-sm"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #F59E0B',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '6px 12px',
                boxShadow: '0 1px 2px rgba(245, 158, 11, 0.2)'
              }}
              id="desktop-judge-btn"
              title="Quick Load Hackathon Scenario: Total Knee Replacement in Hyderabad with White Card"
            >
              <style>{`
                @media (min-width: 900px) {
                  #desktop-judge-btn { display: inline-flex !important; }
                }
              `}</style>
              <Sparkles size={14} color="#D97706" />
              <span>Judge Demo</span>
            </button>
          )}

          {/* Trust Dashboard Button (Desktop) */}
          {onOpenTrustDashboard && (
            <button
              onClick={onOpenTrustDashboard}
              className="btn btn-sm"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-mint)',
                color: 'var(--color-teal-dark)',
                border: '1px solid #A7F3D0',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '6px 12px'
              }}
              id="desktop-trust-btn"
              title="Open Data Transparency Ledger & Freshness Audit"
            >
              <style>{`
                @media (min-width: 1024px) {
                  #desktop-trust-btn { display: inline-flex !important; }
                }
              `}</style>
              <ShieldCheck size={15} color="var(--color-teal)" />
              <span>Trust Ledger</span>
            </button>
          )}

          {/* Guided Chat Trigger (Desktop) */}
          {onOpenChatDrawer && (
            <button
              onClick={onOpenChatDrawer}
              className="btn btn-sm"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#DCF8C6',
                color: '#075E54',
                border: '1px solid #86EFAC',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '6px 12px'
              }}
              id="desktop-chat-btn"
              title="Chat with CareSaathi Assistant"
            >
              <style>{`
                @media (min-width: 768px) {
                  #desktop-chat-btn { display: inline-flex !important; }
                }
              `}</style>
              <MessageSquare size={15} color="#075E54" />
              <span>CareSaathi Chat</span>
            </button>
          )}

          {/* Comparison Tray Indicator (if 1 or more items selected) */}
          {searchState.comparisonList.length > 0 && (
            <button
              onClick={() => setActiveTab('comparison')}
              className="btn btn-secondary btn-sm"
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Compare selected facilities"
            >
              <Layers size={16} color="var(--color-teal)" />
              <span>{t('compare')}</span>
              <span style={{
                backgroundColor: 'var(--color-teal)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {searchState.comparisonList.length}
              </span>
            </button>
          )}

          {/* User Account / Sign In Button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-teal)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={13} color="var(--color-text-grey)" />
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: '200px',
                  zIndex: 110,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-warm-bg)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-navy)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-grey)' }}>{user.email}</div>
                  </div>

                  {onOpenSavedComparisons && (
                    <div
                      onClick={() => {
                        onOpenSavedComparisons();
                        setUserDropdownOpen(false);
                      }}
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.84rem',
                        color: 'var(--color-navy)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Layers size={14} color="var(--color-teal)" />
                      <span>Saved Comparisons ({savedComparisons.length})</span>
                    </div>
                  )}

                  <div
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      color: '#EF4444',
                      cursor: 'pointer',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
            >
              <User size={14} color="var(--color-teal)" />
              <span>Sign In</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
            >
              <Globe size={15} color="var(--color-teal)" />
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{language}</span>
            </button>
            {langDropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                minWidth: '130px',
                zIndex: 110,
                overflow: 'hidden'
              }}>
                {[
                  { code: 'en', label: 'English' },
                  { code: 'te', label: 'తెలుగు (Telugu)' },
                  { code: 'hi', label: 'हिंदी (Hindi)' }
                ].map(l => (
                  <div
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as any);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      fontSize: '0.88rem',
                      fontWeight: language === l.code ? 700 : 500,
                      backgroundColor: language === l.code ? 'var(--color-mint)' : 'transparent',
                      color: language === l.code ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                      cursor: 'pointer'
                    }}
                  >
                    {l.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onOpenSearch();
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'none' }}
            id="desktop-cta-btn"
          >
            <style>{`
              @media (min-width: 1200px) {
                #desktop-cta-btn { display: inline-flex !important; }
              }
            `}</style>
            <span>{t('startSearch')}</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-navy)',
              padding: '6px'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Horizontal Nav Bar for smaller/tablet screens — Keeps navigation strictly horizontal without disturbing layout */}
      <div
        className="horizontal-subnav"
        style={{
          display: 'none',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--color-border)',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1px solid var(--color-teal)' : '1px solid var(--color-border)',
                background: isActive ? 'var(--color-mint)' : 'var(--color-white)',
                color: isActive ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} color={isActive ? 'var(--color-teal)' : 'var(--color-text-grey)'} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderBottom: '1px solid var(--color-border)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Quick Demo button on Mobile */}
            {onRunJudgeDemo && (
              <button
                onClick={() => {
                  onRunJudgeDemo();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #F59E0B',
                  fontWeight: 700,
                  padding: '10px 14px',
                  marginBottom: '6px'
                }}
              >
                <Sparkles size={16} color="#D97706" />
                <span>🎯 Run Judge Demo (Knee Replacement)</span>
              </button>
            )}

            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--color-mint)' : 'transparent',
                    color: isActive ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--color-teal)' : 'var(--color-text-grey)'} />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {/* Mobile Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {onOpenTrustDashboard && (
                <button
                  onClick={() => {
                    onOpenTrustDashboard();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} color="var(--color-teal)" />
                  <span>Trust Ledger</span>
                </button>
              )}
              {onOpenChatDrawer && (
                <button
                  onClick={() => {
                    onOpenChatDrawer();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#DCF8C6',
                    color: '#075E54'
                  }}
                >
                  <MessageSquare size={16} color="#075E54" />
                  <span>Chat</span>
                </button>
              )}
            </div>

            {/* Mobile Auth Button */}
            {user ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {onOpenSavedComparisons && (
                  <button
                    onClick={() => {
                      onOpenSavedComparisons();
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Layers size={15} color="var(--color-teal)" />
                    <span>Saved ({savedComparisons.length})</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#EF4444' }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <User size={15} color="var(--color-teal)" />
                <span>Sign In / Demo Login</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="btn btn-primary"
              style={{ marginTop: '12px', width: '100%' }}
            >
              <span>{t('startSearch')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
