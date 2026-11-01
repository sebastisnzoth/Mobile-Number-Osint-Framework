#!/usr/bin/env node
/**
 * Zero-dependency static server + offline number-lookup API.
 *
 *   npm start                     http://0.0.0.0:3000
 *   PORT=8080 HOST=127.0.0.1 npm start
 *
 * Endpoints:
 *   GET /api/health                     service status
 *   GET /api/tools                     status of the optional local OSINT toolchain
 *   GET /api/lookup?number=...&region=..&consent=true
 *                                      OFFLINE metadata derived from the number
 *                                      prefix (country, carrier, line type,
 *                                      formats, timezones). No identity lookup.
 *
 * The lookup runs locally: it uses tools/.venv/core/bin/python + phonenumbers
 * when the toolchain is installed, otherwise an embedded calling-code table.
 * An optional Numverify adapter activates only with NUMVERIFY_ACCESS_KEY.
 * Nothing is sent anywhere unless that key is explicitly configured.
 */

import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const TOOLS = join(ROOT, 'tools');
const CORE_PY = join(TOOLS, '.venv', 'core', 'bin', 'python');
const NUMBER_INFO = join(TOOLS, 'number_info.py');
const STATE_FILE = join(TOOLS, '.cache', 'install-state.json');
const PHONEINFOGA_BIN = join(TOOLS, '.cache', 'bin', 'phoneinfoga');
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf'
};

// Fallback used when the optional Python toolchain has not been installed.
// calling code -> [ISO region, country name]
const CALLING_CODES = {
  '1': ['US', 'USA / Canada'], '7': ['RU', 'Russia / Kazakhstan'],
  '20': ['EG', 'Egypt'], '27': ['ZA', 'South Africa'], '31': ['NL', 'Netherlands'],
  '32': ['BE', 'Belgium'], '33': ['FR', 'France'], '34': ['ES', 'Spain'],
  '36': ['HU', 'Hungary'], '39': ['IT', 'Italy'], '41': ['CH', 'Switzerland'],
  '43': ['AT', 'Austria'], '44': ['GB', 'United Kingdom'], '45': ['DK', 'Denmark'],
  '46': ['SE', 'Sweden'], '47': ['NO', 'Norway'], '48': ['PL', 'Poland'],
  '49': ['DE', 'Germany'], '51': ['PE', 'Peru'], '52': ['MX', 'Mexico'],
  '54': ['AR', 'Argentina'], '55': ['BR', 'Brazil'], '56': ['CL', 'Chile'],
  '57': ['CO', 'Colombia'], '58': ['VE', 'Venezuela'], '60': ['MY', 'Malaysia'],
  '61': ['AU', 'Australia'], '62': ['ID', 'Indonesia'], '63': ['PH', 'Philippines'],
  '64': ['NZ', 'New Zealand'], '65': ['SG', 'Singapore'], '66': ['TH', 'Thailand'],
  '81': ['JP', 'Japan'], '82': ['KR', 'South Korea'], '84': ['VN', 'Vietnam'],
  '86': ['CN', 'China'], '90': ['TR', 'Turkey'], '91': ['IN', 'India'],
  '92': ['PK', 'Pakistan'], '93': ['AF', 'Afghanistan'], '98': ['IR', 'Iran'],
  '212': ['MA', 'Morocco'], '234': ['NG', 'Nigeria'], '254': ['KE', 'Kenya'],
  '351': ['PT', 'Portugal'], '353': ['IE', 'Ireland'], '358': ['FI', 'Finland'],
  '380': ['UA', 'Ukraine'], '420': ['CZ', 'Czechia'], '598': ['UY', 'Uruguay'],
  '880': ['BD', 'Bangladesh'], '886': ['TW', 'Taiwan'], '971': ['AE', 'UAE'],
  '966': ['SA', 'Saudi Arabia'], '972': ['IL', 'Israel']
};

const TOOL_NAMES = ['ghunt', 'spiderfoot', 'recon-ng', 'recon-cli', 'number-info', 'phoneinfoga'];
const BLOCKED_PATHS = [
  /^\/\.git(\/|$)/i, /^\/\.env/i, /^\/node_modules(\/|$)/i,
  /^\/tools\/\.venv(\/|$)/i, /^\/tools\/\.cache(\/|$)/i
];

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

// Simple per-IP rate limit (30 requests / minute) — no external dependencies.
const hits = new Map();
function tooManyRequests(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 30;
}

function jsFallback(number) {
  let raw = number.trim().replace(/[^\d+]/g, '');
  if (!raw.startsWith('+')) raw = '+' + raw;
  const digits = raw.slice(1);
  let code = null;
  for (const len of [3, 2, 1]) {
    const candidate = digits.slice(0, len);
    if (CALLING_CODES[candidate]) { code = candidate; break; }
  }
  const entry = code ? CALLING_CODES[code] : null;
  return {
    input: number, e164: raw, international: raw, national: raw,
    country_code: code ? Number(code) : null,
    region: entry ? entry[0] : null,
    country_or_area: entry ? entry[1] : null,
    carrier: null, line_type: 'unknown',
    is_possible: null, is_valid: null, timezones: [],
    source: 'fallback:embedded-calling-codes',
    note: 'Install the toolchain (npm run tools:install) for carrier, line type and validity.'
  };
}

