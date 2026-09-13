'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const mainEntryPath = path.join(root, 'electron', 'main.cjs');
const vercelIgnorePath = path.join(root, '.vercelignore');

function fail(message) {
  console.error(`\n[smoke-test] FAIL: ${message}\n`);
  process.exit(1);
}

function ok(message) {
  console.log(`\n[smoke-test] OK: ${message}`);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (!pkg.main || typeof pkg.main !== 'string') {
    fail('package.json main is missing or invalid.');
  }

  if (!pkg.main.endsWith('main.cjs')) {
    fail(`package.json main must point to a main.cjs entry, got: ${pkg.main}`);
  }

  if (!fileExists(path.join(root, pkg.main))) {
    fail(`package.json main target does not exist on disk: ${pkg.main}`);
  }

  ok(`package.json main is valid: ${pkg.main}`);
} catch (err) {
  fail(`Unable to read valid package.json: ${err.message}`);
}

if (!fileExists(mainEntryPath)) {
  fail(`Electron main entry is missing: ${mainEntryPath}`);
}
ok(`Electron main entry exists: ${mainEntryPath}`);

if (!fs.readFileSync(vercelIgnorePath, 'utf8').includes('public/downloads/')) {
  fail('.vercelignore must exclude retired desktop downloads.');
}
ok('.vercelignore excludes retired desktop downloads.');

console.log('\n[smoke-test] SUCCESS: all required desktop distribution checks passed.');
