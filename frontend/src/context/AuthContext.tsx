import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfileDTO, SavedComparisonDTO } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfileDTO | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, language?: string, phone?: string) => Promise<{ needsEmailConfirmation: boolean }>;
  demoLogin: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  savedComparisons: SavedComparisonDTO[];
  refreshSavedComparisons: () => Promise<void>;
  saveCurrentComparison: (facilityIds: string[], treatmentName: string) => Promise<void>;
  removeSavedComparison: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileDTO | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('caresaathi_token'));
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem('caresaathi_is_guest') === 'true');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparisonDTO[]>([]);

// Helper: Safety-net upsert into public.profiles if trigger or backfill did not populate
async function upsertProfileSafetyNet(profile: { id: string; email?: string; name?: string; phone?: string; language?: string }) {
  if (!supabase || !profile?.id) return;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(profile.id)) return;

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      email: profile.email || '',
      name: profile.name || 'CareSaathi User',
      phone: profile.phone || null,
      language: profile.language || 'en',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Profile Upsert]:', error.message);
    }
  } catch (e) {
    console.warn('[Supabase Profile Upsert Exception]:', e);
  }
}

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // 1. Check if active Supabase session exists (e.g. from Google OAuth redirect)
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const supabaseProfile: UserProfileDTO = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              phone: session.user.phone || session.user.user_metadata?.phone || undefined,
              language: session.user.user_metadata?.language || session.user.user_metadata?.preferred_language || 'en'
            };
            setUser(supabaseProfile);
            setToken(session.access_token);
            setIsGuest(false);
            localStorage.setItem('caresaathi_token', session.access_token);
            localStorage.removeItem('caresaathi_is_guest');
            setIsLoading(false);

            // Safety-net upsert
            await upsertProfileSafetyNet(supabaseProfile);
            return;
          }
        } catch (e) {
          console.warn('Error reading Supabase session:', e);
        }
      }

      // 2. Fallback to stored token (FastAPI / Demo)
      const storedToken = localStorage.getItem('caresaathi_token');
      if (storedToken && isMounted) {
        try {
          const profile = await api.getMe(storedToken);
          if (isMounted) {
            setUser(profile);
            setToken(storedToken);
            setIsGuest(false);
            const comparisons = await api.getSavedComparisons(storedToken);
            setSavedComparisons(comparisons);
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem('caresaathi_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 3. Listen to Supabase auth state changes (OAuth redirect completion)
    const { data: authListener } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isMounted) {
        const supabaseProfile: UserProfileDTO = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: session.user.phone || session.user.user_metadata?.phone || undefined,
          language: session.user.user_metadata?.language || session.user.user_metadata?.preferred_language || 'en'
        };
        setUser(supabaseProfile);
        setToken(session.access_token);
        setIsGuest(false);
        localStorage.setItem('caresaathi_token', session.access_token);
        localStorage.removeItem('caresaathi_is_guest');

        // Safety-net upsert
        await upsertProfileSafetyNet(supabaseProfile);
      }
    }) || { data: null };

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (supabase && isSupabaseConfigured) {
      // 1. Primary Authentication: Real Supabase Auth signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Temporary debug log required for verification
      console.log('[Supabase Auth Debug] signInWithPassword:', {
        userId: data?.user?.id,
        session: !!data?.session,
        error: error?.message
      });

      if (error) {
        console.error('[Supabase Auth Error] signInWithPassword failed:', error);
        if (error.message.includes('Email not confirmed') || (error as any).code === 'email_not_confirmed') {
          throw new Error('Email not confirmed. Please check your inbox for the confirmation email, or disable "Confirm email" in Supabase Dashboard > Authentication > Providers > Email.');
        }
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }

      if (!data.user) {
        throw new Error('Login failed: No user returned from Supabase.');
      }

      const userProfile: UserProfileDTO = {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'CareSaathi User',
        email: data.user.email || email,
        phone: data.user.phone || data.user.user_metadata?.phone,
        language: data.user.user_metadata?.language || 'en'
      };

      setUser(userProfile);
      setToken(data.session?.access_token || null);
      setIsGuest(false);
      if (data.session?.access_token) {
        localStorage.setItem('caresaathi_token', data.session.access_token);
      }
      localStorage.removeItem('caresaathi_is_guest');

      // Safety-net upsert into public.profiles
      await upsertProfileSafetyNet(userProfile);

      // Background sync with FastAPI local endpoints if available
      api.login(email, password).then(res => {
        api.getSavedComparisons(res.access_token).then(setSavedComparisons).catch(() => {});
      }).catch(() => {});

      return;
    }

    // Fallback when Supabase is not configured
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    setIsGuest(false);
    localStorage.setItem('caresaathi_token', res.access_token);
    localStorage.removeItem('caresaathi_is_guest');
    const comparisons = await api.getSavedComparisons(res.access_token);
    setSavedComparisons(comparisons);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    language = 'en',
    phone?: string
  ): Promise<{ needsEmailConfirmation: boolean }> => {
    if (supabase && isSupabaseConfigured) {
      // 1. Primary Registration: Real Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
            phone: phone || '',
            language: language
          }
        }
      });

      // Temporary debug log required for verification
      console.log('[Supabase Auth Debug] signUp:', {
        userId: data?.user?.id,
        session: !!data?.session,
        confirmationSentAt: (data?.user as any)?.confirmation_sent_at,
        error: error?.message
      });

      if (error) {
        console.error('[Supabase Auth Error] signUp failed:', error);
        throw new Error(error.message || 'Registration failed.');
      }

      if (!data.user) {
        throw new Error('Registration failed: No user was created.');
      }

      // Check if email confirmation is required (data.session is null when email confirmation is active)
      const needsEmailConfirmation = !data.session;

      const userProfile: UserProfileDTO = {
        id: data.user.id,
        name,
        email: data.user.email || email,
        phone: phone || '',
        language
      };

      if (data.session) {
        setUser(userProfile);
        setToken(data.session.access_token);
        setIsGuest(false);
        localStorage.setItem('caresaathi_token', data.session.access_token);
        localStorage.removeItem('caresaathi_is_guest');

        // Safety-net upsert
        await upsertProfileSafetyNet(userProfile);
      }

      // Background registration with FastAPI local db if running
      api.register(name, email, password, language).catch(() => {});

      return { needsEmailConfirmation };
    }

    // Fallback when Supabase is not configured
    const res = await api.register(name, email, password, language);
    setToken(res.access_token);
    setUser({ ...res.user, phone });
    setIsGuest(false);
    localStorage.setItem('caresaathi_token', res.access_token);
    localStorage.removeItem('caresaathi_is_guest');
    return { needsEmailConfirmation: false };
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    setToken(res.access_token);
    setUser(res.user);
    setIsGuest(false);
    localStorage.setItem('caresaathi_token', res.access_token);
    localStorage.removeItem('caresaathi_is_guest');
    const comparisons = await api.getSavedComparisons(res.access_token);
    setSavedComparisons(comparisons);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setToken(null);
    localStorage.removeItem('caresaathi_token');
    localStorage.setItem('caresaathi_is_guest', 'true');
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setToken(null);
    setIsGuest(false);
    setSavedComparisons([]);
    localStorage.removeItem('caresaathi_token');
    localStorage.removeItem('caresaathi_is_guest');
  };

  const refreshSavedComparisons = async () => {
    if (!token) return;
    try {
      const comparisons = await api.getSavedComparisons(token);
      setSavedComparisons(comparisons);
    } catch (e) {
      console.warn("Failed to refresh saved comparisons", e);
    }
  };

  const saveCurrentComparison = async (facilityIds: string[], treatmentName: string) => {
    if (!token) throw new Error("Please log in to save comparisons to your account");
    const item = await api.saveComparison(token, facilityIds, treatmentName);
    setSavedComparisons(prev => [item, ...prev]);
  };

  const removeSavedComparison = async (id: string) => {
    if (!token) return;
    await api.deleteSavedComparison(token, id);
    setSavedComparisons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isGuest,
      isLoading,
      login,
      register,
      demoLogin,
      continueAsGuest,
      logout,
      savedComparisons,
      refreshSavedComparisons,
      saveCurrentComparison,
      removeSavedComparison
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
