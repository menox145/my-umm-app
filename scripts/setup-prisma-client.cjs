const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'node_modules', '.prisma', 'client');
const dstDir = path.resolve(__dirname, '..', 'node_modules', '@prisma', 'client', '.prisma', 'client');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  copyRecursive(srcDir, dstDir);
  console.log(`Copied Prisma client from ${srcDir} to ${dstDir}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
