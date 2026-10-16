/* Auth 5.5.9A — regressão fail-closed no bootstrap da PWA.
 * Sem rede, credenciais reais ou gravação no banco.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'cloud.js'), 'utf8');
const prefix = 'async function verifiedSessionUser(session){';
const start = source.indexOf(prefix);
assert.ok(start >= 0, 'Guarda de identidade deve existir em cloud.js');
assert.equal(source.indexOf(prefix, start + 1), -1, 'Uma única guarda de identidade');
const end = source.indexOf('\n}', start);
assert.ok(end > start, 'Guarda deve encerrar com bloco esperado');
const definition = source.slice(start, end + 2);

function makeGuard(getUser) {
  const client = { auth: { getUser } };
  return vm.runInNewContext('(' + definition + ')', { client });
}
const session = { user: { id: 'user-a', email: 'ficticio@example.test' } };
async function check() {
  let count = 0;
  async function test(title, fn) {
    await fn();
    console.log('OK: ' + title);
    count++;
  }

  await test('Identidade validada vem do servidor Auth, não do armazenamento', async () => {
    const serverUser = { id: 'user-a', email: 'atualizado@example.test' };
    const verified = await makeGuard(async () => ({ data: { user: serverUser }, error: null }))(session);
    assert.equal(verified.email, 'atualizado@example.test');
    assert.notEqual(verified, session.user);
  });
  await test('Sessão ausente retorna nulo sem consultar o servidor', async () => {
    const guard = makeGuard(async () => { throw Error('getUser não deveria ser chamado'); });
    assert.equal(await guard(null), null);
    assert.equal(await guard({ user: {} }), null);
  });
  await test('Usuário devolvido com ID diferente não entra na área privada', async () => {
    const guard = makeGuard(async () => ({ data: { user: { id: 'user-b' } }, error: null }));
    await assert.rejects(() => guard(session), /Sessão inválida ou expirada/);
  });
  await test('Token expirado ou rejeitado impede a entrada', async () => {
    const guard = makeGuard(async () => ({ data: { user: null }, error: new Error('Invalid JWT') }));
    await assert.rejects(() => guard(session), /Invalid JWT/);
  });
  await test('Resposta Auth sem identidade válida impede a entrada', async () => {
    const guard = makeGuard(async () => ({ data: { user: null }, error: null }));
    await assert.rejects(() => guard(session), /Sessão inválida ou expirada/);
  });
  await test('Erro de rede não vira acesso autorizado', async () => {
    const guard = makeGuard(async () => { throw new Error('Network unavailable'); });
    await assert.rejects(() => guard(session), /Network unavailable/);
  });
  await test('Bootstrap utiliza identidade verificada antes de startSession', async () => {
    assert.match(source, /else if\(session\?\.user\)\s*\{\s*const verifiedUser=await verifiedSessionUser\(session\);[\s\S]*?await startSession\(verifiedUser\)/);
    assert.doesNotMatch(source, /await startSession\(session\.user\)/);
  });
  await test('Recuperação de senha e saída continuam preservadas', async () => {
    assert.match(source, /client\.auth\.getSession\(\)/);
    assert.match(source, /if\(recoveryMode\)/);
    assert.match(source, /client\.auth\.signOut\(\)/);
    assert.match(source, /event==='SIGNED_OUT'/);
  });
  console.log(count + ' regressões da guarda de sessão verificadas.');
}
check().catch(e => { console.error(e); process.exitCode = 1; });
