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
  console.error('Error: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockPartners = [
  {
    name: 'Rahul S.',
    whatsapp: '918120317074',
    insta_id: '@creative_shiva_01',
    gmail: 'rahul.s@gmail.com',
    state: 'MP',
    district: 'Indore',
    exact_location: 'Vijay Nagar',
    skills: 'Cinematic Shoot, Video Editing',
    equipments: 'Sony A7SIII, DJI RS3 Gimbal, 24-70mm GM II',
    experience: '5 Years'
  },
  {
    name: 'Sandeep Kumar',
    whatsapp: '917000123456',
    insta_id: '@sandeep_edits',
    gmail: 'sandeep.vfx@gmail.com',
    state: 'MP',
    district: 'Bhopal',
    exact_location: 'MP Nagar',
    skills: 'Video Editing, Color Grading',
    equipments: 'MacBook Pro M3 Max, DaVinci Resolve Speed Editor',
    experience: '3 Years'
  },
  {
    name: 'Amit Drone',
    whatsapp: '919827011111',
    insta_id: '@amit_aerials',
    gmail: 'amit.drone@gmail.com',
    state: 'MP',
    district: 'Sehore',
    exact_location: 'Bus Stand Area',
    skills: 'Drone Pilot, Aerial Photography',
    equipments: 'DJI Mavic 3 Pro, DJI Mini 4 Pro',
    experience: '2 Years'
  },
  {
    name: 'Priya Sharma',
    whatsapp: '918888777766',
    insta_id: '@priya_vlogs',
    gmail: 'priya.creator@gmail.com',
    state: 'MP',
    district: 'Indore',
    exact_location: 'Bhawarkua',
    skills: 'Vlog Editing, Social Media Management',
    equipments: 'iPad Pro, iPhone 15 Pro Max',
    experience: '4 Years'
  },
  {
    name: 'Vikram Singh',
    whatsapp: '919900990099',
    insta_id: '@vikram_films',
    gmail: 'vikram.corp@gmail.com',
    state: 'MP',
    district: 'Jabalpur',
    exact_location: 'Civic Center',
    skills: 'Corporate Shoot, Documentary',
    equipments: 'Blackmagic Pocket 6K Pro, Sennheiser Audio Kit',
    experience: '6 Years'
  }
];

async function seed() {
  console.log('🚀 Starting to seed partners into database...');
  
  // Note: We assume the 'partners' table already exists or Supabase will error.
  // In a real scenario, we'd use a migration or the SQL editor.
  
  const { data, error } = await supabase
    .from('partners')
    .insert(mockPartners);

  if (error) {
    if (error.code === '42P01') {
      console.error('\n❌ ERROR: Table "partners" does not exist!');
      console.log('\n💡 Please run this SQL in your Supabase SQL Editor first:');
      console.log(`
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  insta_id TEXT,
  gmail TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  exact_location TEXT NOT NULL,
  skills TEXT,
  equipments TEXT,
  experience TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
      `);
    } else {
      console.error('❌ Error inserting data:', error);
    }
  } else {
    console.log('✅ Successfully added 5 mock partners to the database!');
  }
}

seed();
