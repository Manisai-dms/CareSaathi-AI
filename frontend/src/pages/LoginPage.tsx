// ==============================================================================
// CareSaathi AI - Dedicated Light Multi-Tone Login Page (/login)
// Scoped prefix: lg-
//
// Complies with:
// - B0: Removes old CarePath3D ribbon completely. Reuses LivingHeart3D (login variant).
// - B1: Light mesh gradient background (ivory, pale blue, mint, faint rose).
//   Left ~55% calm living heart + B3 blurb; Right ~45% centered auth card.
//   Mobile/tablet: scene 28vh above card, blurb collapses, canvas never overlaps form.
// - B2: Rotating conic card edge (20s+ loop, stops under reduced-motion).
//   Serif title, underline tabs with sliding spring indicator, floating labels,
//   teal focus ring and underline, eye password toggle, teal gradient button with sheen,
//   real loading/success/error animations, quiet Demo Access, informational disclaimer.
// - B3: Short app blurb ("Healthcare costs, made clearer." + 3 colored tags: Costs, Hospitals, Schemes).
// - B4: 1.4s entrance sequence; camera glides to closer framing.
// - B5: Interaction-linked 3D state (focus tilts heart, typing speeds ECG, loading glow, success beat, error pulse).
// - B6: Full accessibility, aria-live, aria-describedby, reduced-motion overrides, no layout shift.
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LivingHeart3D } from '../components/LivingHeart3D';
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

