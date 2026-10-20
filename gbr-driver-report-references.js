/* GBR R5 — carta conferida em relatório F1 Clash fornecido pelo usuário.
   NÃO altera catálogo externo, garagem, nem dados pessoais do adversário.
   Série da carta não é exibida no relatório, portanto foi omitida.
   Matching 4/5 é apenas SUGESTÃO a confirmar visualmente. */
(()=>{'use strict';
const cards=[{name:'Fangio',rarity:'Legendary',level:1,
 values:[76,67,79,70,73],source:'relatorio-f1clash-2026-10-17'}];
window.GBRDriverReportReferences=Object.freeze({cards:Object.freeze(cards.map(c=>Object.freeze({
 ...c,values:Object.freeze([...c.values])})))});
})();
