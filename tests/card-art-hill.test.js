/* T07/T12 — regressões da identidade visual de Graham e Damon Hill.
 * Teste isolado, sem rede ou escrita em Supabase. Execute com Node >= 20.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const storage = new Map();
const sandbox = {
  window: {},
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  document: { dispatchEvent() {}, visibilityState: 'visible' },
  CustomEvent: class CustomEvent {},
  setInterval: () => 1,
  clearInterval() {},
  URL,
  console
};
vm.runInNewContext(fs.readFileSync(path.join(root, 'card-art.js'), 'utf8'), sandbox, {
  filename: 'card-art.js', timeout: 1000
});
const art = sandbox.window.GBRCardArt;
assert.ok(art, 'O módulo GBRCardArt deve estar disponível');
const graham = { name: 'Graham Hill', rarity: 'Legendary', editionLabel: '' };
const damon = { name: 'Damon Hill', rarity: 'Legendary', editionLabel: '' };
const source = item => art.getSource(item, 'drivers');
const run = async (name, fn) => {
  await fn();
  console.log('OK — ' + name);
};
(async () => {
  await run('Graham e Damon usam imagens de referência diferentes', () => {
    assert.match(source(graham).url, /f1clash-driver-ghill-legendary\.jpg$/);
    assert.match(source(damon).url, /f1clash-driver-dhill-legendary\.jpg$/);
    assert.notEqual(source(graham).url, source(damon).url);
  });
  await run('Abreviações G. Hill e D. Hill permanecem separadas', () => {
    assert.equal(source({ ...graham, name: 'G. Hill' }).url, source(graham).url);
    assert.equal(source({ ...damon, name: 'D. Hill' }).url, source(damon).url);
  });
  await run('Sobrenome ambíguo não recebe uma imagem arbitrária', () => {
    assert.equal(source({ ...graham, name: 'Hill' }).origin, 'none');
    assert.equal(source({ ...graham, rarity: 'Epic' }).origin, 'none');
  });
  await run('Chaves de identificação não misturam pilotos/raridades', () => {
    assert.notEqual(art.overrideKey(graham, 'drivers'), art.overrideKey(damon, 'drivers'));
    assert.notEqual(art.overrideKey(graham, 'drivers'), art.overrideKey({ ...graham, rarity: 'Epic' }, 'drivers'));
  });
  await run('Override local de Graham não afeta Damon', () => {
    storage.set('gbr_visual_images_v53', JSON.stringify({
      [art.overrideKey(graham, 'drivers')]: 'https://images.example.test/graham.webp'
    }));
    assert.equal(source(graham).origin, 'local');
    assert.equal(source(damon).origin, 'reference');
  });
  await run('URL HTTP não é aceita como imagem local', () => {
    storage.set('gbr_visual_images_v53', JSON.stringify({
      [art.overrideKey(graham, 'drivers')]: 'http://images.example.test/unsafe.webp'
    }));
    assert.equal(source(graham).origin, 'reference');
  });
  await run('Imagem compartilhada prevalece apenas para a chave exata', async () => {
    const remoteUrl = 'https://images.example.test/shared-graham.webp';
    const client = {
      rpc: async () => ({ error: null, data: true }),
      from: () => ({ select: () => ({
        limit: async () => ({ error: null, data: [{
          card_key: art.overrideKey(graham, 'drivers'), image_url: remoteUrl
        }] })
      }) }),
      channel: () => ({ on() { return this; }, subscribe() { return this; } }),
      removeChannel: async () => {}
    };
    await art.connect({ client });
    assert.equal(source(graham).url, remoteUrl);
    assert.equal(source(graham).origin, 'shared');
    assert.equal(source(damon).origin, 'reference');
    art.disconnect();
  });
  await run('Editor de imagens e OCR listam ambos os pilotos', () => {
    const editor = fs.readFileSync(path.join(root, 'auditoria-imagens.js'), 'utf8');
    const ocr = fs.readFileSync(path.join(root, 'garage-plus.js'), 'utf8');
    for (const name of ['Graham Hill', 'Damon Hill']) {
      assert.ok(editor.includes(name), name + ' não encontrado no editor');
      assert.ok(ocr.includes(name), name + ' não encontrado no OCR');
    }
  });
  console.log('T07/T12: 8 verificações de regressão aprovadas.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
