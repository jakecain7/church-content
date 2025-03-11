const fs = require('fs-extra');
const path = require('path');

// Define source and destination paths
const functionsSourceDir = path.join(__dirname, 'netlify/functions');
const functionsDestDir = path.join(__dirname, 'dist/.netlify/functions');
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

// Ensure destination directory exists
fs.ensureDirSync(functionsDestDir);

// Copy functions
console.log(`Copying Netlify functions from ${functionsSourceDir} to ${functionsDestDir}`);
fs.copySync(functionsSourceDir, functionsDestDir);

// Copy all HTML files from public to dist
console.log('Copying HTML files from public directory to dist directory');
fs.readdirSync(publicDir).forEach(file => {
  const sourcePath = path.join(publicDir, file);
  const destPath = path.join(distDir, file);
  
  // Skip directories and only copy files
  if (fs.statSync(sourcePath).isFile()) {
    console.log(`Copying ${sourcePath} to ${destPath}`);
    fs.copyFileSync(sourcePath, destPath);
  }
});

console.log('Netlify functions and HTML files copied successfully');