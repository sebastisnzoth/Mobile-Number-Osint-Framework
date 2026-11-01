#!/usr/bin/env node
/**
 * Smoke test for the optional local OSINT toolchain.
 *   npm run tools:check
 * Verifies that every generated command actually runs (not just that it exists).
 */

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BIN = join(ROOT, 'tools', 'bin');
const STATE = join(ROOT, 'tools', '.cache', 'install-state.json');
const green = s => `\x1b[32m${s}\x1b[0m`;
const red = s => `\x1b[31m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const grey = s => `\x1b[90m${s}\x1b[0m`;

const CHECKS = [
    { name: 'number-info', args: ['+14155552671', '--json'], test: o => { try { return JSON.parse(o).region === 'US'; } catch { return false; } } },
    { name: 'spiderfoot', args: ['--help'], test: o => /usage:/i.test(o) },
    { name: 'recon-cli', args: ['-h'], test: o => /usage:/i.test(o) },
    { name: 'ghunt', args: ['--help'], test: o => /usage:|GHunt/i.test(o) },
    { name: 'phoneinfoga', args: ['scan', '-n', '+14155552671'], test: o => /E\.164|PhoneInfoga/i.test(o) }
];

console.log('\n🔍 Verificación del toolchain OSINT local\n');
let failures = 0;

for (const c of CHECKS) {
    const wrapper = join(BIN, c.name);
    if (!existsSync(wrapper)) {
        console.log(`  ${red('✗')} ${c.name.padEnd(14)} ${grey('comando no generado')}`);
        failures++;
        continue;
    }
    const r = spawnSync(wrapper, c.args, { encoding: 'utf8', timeout: 90000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
    const out = `${r.stdout || ''}\n${r.stderr || ''}`;
    const ok = r.status === 0 && !r.error && c.test(out);
    const first = out.split('\n').find(l => l.trim()) || '';
    console.log(`  ${ok ? green('✓') : red('✗')} ${c.name.padEnd(14)} ${grey(first.slice(0, 78))}`);
    if (!ok) failures++;
}

if (existsSync(STATE)) {
    const state = JSON.parse(readFileSync(STATE, 'utf8'));
    const skipped = state.skippedOptional || [];
    console.log(`\n  ${grey('Estado:')} ${state.installedAt} · ${state.platform}`);
    if ((state.failedRequired || []).length) {
        console.log(`  ${red('Fallos obligatorios:')} ${state.failedRequired.join(', ')}`);
        failures += state.failedRequired.length;
    }
    if (skipped.length) console.log(`  ${yellow('Opcionales no disponibles:')} ${skipped.join(' | ')}`);
} else {
    console.log(`\n  ${yellow('!')} ${grey('Sin estado de instalación. Ejecuta: npm run tools:install')}`);
    failures++;
}

// Informational: is the web API up?
try {
    const port = Number(process.env.PORT) || 3000;
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    console.log(`  ${green('✓')} ${'web API'.padEnd(14)} ${grey(`${data.status} · lookup=${data.lookup} · toolchain=${data.toolchain}`)}`);
} catch {
    console.log(`  ${yellow('!')} ${'web API'.padEnd(14)} ${grey('no levantada (npm start)')}`);
}

console.log('');
if (failures) {
    console.error(red(`❌ ${failures} comprobación(es) fallaron. Reinstala con: npm run tools:install\n`));
    process.exitCode = 1;
} else {
    console.log(green('✅ Todo el toolchain local responde correctamente.\n'));
}
