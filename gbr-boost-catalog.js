/* GBR Racing Lab 6 — catálogo de recomendação e catálogo visual de boosts, 09/11/2026.
   Números publicamente observáveis em guias comunitários; confirmar no jogo.
   Modelo próprio do GBR, sem rankings de terceiros, acesso remoto ou estoque presumido.
   NÃO atribuir níveis/raridades, elegibilidade por série ou quantidade sem evidência. */
(()=>{
 'use strict';
 const verifiedOn='2026-11-05';
 const ATTRS=Object.freeze({overtaking:'Ultrapassagem',defending:'Defesa',raceStart:'Largada',tyreUse:'Gerenciamento de pneus',speed:'Velocidade',corner:'Curvas',power:'Unidade de potência',pitStop:'Tempo de Pit Stop'});
 const s5='https://www.allclash.com/beat-series-5-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/';
 const s10='https://www.allclash.com/beat-series-10-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/';
 const s11='https://www.allclash.com/beat-series-11-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/';
 const s12='https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/';
 const gp='https://www.allclash.com/f1-clash-sao-paulo-spectacular-2026-guide-junior-challenger-contender-champion/';
 // Catálogo visual independente: 65 nomes distintos da aba "Boosts" da planilha do usuário.
 // Não amplia o motor de recomendação: DATA abaixo continua com 11 itens e os mesmos atributos.
 // URLs AllClash ficam apenas como metadados de auditoria; não fazer hotlink nem copiar para Storage/Supabase.
 // imageReferencePermission permanece not_verified; publicação compartilhada exige arquivo autorizado.
 const VISUAL_DATA=Object.freeze([
  {
    "id": "ballast",
    "name": "Ballast",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-ballast.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-ballast.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "butterfly",
    "name": "Butterfly",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-butterfly.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-butterfly.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "champion",
    "name": "Champion",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-champion.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "christmas",
    "name": "Christmas",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-christmas.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-christmas.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-4-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "confetti",
    "name": "Confetti",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-confetti.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "cranberry",
    "name": "Cranberry",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-cranberry.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-cranberry.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-8-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "crown",
    "name": "Crown",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-crown.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "cuppa",
    "name": "Cuppa",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-cuppa.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-cuppa.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "dead-fast",
    "name": "Dead Fast",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-dead-fast.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-dead-fast.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "djinn",
    "name": "Djinn",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-djinn.png",
    "imageReferencePage": "https://www.allclash.com/f1-clash-sao-paulo-spectacular-2026-guide-junior-challenger-contender-champion/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "downforce",
    "name": "Downforce",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-downforce.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-downforce.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "dragon",
    "name": "Dragon",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-dragon.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-dragon.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "eagle",
    "name": "Eagle",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eagle.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eagle.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "eclipse",
    "name": "Eclipse",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eclipse.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eclipse.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "eggcepton",
    "name": "Eggcepton",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eggcepton.png",
    "imageReferencePage": "https://www.allclash.com/f1-clash-sao-paulo-spectacular-2026-guide-junior-challenger-contender-champion/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "eternal-flame",
    "name": "Eternal Flame",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eternal-flame.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eternal-flame.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "feral",
    "name": "Feral",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-feral.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "firework",
    "name": "Firework",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-firework.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-firework.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-4-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "frost",
    "name": "Frost",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-frost.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-frost.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "full-send",
    "name": "Full Send",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-full-send.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-full-send.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "genesis",
    "name": "Genesis",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-genesis.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-genesis.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-4-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "ghoulfuel",
    "name": "Ghoulfuel",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-ghoulfuel.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-5-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "gladiator",
    "name": "Gladiator",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-gladiator.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-gladiator.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "glitz",
    "name": "Glitz",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-glitz.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-glitz.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-8-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "handlebar",
    "name": "Handlebar",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-handlebar.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-handlebar.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-4-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "heartbreaker",
    "name": "Heartbreaker",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-heartbreaker.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "herald",
    "name": "Herald",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-herald.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-herald.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "hex",
    "name": "Hex",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-hex.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-hex.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "hook",
    "name": "Hook",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-hook.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-hook.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-6-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "impact",
    "name": "Impact",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-impact.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-impact.png",
    "imageReferencePage": null,
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "instinct",
    "name": "Instinct",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-instinct.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-instinct.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "iron-force",
    "name": "Iron Force",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-iron-force.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-iron-force.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "kawaii",
    "name": "Kawaii",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-kawaii.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-kawaii.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-7-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "launch-pad",
    "name": "Launch Pad",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-launch-pad.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "livewire",
    "name": "Livewire",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-livewire.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "lumberjack",
    "name": "Lumberjack",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-lumberjack.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-lumberjack.png",
    "imageReferencePage": null,
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "merlion",
    "name": "Merlion",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-merlion.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-8-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "movember",
    "name": "Movember",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-movember.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-movember.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-6-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "nazar",
    "name": "Nazar",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-nazar.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-nazar.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "oud",
    "name": "Oud",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-oud.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-oud.png",
    "imageReferencePage": null,
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "overcharge",
    "name": "Overcharge",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-overcharge.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-overcharge.png",
    "imageReferencePage": null,
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "palm",
    "name": "Palm",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-palm.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "pretzel",
    "name": "Pretzel",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-pretzel.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-pretzel.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "prince",
    "name": "Prince",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-prince.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-prince.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-7-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "pumpkin",
    "name": "Pumpkin",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-pumpkin.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-pumpkin.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "rainbow",
    "name": "Rainbow",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rainbow.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rainbow.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-4-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "reindeer",
    "name": "Reindeer",
    "imageReferenceUrl": null,
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-reindeer.png",
    "imageReferencePage": "https://www.allclash.com/f1-clash-mexico-city-grand-prix-2026-guide-junior-challenger-contender-champion/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "rookie-reload",
    "name": "Rookie Reload",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rookie-reload.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rookie-reload.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-5-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "rookie-rush",
    "name": "Rookie Rush",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rookie-rush.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rookie-rush.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "rooster",
    "name": "Rooster",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rooster.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-rooster.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "samba",
    "name": "Samba",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-samba.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-samba.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-5-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "schooner",
    "name": "Schooner",
    "imageReferenceUrl": null,
    "candidateUrl": null,
    "imageReferencePage": null,
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "self-control",
    "name": "Self Control",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-self-control.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-self-control.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "skull",
    "name": "Skull",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-skull.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-skull.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-4-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "street-shark",
    "name": "Street Shark",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-street-shark.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-street-shark.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "surf",
    "name": "Surf",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-surf.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-surf.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "taurus",
    "name": "Taurus",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-taurus.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-taurus.png",
    "imageReferencePage": "https://www.allclash.com/f1-clash-sao-paulo-spectacular-2026-guide-junior-challenger-contender-champion/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "timeless",
    "name": "Timeless",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-timeless.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-timeless.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-7-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "tire-water",
    "name": "Tire Water",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-tire-water.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-tire-water.png",
    "imageReferencePage": null,
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200_parser_unverified",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "tsar",
    "name": "Tsar",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-tsar.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-tsar.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-3-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "tulip",
    "name": "Tulip",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-tulip.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-tulip.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-6-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "tune-in",
    "name": "Tune-In",
    "imageReferenceUrl": null,
    "candidateUrl": null,
    "imageReferencePage": null,
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_404",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "unstoppable",
    "name": "Unstoppable",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-unstoppable.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-unstoppable.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-4-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "vice",
    "name": "Vice",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-vice.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-vice.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-6-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  },
  {
    "id": "warrior",
    "name": "Warrior",
    "imageReferenceUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-warrior.png",
    "candidateUrl": "https://www.allclash.com/wp-content/uploads/2026/10/f1booster-warrior.png",
    "imageReferencePage": "https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/",
    "imageReferenceCheckedOn": "2026-11-09",
    "imageReferencePermission": "not_verified",
    "imageReferenceStatus": "http_200",
    "imageReferenceSource": "AllClash"
  }
].map(x=>Object.freeze(x)));
 const visualById=new Map(VISUAL_DATA.map(x=>[x.id,x]));
 const visualByName=new Map(VISUAL_DATA.map(x=>[x.name.toLocaleLowerCase('pt-BR'),x]));
 function getVisual(value){
  const key=String(value??'').trim();
  return visualById.get(key)||visualByName.get(key.toLocaleLowerCase('pt-BR'))||null;
 }
 // Só os atributos cujos valores constam no relatório de auditoria; os ausentes
 // não recebem zero inventado e não entram no cálculo.
 const DATA=[
  {id:'butterfly',name:'Butterfly',aliases:[],stats:{tyreUse:20,power:25,pitStop:5},source:s10},
  {id:'pretzel',name:'Pretzel',aliases:[],stats:{tyreUse:25,power:15,pitStop:10},source:s10},
  {id:'eclipse',name:'Eclipse',aliases:[],stats:{overtaking:15,speed:25,pitStop:10},source:s11},
  {id:'surf',name:'Surf',aliases:[],stats:{raceStart:25,power:20,tyreUse:5},source:s12},
  {id:'dragon',name:'Dragon',aliases:[],stats:{overtaking:20,power:15,tyreUse:15},source:gp},
  // Valores publicados em 05/11 em tabela pública da Série 5.
  // Self Control: divergência do relatório (Pit Stop +5) com a tabela viva
  // (Curvas +5). Preservar só os dois campos coincidentes e excluir do ranking
  // até conferência por captura do jogo. NUNCA completar com zero.
  {id:'self-control',name:'Autocontrole',canonicalName:'Self Control',aliases:[],localAsset:'assets/boosts/autocontrole.png',stats:{tyreUse:5,power:5},source:s5,shop:true,disputed:true,dispute:'Terceiro atributo: Curvas ou Pit Stop — a confirmar'},
  {id:'ballast',name:'Lastro',canonicalName:'Ballast',aliases:[],localAsset:'assets/boosts/lastro.png',stats:{raceStart:5,corner:10,pitStop:5},source:s5,shop:true},
  {id:'downforce',name:'Sustentação Negativa',canonicalName:'Downforce',aliases:[],localAsset:'assets/boosts/downforce.png',stats:{tyreUse:15,defending:10,corner:5},source:s5,shop:true},
  {id:'warrior',name:'Guerreiro',canonicalName:'Warrior',aliases:[],localAsset:'assets/boosts/guerreiro.png',stats:{overtaking:5,defending:5,speed:10},source:s5,shop:true},
  {id:'instinct',name:'Instinto',canonicalName:'Instinct',aliases:[],localAsset:'assets/boosts/instinct.png',stats:{tyreUse:5,power:15,raceStart:10},source:s5,shop:true},
  {id:'hex',name:'Hex',canonicalName:'Hex',aliases:[],localAsset:'assets/boosts/hex.png',stats:{overtaking:20,speed:15,pitStop:5},source:s5,shop:true}
 ];
 // URLs AllClash abaixo são LINKS DE REFERÊNCIA, não fontes de imagem do app.
 // Permissão de reutilização não verificada: nunca usar como imageSrc, hotlink ou upload.
 // A biblioteca compartilhada (GBRCardArt) é consultada pelo identificador/nome;
 // fontes estáticas próprias só podem ser adicionadas depois de aprovadas.
 const items=Object.freeze(DATA.map(d=>{
  const visual=getVisual(d.id);
  return Object.freeze({...d,aliases:Object.freeze(d.aliases),stats:Object.freeze(d.stats),imageSrc:null,
   imageReferenceUrl:visual?.imageReferenceUrl||null,imageReferencePage:visual?.imageReferencePage||null,
   imageReferenceCheckedOn:visual?.imageReferenceCheckedOn||'2026-11-09',
   imageReferencePermission:visual?.imageReferencePermission||'not_verified',
   verifiedOn,confidence:'referencia_comunitaria_pendente_validacao_no_jogo'});
 }));
 const byId=Object.freeze(Object.fromEntries(items.map(x=>[x.id,x])));
 const CAR=Object.freeze({speed:'speed',corner:'corner',power:'power',qualifying:'speed'});
 const DRIVER=Object.freeze({overtaking:'overtaking',defending:'defending',raceStart:'raceStart',tyreUse:'tyreUse',qualifying:'raceStart'});
 function estimate(item,ctx={}){
  // Heurística independente e explícita, NÃO validada por resultados de corrida.
  // Foco carro/piloto 1x cada, conservação 0,25x, pit 0,1x.
  const carKey=CAR[ctx.car],driverKey=DRIVER[ctx.driver],stats=item.stats;
  return (carKey&&Number.isFinite(stats[carKey])?stats[carKey]:0)
   +(driverKey&&Number.isFinite(stats[driverKey])?stats[driverKey]:0)
   +(Number(stats.tyreUse)||0)*.25+(Number(stats.pitStop)||0)*.10;
 }
 function rank(ctx={},options={}){
  // Recomendação independente de posse, quantidade ou consumo.
  // Ordena somente atributos publicados; dados conflitantes ficam fora.
  return items.filter(item=>!item.disputed && (!options.shopOnly||item.shop) && (!options.tyreOnly||Number.isFinite(item.stats.tyreUse)&&item.stats.tyreUse>0)).map(item=>({
   id:item.id,name:item.name,stats:item.stats,source:item.source,reviewedOn:item.verifiedOn,
   score:estimate(item,ctx),confidence:item.confidence
  })).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'pt-BR'));
 }
 const api=Object.freeze({version:'2026-11-10-track-recommendations',items,visualItems:VISUAL_DATA,attributes:ATTRS,get:id=>Object.prototype.hasOwnProperty.call(byId,id)?byId[id]:null,getVisual,rank});
 if(typeof window!=='undefined')window.GBRBoostCatalog=api;
})();
