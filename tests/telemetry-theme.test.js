/* GBR Racing Lab — regressão de tema e assets. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'telemetry-theme.css'),'utf8');
assert.match(html,/telemetry-theme\.css/);
assert.match(css,/Racing\+Sans\+One/);
assert.match(css,/@media\(max-width:820px\)/);
for(const file of ['assets/telemetry/hero-racer.webp','assets/telemetry/hero-sidecar.webp'])assert.ok(fs.statSync(path.join(root,file)).size>1000);
console.log('OK: tema visual e imagens de telemetria disponíveis.');
