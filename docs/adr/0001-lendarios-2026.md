# ADR 0001 — Pilotos lendários e aliases (2026)

**Status:** proposto para implantação na 5.5.10.

## Contexto
O catálogo estático da Resource Sheet contém 66 pilotos de raridades padrão, mas não cobre 22 lendários. Os nomes abreviados produziam associações visuais incorretas.

## Decisão
Acrescentar um módulo frontend independente `legendary-drivers.js` com um registro por piloto lendário, lista controlada de aliases e URLs de imagem apenas quando previamente verificadas. As cartas ficam inicialmente não possuídas, com nível e atributos zero e série 0 (não informada). A migração evita duplicatas pelos aliases e respeita exclusões.

## Alternativas
- Duplicar os 22 registros em `app.js`, `card-art.js`, `auditoria-imagens.js` e `garage-plus.js`: rejeitada por risco de divergência entre telas.
- Criar uma nova tabela Supabase: rejeitada por acrescentar infraestrutura e políticas para um catálogo de 22 nomes estáticos.

## Consequências
- Sem consultas extras nem mudança de RLS.
- Necessário carregar o módulo antes dos consumidores em todas as páginas.
- As imagens não confirmadas permanecem editáveis manualmente; não inventar URLs.

## Escala e reversibilidade
Custo O(22) por inicialização, sem novas operações de rede. Mudança reversível por reimplantação do ZIP anterior. Rever se passarmos a precisar de administração online, versões dinâmicas do catálogo ou metadados oficiais verificáveis.
