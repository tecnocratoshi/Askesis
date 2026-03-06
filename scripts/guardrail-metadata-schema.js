#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const METADATA_PATH = path.join(ROOT, 'metadata.json');
const REQUIRED_KEYS = new Set(['name', 'description', 'requestFramePermissions']);

function fail(message) {
  console.error(`❌ Metadata guardrail failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(METADATA_PATH)) {
  fail('metadata.json not found.');
}

let metadata;
try {
  metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
} catch (error) {
  fail(`invalid JSON (${error instanceof Error ? error.message : 'unknown error'}).`);
}

if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
  fail('root must be a JSON object.');
}

const extraKeys = Object.keys(metadata).filter((key) => !REQUIRED_KEYS.has(key) && !key.startsWith('_'));
if (extraKeys.length > 0) {
  fail(`unexpected keys found: ${extraKeys.join(', ')}.`);
}

if (typeof metadata.name !== 'string' || metadata.name.trim().length === 0) {
  fail('"name" must be a non-empty string.');
}

if (typeof metadata.description !== 'string' || metadata.description.trim().length === 0) {
  fail('"description" must be a non-empty string.');
}

if (!Array.isArray(metadata.requestFramePermissions)) {
  fail('"requestFramePermissions" must be an array.');
}

for (let i = 0; i < metadata.requestFramePermissions.length; i += 1) {
  const permission = metadata.requestFramePermissions[i];
  if (typeof permission !== 'string' || permission.trim().length === 0) {
    fail(`"requestFramePermissions[${i}]" must be a non-empty string.`);
  }
}

const duplicatePermission = metadata.requestFramePermissions.find((permission, idx, arr) => arr.indexOf(permission) !== idx);
if (duplicatePermission) {
  fail(`duplicated permission found: "${duplicatePermission}".`);
}

console.log('✅ Metadata guardrail passed.');
