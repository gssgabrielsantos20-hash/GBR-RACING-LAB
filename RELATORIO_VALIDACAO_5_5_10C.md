# GBR Racing Lab 5.5.10C — Relatório de validação

## Evidência da causa raiz
No arquivo `card-art.js` da 5.5.10B, a função `thumb` criava `<img ... onerror="this.remove()">`. Qualquer erro de rede, URL inexistente ou rejeição da origem externa deixava só o losango/círculo. `events-gp.js` montava as imagens a partir das versões reais da garagem, mas `getImage()` retornar uma URL não confirmava que o navegador conseguiria carregá-la. A captura e a gravação do usuário demonstraram o problema em Bearman, Bortoleto e Tailwind na versão publicada.

## Mudanças
- `card-art.js`: argumentos opcionais para fallback de GP e rotina `tryNextImage`. Manteve a ordem de prioridade da Biblioteca Visual; impede referências genéricas inventadas para lendários sem URL confirmada.
- `events-gp.js`: convenção comum de nomes para as imagens locais do evento, válida para os próximos eventos sem reescrever o renderizador. Sem alterações de cálculo.
- `index.html`: cache busting nos dois scripts atualizados.
- `assets/events/featured/us-grand-prix-2026-*.webp`: cinco imagens (20–25 KB no total) extraídas do banner já incluído na versão 5.5.10B.
- `_worker.js`: recompilado a partir da lista restrita anterior; **59** recursos expostos (54 anteriores + 5 WebP). SQL, relatórios, testes e manifestos não são publicados pelo Worker.

## Testes locais executados
Comandos:
```
node tests/gp-image-fallback.test.js
node tests/us-event-featured-icons.test.js
node tests/zephyr-event-image.test.js
node tests/legendary-worker-integrity.test.js
# e todas as demais suítes tests/*.test.js
node --check card-art.js
node --check events-gp.js
node --check _worker.js
```
Resultado: **11/11 suítes passaram** e scripts com sintaxe válida. O teste de fallback simula um erro na primeira imagem e confirma a tentativa da próxima URL; valida também fotos compartilhadas/locais e as cinco artes do GP. A entrega integral dos bytes WebP e o bloqueio de rotas técnicas são verificados pelo teste do Worker e pela comparação direta do bundle.

## Comparação de regressão com o ZIP publicado 5.5.10B
- 99 arquivos intactos, 4 alterados (`card-art.js`, `events-gp.js`, `index.html`, `_worker.js`).
- 0 arquivos removidos.
- 5 imagens WebP, teste, manifesto e documentos adicionados.
- `app.js`, `cloud.js`, `favorites.js`, `favorites.css`, `garage-plus.js`, `catalog.js`, `legendary-drivers.js`, `gbr-intelligence.js`, Avisos, Baús e os demais arquivos de código anteriores permanecem idênticos.

## Segurança e limitações
- Nenhuma consulta a dados dos jogadores, sem alteração RLS ou Supabase.
- Imagens locais derivadas do asset promocional previamente incorporado ao aplicativo; as legendas representam destaques do evento, não indicam uma raridade específica para os pilotos.
- Próximos GPs seguem a mesma lógica de fallback sem mudança no renderizador; quando uma carta não tiver foto cadastrada, imagem WebP correspondente ou referência externa carregável, o ícone continuará como placeholder. Não é correto prometer fotografia de origem inexistente.
- Protocolo AppSec próprio do projeto não identificado/inacessível; revisão integral AppSec não verificada.
- Safari iPhone real não testado pela automação; validação após implantação recomendada.

## Rollback
Publicar novamente o ZIP `GBR_Racing_Lab_5_5_10B_EVENTOS_GP_PRONTO_PUBLICAR.zip` na branch `main` (ou usar rollback do deployment correspondente no Cloudflare). Nenhum rollback de banco é necessário.
