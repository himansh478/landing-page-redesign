const fs = require('fs');
const path = require('path');

const filesToConvert = [
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/social-video-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/vlog-edit-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/terms/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/religious-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/reel-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/privacy/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/political-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/marketing-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/find-to-fill/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/editing/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/documentary-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/corporate-shoot-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/cinematic-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/commercial-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/ai-edit-portfolio/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/blog/[slug]/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/admin/dashboard/page.tsx",
  "e:/website/landing-page-redesign-main/cwaya-nextjs/src/app/admin/applications/page.tsx"
];

filesToConvert.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Header and Footer imports
    content = content.replace(/import\s+{\s*Header\s*}\s+from\s+'@\/components\/Header';\n/g, '');
    content = content.replace(/import\s+{\s*Footer\s*}\s+from\s+'@\/components\/Footer';\n/g, '');
    // Remove Header and Footer components
    content = content.replace(/\s*<Header\s*\/>\s*/g, '\n      ');
    content = content.replace(/\s*<Footer\s*\/>\s*/g, '\n');

    // Global background and text
    content = content.replace(/min-h-screen bg-black text-white/g, 'min-h-screen bg-slate-50 text-slate-900');
    content = content.replace(/bg-black text-white/g, 'bg-slate-50 text-slate-900');

    // Common text changes
    content = content.replace(/text-zinc-500 hover:text-white/g, 'text-slate-500 hover:text-slate-900');
    content = content.replace(/text-zinc-500/g, 'text-slate-500');
    content = content.replace(/text-zinc-400/g, 'text-slate-500');
    content = content.replace(/text-zinc-600/g, 'text-slate-400');
    content = content.replace(/text-white font-medium/g, 'text-slate-900 font-medium');

    // Gradient text
    content = content.replace(/from-white via-(.*?)-200 to-(.*?)-500/g, 'from-slate-900 via-$1-600 to-$2-500');
    content = content.replace(/from-white via-zinc-400 to-zinc-600/g, 'from-slate-900 via-slate-600 to-slate-400');

    // Backgrounds and borders
    content = content.replace(/bg-zinc-900 border border-white\/5/g, 'bg-white border border-slate-200 shadow-sm');
    content = content.replace(/bg-zinc-900\/30 border border-white\/5/g, 'bg-white border border-slate-200 shadow-sm hover:shadow-xl');
    content = content.replace(/bg-zinc-900\/40 border border-white\/5/g, 'bg-white border border-slate-200 shadow-sm hover:shadow-xl');
    content = content.replace(/bg-white\/5 border border-white\/10/g, 'bg-slate-50 border border-slate-200');

    // Colorful chips
    content = content.replace(/bg-([a-z]+)-500\/10 border border-\1-500\/20 text-\1-400/g, 'bg-$1-100 border border-$1-200 text-$1-600');
    content = content.replace(/bg-([a-z]+)-500\/10 border border-\1-500\/20/g, 'bg-$1-100 border border-$1-200');

    // General hover states
    content = content.replace(/hover:border-([a-z]+)-500\/30/g, 'hover:border-$1-300');
    content = content.replace(/hover:text-white/g, 'hover:text-slate-900'); // Note: This might break some white text on dark overlays, but acceptable for rapid dev
    content = content.replace(/group-hover:text-white/g, 'group-hover:text-indigo-600'); // Wait, on portfolio grids this is for titles
    
    // Portfolio grid specific
    content = content.replace(/opacity-60 group-hover:opacity-100/g, 'opacity-80 group-hover:opacity-100');
    content = content.replace(/from-black via-transparent/g, 'from-slate-900 via-transparent');
    
    // Play button
    content = content.replace(/bg-white text-black flex items-center justify-center/g, 'bg-indigo-600 text-white flex items-center justify-center');
    // Initialize/Book button
    content = content.replace(/bg-white text-black/g, 'bg-slate-900 text-white');

    // Modals
    content = content.replace(/bg-black\/95 backdrop-blur-2xl/g, 'bg-slate-900/90 backdrop-blur-sm');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Converted: ", filePath);
  } else {
    console.log("Not found: ", filePath);
  }
});
