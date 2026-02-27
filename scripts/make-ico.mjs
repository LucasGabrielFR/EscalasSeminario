/**
 * make-ico.mjs
 * Reads public/icon.png and writes a valid public/icon.ico
 * using the "png-to-ico" package (pure JS, no native deps).
 *
 * Run: node scripts/make-ico.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Dynamically import png-to-ico (CommonJS module)
const { default: pngToIco } = await import('png-to-ico');

const pngPath = path.join(root, 'public', 'icon.png');
const icoPath = path.join(root, 'public', 'icon.ico');

console.log('Reading PNG from:', pngPath);
const icoBuffer = await pngToIco(pngPath);
writeFileSync(icoPath, icoBuffer);
console.log('ICO written to:', icoPath, `(${icoBuffer.length} bytes)`);
