import { RouterProvider } from 'react-router';
import { router } from './routes';
import { GlobalAuthGate } from './components/GlobalAuthGate';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalAuthGate />
    </>
  );
}
