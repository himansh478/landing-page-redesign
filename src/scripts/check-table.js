const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid needing dotenv
const envPath = path.join(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  console.log('🔍 Fetching newly registered partners from live Supabase...');
  
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('❌ Error fetching data:', error.message);
  } else {
    console.log('✅ DATABASE QUERY SUCCESSFUL! HERE IS THE LIVE DATA IN SUPABASE:');
    console.table(data.map(row => ({
      Name: row.name,
      WhatsApp: row.whatsapp,
      Gmail: row.gmail,
      State: row.state,
      District: row.district,
      'Portfolio Link': row.portfolio_link,
      'Created At': row.created_at
    })));
  }
}

checkTable();
