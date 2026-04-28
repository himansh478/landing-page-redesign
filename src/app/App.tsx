import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { GlobalAuthGate } from './components/GlobalAuthGate';
import { CookieConsentBanner } from './components/CookieConsentBanner';

export default function App() {
  // Check for the hashed auth token
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('_cwaya_auth_v1')
  );

  // If not authenticated, ONLY render the Auth Gate. 
  // This prevents the rest of the site from being in the DOM.
  if (!isAuthenticated) {
    return <GlobalAuthGate onAuth={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <CookieConsentBanner />
    </>
  );
}
