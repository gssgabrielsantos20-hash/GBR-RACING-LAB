# GBR Racing Lab 5.5.1 — Ajustes solicitados em 16/10/2026

## Alterações executadas neste pacote
1. **Biblioteca de circuitos:** contador visual corrigido de **25** para **24 circuitos**.
2. **Duelos — rotações validadas:** painel de rotatividade atualizado para mostrar as Séries **10, 11 e 12**.
   - **Série 10:** Madri, Zandvoort, Austin - COTA e Suzuka.
   - **Série 11:** Shanghai, Monza, Monaco e Zandvoort.
   - **Série 12:** Monza, Abu Dhabi, Singapura e Jeddah.
3. **Garagem:** reparo de migração para reinserir **Russell Raro** caso esteja ausente em bases anteriores.
4. **Painel web:** o marcador "01" do hero foi substituído por uma **ilustração de carro de Fórmula 1** em SVG, sem dependência externa.
5. **Cache-busting:** referências de `race.css`, `app.js` e `gbr-intelligence.js` foram incrementadas para evitar cache antigo após publicação.

## Arquivos alterados
- `index.html`
- `race.css`
- `app.js`
- `gbr-intelligence.js`

## Observações de validação
- A **Série 10** foi marcada com aviso de revisão necessária, porque a referência comunitária consultada informava nova rotação prevista após 08/10/2026.
- As **Séries 11 e 12** permanecem com aviso de referência vigente dentro da janela quinzenal indicada pela fonte consultada.
- O reparo do Russell raro é **não destrutivo**: apenas garante a presença da carta quando ausente.

## Pacote resultante
- ZIP final: `GBR_Racing_Lab_5_5_1_PRONTO_PARA_PUBLICACAO.zip`

## Verificação adicional antes da publicação
- `_worker.js` reconstruído com os arquivos corrigidos, incluindo `index.html`, `app.js`, `race.css` e `gbr-intelligence.js`.
- Teste local das rotas `/`, `/index.html`, `/app.js`, `/gbr-intelligence.js`, `/race.css`, `/auditoria-imagens.html` e duas imagens; status HTTP 200 e bytes idênticos aos arquivos do pacote.
- `node --check` aprovado para o Worker e os scripts editados; integridade do ZIP aprovada.
- **Publicação Cloudflare ainda não realizada**: não declarar sucesso antes de novo deployment confirmado.
