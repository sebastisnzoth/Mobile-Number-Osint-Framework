#!/usr/bin/env node
/**
 * Optional installer for the external OSINT tools referenced by the framework.
 *
 *   npm run tools:install
 *
 * The web app itself has zero dependencies; this script installs the standalone
 * tools listed in category 9 (Automated OSINT Tools) into ignored folders:
 *
 *   tools/.venv/<tool>/   isolated Python virtualenv per tool (avoids pin conflicts)
 *   tools/.cache/src/     shallow git clones
 *   tools/.cache/bin/     downloaded binaries
 *   tools/bin/            generated CLI wrappers
 *
 * Everything installed is reproducible from this script and is NOT committed.
 * Network requirements: github.com, api.github.com, pypi.org,
 * files.pythonhosted.org. GitHub *release assets* redirect to
 * objects.githubusercontent.com, which is blocked in some sandboxes; in that
 * case PhoneInfoga is staged as source and the script says so explicitly.
 */

import { spawnSync } from 'node:child_process';
import {
    existsSync, mkdirSync, writeFileSync, readFileSync, chmodSync, copyFileSync,
    readdirSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS = join(ROOT, 'tools');
const VENV = join(TOOLS, '.venv');
const CACHE = join(TOOLS, '.cache');
const SRC = join(CACHE, 'src');
const DL = join(CACHE, 'bin');
const BIN = join(TOOLS, 'bin');
const STATE_FILE = join(CACHE, 'install-state.json');
const PY = process.env.PYTHON || 'python3';

const REPOS = {
    spiderfoot: 'https://github.com/smicallef/spiderfoot.git',
    'recon-ng': 'https://github.com/lanmaster53/recon-ng.git',
    phoneinfoga: 'https://github.com/sundowndev/phoneinfoga.git'
};

const results = [];
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const grey = (s) => `\x1b[90m${s}\x1b[0m`;

function run(cmd, args, opts = {}) {
    const r = spawnSync(cmd, args, {
        cwd: opts.cwd || ROOT,
        env: { ...process.env, PIP_DISABLE_PIP_VERSION_CHECK: '1', PYTHONDONTWRITEBYTECODE: '1' },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: opts.timeout || 15 * 60 * 1000,
        shell: false
    });
    return {
        ok: r.status === 0 && !r.error,
        out: `${r.stdout || ''}\n${r.stderr || ''}`.trim(),
        status: r.status,
        error: r.error ? String(r.error.message) : null
    };
}

async function step(name, required, fn) {
    process.stdout.write(`  ${grey('···')} ${name} ... `);
    let result;
    try {
        result = await fn();
    } catch (err) {
        result = { ok: false, detail: String(err.message || err) };
    }
    const ok = result && result.ok !== false;
    const detail = result?.detail || '';
    const icon = ok ? green('✓') : required ? red('✗') : yellow('!');
    process.stdout.write(`${icon}${detail ? grey(` ${detail}`) : ''}\n`);
    if (!ok && result?.out) {
        const tail = result.out.split('\n').slice(-8).join('\n');
        console.log(grey(tail.split('\n').map(l => '      ' + l).join('\n')));
    }
    results.push({ name, required, ok, detail });
    return ok;
}

function clone(name) {
    const dest = join(SRC, name);
    if (existsSync(join(dest, '.git'))) {
        const head = run('git', ['-C', dest, 'rev-parse', '--short', 'HEAD']);
        return { ok: true, detail: `ya presente (${head.out.trim() || 'clon'})` };
    }
    mkdirSync(SRC, { recursive: true });
    const r = run('git', ['clone', '--depth', '1', REPOS[name], dest]);
    if (!r.ok) return { ok: false, detail: 'git clone falló', out: r.out };
    const head = run('git', ['-C', dest, 'rev-parse', '--short', 'HEAD']);
    return { ok: true, detail: head.out.trim() };
}

function ensureVenv(name) {
    const path = join(VENV, name);
    const py = join(path, 'bin', 'python');
    if (existsSync(py)) return { ok: true, detail: 'ya existe' };
    mkdirSync(VENV, { recursive: true });
    const r = run(PY, ['-m', 'venv', path]);
    return r.ok ? { ok: true, detail: 'creado' } : { ok: false, detail: 'python3 -m venv falló', out: r.out };
}

function pip(name, args, extra = {}) {
    return async () => {
        const v = await ensureVenv(name);
        if (!v.ok) return v;
        const r = run(join(VENV, name, 'bin', 'pip'), ['install', '--disable-pip-version-check', ...args], extra);
        if (r.ok) return { ok: true, detail: v.detail === 'creado' ? 'venv + paquetes instalados' : 'paquetes al día' };
        return { ok: false, detail: 'pip install falló', out: r.out };
    };
}

function relaxedRequirements(source, target) {
    // Old upper pins (e.g. cryptography<4, lxml<5) often have no wheels for
    // modern Python. Drop only the upper bounds, keep the minimum versions.
    const text = readFileSync(source, 'utf8')
        .split('\n')
        .map(l => l.replace(/,<[^,\s#]+/g, '').trim())
        .filter(l => l && !l.startsWith('#'))
        .join('\n');
    writeFileSync(target, text + '\n');
    return target;
}

const PLATFORM_ASSETS = {
    'linux-x64': 'phoneinfoga_Linux_x86_64.tar.gz',
    'linux-arm64': 'phoneinfoga_Linux_arm64.tar.gz',
    'darwin-x64': 'phoneinfoga_Darwin_x86_64.tar.gz',
    'darwin-arm64': 'phoneinfoga_Darwin_arm64.tar.gz'
};

async function tryPhoneInfogaBinary() {
    const assetName = PLATFORM_ASSETS[`${process.platform}-${process.arch}`];
    if (!assetName) return { ok: false, detail: `sin binario para ${process.platform}-${process.arch}` };
    const headers = { 'User-Agent': 'mobile-number-osint-framework-installer', Accept: 'application/vnd.github+json' };
    // GitHub release assets redirect to objects.githubusercontent.com, which is
    // outside the sandbox network allowlist; make that failure self-explanatory.
    const safeFetch = async (url, options) => {
        try { return await fetch(url, options); }
        catch (err) {
            throw new Error(`binario oficial bloqueado por la red del sandbox; se deja el código fuente (${err.cause?.code || err.message})`);
        }
    };
    const meta = await safeFetch('https://api.github.com/repos/sundowndev/phoneinfoga/releases/latest', { headers });
    if (!meta.ok) return { ok: false, detail: `GitHub API HTTP ${meta.status}` };
    const release = await meta.json();
    const asset = (release.assets || []).find(a => a.name === assetName);
    if (!asset) return { ok: false, detail: `no existe ${assetName} en ${release.tag_name}` };

    const file = await safeFetch(asset.browser_download_url, { headers: { 'User-Agent': headers['User-Agent'] } });
    if (!file.ok) return { ok: false, detail: `descarga HTTP ${file.status}` };
    const buf = Buffer.from(await file.arrayBuffer());
    // A blocked redirect usually returns an HTML page or an empty body.
    if (buf.length < 10000 || buf[0] !== 0x1f || buf[1] !== 0x8b) {
        return { ok: false, detail: 'redirección a objects.githubusercontent.com bloqueada' };
    }
    mkdirSync(DL, { recursive: true });
    const archive = join(DL, assetName);
    writeFileSync(archive, buf);
    const extractDir = join(DL, 'phoneinfoga-extracted');
    mkdirSync(extractDir, { recursive: true });
    const tar = run('tar', ['-xzf', archive, '-C', extractDir]);
    if (!tar.ok) return { ok: false, detail: 'tar falló', out: tar.out };

    const found = run('find', [extractDir, '-type', 'f', '-name', 'phoneinfoga', '-print', '-quit']);
    const binary = found.out.trim();
    if (!binary) return { ok: false, detail: 'binario no encontrado en el tar.gz' };
    copyFileSync(binary, join(DL, 'phoneinfoga'));
    chmodSync(join(DL, 'phoneinfoga'), 0o755);
    return { ok: true, detail: `${release.tag_name} (${assetName})` };
}

/**
 * GHunt checks its own version against raw.githubusercontent.com on every CLI
 * start, even for --help. In an offline/allowlisted sandbox that raises an
 * unhandled httpx error. Patch ONLY the generated local venv so the version
 * check degrades gracefully; never touches the project sources or upstream.
 */
function patchGhuntOffline() {
    const lib = join(VENV, 'ghunt', 'lib');
    if (!existsSync(lib)) return { ok: false, detail: 'venv de GHunt no encontrado' };
    const pyDir = readdirSync(lib).find(d => d.startsWith('python3.'));
    if (!pyDir) return { ok: false, detail: 'no se localizó site-packages' };
    const file = join(lib, pyDir, 'site-packages', 'ghunt', 'helpers', 'utils.py');
    if (!existsSync(file)) return { ok: false, detail: 'helpers/utils.py no encontrado' };

    const text = readFileSync(file, 'utf8');
    const oldLine = '    req = httpx.get("https://raw.githubusercontent.com/mxrch/GHunt/master/ghunt/version.py")';
    if (!text.includes(oldLine)) {
        return { ok: true, detail: 'ya es tolerante a red / versión distinta' };
    }
    const newLines = `    try:\r
        req = httpx.get("https://raw.githubusercontent.com/mxrch/GHunt/master/ghunt/version.py", timeout=5)\r
    except Exception:\r
        return False, {}`;
    writeFileSync(file, text.replace(oldLine, newLines));
    return { ok: true, detail: 'chequeo de versión tolerante a red' };
}

function makeWrappers(phoneinfogaBinary) {
    mkdirSync(BIN, { recursive: true });
    const header = `#!/usr/bin/env bash
# Generado por scripts/install-tools.mjs — no editar a mano.
set -e
TOOLS_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
`;
    const wrappers = {
        ghunt: `exec "$TOOLS_DIR/.venv/ghunt/bin/ghunt" "$@"`,
        spiderfoot: `exec "$TOOLS_DIR/.venv/spiderfoot/bin/python" "$TOOLS_DIR/.cache/src/spiderfoot/sf.py" "$@"`,
        'recon-ng': `exec "$TOOLS_DIR/.venv/recon-ng/bin/python" "$TOOLS_DIR/.cache/src/recon-ng/recon-ng" "$@"`,
        'recon-cli': `exec "$TOOLS_DIR/.venv/recon-ng/bin/python" "$TOOLS_DIR/.cache/src/recon-ng/recon-cli" "$@"`,
        'number-info': `exec "$TOOLS_DIR/.venv/core/bin/python" "$TOOLS_DIR/number_info.py" "$@"`,
        phoneinfoga: phoneinfogaBinary
            ? `exec "$TOOLS_DIR/.cache/bin/phoneinfoga" "$@"`
            : `exec "$TOOLS_DIR/.venv/core/bin/python" "$TOOLS_DIR/phoneinfoga_fallback.py" "$@"`
    };
    for (const [name, body] of Object.entries(wrappers)) {
        const path = join(BIN, name);
        writeFileSync(path, header + '\n' + body + '\n');
        chmodSync(path, 0o755);
    }
    writeFileSync(join(TOOLS, 'env.sh'), `#!/usr/bin/env bash
# Uso: source tools/env.sh
TOOLS_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
export PATH="$TOOLS_DIR/bin:$PATH"
echo "Herramientas OSINT en PATH: ghunt, spiderfoot, recon-ng, recon-cli, number-info, phoneinfoga"
`);
    return { ok: true, detail: `${Object.keys(wrappers).length} comandos` };
}

function verify(label, cmd, args) {
    const r = run(cmd, args, { timeout: 120000 });
    const first = r.out.split('\n').find(l => l.trim()) || '';
    return r.ok
        ? { ok: true, detail: first.slice(0, 90) }
        : { ok: false, detail: 'no respondió --help', out: r.out };
}

async function main() {
    console.log('\n🛠️  Instalador de herramientas OSINT externas\n');
    console.log(grey(`   Destino: ${TOOLS}\n`));

    await step('Python >= 3.10', true, () => {
        const r = run(PY, ['-c', 'import sys; print(".".join(map(str, sys.version_info[:2])))']);
        if (!r.ok) return { ok: false, detail: `${PY} no disponible`, out: r.out };
        const [maj, min] = r.out.trim().split('.').map(Number);
        return maj === 3 && min >= 10
            ? { ok: true, detail: `Python ${r.out.trim()}` }
            : { ok: false, detail: `se requiere Python >= 3.10 (hay ${r.out.trim()})` };
    });
    await step('git disponible', true, () => {
        const r = run('git', ['--version']);
        return r.ok ? { ok: true, detail: r.out.trim() } : { ok: false, detail: 'git no encontrado', out: r.out };
    });

    for (const name of Object.keys(REPOS)) {
        await step(`clonar ${name}`, true, () => clone(name));
    }

    const pi = await step('binario oficial de PhoneInfoga (opcional)', false, tryPhoneInfogaBinary);
    const piOk = results[results.length - 1].ok;

    await step('instalar GHunt 2.3.4', true, pip('ghunt', ['ghunt==2.3.4']));
    await step('parche offline de GHunt (--help sin red)', false, patchGhuntOffline);

    await step('instalar dependencias de Spiderfoot', true, async () => {
        const v = await ensureVenv('spiderfoot');
        if (!v.ok) return v;
        const req = join(SRC, 'spiderfoot', 'requirements.txt');
        let r = run(join(VENV, 'spiderfoot', 'bin', 'pip'), ['install', '--disable-pip-version-check', '-r', req]);
        if (!r.ok) {
            const relaxed = relaxedRequirements(req, join(CACHE, 'spiderfoot-requirements-relaxed.txt'));
            r = run(join(VENV, 'spiderfoot', 'bin', 'pip'), ['install', '--disable-pip-version-check', '-r', relaxed]);
            return r.ok
                ? { ok: true, detail: 'instalado con límites superiores relajados' }
                : { ok: false, detail: 'pip install falló', out: r.out };
        }
        return { ok: true, detail: 'requirements.txt' };
    });

    await step('instalar dependencias de recon-ng', true, pip('recon-ng', ['-r', join(SRC, 'recon-ng', 'REQUIREMENTS')]));
    await step('instalar phonenumbers (helper offline)', true, pip('core', ['phonenumbers>=8.13,<10']));

    await step('generar comandos en tools/bin', true, () => makeWrappers(piOk));
    await step('verificar GHunt --help', false, () =>
        verify('ghunt', join(BIN, 'ghunt'), ['--help']));
    await step('verificar Spiderfoot --help', false, () =>
        verify('spiderfoot', join(VENV, 'spiderfoot', 'bin', 'python'), [join(SRC, 'spiderfoot', 'sf.py'), '--help']));
    await step('verificar recon-cli -h', false, () =>
        verify('recon-cli', join(BIN, 'recon-cli'), ['-h']));
    await step('verificar number-info (offline)', true, () =>
        verify('number-info', join(VENV, 'core', 'bin', 'python'), [join(TOOLS, 'number_info.py'), '+14155552671', '--json']));
    await step('verificar phoneinfoga (oficial o fallback)', true, () =>
        verify('phoneinfoga', join(BIN, 'phoneinfoga'), ['scan', '-n', '+14155552671']));

    const failed = results.filter(r => r.required && !r.ok);
    const skipped = results.filter(r => !r.required && !r.ok);
    const state = {
        installedAt: new Date().toISOString(),
        python: PY,
        platform: `${process.platform}-${process.arch}`,
        results,
        failedRequired: failed.map(r => r.name),
        skippedOptional: skipped.map(r => `${r.name}: ${r.detail}`)
    };
    mkdirSync(CACHE, { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');

    console.log('');
    if (failed.length) {
        console.error(red(`❌ ${failed.length} paso(s) obligatorio(s) fallaron: ${failed.map(r => r.name).join(', ')}`));
        console.error(grey('   Revisa la salida, corrige el problema y vuelve a ejecutar: npm run tools:install\n'));
        process.exitCode = 1;
    } else {
        console.log(green('✅ Herramientas instaladas y verificadas.'));
    }
    console.log('   Activa los comandos : source tools/env.sh');
    console.log('   Ejemplo             : number-info +14155552671');
    console.log(grey(`   Estado detallado    : ${STATE_FILE}`));
    console.log(grey('   Documentación       : tools/README.md\n'));
}

main().catch(err => {
    console.error(red(`Error inesperado: ${err.stack || err}`));
    process.exitCode = 1;
});
