// Testes de segurança da API de consulta (rodam no CI a cada envio para o GitHub).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, { limited, validCPF, validCNPJ } from '../api/consulta.js';

function call({ method = 'POST', auth, body } = {}) {
  return new Promise((resolve) => {
    const res = { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(j) { resolve({ code: this.code, body: j, headers: this.headers }); } };
    handler({ method, headers: auth ? { authorization: auth } : {}, body }, res);
  });
}
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

test('recusa método diferente de POST', async () => {
  assert.equal((await call({ method: 'GET' })).code, 405);
});
test('recusa requisição sem login', async () => {
  const r = await call({ body: { tipo: 'cep', doc: '77000000' } });
  assert.equal(r.code, 401);
  assert.equal(r.headers['Cache-Control'], 'no-store');
});
test('recusa token forjado sem assinatura (alg none)', async () => {
  const t = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'x', role: 'authenticated' })}.`;
  assert.equal((await call({ auth: 'Bearer ' + t, body: { tipo: 'cep', doc: '77000000' } })).code, 401);
});
test('recusa token assinado com segredo compartilhado (HS256)', async () => {
  const t = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: 'x', role: 'authenticated', iss: 'https://ep-curly-silence-b6whyv3k.neonauth.c-2.sa-east-1.aws.neon.tech' })}.c2lnbmF0dXJl`;
  assert.equal((await call({ auth: 'Bearer ' + t, body: { tipo: 'cep', doc: '77000000' } })).code, 401);
});
test('recusa token gigante', async () => {
  assert.equal((await call({ auth: 'Bearer ' + 'a'.repeat(5000) })).code, 401);
});
test('erro não expõe detalhes internos', async () => {
  const r = await call({ auth: 'Bearer abc.def.ghi' });
  assert.deepEqual(Object.keys(r.body), ['error']);
  assert.doesNotMatch(r.body.error, /stack|at |Error:|jose|jwks/i);
});
test('limite de consultas por usuário', () => {
  const k = 'teste-' + Math.random();
  for (let i = 0; i < 20; i++) assert.equal(limited(k), false);
  assert.equal(limited(k), true);
});
test('validação de CPF e CNPJ', () => {
  assert.equal(validCPF('52998224725'), true);
  assert.equal(validCPF('11111111111'), false);
  assert.equal(validCNPJ('11222333000181'), true);
  assert.equal(validCNPJ('11222333000180'), false);
});