type Visual3DState = 'idle' | 'focus' | 'typing' | 'loading' | 'success' | 'error';

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

  // Focus & interaction tracking for 3D state linking (B5)
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Auth statuses: 'idle' | 'loading' | 'error' | 'success'
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Field input refs for error auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const prefersReduced = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Determine current visual state for the Living Heart (B5)
  let visualState: Visual3DState = 'idle';
  if (status === 'loading') visualState = 'loading';
  else if (status === 'success') visualState = 'success';
  else if (status === 'error') visualState = 'error';
  else if (isTyping) visualState = 'typing';
  else if (focusedField) visualState = 'focus';

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setIsTyping(true);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
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
        await register(name, email, password, selectedLang);
        setLanguage(selectedLang as any);
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 420);
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
      }, 420);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Demo access authentication failed.');
    }
  };

  return (
    <div className="lg-root-container">
      {/* 1. Top Navigation Bar (B1) */}
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

        {/* Brand wordmark without icon tile */}
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

      {/* 2. Main 2-Panel Layout (B1: Left 55% Scene & Blurb, Right 45% Auth Card) */}
      <main className="lg-main-grid">
        {/* Left Panel (~55%): Calmer Living Heart Scene + Short App Blurb */}
        <div className="lg-left-panel">
          <div className="lg-left-inner">
            {/* 3D Living Heart Scene (login variant, closer framing, 60 BPM beat) */}
            <div className="lg-scene-wrapper">
              <LivingHeart3D
                variant="login"
                loginState={visualState}
                interactive={true}
                compact={false}
              />
            </div>

            {/* B3 Short App Blurb */}
            <div className="lg-blurb-container">
              <h2 className="lg-blurb-heading">
                Healthcare costs, made clearer.
              </h2>
              <p className="lg-blurb-sentence">
                CareSaathi AI helps you explore indicative costs, find empanelled hospitals, and check schemes you may be eligible for.
              </p>

              {/* 3 tiny inline tags matching 3D tablet colors */}
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

        {/* Right Panel (~45%): Auth Card (B2) */}
        <div className="lg-right-panel">
          <div className={`lg-auth-card-wrap ${status === 'error' && !prefersReduced ? 'lg-card-shake' : ''} ${status === 'success' ? 'lg-card-success-lift' : ''}`}>
            {/* Subtle Rotating Conic Gradient 1px Border (B2) */}
            <div className="lg-conic-border-glow" aria-hidden="true" />

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

              {/* Underline Tabs with Sliding Spring Indicator (B2) */}
              <div className="lg-tab-bar" role="tablist" aria-label="Authentication Type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
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

              {/* Real Error Message (B2) */}
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

              {/* Auth Form with Floating Labels & Real Validation */}
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
                      onChange={e => handleInputChange(setName, e.target.value)}
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
                    onChange={e => handleInputChange(setEmail, e.target.value)}
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
                    onChange={e => handleInputChange(setPassword, e.target.value)}
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

                {/* Primary Action Button (Teal Gradient + Hover Sheen + Real Loading/Success) */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
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

              {/* Divider */}
              <div className="lg-divider">
                <span className="lg-divider-text">OR DEMO REVIEW</span>
              </div>

              {/* Quiet Outline Demo Access Button (B2) */}
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={status === 'loading'}
                className="lg-demo-btn"
              >
                <Sparkles size={15} className="lg-demo-icon" />
                <span>Demo access (Instant Sign In)</span>
              </button>

              {/* Informational Disclaimer (B2) */}
              <div className="lg-disclaimer-text">
                Estimates are informational and not a quotation. Always confirm tariffs directly with empanelled hospital desks.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scoped CSS Styles (prefixed lg-) */}
      <style>{`
        /* 1. Layout & Soft Mesh Gradient Background */
        .lg-root-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          background: 
            radial-gradient(circle at 18% 24%, rgba(235, 243, 250, 0.8) 0%, transparent 48%),
            radial-gradient(circle at 82% 32%, rgba(237, 247, 244, 0.75) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(253, 242, 244, 0.6) 0%, transparent 55%),
            #FAFAF7;
        }

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
          gap: 40px;
        }

        /* 2. Left Panel (~55%): Scene & Blurb */
        .lg-left-panel {
          grid-column: span 7;
        }
        .lg-left-inner {
          max-width: 520px;
          margin: 0 auto;
        }
        .lg-scene-wrapper {
          height: 380px;
          width: 100%;
          position: relative;
          margin-bottom: 20px;
        }

        .lg-blurb-container {
          padding-left: 8px;
        }
        .lg-blurb-heading {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #102A36;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
        }
        .lg-blurb-sentence {
          font-size: 0.94rem;
          line-height: 1.55;
          color: #64717D;
          margin: 0 0 16px 0;
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
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #334155;
          box-shadow: 0 1px 3px rgba(16, 42, 54, 0.03);
        }
        .lg-tag-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .lg-dot-aqua { background-color: #2EC4B6; }
        .lg-dot-sky { background-color: #4DA8FF; }
        .lg-dot-coral { background-color: #FF7A59; }

        /* 3. Right Panel (~45%): Auth Card */
        .lg-right-panel {
          grid-column: span 5;
        }

        .lg-auth-card-wrap {
          position: relative;
          border-radius: 17px;
          padding: 1px; /* Holds the exact 1px rotating conic border */
          overflow: hidden;
          max-width: 440px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 4px 6px -1px rgba(16, 42, 54, 0.04), 0 16px 36px -4px rgba(16, 42, 54, 0.08);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        }

        /* Subtle Rotating Conic Gradient 1px Edge (B2) */
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

        .lg-card-surface {
          position: relative;
          z-index: 2;
          background: #FFFFFF;
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

        /* Underline Tab Bar (B2) */
        .lg-tab-bar {
          display: flex;
          position: relative;
          border-bottom: 1.5px solid #E2E8F0;
          margin-bottom: 24px;
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

        /* Error Banner */
        @keyframes lgErrorSlide {
          from { transform: translateY(-6px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .lg-error-banner {
          background-color: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 0.84rem;
          color: #D95338;
          animation: lgErrorSlide 0.2s ease-out both;
        }
        .lg-error-icon {
          flex-shrink: 0;
          color: #D95338;
        }

        /* Form & Floating Labels (B2) */
        .lg-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lg-input-group {
          position: relative;
          background: #FAFAF7;
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

        /* Move label up on focus or when input has value */
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
          background: #FAFAF7;
          outline: none;
        }
        .lg-select-field:focus {
          border-color: #438F84;
          box-shadow: 0 0 0 2px rgba(67, 143, 132, 0.2);
        }

        /* Primary Action Button (B2) */
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
          margin-top: 6px;
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

        /* Moving Sheen on Primary Button */
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

        /* Spinner */
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

        /* Divider & Demo Button */
        .lg-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
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

        /* Mobile & Responsive Rules (<1024px) */
        @media (max-width: 1023px) {
          .lg-main-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px 16px 36px 16px;
          }
          .lg-left-panel {
            grid-column: span 1;
          }
          .lg-right-panel {
            grid-column: span 1;
          }
          .lg-scene-wrapper {
            height: 28vh;
            min-height: 200px;
            margin-bottom: 8px;
          }
          .lg-blurb-heading {
            font-size: 1.25rem;
            margin-bottom: 4px;
          }
          .lg-blurb-sentence {
            font-size: 0.85rem;
            margin-bottom: 8px;
          }
        }

        /* Reduced Motion Overrides (B6) */
        @media (prefers-reduced-motion: reduce) {
          .lg-conic-border-glow,
          .lg-btn-sheen,
          .lg-card-shake,
          .lg-error-banner {
            animation: none !important;
          }
          .lg-auth-card-wrap,
          .lg-primary-btn,
          .lg-floating-label,
          .lg-tab-slider {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};
