// GBR Racing Lab — GBR Racing Lab 5.0 — teste em homologação
// Limpa caches antigos em atualizações do PWA; sem armazenamento offline de dados pessoais.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(
 caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('gbr-racing-lab-')).map(key => caches.delete(key)))).then(() => self.clients.claim())
));
