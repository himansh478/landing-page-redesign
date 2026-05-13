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
    content = content.replace(/import\s+{\s*Header\s*}\s+from\s+['"]@\/components\/Header['"];?\r?\n?/g, '');
    content = content.replace(/import\s+{\s*Footer\s*}\s+from\s+['"]@\/components\/Footer['"];?\r?\n?/g, '');
    // Remove Header and Footer components
    content = content.replace(/\s*<Header\s*\/>/g, '');
    content = content.replace(/\s*<Footer\s*\/>/g, '');

    // Text color updates missed
    content = content.replace(/text-white\/50 hover:text-white/g, 'text-slate-500 hover:text-slate-900');
    content = content.replace(/text-white\/50 hover:text-slate-900/g, 'text-slate-500 hover:text-slate-900');

    // Remove unneeded text-white on regular headers (already slate-900 from global)
    content = content.replace(/text-white font-medium/g, 'text-slate-900 font-medium');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Converted: ", filePath);
  } else {
    console.log("Not found: ", filePath);
  }
});
