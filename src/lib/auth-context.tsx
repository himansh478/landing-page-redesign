'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { GlobalAuthGate } from '@/components/GlobalAuthGate';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

interface AuthContextType {
  isAuthenticated: boolean;
  openAuthGate: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  openAuthGate: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('_cwaya_auth_v1');
    if (auth) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    // Show modal after 1 minute if not authenticated
    const timer = setTimeout(() => {
      if (!localStorage.getItem('_cwaya_auth_v1')) {
        setShowAuthGate(true);
      }
    }, 60000);

    const handleOpenAuthGate = () => setShowAuthGate(true);
    window.addEventListener('open-auth-gate', handleOpenAuthGate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-auth-gate', handleOpenAuthGate);
    };
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowAuthGate(false);
  };

  const openAuthGate = () => setShowAuthGate(true);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, openAuthGate }}>
      {showAuthGate && !isAuthenticated && (
        <GlobalAuthGate 
          onAuth={handleAuth} 
          onClose={() => setShowAuthGate(false)}
        />
      )}
      {children}
      <CookieConsentBanner />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
