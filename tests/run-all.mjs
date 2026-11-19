#!/usr/bin/env node
// Executa todos os testes Node do pacote e resume o resultado (ADR 0025).
// Uso: node tests/run-all.mjs   (ou npm test)
// Sai com código 1 se algum teste falhar, para servir de portão antes de publicar.
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter(f => f.endsWith('.test.js')).sort();
const failed = [];
for (const file of files) {
  const run = spawnSync(process.execPath, [path.join(dir, file)], { encoding: 'utf8', timeout: 180000 });
  const ok = run.status === 0;
  if (!ok) failed.push({ file, detail: (run.stderr || run.stdout || '').split('\n').find(l => /Error|assert/i.test(l)) || '' });
  console.log(`${ok ? 'PASSOU' : 'FALHOU'}  ${file}`);
}
console.log(`\n${files.length - failed.length} de ${files.length} testes passaram.`);
for (const f of failed) console.log(`  - ${f.file}: ${f.detail.trim().slice(0, 160)}`);
process.exit(failed.length ? 1 : 0);
