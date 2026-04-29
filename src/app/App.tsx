import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { GlobalAuthGate } from './components/GlobalAuthGate';
import { CookieConsentBanner } from './components/CookieConsentBanner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('_cwaya_auth_v1')
  );
  const [showAuthGate, setShowAuthGate] = useState(false);

  useEffect(() => {
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

  return (
    <>
      <RouterProvider router={router} />
      <CookieConsentBanner />
      {showAuthGate && !isAuthenticated && (
        <GlobalAuthGate 
          onAuth={() => {
            setIsAuthenticated(true);
            setShowAuthGate(false);
          }} 
          onClose={() => setShowAuthGate(false)}
        />
      )}
    </>
  );
}