async function analyze(number, region) {
  if (existsSync(CORE_PY) && existsSync(NUMBER_INFO)) {
    const args = [NUMBER_INFO, number];
    if (region) args.push('--region', region);
    args.push('--json');
    try {
      const { stdout } = await execFileAsync(CORE_PY, args, { timeout: 10000, maxBuffer: 1024 * 1024 });
      return { ...JSON.parse(stdout), source: 'local:phonenumbers' };
    } catch {
      // fall through to the dependency-free fallback
    }
  }
  return jsFallback(number);
}

async function optionalProviders(number) {
  const key = process.env.NUMVERIFY_ACCESS_KEY;
  if (!key) {
    return [{ name: 'numverify', configured: false, status: 'not configured (set NUMVERIFY_ACCESS_KEY)' }];
  }
  try {
    const url = new URL('https://apilayer.net/api/validate');
    url.searchParams.set('access_key', key);
    url.searchParams.set('number', number);
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return [{ name: 'numverify', configured: true, status: 'ok', data: d }];
  } catch (err) {
    return [{ name: 'numverify', configured: true, status: 'unavailable', reason: String(err.message || err) }];
  }
}

async function handleApi(req, res, url) {
  const path = url.pathname;

  if (path === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok', service: 'Mobile Number OSINT Framework',
      lookup: existsSync(CORE_PY) ? 'local:phonenumbers' : 'fallback:embedded-calling-codes',
      toolchain: existsSync(STATE_FILE) ? 'installed' : 'not installed'
    });
  }

  if (path === '/api/tools') {
    if (!existsSync(STATE_FILE)) {
      return sendJson(res, 200, {
        installed: false, hint: 'Run: npm run tools:install', tools: [], failedRequired: [], skippedOptional: []
      });
    }
    try {
      const state = JSON.parse(await readFile(STATE_FILE, 'utf8'));
      return sendJson(res, 200, {
        installed: true,
        installedAt: state.installedAt,
        python: state.python,
        platform: state.platform,
        failedRequired: state.failedRequired || [],
        skippedOptional: state.skippedOptional || [],
        tools: TOOL_NAMES.map(name => ({
          name,
          available: existsSync(join(TOOLS, 'bin', name)),
          official: name !== 'phoneinfoga' || existsSync(PHONEINFOGA_BIN)
        }))
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Cannot read toolchain state', detail: String(err.message || err) });
    }
  }

  if (path === '/api/lookup') {
    const rawNumber = url.searchParams.get('number') || '';
    let number = rawNumber.trim();
    // A literal '+55...' sent unencoded arrives as ' 55...': URLSearchParams
    // decodes '+' as a space. Restore the international prefix in that case.
    if (/^\s\d[\d\s().\-]*$/.test(rawNumber)) number = '+' + number;
    const region = (url.searchParams.get('region') || '').trim().toUpperCase();
    const consent = url.searchParams.get('consent') === 'true';

    if (!number) return sendJson(res, 400, { error: 'Missing "number" parameter.' });
    if (number.length > 32 || !/^[0-9+()\s.\-]+$/.test(number)) {
      return sendJson(res, 400, { error: 'Invalid number. Use digits, +, spaces, parentheses, dots or dashes (max 32 chars).' });
    }
    if (region && !/^[A-Z]{2}$/.test(region)) {
      return sendJson(res, 400, { error: 'Invalid region: use a two-letter ISO code (BR, US, IN...).' });
    }
    if (!consent) {
      return sendJson(res, 403, {
        error: 'Consent required. This tool is for consent-based investigations, authorised security work and education only.',
        hint: 'Pass consent=true or tick the consent checkbox in the UI.'
      });
    }
    if (tooManyRequests(req.socket.remoteAddress || 'unknown')) {
      return sendJson(res, 429, { error: 'Too many requests. Please wait a minute.' });
    }

    try {
      const info = await analyze(number, region || null);
      if (!info.region && !info.country_code) {
        return sendJson(res, 422, { error: 'Could not parse that number. Try international format, e.g. +55 48 99999-1234.' });
      }
      return sendJson(res, 200, {
        ...info,
        providers: await optionalProviders(info.e164 || number),
        disclaimer: 'Metadata derived from the number prefix only. No name, address or identity is looked up. Ethical, consent-based use only.'
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Lookup failed', detail: String(err.message || err) });
    }
  }

  return sendJson(res, 404, { error: 'Unknown API endpoint' });
}

const server = createServer(async (req, res) => {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method Not Allowed');
    return;
  }

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    if (method === 'HEAD') { res.writeHead(200).end(); return; }
    await handleApi(req, res, url);
    return;
  }

  if (BLOCKED_PATHS.some(re => re.test(url.pathname))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('403 Forbidden');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }

  // Resolve inside ROOT only (blocks ../ traversal).
  const requested = resolve(join(ROOT, normalize(pathname)));
  if (requested !== ROOT && !requested.startsWith(ROOT + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let filePath = requested;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, 'index.html');
    await stat(filePath);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  if (method === 'HEAD') { res.end(); return; }
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Mobile Number OSINT Framework running at http://${HOST}:${PORT}`);
  console.log('  API: /api/health · /api/tools · /api/lookup?number=...&consent=true');
});
