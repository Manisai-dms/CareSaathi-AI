import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfileDTO, SavedComparisonDTO } from '../services/api';

interface AuthContextType {
  user: UserProfileDTO | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, language?: string) => Promise<void>;
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

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('caresaathi_token');
      if (storedToken) {
        try {
          const profile = await api.getMe(storedToken);
          setUser(profile);
          setToken(storedToken);
          setIsGuest(false);
          const comparisons = await api.getSavedComparisons(storedToken);
          setSavedComparisons(comparisons);
        } catch {
          localStorage.removeItem('caresaathi_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    setIsGuest(false);
    localStorage.setItem('caresaathi_token', res.access_token);
    localStorage.removeItem('caresaathi_is_guest');
    const comparisons = await api.getSavedComparisons(res.access_token);
    setSavedComparisons(comparisons);
  };

  const register = async (name: string, email: string, password: string, language = 'en') => {
    const res = await api.register(name, email, password, language);
    setToken(res.access_token);
    setUser(res.user);
    setIsGuest(false);
    localStorage.setItem('caresaathi_token', res.access_token);
    localStorage.removeItem('caresaathi_is_guest');
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
