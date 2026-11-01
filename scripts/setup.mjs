#!/usr/bin/env node
// One-command install verification for the Mobile Number OSINT Framework.
// Usage: npm run setup
// The project has zero dependencies, so "installing" means: check the runtime,
// verify that every file and every feature promised by the README is present.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const ok = (label, detail = '') => console.log(`  \x1b[32m✓\x1b[0m ${label}${detail ? ` \x1b[90m(${detail})\x1b[0m` : ''}`);
const fail = (msg) => { failures.push(msg); console.log(`  \x1b[31m✗\x1b[0m ${msg}`); };
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

console.log('\n📱 DEVOTEE INDIA · Mobile Number OSINT Framework — setup\n');

// 1. Runtime
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor >= 18) ok('Node.js runtime', `v${process.versions.node}`);
else fail(`Node.js >= 18 required (found v${process.versions.node})`);

// 2. Required files
const files = [
  'index.html', 'style.css', 'script.js', 'logo.png', 'server.mjs',
  'package.json', 'package-lock.json', 'README.md',
  'scripts/install-tools.mjs', 'scripts/check-tools.mjs',
  'tools/README.md', 'tools/number_info.py', 'tools/phoneinfoga_fallback.py'
];
for (const f of files) {
  if (existsSync(join(ROOT, f)) && statSync(join(ROOT, f)).size > 0) {
    ok('file present', `${f} · ${statSync(join(ROOT, f)).size} bytes`);
  } else {
    fail(`missing or empty file: ${f}`);
  }
}
if (failures.length) {
  console.error('\n❌ Setup incomplete. Restore the missing files and run again.\n');
  process.exit(1);
}

const html = read('index.html');
const css = read('style.css');
const js = read('script.js');
const readme = read('README.md');

// 3. Content: the 9 categories and 78 techniques declared in README
const categories = (js.match(/id:\s*\d+,\s*name:/g) || []).length;
const techniques = (js.match(/\{\s*name:\s*"/g) || []).length;
const links = (js.match(/url:\s*"https?:\/\//g) || []).length;
if (categories === 9) ok('investigation categories', '9');
else fail(`expected 9 categories, found ${categories}`);
if (techniques === 78) ok('investigation techniques', '78');
else fail(`expected 78 techniques, found ${techniques}`);
ok('external tool links', String(links));

// 4. Feature wiring (features advertised by the README)
const features = [
  ['landing page / start button', html.includes('id="startBtn"') && js.includes('setupInvestigate')],
  ['real-time technique search', html.includes('id="searchInput"') && js.includes('setupSearch')],
  ['Cmd/Ctrl+K search shortcut', js.includes('setupKeyboardShortcuts')],
  ['one-click link copy', js.includes('copyToClipboard') && js.includes('fallbackCopy')],
  ['local investigation notes', html.includes('id="notesInput"') && js.includes('localStorage') && css.includes('.notes-panel')],
  ['toast notifications', html.includes('id="toastMsg"') && js.includes('showToast')],
  ['responsive layout', css.includes('@media (max-width: 750px)')],
  ['local static server', read('server.mjs').includes('createServer') && read('package.json').includes('"start"')],
  ['offline number lookup API', read('server.mjs').includes("path === '/api/lookup'")],
  ['toolchain status API', read('server.mjs').includes("path === '/api/tools'")],
  ['number lookup UI', html.includes('id="lookupForm"') && js.includes('setupLookup')],
  ['consent guardrail', read('server.mjs').includes('Consent required') && html.includes('id="lookupConsent"')],
  ['local toolchain installer', read('scripts/install-tools.mjs').includes('REPOS')],
  ['toolchain smoke check', read('package.json').includes('"tools:check"')]
];
for (const [label, present] of features) present ? ok('feature', label) : fail(`feature missing: ${label}`);

// 5. Documented install path
if (readme.includes('npm start') && readme.includes('npm run setup')) ok('install docs', 'README');
else fail('README does not document npm run setup / npm start');

console.log('');
if (failures.length) {
  console.error(`❌ Setup found ${failures.length} problem(s). Fix them and run again.\n`);
  process.exit(1);
}
console.log('✅ Installation complete — every advertised feature is present.\n');
console.log('   Start the app : npm start');
console.log('   Open          : http://localhost:3000');
console.log('   Override port : PORT=8080 npm start\n');
