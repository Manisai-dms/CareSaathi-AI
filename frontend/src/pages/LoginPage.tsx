// ==============================================================================
// CareSaathi AI - Light Multi-Tone Login Page (/login)
// Scoped prefix: lg-
//
// Features:
// - Full-page subtle transparent hospital background (18% opacity, 3px blur, soft overlay)
// - 2D continuous animated ECG / blood-pressure waveform lines with leading pulse point
// - Preserved headline, blurb, and colored tags (Costs, Hospitals, Schemes)
// - Glassy sign-in card (~90% opacity with backdrop blur)
// - "Continue with Google" Supabase OAuth with inline fallback and loading states
// - Preserved Email/Password auth, Demo access, language selection, and disclaimer
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { LoginBackground } from '../components/LoginBackground';
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
  ArrowLeft,
  Info
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
  const { user, token, login, register, demoLogin } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);

  // Focus tracking for input line animation
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Auth statuses: 'idle' | 'loading' | 'error' | 'success'
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Google OAuth status
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  // Field input refs for error auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const prefersReduced = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If an already-logged-in user opens the login page, redirect to Home immediately
  useEffect(() => {
    if (user || token) {
      onSuccess();
    }
  }, [user, token, onSuccess]);

  // Listen to Supabase auth state change (e.g. after Google OAuth redirect)
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        setStatus('success');
        setIsGoogleLoading(false);
        setTimeout(() => {
          onSuccess();
        }, 400);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoNotice(null);
    setGoogleNotice(null);
    setStatus('loading');

    try {
      if (mode === 'login') {
        if (!email.trim()) {
          emailInputRef.current?.focus();
          throw new Error('Please enter your email address.');
        }
        if (!password.trim()) {
          passwordInputRef.current?.focus();
          throw new Error('Please enter your password.');
        }
        await login(email, password);
        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 420);
      } else {
        if (!name.trim()) {
          nameInputRef.current?.focus();
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@')) {
          emailInputRef.current?.focus();
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          passwordInputRef.current?.focus();
          throw new Error('Password must be at least 6 characters.');
        }
        const regResult = await register(name, email, password, selectedLang);
        setLanguage(selectedLang as any);

        if (regResult?.needsEmailConfirmation) {
          setStatus('idle');
          setInfoNotice(`Account created for ${email}! A confirmation link has been sent to your email. Please check your inbox to verify your email before signing in, or disable "Confirm email" in your Supabase Dashboard (Authentication > Providers > Email) for instant login.`);
          setMode('login');
          return;
        }

        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 420);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleNotice(null);
    setErrorMsg(null);

    if (!supabase || !isSupabaseConfigured) {
      setGoogleNotice('Google sign-in needs Supabase to be configured. Use Demo access for now.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleDemoAccess = async () => {
    setErrorMsg(null);
    setGoogleNotice(null);
    setStatus('loading');
    try {
      await demoLogin();
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 420);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Demo access authentication failed.');
    }
  };

  return (
    <div className="lg-root-container">
      {/* Rich Decorative 6-Layer Background Component (Blobs, waves, icons, particles, hospital watermark, grid) */}
      <LoginBackground />

      {/* Top Navigation Bar */}
      <header className="lg-top-header">
        <button
          type="button"
          onClick={onNavigateHome}
          className="lg-back-btn"
          aria-label="Back to Overview"
        >
          <ArrowLeft size={16} />
          <span>Back to Overview</span>
        </button>

        {/* Brand Wordmark */}
        <div
          onClick={onNavigateHome}
          className="lg-brand-wordmark"
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') onNavigateHome(); }}
        >
          <span className="lg-wordmark-title">CareSaathi</span>
          <span className="lg-wordmark-accent">AI</span>
        </div>
      </header>

      {/* Main 2-Panel Layout: Left 55% ECG Lines & Blurb, Right 45% Glassy Auth Card */}
      <main className="lg-main-grid">
        {/* Left Panel: 2D Animated ECG/BP lines & App Headline */}
        <div className="lg-left-panel">
          <div className="lg-left-inner">
            {/* Animated 2D ECG Pulse Line Card */}
            <div className="lg-ecg-visual-container">
              {/* Responsive SVG Heartbeat waveforms */}
              <svg 
                className="lg-ecg-svg" 
                viewBox="0 0 600 180" 
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ecgTealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2F8F83" stopOpacity="0" />
                    <stop offset="20%" stopColor="#2F8F83" stopOpacity="0.4" />
                    <stop offset="85%" stopColor="#2F8F83" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#2F8F83" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="ecgCoralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF7A59" stopOpacity="0" />
                    <stop offset="25%" stopColor="#FF7A59" stopOpacity="0.3" />
                    <stop offset="85%" stopColor="#FF7A59" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#FF7A59" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="ecgSubtleTeal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#438F84" stopOpacity="0" />
                    <stop offset="30%" stopColor="#438F84" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#438F84" stopOpacity="0.45" />
                  </linearGradient>
                  <filter id="ecgGlowTeal" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2F8F83" floodOpacity="0.5" />
                  </filter>
                  <filter id="ecgGlowCoral" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#FF7A59" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Waveform 3: Ambient blood-pressure wave (top, y=50) */}
                <path
                  d="M -50,50 Q 0,38 50,50 T 150,50 L 165,50 L 172,56 L 184,18 L 194,76 L 200,50 L 220,50 Q 235,40 250,50 T 350,50 L 365,50 L 372,56 L 384,18 L 394,76 L 400,50 L 420,50 Q 435,40 450,50 T 550,50 L 650,50"
                  className="lg-ecg-line lg-ecg-ambient"
                  fill="none"
                  stroke="url(#ecgSubtleTeal)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Waveform 2: Soft Coral ECG rhythm (bottom, y=125) */}
                <path
                  d="M -40,125 L 30,125 Q 45,115 55,125 L 68,125 L 75,131 L 88,68 L 98,144 L 105,125 L 125,125 Q 140,114 155,125 L 230,125 Q 245,115 255,125 L 268,125 L 275,131 L 288,68 L 298,144 L 305,125 L 325,125 Q 340,114 355,125 L 430,125 Q 445,115 455,125 L 468,125 L 475,131 L 488,68 L 498,144 L 505,125 L 525,125 Q 540,114 555,125 L 650,125"
                  className="lg-ecg-line lg-ecg-coral"
                  fill="none"
                  stroke="url(#ecgCoralGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#ecgGlowCoral)"
                />

                {/* Waveform 1: Primary Teal ECG line (center, y=90) */}
                <path
                  d="M -50,90 L 40,90 Q 55,78 65,90 L 78,90 L 86,98 L 100,22 L 112,118 L 120,90 L 140,90 Q 155,76 170,90 L 230,90 Q 245,78 255,90 L 268,90 L 276,98 L 290,22 L 302,118 L 310,90 L 330,90 Q 345,76 360,90 L 420,90 Q 435,78 445,90 L 458,90 L 466,98 L 480,22 L 492,118 L 500,90 L 520,90 Q 535,76 550,90 L 650,90"
                  className="lg-ecg-line lg-ecg-main"
                  fill="none"
                  stroke="url(#ecgTealGrad)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#ecgGlowTeal)"
                />

                {/* Leading pulse dot and ring following the main ECG wave */}
                <g className="lg-ecg-pulse-follower">
                  <circle r="4" fill="#2F8F83" className="lg-pulse-head-dot" />
                  <circle r="8" fill="none" stroke="#2F8F83" strokeWidth="1.5" className="lg-pulse-head-ring" />
                </g>
              </svg>
            </div>

            {/* Preserved Headline, App Blurb & Colored Tags */}
            <div className="lg-blurb-container">
              <h2 className="lg-blurb-heading">
                Healthcare costs, made clearer.
              </h2>
              <p className="lg-blurb-sentence">
                CareSaathi AI helps you explore indicative costs, find empanelled hospitals, and check schemes you may be eligible for.
              </p>

              {/* 3 colored tags: Costs, Hospitals, Schemes */}
              <div className="lg-blurb-tags">
                <span className="lg-tag-pill">
                  <span className="lg-tag-dot lg-dot-aqua" />
                  <span>Costs</span>
                </span>
                <span className="lg-tag-pill">
                  <span className="lg-tag-dot lg-dot-sky" />
                  <span>Hospitals</span>
                </span>
                <span className="lg-tag-pill">
                  <span className="lg-tag-dot lg-dot-coral" />
                  <span>Schemes</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Glassy Auth Card */}
        <div className="lg-right-panel">
          <div className={`lg-auth-card-wrap ${status === 'error' && !prefersReduced ? 'lg-card-shake' : ''} ${status === 'success' ? 'lg-card-success-lift' : ''}`}>
            {/* Subtle Rotating Conic Gradient Border Glow */}
            <div className="lg-conic-border-glow" aria-hidden="true" />

            {/* Glassy Card Surface (white at ~90% opacity with backdrop blur) */}
            <div className="lg-card-surface">
              {/* Header Title & Subtitle */}
              <div className="lg-card-header">
                <h1 className="lg-card-title">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p className="lg-card-sub">
                  {mode === 'login' 
                    ? 'Sign in to access your saved comparisons & healthcare navigator.'
                    : 'Get personalized cost guidance and empanelled care discovery.'}
                </p>
              </div>

              {/* Underline Tabs with Sliding Indicator */}
              <div className="lg-tab-bar" role="tablist" aria-label="Authentication Type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setInfoNotice(null);
                    setGoogleNotice(null);
                    setStatus('idle');
                  }}
                  className={`lg-tab-btn ${mode === 'login' ? 'lg-tab-active' : ''}`}
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
                    setInfoNotice(null);
                    setGoogleNotice(null);
                    setStatus('idle');
                  }}
                  className={`lg-tab-btn ${mode === 'register' ? 'lg-tab-active' : ''}`}
                >
                  Create Account
                </button>
                {/* Sliding indicator */}
                <div 
                  className="lg-tab-slider" 
                  style={{
                    left: mode === 'login' ? '0%' : '50%',
                    width: '50%'
                  }} 
                  aria-hidden="true"
                />
              </div>

              {/* Info / Email Confirmation Notice Banner */}
              {infoNotice && (
                <div 
                  id="lg-auth-info" 
                  className="lg-info-banner" 
                  role="status" 
                  aria-live="polite"
                >
                  <Info size={18} className="lg-info-icon" />
                  <div className="lg-info-text-wrap">
                    <strong className="lg-info-heading">Action Needed: Confirm Email</strong>
                    <p className="lg-info-body">{infoNotice}</p>
                  </div>
                </div>
              )}

              {/* Error Message Banner */}
              {errorMsg && (
                <div 
                  id="lg-auth-error" 
                  className="lg-error-banner" 
                  role="alert" 
                  aria-live="assertive"
                >
                  <AlertCircle size={16} className="lg-error-icon" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Auth Form with Floating Labels */}
              <form onSubmit={handleSubmit} className="lg-form" noValidate>
                {/* Full Name Field (Register Mode Only) */}
                {mode === 'register' && (
                  <div className={`lg-input-group ${focusedField === 'name' ? 'lg-focused' : ''} ${name ? 'lg-has-value' : ''}`}>
                    <User size={16} className="lg-input-icon" aria-hidden="true" />
                    <input
                      ref={nameInputRef}
                      id="lg-reg-name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="lg-input-field"
                      autoComplete="name"
                      placeholder=" "
                    />
                    <label htmlFor="lg-reg-name" className="lg-floating-label">
                      Full Name
                    </label>
                    <div className="lg-focus-line" aria-hidden="true" />
                  </div>
                )}

                {/* Email Address Field */}
                <div className={`lg-input-group ${focusedField === 'email' ? 'lg-focused' : ''} ${email ? 'lg-has-value' : ''}`}>
                  <Mail size={16} className="lg-input-icon" aria-hidden="true" />
                  <input
                    ref={emailInputRef}
                    id="lg-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="lg-input-field"
                    autoComplete="email"
                    placeholder=" "
                    aria-describedby={errorMsg ? "lg-auth-error" : undefined}
                  />
                  <label htmlFor="lg-email" className="lg-floating-label">
                    Email Address
                  </label>
                  <div className="lg-focus-line" aria-hidden="true" />
                </div>

                {/* Password Field with Eye Toggle */}
                <div className={`lg-input-group ${focusedField === 'password' ? 'lg-focused' : ''} ${password ? 'lg-has-value' : ''}`}>
                  <Lock size={16} className="lg-input-icon" aria-hidden="true" />
                  <input
                    ref={passwordInputRef}
                    id="lg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="lg-input-field lg-input-pwd"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder=" "
                    aria-describedby={errorMsg ? "lg-auth-error" : undefined}
                  />
                  <label htmlFor="lg-password" className="lg-floating-label">
                    {mode === 'login' ? 'Password' : 'Password (min. 6 characters)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="lg-pwd-toggle-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <div className="lg-focus-line" aria-hidden="true" />
                </div>

                {/* Preferred Language Field (Register Mode Only) */}
                {mode === 'register' && (
                  <div className="lg-select-group">
                    <label htmlFor="lg-reg-lang" className="lg-select-label">
                      Preferred Language
                    </label>
                    <select
                      id="lg-reg-lang"
                      value={selectedLang}
                      onChange={e => setSelectedLang(e.target.value as any)}
                      className="lg-select-field"
                    >
                      <option value="en">English (Official)</option>
                      <option value="te">తెలుగు (Telugu - Aarogyasri)</option>
                      <option value="hi">हिंदी (Hindi - PM-JAY)</option>
                    </select>
                  </div>
                )}

                {/* Primary Action Button (Sign In / Create Free Account) */}
                <button
                  type="submit"
                  disabled={status === 'loading' || isGoogleLoading}
                  className={`lg-primary-btn ${status === 'loading' ? 'lg-btn-loading' : ''} ${status === 'success' ? 'lg-btn-success' : ''}`}
                >
                  <div className="lg-btn-sheen" aria-hidden="true" />
                  {status === 'loading' && (
                    <span className="lg-btn-spinner" aria-hidden="true" />
                  )}
                  {status === 'success' && (
                    <Check size={18} className="lg-btn-check-icon" />
                  )}
                  <span className="lg-btn-text">
                    {status === 'loading'
                      ? 'Authenticating...'
                      : status === 'success'
                      ? 'Welcome to CareSaathi'
                      : mode === 'login'
                      ? 'Sign In to CareSaathi'
                      : 'Create Free Account'}
                  </span>
                  {status === 'idle' && <ArrowRight size={16} className="lg-btn-arrow" />}
                </button>
              </form>

              {/* Sub-Divider: "or" */}
              <div className="lg-sub-divider">
                <span className="lg-sub-divider-line" />
                <span className="lg-sub-divider-text">or</span>
                <span className="lg-sub-divider-line" />
              </div>

              {/* Continue with Google Button (Inline SVG G Logo + Supabase OAuth) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || status === 'loading'}
                className={`lg-google-btn ${isGoogleLoading ? 'lg-google-btn-loading' : ''}`}
                aria-label="Continue with Google"
              >
                {isGoogleLoading ? (
                  <span className="lg-btn-spinner lg-spinner-dark" aria-hidden="true" />
                ) : (
                  <svg className="lg-google-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* Inline Friendly Notice for Google Sign-In */}
              {googleNotice && (
                <div className="lg-google-notice" role="status">
                  <Info size={15} className="lg-notice-icon" />
                  <span>{googleNotice}</span>
                </div>
              )}

              {/* Divider: OR DEMO REVIEW */}
              <div className="lg-divider">
                <span className="lg-divider-text">OR DEMO REVIEW</span>
              </div>

              {/* Demo Access Button */}
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={status === 'loading' || isGoogleLoading}
                className="lg-demo-btn"
              >
                <Sparkles size={15} className="lg-demo-icon" />
                <span>Demo access (Instant Sign In)</span>
              </button>

              {/* Informational Disclaimer */}
              <div className="lg-disclaimer-text">
                Estimates are informational and not a quotation. Always confirm tariffs directly with empanelled hospital desks.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scoped CSS Styles (prefixed lg-) */}
      <style>{`
        /* 1. Layout Root Container */
        .lg-root-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          background-color: transparent;
        }

        /* 2. Top Header */
        .lg-top-header {
          position: relative;
          z-index: 20;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(226, 232, 240, 0.65);
          background: rgba(250, 250, 247, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .lg-back-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64717D;
          font-size: 0.86rem;
          font-weight: 500;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .lg-back-btn:hover {
          color: #102A36;
          background: rgba(255, 255, 255, 0.85);
        }

        .lg-brand-wordmark {
          cursor: pointer;
          display: flex;
          align-items: baseline;
          gap: 6px;
          user-select: none;
        }
        .lg-wordmark-title {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #102A36;
          letter-spacing: -0.02em;
        }
        .lg-wordmark-accent {
          font-size: 0.82rem;
          font-weight: 700;
          color: #438F84;
        }

        /* 3. Main Grid Layout */
        .lg-main-grid {
          position: relative;
          z-index: 10;
          flex: 1;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          align-items: center;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 28px 48px 28px;
          gap: 48px;
        }

        /* 4. Left Panel: ECG Visual & Blurb */
        .lg-left-panel {
          grid-column: span 7;
        }
        .lg-left-inner {
          max-width: 540px;
          margin: 0 auto;
        }

        /* ECG Visual Container */
        .lg-ecg-visual-container {
          position: relative;
          width: 100%;
          height: 180px;
          margin-bottom: 24px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(240, 248, 246, 0.45) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          overflow: hidden;
          box-shadow: 0 4px 20px -2px rgba(16, 42, 54, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lg-ecg-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* ECG Waveform Draw & Continuous Slide Animations */
        @keyframes ecgDrawSlideMain {
          0% {
            stroke-dashoffset: 1200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes ecgDrawSlideCoral {
          0% {
            stroke-dashoffset: 1200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes ecgDrawSlideAmbient {
          0% {
            stroke-dashoffset: 1200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .lg-ecg-main {
          stroke-dasharray: 450 750;
          animation: ecgDrawSlideMain 4.2s linear infinite;
          opacity: 0.88;
        }
        .lg-ecg-coral {
          stroke-dasharray: 380 820;
          animation: ecgDrawSlideCoral 5.6s linear infinite;
          opacity: 0.55;
        }
        .lg-ecg-ambient {
          stroke-dasharray: 400 800;
          animation: ecgDrawSlideAmbient 6.8s linear infinite;
          opacity: 0.35;
        }

        /* Pulsing Leading Tip Following Main ECG */
        @keyframes ecgFollowLead {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          6% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }
        .lg-ecg-pulse-follower {
          offset-path: path('M -50,90 L 40,90 Q 55,78 65,90 L 78,90 L 86,98 L 100,22 L 112,118 L 120,90 L 140,90 Q 155,76 170,90 L 230,90 Q 245,78 255,90 L 268,90 L 276,98 L 290,22 L 302,118 L 310,90 L 330,90 Q 345,76 360,90 L 420,90 Q 435,78 445,90 L 458,90 L 466,98 L 480,22 L 492,118 L 500,90 L 520,90 Q 535,76 550,90 L 650,90');
          animation: ecgFollowLead 4.2s linear infinite;
        }

        @keyframes pulseHeadPing {
          0%, 100% {
            r: 3.5px;
            opacity: 1;
          }
          50% {
            r: 9px;
            opacity: 0.35;
          }
        }
        .lg-pulse-head-dot {
          filter: drop-shadow(0 0 6px #2F8F83);
        }
        .lg-pulse-head-ring {
          animation: pulseHeadPing 1.2s ease-in-out infinite;
        }

        /* Headline & Blurb */
        .lg-blurb-container {
          padding-left: 4px;
        }
        .lg-blurb-heading {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #102A36;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
          line-height: 1.3;
        }
        .lg-blurb-sentence {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #64717D;
          margin: 0 0 18px 0;
        }

        .lg-blurb-tags {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .lg-tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(226, 232, 240, 0.9);
          padding: 5px 12px;
          border-radius: 14px;
          font-size: 0.80rem;
          font-weight: 600;
          color: #334155;
          box-shadow: 0 1px 3px rgba(16, 42, 54, 0.04);
        }
        .lg-tag-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .lg-dot-aqua { background-color: #2EC4B6; }
        .lg-dot-sky { background-color: #4DA8FF; }
        .lg-dot-coral { background-color: #FF7A59; }

        /* 5. Right Panel: Glassy Auth Card */
        .lg-right-panel {
          grid-column: span 5;
        }

        .lg-auth-card-wrap {
          position: relative;
          border-radius: 17px;
          padding: 1px;
          overflow: hidden;
          max-width: 440px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 4px 6px -1px rgba(16, 42, 54, 0.04), 0 20px 40px -6px rgba(16, 42, 54, 0.08);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        }

        /* Subtle Rotating Conic Gradient Border */
        @keyframes lgConicBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .lg-conic-border-glow {
          position: absolute;
          top: -60%;
          left: -60%;
          width: 220%;
          height: 220%;
          background: conic-gradient(from 0deg, #438F84 0%, #4DA8FF 33%, #FF7A59 66%, #438F84 100%);
          animation: lgConicBorder 24s linear infinite;
          opacity: 0.55;
          z-index: 1;
          pointer-events: none;
        }

        /* Glassy Card Surface: White at ~90% opacity with backdrop blur */
        .lg-card-surface {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.90);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 16px;
          padding: 34px 30px;
        }

        .lg-card-header {
          margin-bottom: 22px;
        }
        .lg-card-title {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #102A36;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .lg-card-sub {
          font-size: 0.84rem;
          color: #64717D;
          margin: 0;
          line-height: 1.45;
        }

        /* Underline Tab Bar */
        .lg-tab-bar {
          display: flex;
          position: relative;
          border-bottom: 1.5px solid #E2E8F0;
          margin-bottom: 22px;
        }
        .lg-tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 10px 4px 12px 4px;
          font-size: 0.92rem;
          font-weight: 500;
          color: #64717D;
          cursor: pointer;
          transition: color 0.2s ease;
          text-align: center;
        }
        .lg-tab-active {
          color: #102A36;
          font-weight: 700;
        }
        .lg-tab-slider {
          position: absolute;
          bottom: -1.5px;
          height: 2.5px;
          background: #438F84;
          border-radius: 2px;
          transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Info & Error Banners */
        @keyframes lgErrorSlide {
          from { transform: translateY(-6px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .lg-info-banner {
          background-color: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 18px;
          font-size: 0.84rem;
          color: #166534;
          animation: lgErrorSlide 0.2s ease-out both;
        }
        .lg-info-icon {
          flex-shrink: 0;
          color: #16A34A;
          margin-top: 2px;
        }
        .lg-info-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .lg-info-heading {
          font-weight: 700;
          color: #14532D;
          font-size: 0.86rem;
        }
        .lg-info-body {
          margin: 0;
          line-height: 1.45;
          color: #166534;
          font-size: 0.82rem;
        }

        .lg-error-banner {
          background-color: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          font-size: 0.84rem;
          color: #D95338;
          animation: lgErrorSlide 0.2s ease-out both;
        }
        .lg-error-icon {
          flex-shrink: 0;
          color: #D95338;
        }

        /* Form & Floating Labels */
        .lg-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .lg-input-group {
          position: relative;
          background: rgba(250, 250, 247, 0.85);
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
          overflow: hidden;
        }
        .lg-input-group.lg-focused {
          border-color: #438F84;
          box-shadow: 0 0 0 2px rgba(67, 143, 132, 0.2);
          background-color: #FFFFFF;
        }

        .lg-input-icon {
          position: absolute;
          left: 12px;
          top: 15px;
          color: #94A3B8;
          transition: color 0.15s ease;
          pointer-events: none;
        }
        .lg-input-group.lg-focused .lg-input-icon {
          color: #438F84;
        }

        .lg-input-field {
          width: 100%;
          border: none;
          background: transparent;
          padding: 22px 14px 6px 38px;
          font-size: 0.94rem;
          color: #102A36;
          outline: none;
        }
        .lg-input-pwd {
          padding-right: 42px;
        }

        .lg-floating-label {
          position: absolute;
          left: 38px;
          top: 14px;
          font-size: 0.88rem;
          color: #64717D;
          pointer-events: none;
          transform-origin: left top;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lg-input-group.lg-focused .lg-floating-label,
        .lg-input-group.lg-has-value .lg-floating-label {
          top: 5px;
          transform: scale(0.78);
          color: #438F84;
          font-weight: 600;
        }
        .lg-input-group.lg-has-value:not(.lg-focused) .lg-floating-label {
          color: #64717D;
        }

        .lg-focus-line {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 0%;
          background: #438F84;
          transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lg-input-group.lg-focused .lg-focus-line {
          width: 100%;
        }

        .lg-pwd-toggle-btn {
          position: absolute;
          right: 10px;
          top: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: #64717D;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }
        .lg-pwd-toggle-btn:hover {
          color: #102A36;
        }

        .lg-select-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .lg-select-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #102A36;
        }
        .lg-select-field {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          font-size: 0.9rem;
          color: #102A36;
          background: rgba(250, 250, 247, 0.85);
          outline: none;
        }
        .lg-select-field:focus {
          border-color: #438F84;
          box-shadow: 0 0 0 2px rgba(67, 143, 132, 0.2);
        }

        /* Primary Action Button */
        .lg-primary-btn {
          position: relative;
          overflow: hidden;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          background: linear-gradient(135deg, #438F84 0%, #2C6B61 100%);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.94rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: none;
          margin-top: 4px;
          min-height: 46px;
          box-shadow: 0 2px 6px rgba(44, 107, 97, 0.2);
          transition: transform 0.12s ease, box-shadow 0.15s ease, background 0.25s ease;
        }
        .lg-primary-btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow: 0 5px 14px rgba(44, 107, 97, 0.3);
        }
        .lg-primary-btn:active:not(:disabled) {
          transform: translateY(0.5px);
        }
        .lg-btn-loading {
          cursor: wait;
        }
        .lg-btn-success {
          background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%) !important;
        }

        @keyframes lgBtnSheen {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        .lg-btn-sheen {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 35%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
          animation: lgBtnSheen 4.5s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes lgSpin {
          to { transform: rotate(360deg); }
        }
        .lg-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: lgSpin 0.7s linear infinite;
        }

        /* Sub-divider between primary button & Google button */
        .lg-sub-divider {
          display: flex;
          align-items: center;
          margin: 14px 0 12px 0;
          gap: 12px;
        }
        .lg-sub-divider-line {
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }
        .lg-sub-divider-text {
          font-size: 0.76rem;
          color: #94A3B8;
          font-weight: 500;
          text-transform: lowercase;
        }

        /* Continue with Google Button */
        .lg-google-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 8px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          font-size: 0.90rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(16, 42, 54, 0.04);
          min-height: 44px;
        }
        .lg-google-btn:hover:not(:disabled) {
          background: #F8FAFC;
          border-color: #94A3B8;
          box-shadow: 0 3px 8px rgba(16, 42, 54, 0.08);
          transform: translateY(-1px);
        }
        .lg-google-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .lg-google-btn-loading {
          background: #F8FAFC;
        }
        .lg-google-icon {
          flex-shrink: 0;
        }
        .lg-spinner-dark {
          border-color: rgba(30, 41, 59, 0.2);
          border-top-color: #1E293B;
        }

        /* Inline Friendly Notice for Google Sign-In */
        .lg-google-notice {
          margin-top: 10px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1E40AF;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.78rem;
          line-height: 1.45;
          text-align: left;
        }
        .lg-notice-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Divider & Demo Button */
        .lg-divider {
          display: flex;
          align-items: center;
          margin: 18px 0;
          color: #94A3B8;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
          text-align: center;
        }
        .lg-divider::before,
        .lg-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }
        .lg-divider-text {
          padding: 0 10px;
          font-weight: 600;
        }

        .lg-demo-btn {
          width: 100%;
          background: transparent;
          border: 1.5px solid #438F84;
          border-radius: 8px;
          padding: 10px 14px;
          color: #326D64;
          font-weight: 600;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          min-height: 44px;
          transition: all 0.15s ease;
        }
        .lg-demo-btn:hover {
          background-color: #E7F3EF;
        }

        .lg-disclaimer-text {
          text-align: center;
          font-size: 0.74rem;
          color: #94A3B8;
          margin-top: 16px;
          line-height: 1.4;
        }

        /* Shake and Success Card Animations */
        @keyframes lgCardShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .lg-card-shake {
          animation: lgCardShake 0.4s ease-out both;
        }
        .lg-card-success-lift {
          transform: translateY(-8px);
          opacity: 0.95;
        }

        /* Responsive Rules (<1024px) */
        @media (max-width: 1023px) {
          .lg-main-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 20px 16px 36px 16px;
          }
          .lg-left-panel {
            grid-column: span 1;
          }
          .lg-right-panel {
            grid-column: span 1;
          }
          .lg-ecg-visual-container {
            height: 130px;
            margin-bottom: 16px;
          }
          .lg-blurb-heading {
            font-size: 1.3rem;
            margin-bottom: 4px;
          }
          .lg-blurb-sentence {
            font-size: 0.86rem;
            margin-bottom: 10px;
          }
        }

        /* Reduced Motion Overrides */
        @media (prefers-reduced-motion: reduce) {
          .lg-conic-border-glow,
          .lg-btn-sheen,
          .lg-card-shake,
          .lg-error-banner,
          .lg-ecg-line,
          .lg-ecg-pulse-follower,
          .lg-pulse-head-ring {
            animation: none !important;
          }
          .lg-ecg-line {
            stroke-dashoffset: 0 !important;
          }
          .lg-ecg-pulse-follower {
            display: none !important;
          }
          .lg-auth-card-wrap,
          .lg-primary-btn,
          .lg-floating-label,
          .lg-tab-slider,
          .lg-google-btn {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};
