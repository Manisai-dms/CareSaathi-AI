import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Lock, Mail, User, Sparkles, ArrowRight, AlertCircle, ShieldCheck, X } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  onContinueAsGuest: () => void;
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onContinueAsGuest, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLang, setSelectedLang] = useState(language);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both email and password');
        }
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name, email, password, selectedLang);
        setLanguage(selectedLang as any);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await demoLogin();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF7', // Warm Off-White
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px -5px rgba(24, 50, 71, 0.1)',
        maxWidth: '460px',
        width: '100%',
        padding: '36px 32px',
        position: 'relative'
      }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#E7F3EF', // Mint
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#438F84',
            marginBottom: '12px'
          }}>
            <Heart size={28} fill="#438F84" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#183247', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            CareSaathi <span style={{ color: '#438F84' }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64717D', margin: 0 }}>
            Know the Cost. Find the Care. Discover Support.
          </p>
        </div>

        {/* Quick Demo Access Callout for Hackathon Judges */}
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E' }}>
                Hackathon Judging Mode
              </div>
              <div style={{ fontSize: '0.74rem', color: '#B45309' }}>
                One-click access with demo reviewer credentials
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              style={{
                backgroundColor: '#D97706',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <Sparkles size={13} />
              <span>Judge Demo Login</span>
            </button>
          </div>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '22px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? '#183247' : '#64717D',
              fontWeight: mode === 'login' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
              color: mode === 'register' ? '#183247' : '#64717D',
              fontWeight: mode === 'register' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
            fontSize: '0.82rem',
            color: '#B91C1C'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#183247', marginBottom: '4px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Reddy"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
                <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#183247', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
              <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#183247', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
              <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#183247', marginBottom: '4px' }}>
                Preferred Language
              </label>
              <select
                value={selectedLang}
                onChange={e => setSelectedLang(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#438F84', // Teal
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>{isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In to CareSaathi' : 'Create Free Account')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '22px 0',
          color: '#94A3B8',
          fontSize: '0.78rem'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          <span style={{ padding: '0 10px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
        </div>

        {/* Continue as Guest Button */}
        <button
          type="button"
          onClick={onContinueAsGuest}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#183247',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
        >
          Continue as Guest (No Account Required)
        </button>

        {/* Privacy Note */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#438F84" />
          <span>Zero patient clinical data or health identifiers are retained.</span>
        </div>
      </div>
    </div>
  );
};
