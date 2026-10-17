# GBR Racing Lab 5.5.10 — Correções finais Zephyr + Worker

## Evidência de causa raiz
- `events-gp.js`, função `featuredHtml`: a seção `03 / Cartas em destaque` reutiliza `GBRCardArt.thumb` e passa `{name: 'Zephyr', rarity: 'Epic'}`. Não há renderizador especial da Zephyr neste módulo.
- `card-art.js`, objeto `partUrls` e função `getSource`: a peça não constava no mapeamento de referência da versão anterior, embora o AllClash tenha o arquivo [f1clash-frontwing-zephyr.jpg](https://www.allclash.com/wp-content/uploads/2026/04/f1clash-frontwing-zephyr.jpg).
- `_worker.js`: pacote anterior permitia acesso público a SQL, documentação e testes não utilizados pelo aplicativo.

## Intervenções
1. `card-art.js`: somente uma entrada do mapeamento foi adicionada: Zephyr → `frontwing-zephyr`.
2. `index.html` e `auditoria-imagens.html`: query version do `card-art.js` atualizada para evitar uso de JS antigo no navegador. O rodapé indica 5.5.10.
3. `_worker.js`: inventário de ativos HTTP restrito a HTML, JS, CSS, SVG, PNG, JPEG, JPG, WEBP, ICO e Webmanifest; todos os dados embutidos batem com os arquivos reais por bytes.
4. `MANIFEST_SHA256_5_5_10.json`: verificação local com hashes SHA-256 e tamanhos dos ativos públicos, não publicado em HTTP.
5. `tests/zephyr-event-image.test.js`: teste novo da URL, do thumb, da integração com o destaque de GP e da prioridade da imagem local.
6. `tests/legendary-worker-integrity.test.js`: casos negativos exigem 404 para rotas de SQL, testes, documentos, relatório, manifesto e `_worker.js`.
7. `docs/adr/0002-worker-ativos-publicos.md`: decisão de publicar apenas arquivos necessários.

## Impacto e segurança
A execução do frontend e a persistência continuam inalteradas; nenhuma tabela, migration, RLS, chave, permissão ou registro do Supabase foi modificado. Foto compartilhada da academia continua com prioridade sobre a referência do AllClash. A redução de rotas aplica negação por padrão; não substitui auditoria AppSec completa.

## Escalabilidade
Portão OK: catálogo estático, mudança de nome de URL só em cache de cliente, sem consulta extra a API; Worker continua stateless, previsível sob crescimento de tráfego.

## Estado da validação
Resultado final: 9/9 suítes de teste aprovadas; todos os scripts principais passaram em `node --check`; 54/54 ativos HTTP do Worker batem byte a byte com os arquivos e com o manifesto; HTML sem referências locais ausentes; 13 módulos funcionais anteriores idênticos byte a byte à base 5.5.9A. ZIP final verificado quanto à estrutura, CRC e integridade após compactação. Safari real autenticado é **não verificado**: navegação externa e por file:// está bloqueada pelo navegador automatizado deste ambiente.

## Fontes técnicas
1. Protocolo AppSec específico: não identificado nem acessível, portanto não afirmamos auditoria completa.
2. `arquiteto-de-software.txt`: menor superfície pública, reversibilidade e testes.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: causa raiz e intervenções locais.
4. `persona-planejadora.txt`: validação, limites e dependências; manuais adicionais não disponíveis para consulta neste contexto.

## Rollback
Reimplantar o ZIP 5.5.9A, sem alterar nenhuma garagem. Preservar o ZIP final para comparar hashes se necessário.
