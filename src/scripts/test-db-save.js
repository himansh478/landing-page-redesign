const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
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
  console.error('Error: Env variables not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSubmitData() {
  const randomSuffix = Math.floor(Math.random() * 10000);
  const testPartner = {
    name: `Test Partner ${randomSuffix}`,
    whatsapp: '9999999999',
    insta_id: `@test_partner_${randomSuffix}`,
    gmail: `test_partner_${randomSuffix}@gmail.com`,
    state: 'Madhya Pradesh',
    district: 'Sehore',
    exact_location: 'Main Bazar Sehore',
    skills: 'Testing Form Save',
    equipments: 'Antigravity AI Test Bot Tool',
    experience: '1 Year',
    portfolio_link: 'https://instagram.com/cwaya.me'
  };

  console.log('📡 1. Inserting simulated partner form submission...');
  
  const { data, error } = await supabase
    .from('partners')
    .insert([testPartner])
    .select();

  if (error) {
    console.error('❌ Database insertion failed:', error.message);
  } else {
    console.log('✅ Success! Test partner saved successfully in Supabase.');
    console.table(data.map(row => ({
      ID: row.id,
      Name: row.name,
      WhatsApp: row.whatsapp,
      Gmail: row.gmail,
      Status: 'SAVED IN DB'
    })));

    // Clean up test entry
    console.log('🧹 Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('partners')
      .delete()
      .eq('id', data[0].id);

    if (deleteError) {
      console.error('⚠️ Could not clean up test row:', deleteError.message);
    } else {
      console.log('✅ Clean up successful!');
    }
  }
}

testSubmitData();
