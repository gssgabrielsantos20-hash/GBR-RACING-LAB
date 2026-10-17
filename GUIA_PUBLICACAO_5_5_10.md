# GBR Racing Lab 5.5.10 — Publicação oficial

## O que este pacote contém
- Catálogo não destrutivo com **22 pilotos lendários**, 15 novos em relação à base anterior.
- Correção da imagem da **Zephyr** em Cartas em destaque, usando imagem confirmada do AllClash.
- Worker com **somente os 54 ativos públicos necessários**, sem expor arquivos auxiliares.
- Cards compactos da 5.5.9A, Setups Salvos e demais módulos anteriores preservados.

## Procedimento
1. Fazer backup do ZIP 5.5.9A atualmente publicado, para rollback.
2. No Cloudflare Dashboard, abrir **Workers & Pages → gbr-racing-lab**.
3. Preferir primeiro implantação **preview** de `GBR_Racing_Lab_5_5_10_DEFINITIVA_ZEPHYR_WORKER_CORRIGIDO.zip` para validar Safari/iPhone.
4. Conferir **Eventos GP → Nightmare Fuel → 03 / Cartas em destaque**. Zephyr deve exibir a imagem da asa dianteira, sem afetar o selo de bônus do evento.
5. Conferir **Minha garagem → Pilotos → Legendary** e a Biblioteca Visual, assegurando que os 22 nomes estão disponíveis sem auto-marcar posse.
6. Se aprovado, criar deployment da mesma versão na branch `main` e confirmar status **Success**.
7. Só então publicar o comunicado 5.5.10 na Central de Avisos da Academia.

## Validação negativa importante
As seguintes rotas precisam retornar HTTP 404:
- `/MIGRACAO_BIBLIOTECA_VISUAL_5_4.sql`
- `/tests/favorites-model.test.js`
- `/docs/adr/0001-lendarios-2026.md`
- `/RELATORIO_CATALOGO_LENDARIOS_5_5_10.md`
- `/MANIFEST_SHA256_5_5_10.json`

## Reversão
Reimplantar `GBR_Racing_Lab_5_5_9A_CARDS_COMPACTOS_TESTE_IPHONE.zip` na branch `main`. Nenhuma migração SQL ou alteração nos dados da garagem é necessária ou executada pela instalação desta versão.

## Limitações
O teste no Safari autenticado e a disponibilidade da imagem em cada rede/dispositivo ainda precisam ser confirmados após o deployment de preview. A publicação no Cloudflare não é feita por este ZIP automaticamente.
