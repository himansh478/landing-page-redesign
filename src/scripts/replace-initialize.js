const fs = require('fs');
const path = require('path');

const directory = 'e:/website/landing-page-redesign-main/src/app';

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('Initialize')) {
        console.log(`Updating ${filePath}`);
        // Only replace "Initialize" when it's likely a button text (not inside code)
        // A simple way is to replace it when it's surrounded by whitespace or at the start of a line in JSX
        content = content.replace(/>\s*Initialize\s*</g, '>Book Now<');
        content = content.replace(/\s+Initialize\s+/g, (match) => match.replace('Initialize', 'Book Now'));
        fs.writeFileSync(filePath, content);
      }
    }
  });
}

walk(directory);
console.log('Finished updating portfolio pages.');
