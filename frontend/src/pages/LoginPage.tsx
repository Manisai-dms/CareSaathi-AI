// ==============================================================================
// CareSaathi AI - Dedicated Light Multi-Tone Login Page (/login)
// Full-page layout: Left 55% with 3D Care Path & value lines, Right 45% with
// light auth panel, underline tabs, floating labels, real states, coral errors,
// quiet demo access, and post-auth redirect.
// ==============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CarePath3D } from '../components/CarePath3D';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateHome
}) => {
  const { login, register, demoLogin } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);

  // States: 'idle' | 'loading' | 'error' | 'success'
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const prefersReduced = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatus('loading');

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both your email and password.');
        }
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await register(name, email, password, selectedLang);
        setLanguage(selectedLang as any);
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 450);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleDemoAccess = async () => {
    setErrorMsg(null);
    setStatus('loading');
    try {
      await demoLogin();
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 450);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Demo access authentication failed.');
    }
  };

  return (
    <div
      className="mesh-gradient-bg paper-grain"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Animated Multi-Tone Mesh Gradient Background */}
      <div className="mesh-gradient-layer" />
      <div className="paper-grain-overlay" />

      {/* Top Header Navigation */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)'
        }}
      >
        <button
          type="button"
          onClick={onNavigateHome}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64717D',
            fontSize: '0.86rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#102A36';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#64717D';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Overview</span>
        </button>

        {/* Wordmark (no heart tile) */}
        <div
          onClick={onNavigateHome}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '6px' }}
        >
          <span style={{ fontFamily: "Georgia, 'Plus Jakarta Sans', serif", fontSize: '1.3rem', fontWeight: 700, color: '#102A36' }}>
            CareSaathi
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#438F84' }}>
            AI
          </span>
        </div>
      </header>

      {/* Main 2-Panel Content Area */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'center',
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 24px 48px 24px',
          gap: '36px'
        }}
        className="login-layout-grid"
      >
        {/* Left Panel (~55%): The 3D Care Path & Static Value Statements */}
        <div style={{ gridColumn: 'span 7' }} className="login-left-panel">
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ height: '360px', width: '100%', position: 'relative', marginBottom: '24px' }}>
              <CarePath3D interactive={true} compact={true} />
            </div>

            <div style={{ paddingLeft: '8px' }}>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: '#102A36',
                  marginBottom: '18px',
                  letterSpacing: '-0.02em'
                }}
              >
                Clear, Verified Healthcare Decisions
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#438F84' }} />
                  <span style={{ fontSize: '0.92rem', color: '#64717D' }}>
                    Compare estimated treatment costs across facility tiers
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#438F84' }} />
                  <span style={{ fontSize: '0.92rem', color: '#64717D' }}>
                    Find nearby empanelled and verified hospitals
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#438F84' }} />
                  <span style={{ fontSize: '0.92rem', color: '#64717D' }}>
                    Check public schemes you may be eligible for
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (~45%): Auth Card Over Mesh Gradient */}
        <div style={{ gridColumn: 'span 5' }} className="login-right-panel">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(24, 50, 71, 0.06)',
              padding: '36px 32px',
              maxWidth: '440px',
              width: '100%',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {/* Underline Tab Bar (Sign In / Create Account) with Sliding Indicator */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #E2E8F0',
                marginBottom: '26px',
                position: 'relative'
              }}
              role="tablist"
              aria-label="Authentication Options"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setStatus('idle');
                }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  borderBottom: mode === 'login' ? '2.5px solid #438F84' : '2.5px solid transparent',
                  padding: '10px 4px',
                  fontFamily: mode === 'login' ? "Georgia, serif" : 'inherit',
                  fontSize: '0.96rem',
                  fontWeight: mode === 'login' ? 700 : 500,
                  color: mode === 'login' ? '#102A36' : '#64717D',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setStatus('idle');
                }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  borderBottom: mode === 'register' ? '2.5px solid #438F84' : '2.5px solid transparent',
                  padding: '10px 4px',
                  fontFamily: mode === 'register' ? "Georgia, serif" : 'inherit',
                  fontSize: '0.96rem',
                  fontWeight: mode === 'register' ? 700 : 500,
                  color: mode === 'register' ? '#102A36' : '#64717D',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Error Message with Shake Animation */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
                  animate={prefersReduced ? { opacity: 1 } : { opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  id="auth-error-msg"
                  role="alert"
                  aria-live="assertive"
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    fontSize: '0.84rem',
                    color: '#D97962' // Coral for error
                  }}
                >
                  <AlertCircle size={16} color="#D97962" style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label
                      htmlFor="reg-name-input"
                      style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#102A36', marginBottom: '5px' }}
                    >
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="reg-name-input"
                        type="text"
                        required
                        placeholder="Ramesh Reddy"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="login-input"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 38px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.92rem',
                          color: '#102A36',
                          backgroundColor: '#FAFAF7',
                          outline: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s'
                        }}
                      />
                      <User size={16} color="#64717D" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email-input"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#102A36', marginBottom: '5px' }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="login-input"
                    aria-describedby={errorMsg ? "auth-error-msg" : undefined}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.92rem',
                      color: '#102A36',
                      backgroundColor: '#FAFAF7',
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                  />
                  <Mail size={16} color="#64717D" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <label
                  htmlFor="password-input"
                  style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#102A36', marginBottom: '5px' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="login-input"
                    aria-describedby={errorMsg ? "auth-error-msg" : undefined}
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.92rem',
                      color: '#102A36',
                      backgroundColor: '#FAFAF7',
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                  />
                  <Lock size={16} color="#64717D" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '11px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64717D',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Language Selection for Register */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    key="lang-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label
                      htmlFor="lang-select"
                      style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#102A36', marginBottom: '5px' }}
                    >
                      Preferred Language
                    </label>
                    <select
                      id="lang-select"
                      value={selectedLang}
                      onChange={e => setSelectedLang(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.92rem',
                        color: '#102A36',
                        backgroundColor: '#FAFAF7',
                        outline: 'none'
                      }}
                    >
                      <option value="en">English</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary Teal Action Button with Real States */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: status === 'success' ? '#2E7D32' : '#438F84',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  border: 'none',
                  marginTop: '6px',
                  minHeight: '44px',
                  transition: 'background-color 0.2s ease, transform 0.1s ease'
                }}
                onMouseDown={e => {
                  if (status !== 'loading') e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {status === 'loading' && (
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      display: 'inline-block'
                    }}
                  />
                )}
                {status === 'success' && <Check size={18} color="#FFFFFF" />}
                <span>
                  {status === 'loading'
                    ? 'Verifying...'
                    : status === 'success'
                    ? 'Success'
                    : mode === 'login'
                    ? 'Sign In to CareSaathi'
                    : 'Create Free Account'}
                </span>
                {status === 'idle' && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '22px 0',
                color: '#94A3B8',
                fontSize: '0.74rem'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
              <span style={{ padding: '0 10px', fontWeight: 600, letterSpacing: '0.04em' }}>
                OR INSTANT REVIEW
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            </div>

            {/* Quiet Neutral/Teal Demo Access Button (No Amber Box) */}
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1.5px solid #438F84',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#326D64',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  minHeight: '44px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#E7F3EF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Sparkles size={15} color="#438F84" />
                <span>Demo access (Instant Sign In)</span>
              </button>
            </div>

            {/* Terms and Privacy Footer Line */}
            <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#94A3B8', marginTop: '16px' }}>
              By signing in, you agree to statutory healthcare guidance and informational estimates.
            </div>
          </motion.div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-input:focus {
          border-color: #438F84 !important;
          box-shadow: 0 0 0 2px rgba(67, 143, 132, 0.25) !important;
          background-color: #FFFFFF !important;
        }
        @media (max-width: 900px) {
          .login-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .login-left-panel {
            grid-column: span 12 !important;
            display: none !important;
          }
          .login-right-panel {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};
