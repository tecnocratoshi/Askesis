#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SW_PATH = path.join(ROOT, 'sw.js');

function fail(message) {
  console.error(`❌ SW cache-version guardrail failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(SW_PATH)) {
  fail('sw.js not found.');
}

const swContent = fs.readFileSync(SW_PATH, 'utf8');

const versionConstRegex = /const\s+SW_CACHE_VERSION\s*=\s*['"]v\d+['"];?/;
if (!versionConstRegex.test(swContent)) {
  fail('missing "SW_CACHE_VERSION" constant in format "v<number>".');
}

if (!/setCacheNameDetails\(\{\s*prefix:\s*['"]askesis['"],\s*suffix:\s*SW_CACHE_VERSION\s*\}\)/.test(swContent)) {
  fail('Workbox cache details must set suffix: SW_CACHE_VERSION.');
}

const requiredSnippets = [
  'cacheName: `pages-${SW_CACHE_VERSION}`',
  'cacheName: `assets-${SW_CACHE_VERSION}`',
  'const CACHE_NAME = `askesis-fallback-${SW_CACHE_VERSION}`;'
];

const missing = requiredSnippets.filter((snippet) => !swContent.includes(snippet));
if (missing.length > 0) {
  fail(`missing versioned cache names: ${missing.join(' | ')}`);
}

console.log('✅ SW cache-version guardrail passed.');
