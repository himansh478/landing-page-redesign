import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCAL, startLocalBackend } from './local-backend.mjs';

// Runs the app against the local stand-in, with accounts and payments switched on and
// nothing touching real Supabase or Razorpay. Values here override .env.local.
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

await startLocalBackend();
console.log(`Local backend on http://localhost:${LOCAL.port}`);

const next = spawn(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', 'localhost', '--port', '3100'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: `http://localhost:${LOCAL.port}`,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: LOCAL.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: LOCAL.serviceKey,
    RAZORPAY_KEY_ID: LOCAL.razorpayKey,
    RAZORPAY_KEY_SECRET: LOCAL.razorpaySecret,
    RAZORPAY_CAPTION_WEBHOOK_SECRET: LOCAL.webhookSecret,
    RAZORPAY_API_URL: `http://localhost:${LOCAL.port}/razorpay`,
  },
});

next.on('exit', (code) => process.exit(code ?? 0));
