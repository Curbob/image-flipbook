#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Read the source file
const sourceFile = path.join(srcDir, 'image-flipbook.js');
const sourceCode = fs.readFileSync(sourceFile, 'utf8');

// Simple minification - remove comments and extra whitespace
const minified = sourceCode
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/^\s+|\s+$/gm, '') // Remove leading/trailing whitespace
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();

// Write minified version
const distFile = path.join(distDir, 'image-flipbook.min.js');
fs.writeFileSync(distFile, minified);

// Copy unminified version
const distUnminified = path.join(distDir, 'image-flipbook.js');
fs.writeFileSync(distUnminified, sourceCode);

console.log('✅ Build complete!');
console.log(`📄 Source: ${Math.round(sourceCode.length / 1024)} KB`);
console.log(`📦 Minified: ${Math.round(minified.length / 1024)} KB`);
console.log(`📁 Files created in: ${distDir}`);