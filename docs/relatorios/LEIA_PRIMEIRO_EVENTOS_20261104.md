# GBR Racing Lab — pré-publicação dos eventos (04/11/2026)

1. **Este ZIP contém o site completo**, incluindo `_worker.js`, `index.html`, Pódio Global e rotação S9–S12. O ZIP não foi publicado automaticamente.
2. Os dados de Las Vegas e Catar agora estão no módulo Eventos de GP. Os cartazes fornecidos foram incorporados em `assets/events/`.
3. O último deploy de produção consultado durante o preparo foi `d95d06ab-7310-440d-946d-028f78805e87`; ele pode servir como referência para rollback, caso permaneça disponível.
4. **Nunca substitua apenas o `events-gp.js` em uma implantação que usa `_worker.js` embutido**: o bundle atual precisa ser publicado integralmente.
5. Antes de trocar produção, confirme a correspondência com o site atualmente online, publique primeiro em homologação (quando possível) e valide em iPhone/Safari, conta logada e duas contas distintas.
6. Não há scripts de migração, novas tabelas, alterações de RLS ou segredos adicionados por esta entrega.
7. Ver relatório `RELATORIO_EVENTOS_LAS_VEGAS_CATAR_20261104.md` para detalhes e limitações.
