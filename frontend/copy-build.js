import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, 'dist');
const backendPublicDir = path.resolve(__dirname, '../backend/public');
const rootDistDir = path.resolve(__dirname, '../dist');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    for (const file of files) {
      const curSource = path.join(source, file);
      const curTarget = path.join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
      }
    }
  }
}

try {
  if (fs.existsSync(srcDir)) {
    console.log('📦 Syncing frontend build to backend/public & root dist...');
    copyFolderRecursiveSync(srcDir, backendPublicDir);
    copyFolderRecursiveSync(srcDir, rootDistDir);
    console.log('✅ Build successfully mirrored to all target directories.');
  }
} catch (err) {
  console.error('⚠️ Failed to mirror build assets:', err);
}
