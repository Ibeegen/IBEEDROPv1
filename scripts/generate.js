import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];
const SVG_SOURCE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#FFD400"/>
  <path d="M160 200V152C160 103.399 199.399 64 248 64H264C312.601 64 352 103.399 352 152V200" stroke="#000000" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <rect x="96" y="200" width="320" height="248" rx="48" fill="#111827"/>
  <circle cx="256" cy="300" r="24" fill="#FFD400"/>
</svg>`;

async function init() {
  const iconDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(SVG_SOURCE);

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
}
init();
