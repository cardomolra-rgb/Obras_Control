// Verifica configurações de segurança do projeto e do build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const all = Object.fromEntries(vercel.headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key, h.value]));

test('cabeçalhos de segurança configurados na Vercel', () => {
  for (const k of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'X-Frame-Options']) assert.ok(all[k], k);
  const csp = all['Content-Security-Policy'];
  assert.match(csp, /script-src 'self';/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.doesNotMatch(csp, /unsafe-eval/);
});
test('index.html não carrega scripts de terceiros', () => {
  const html = readFileSync('index.html', 'utf8');
  for (const m of html.matchAll(/<script[^>]*src="([^"]+)"/g)) assert.ok(m[1].startsWith('/'), m[1]);
});
test('.env fora do Git', () => {
  assert.match(readFileSync('.gitignore', 'utf8'), /^\.env$/m);
});
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
test('nenhum segredo no código-fonte nem no build', () => {
  const files = ['index.html', ...walk('src'), ...walk('api'), ...(existsSync('dist') ? walk('dist') : [])].filter((f) => /\.(js|html|json|css)$/.test(f));
  const bad = /(postgres(ql)?:\/\/[^\s'"]*:[^\s'"]*@|npg_[A-Za-z0-9]{8,}|dabra_(live|test)_[A-Za-z0-9]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY|sk_live_[A-Za-z0-9]+)/;
  for (const f of files) assert.doesNotMatch(readFileSync(f, 'utf8'), bad, f);
});
test('datas são escapadas antes de ir para a tela (XSS)', () => {
  assert.match(readFileSync('src/app.js', 'utf8'), /const fdate=iso=>iso\?esc\(/);
});
