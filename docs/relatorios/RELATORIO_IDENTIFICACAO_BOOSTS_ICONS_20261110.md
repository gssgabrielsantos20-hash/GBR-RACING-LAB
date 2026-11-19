# Relatório — identificação dos seis ícones de boosts

## Fontes utilizadas
- `boosts_icons.zip`: seis imagens originais numeradas; associação nominal confirmada pelo usuário na conversa.
- `F1 Clash 2026 Resource Sheet v1.1 by TR The Flash.xlsx`, aba `Boosts`: atributos e nomes canônicos.

## Mapeamento
| Arquivo original | Nome de exibição | Nome canônico | ID GBR | Atributos da aba Boosts |
|---|---|---|---|---|
| BoostIcon_1.png | Autocontrole | Self Control | self-control | Tyre Use +5; Cornering +5; Power Unit +5; existe conflito com relatório anterior, por isso permanece fora do ranking |
| BoostIcon_2.png | Guerreiro | Warrior | warrior | Overtaking +5; Defending +5; Speed +10 |
| BoostIcon_3.png | Lastro | Ballast | ballast | Race Start +5; Cornering +10; Pit Time +5 |
| BoostIcon_4.png | Instinto | Instinct | instinct | Race Start +10; Tyre Use +5; Power Unit +15 |
| BoostIcon_5.png | Sustentação Negativa | Downforce | downforce | Defending +10; Tyre Use +15; Cornering +5 |
| BoostIcon_6.png | Hex | Hex | hex | Overtaking +20; Speed +15; Pit Time +5 |

A planilha possui linhas repetidas/níveis para alguns boosts; os valores listados acima são o conjunto de atributos não nulos observado para o nome. A divergência de Self Control já estava documentada no catálogo e não foi resolvida por inferência.

## Implementação
- Seis imagens fornecidas pelo usuário foram copiadas sem transformação para `assets/boosts/`.
- Catálogo mantém nome PT-BR e `canonicalName` para rastreabilidade.
- `card-art.js` permite apenas caminho local que corresponda a `assets/boosts/<slug>.png`.
- Nenhuma quantidade, inventário ou consumo adicionado.
- Nenhuma alteração em banco, autenticação, RLS ou dados remotos.

## Validação
Executar `node tests/boosts-user-icons-20261110.test.js`, `node --check` nos JS alterados e `node tests/mega-worker-20261029.test.js`.

## Resultado dos testes (execução após implementação)
- APROVADO: `node tests/boosts-user-icons-20261110.test.js`
- APROVADO: `node tests/boosts-catalog-20261105.test.js`
- APROVADO: `node tests/boosts-real-images-20261105.test.js`
- APROVADO: `node tests/boosts-worker-assets-20261110.test.js`


## Correção complementar — recomendações dentro dos Eventos GP
Foi identificado que a entrega anterior integrou os boosts na biblioteca de pistas, mas não adicionou o painel ao calendário da Central de Eventos GP. Correção aplicada:
- `events-gp.js`: painel de recomendações abaixo do calendário, ligado à pista/rodada, etapa e categoria selecionadas; utiliza o foco carro/piloto de `GBRCore.TRACK_SERIES` e os atributos do `GBRBoostCatalog`.
- `events-gp.css`: apresentação responsiva das recomendações e miniaturas locais.
- `index.html`: cache-busting dos recursos GP.
- `_worker.js`: manifesto estático atualizado para incluir os novos bytes e manter a prévia consistente.
- Sem inventário, quantidades, gravação de dados, mudanças em Auth/Supabase/RLS ou deploy.

Validação complementar:
- `node tests/gp-event-track-boosts-20261110.test.js` — aprovado.
- `node tests/gp-context-stage-20261107.test.js` — 5/5 aprovados.
- `node tests/eventos-las-vegas-catar-20261104.test.js` — aprovado.
- `node tests/worker-events-smoke-20261104.test.js` — aprovado.
- `node --check events-gp.js` — aprovado.
