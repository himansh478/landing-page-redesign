const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addColumn() {
  console.log('Attempting to add "portfolio_link" column to "partners" table...');
  
  // Note: Anon key usually cannot run RPC for schema changes unless specially configured.
  // We'll try to insert a dummy record with the new column to see if it exists, 
  // but that won't create it. 
  // The best way is to advise the user to run SQL in Supabase dashboard.
  
  console.log('SQL to run in Supabase SQL Editor:');
  console.log('ALTER TABLE partners ADD COLUMN IF NOT EXISTS portfolio_link TEXT;');
}

addColumn();
