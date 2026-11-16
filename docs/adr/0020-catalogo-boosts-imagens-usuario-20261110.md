# ADR 0020 — Identificação e imagens locais de seis boosts

**Status:** Aceito para pacote de prévia local  
**Data:** 10/11/2026

## Contexto
O usuário identificou os seis arquivos `BoostIcon_1.png` a `BoostIcon_6.png` como Autocontrole, Guerreiro, Lastro, Instinto, Sustentação Negativa e Hex. A aba `Boosts` da planilha F1 Clash 2026 Resource Sheet v1.1 contém os nomes canônicos e atributos correspondentes.

## Decisão
- Preservar os nomes PT-BR fornecidos pelo usuário para exibição e guardar o nome canônico da planilha em `canonicalName`.
- Copiar os seis PNG fornecidos pelo usuário para `assets/boosts/` sem modificar os pixels.
- Relacionar atributos da planilha: Self Control, Warrior, Ballast, Instinct, Downforce e Hex.
- Preservar o conflito documentado de Self Control: apenas Tyre Use +5 e Power Unit +5 são usados; item permanece `disputed` e fora do ranking.
- Não adicionar inventário, quantidades ou persistência de boosts.
- Não alterar Auth, Supabase, RLS ou dados remotos.

## Segurança e operação
Os caminhos locais são allowlisted por regex em `card-art.js`; nomes exibidos continuam escapados na UI. Worker estático é atualizado com as seis imagens e os três recursos JS/HTML modificados.

## Rollback
Restaurar `gbr-boost-catalog.js`, `card-art.js`, `index.html`, `_worker.js`, remover `assets/boosts/{autocontrole,guerreiro,lastro,instinct,downforce,hex}.png` e remover este ADR/teste/relatório. Nenhuma migração de dados necessária.

## Complemento — integração à Central de Eventos GP
O painel de boosts também é exibido abaixo do calendário na Central GP. A recomendação acompanha a pista/rodada selecionada e a categoria, sem reaproveitar clima de outra etapa ou outra pista. O ranking é gerado pelo catálogo existente; os nomes/imagens não são inventados. Recursos GP atualizados no Worker estático. Nenhuma persistência ou integração remota nova.
