import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'public', 'icon.svg');
const outputPath = join(__dirname, 'app-icon.png');

console.log('Converting SVG to PNG...');
console.log('Input:', svgPath);
console.log('Output:', outputPath);

try {
  // Read SVG file
  const svg = readFileSync(svgPath, 'utf-8');
  
  // Create Resvg instance with options for 1024x1024 output
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1024,
    },
    font: {
      loadSystemFonts: true,
    },
  });
  
  // Render to PNG
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  // Write PNG file
  writeFileSync(outputPath, pngBuffer);
  
  console.log('Successfully converted SVG to PNG!');
  console.log('Now run: npx @tauri-apps/cli icon app-icon.png');
} catch (error) {
  console.error('Error converting SVG to PNG:', error);
  process.exit(1);
}

