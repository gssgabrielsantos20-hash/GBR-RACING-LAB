#!/usr/bin/env node
// GBR Racing Lab — sincronização reprodutível do payload do _worker.js.
//
// Por que existe: o _worker.js responde TODAS as rotas a partir de um mapa
// comprimido (gzip + Base64) embutido no próprio arquivo. Editar um .js/.css
// local sem regenerar esse mapa faz a produção continuar servindo a versão
// antiga (incidente de 18/11/2026: events-gp.js, gbr-pre-gp-ui.js e
// gbr-pre-gp-engine.js ficaram defasados).
//
// Regras:
// - Só atualiza o conteúdo de rotas que JÁ existem no payload. Rota nova apenas com
//   --add=caminho:content-type explícito (evita publicar docs, testes ou SQL por engano).
// - Preserva a ordem das rotas e o content-type ("t") de cada uma.
// - Não altera o código do Worker fora do literal `compressed`.
//
// Uso (a partir da raiz do pacote):
//   node tools/sincronizar-worker.mjs --check   # só verifica; sai com código 1 se divergir
//   node tools/sincronizar-worker.mjs --write   # regrava _worker.js com os arquivos locais
//   node tools/sincronizar-worker.mjs --write --add=assets/js/vendor/supabase.js:application/javascript
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workerPath = path.join(root, '_worker.js');
const mode = process.argv.includes('--write') ? 'write' : 'check';

const source = fs.readFileSync(workerPath, 'utf8');
const literal = /const compressed = `([^`]+)`;/;
const match = source.match(literal);
if (!match) {
  console.error('ERRO: literal `compressed` não encontrado em _worker.js. Nada foi alterado.');
  process.exit(2);
}

const map = JSON.parse(zlib.gunzipSync(Buffer.from(match[1].replace(/\s+/g, ''), 'base64')).toString('utf8'));
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');

// Inclusão EXPLÍCITA de rota nova (ADR 0023): --add=caminho/arquivo.js:content-type
// Só com --write; recusa docs, testes, ferramentas, SQL e Markdown, e exige que o arquivo exista.
const added = [];
for (const arg of process.argv.filter(a => a.startsWith('--add='))) {
  const spec = arg.slice('--add='.length);
  const cut = spec.lastIndexOf(':');
  const rel = spec.slice(0, cut).replace(/^\/+/, '');
  const type = spec.slice(cut + 1);
  const route = '/' + rel;
  if (cut < 1 || !type.includes('/')) { console.error('ERRO: use --add=caminho:content-type'); process.exit(2); }
  if (/^(docs|tests|tools)\/|\.(md|sql|mjs)$|\.\./.test(rel)) { console.error('ERRO: rota não pode ser pública: ' + route); process.exit(2); }
  if (!fs.existsSync(path.join(root, rel))) { console.error('ERRO: arquivo inexistente: ' + rel); process.exit(2); }
  if (mode !== 'write') { console.error('ERRO: --add exige --write'); process.exit(2); }
  if (map[route]) { console.log('Rota já existe (será apenas sincronizada): ' + route); continue; }
  map[route] = { t: type, b: '' };
  added.push(route);
  console.log('  NOVA ROTA ' + route + ' (' + type + ')');
}

const routes = Object.keys(map);
const divergent = [];
const missing = [];
for (const route of routes) {
  const file = path.join(root, route.replace(/^\//, ''));
  if (!fs.existsSync(file)) { missing.push(route); continue; }
  const local = fs.readFileSync(file);
  const served = Buffer.from(map[route].b, 'base64');
  if (sha(local) !== sha(served)) divergent.push({ route, local });
}

console.log(`Rotas no Worker: ${routes.length} | divergentes: ${divergent.length} | sem arquivo local: ${missing.length}`);
for (const d of divergent) console.log('  DIVERGENTE ' + d.route);
for (const m of missing) console.log('  SEM ARQUIVO LOCAL ' + m);

if (missing.length) {
  console.error('ERRO: há rotas sem arquivo local. Revisão humana obrigatória; nada foi alterado.');
  process.exit(2);
}
if (mode === 'check') process.exit(divergent.length ? 1 : 0);
if (!divergent.length && !added.length) { console.log('Nada a sincronizar.'); process.exit(0); }

for (const { route, local } of divergent) map[route] = { ...map[route], b: local.toString('base64') };
const packed = zlib.gzipSync(Buffer.from(JSON.stringify(map), 'utf8'), { level: 9 }).toString('base64');
const output = source.replace(literal, () => 'const compressed = `' + packed + '`;');
fs.writeFileSync(workerPath, output);
console.log(`_worker.js regravado: ${divergent.length} rota(s) atualizada(s), ${added.length} nova(s). SHA-256 do Worker: ${sha(Buffer.from(output))}`);
