// OBRA CONTROL: consulta de CNPJ, CPF e CEP para preencher o cadastro de clientes.
// Só responde a usuários logados (token do Neon Auth). A chave da Dabra fica na
// variável de ambiente DABRA_API_KEY da Vercel e nunca vai para o navegador.
import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUTH = 'https://ep-curly-silence-b6whyv3k.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth';
const JWKS = createRemoteJWKSet(new URL(AUTH + '/.well-known/jwks.json'));
const DABRA = (process.env.DABRA_BASE_URL || 'https://app.dabradata.com/api/v1').replace(/\/+$/, '');

const only = (s) => String(s || '').replace(/\D/g, '');
function validCPF(c) {
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const dv = (n) => { let s = 0; for (let i = 0; i < n; i++) s += +c[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === +c[9] && dv(10) === +c[10];
}
function validCNPJ(c) {
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const dv = (n) => { const w = n === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2]; let s = 0; for (let i = 0; i < n; i++) s += +c[i] * w[i]; const r = s % 11; return r < 2 ? 0 : 11 - r; };
  return dv(12) === +c[12] && dv(13) === +c[13];
}
// Procura um valor em qualquer nível do JSON pelo nome da chave (respostas de provedores variam).
function pick(obj, patterns) {
  const seen = new Set(); const stack = [obj];
  for (const re of patterns) {
    stack.length = 0; stack.push(obj); seen.clear();
    while (stack.length) {
      const o = stack.shift();
      if (!o || typeof o !== 'object' || seen.has(o)) continue; seen.add(o);
      for (const [k, v] of Object.entries(o)) {
        if (re.test(k) && v != null && typeof v !== 'object' && String(v).trim() !== '') return String(v).trim();
      }
      for (const v of Object.values(o)) if (v && typeof v === 'object') stack.push(v);
    }
  }
  return '';
}
function firstOf(obj, listRe, fieldRe) {
  const stack = [obj];
  while (stack.length) {
    const o = stack.shift();
    if (!o || typeof o !== 'object') continue;
    for (const [k, v] of Object.entries(o)) {
      if (listRe.test(k) && Array.isArray(v) && v.length) {
        const it = v[0];
        if (typeof it !== 'object') return String(it);
        return pick(it, fieldRe);
      }
      if (v && typeof v === 'object') stack.push(v);
    }
  }
  return '';
}
const fmtPhone = (s) => { const d = only(s); if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`; if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`; return s || ''; };
const fmtCep = (s) => { const d = only(s); return d.length === 8 ? `${d.slice(0,5)}-${d.slice(5)}` : s || ''; };

export { fromCnpjWs };
export function normalize(raw, tipo) {
  const out = {
    name: pick(raw, [/^razao_?social$/i, /^nome_?empresarial$/i, /^nome$/i, /^nome_?completo$/i, /name/i]),
    trade_name: pick(raw, [/^nome_?fantasia$/i, /fantasia/i]),
    status_rf: pick(raw, [/^descricao_situacao_cadastral$/i, /^situacao_?cadastral$/i, /^situacao$/i, /status/i]),
    opened_at: pick(raw, [/^data_inicio_atividade$/i, /^data_?abertura$/i, /abertura/i]),
    activity: pick(raw, [/^cnae_fiscal_descricao$/i, /atividade_?principal/i, /cnae.*descr/i]),
    birth: tipo === 'cpf' ? pick(raw, [/nascimento/i]) : '',
    cep: fmtCep(pick(raw, [/^cep$/i, /cep/i])),
    street: [pick(raw, [/^descricao_tipo_de_logradouro$/i, /^tipo_?logradouro$/i]), pick(raw, [/^logradouro$/i, /^endereco$/i, /logradouro/i])].filter(Boolean).join(' '),
    number: pick(raw, [/^numero$/i, /^num$/i]),
    complement: pick(raw, [/^complemento$/i]),
    district: pick(raw, [/^bairro$/i]),
    city: pick(raw, [/^municipio$/i, /^cidade$/i, /municipio|cidade/i]),
    state: pick(raw, [/^uf$/i, /^estado$/i]).slice(0, 2).toUpperCase(),
    phone: fmtPhone(pick(raw, [/^ddd_telefone_1$/i, /^telefone$/i]) || firstOf(raw, /telefones?|phones?/i, [/numero|telefone|phone|ddd/i])),
    email: (pick(raw, [/^email$/i, /e_?mail/i]) || firstOf(raw, /emails?/i, [/email|endereco/i])).toLowerCase(),
  };
  if (out.opened_at && /^\d{4}-\d{2}-\d{2}/.test(out.opened_at)) out.opened_at = out.opened_at.slice(0, 10);
  return out;
}

// CNPJ.ws (https://www.cnpj.ws): API pública (3 consultas por minuto) ou comercial com token.
function fromCnpjWs(j) {
  const e = j.estabelecimento || {};
  const ie = (e.inscricoes_estaduais || []).find((x) => x && x.ativo !== false) || (e.inscricoes_estaduais || [])[0];
  const simples = j.simples || {};
  return {
    name: j.razao_social || '',
    trade_name: e.nome_fantasia || '',
    status_rf: e.situacao_cadastral || '',
    opened_at: (e.data_inicio_atividade || '').slice(0, 10),
    activity: (e.atividade_principal && e.atividade_principal.descricao) || '',
    cep: fmtCep(e.cep),
    street: [e.tipo_logradouro, e.logradouro].filter(Boolean).join(' '),
    number: e.numero || '',
    complement: e.complemento || '',
    district: e.bairro || '',
    city: (e.cidade && e.cidade.nome) || '',
    state: ((e.estado && e.estado.sigla) || '').toUpperCase(),
    phone: e.telefone1 ? fmtPhone(`${e.ddd1 || ''}${e.telefone1}`) : '',
    email: (e.email || '').toLowerCase(),
    ie: ie && ie.inscricao_estadual ? String(ie.inscricao_estadual) : '',
    regime: simples.mei === 'Sim' ? 'MEI' : simples.simples === 'Sim' ? 'Simples Nacional' : '',
  };
}

async function getJSON(url, headers = {}) {
  const r = await fetch(url, { headers: { Accept: 'application/json', ...headers } });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) {}
  return { ok: r.ok, status: r.status, json: j };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const tok = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  try {
    const { payload } = await jwtVerify(tok, JWKS);
    if (payload.role !== 'authenticated' || !String(payload.iss || '').startsWith('https://ep-curly-silence-b6whyv3k.neonauth.')) throw new Error('role');
  } catch (e) {
    return res.status(401).json({ error: 'Entre na sua conta para consultar.' });
  }
  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const tipo = String((body && body.tipo) || ''); const d = only(body && body.doc);
  const key = process.env.DABRA_API_KEY || '';
  try {
    if (tipo === 'cep') {
      if (d.length !== 8) return res.status(400).json({ error: 'CEP deve ter 8 dígitos.' });
      const r = await getJSON(`https://brasilapi.com.br/api/cep/v1/${d}`);
      if (!r.ok || !r.json) return res.status(404).json({ error: 'CEP não encontrado.' });
      return res.json({ source: 'BrasilAPI', data: { cep: fmtCep(d), street: r.json.street || '', district: r.json.neighborhood || '', city: r.json.city || '', state: r.json.state || '' } });
    }
    if (tipo === 'cnpj') {
      if (!validCNPJ(d)) return res.status(400).json({ error: 'CNPJ inválido. Confira os números.' });
      if (key) {
        const r = await getJSON(`${DABRA}/consulta/receita-federal-pj?cnpj=${d}`, { 'X-API-Key': key });
        if (r.ok && r.json) return res.json({ source: 'Dabra', test: key.startsWith('dabra_test_'), data: normalize(r.json, 'cnpj') });
        if (r.status === 401 || r.status === 403) return res.status(502).json({ error: 'A chave da Dabra foi recusada. Confira DABRA_API_KEY na Vercel.' });
        if (r.status === 402) return res.status(502).json({ error: 'Saldo insuficiente na Dabra.' });
      }
      const wsTok = process.env.CNPJWS_TOKEN || '';
      const w = await getJSON(wsTok ? `https://comercial.cnpj.ws/cnpj/${d}` : `https://publica.cnpj.ws/cnpj/${d}`, wsTok ? { x_api_token: wsTok } : {});
      if (w.ok && w.json && w.json.razao_social) return res.json({ source: 'CNPJ.ws', data: fromCnpjWs(w.json) });
      if (w.status === 404) return res.status(404).json({ error: 'CNPJ não encontrado na Receita Federal.' });
      // CNPJ.ws fora do ar ou no limite de consultas: tenta a BrasilAPI
      const r = await getJSON(`https://brasilapi.com.br/api/cnpj/v1/${d}`);
      if (!r.ok || !r.json) return res.status(r.status === 404 ? 404 : 502).json({ error: r.status === 404 ? 'CNPJ não encontrado na Receita Federal.' : 'Muitas consultas seguidas. Aguarde um minuto e tente de novo.' });
      return res.json({ source: 'Receita Federal (BrasilAPI)', data: { ...normalize(r.json, 'cnpj'), regime: r.json.opcao_pelo_mei ? 'MEI' : r.json.opcao_pelo_simples ? 'Simples Nacional' : '' } });
    }
    if (tipo === 'cpf') {
      if (!validCPF(d)) return res.status(400).json({ error: 'CPF inválido. Confira os números.' });
      if (!key) return res.status(501).json({ error: 'A consulta de CPF precisa da chave da Dabra configurada. Preencha os dados manualmente por enquanto.' });
      const r = await getJSON(`${DABRA}/consulta/dados-cadastrais-basicos?cpf=${d}`, { 'X-API-Key': key });
      if (r.ok && r.json) return res.json({ source: 'Dabra', test: key.startsWith('dabra_test_'), data: normalize(r.json, 'cpf') });
      if (r.status === 401 || r.status === 403) return res.status(502).json({ error: 'A chave da Dabra foi recusada. Confira DABRA_API_KEY na Vercel.' });
      return res.status(404).json({ error: 'CPF não encontrado.' });
    }
    return res.status(400).json({ error: 'Tipo de consulta inválido.' });
  } catch (e) {
    return res.status(502).json({ error: 'O serviço de consulta não respondeu. Tente de novo em instantes.' });
  }
}
