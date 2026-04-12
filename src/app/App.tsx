import { RouterProvider } from 'react-router';
import { router } from './routes';
import { GlobalAuthGate } from './components/GlobalAuthGate';
import { CookieConsentBanner } from './components/CookieConsentBanner';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalAuthGate />
      <CookieConsentBanner />
    </>
  );
}
