/* GBR Racing Lab — regressões da composição do Painel Motorsport. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html'),code=read('dashboard-telemetry.js'),css=read('dashboard-telemetry.css');
for(const id of ['dashboard','dashStats','dashGpImage','dashTeamGrid','dashActivityList','teamsGrid','builder','favorites','event','garage','academy'])assert.ok(html.includes('id="'+id+'"'),id);
assert.ok(html.includes('dashboard-telemetry.js?v='));
assert.ok(html.includes('dashboard-telemetry.css?v='));
assert.ok(code.includes('window.F1App.getGarage'));
assert.ok(code.includes('window.GBREvents?.all'));
assert.ok(css.includes('hero-sidecar.webp'));
assert.ok(!code.includes(".from('garage_states"));
console.log('OK: Painel Motorsport e módulos antigos preservados.');
