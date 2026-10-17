# Guia de homologação — 5.5.12

1. Publique o ZIP em **Cloudflare Pages → criar implantação de prévia**, sem trocar a branch `main`.
2. No iPhone, abra **Mais → Meus setups** e toque em **IMPORTAR PRINTS**.
3. Escolha o print das sete peças e o print da dupla de pilotos. A leitura OCR acontece localmente no navegador; é preciso internet para baixar o mecanismo Tesseract na primeira utilização.
4. Clique em **Ler e identificar**. Confira quais nomes foram sugeridos; se aparecer campo sem sugestão, escolha-o manualmente na próxima tela.
5. Toque **Revisar seleção no editor**. Verifique categoria, **raridade, nível e atributos da garagem**, nome e pista. São dados da garagem, não valores automaticamente copiados do print.
6. Salve e confirme o favorito em **Meus setups**. Feche e reabra para confirmar que persiste. Para confirmar sincronização entre aparelhos, aguarde o indicador de garagem sincronizada.
7. Teste um print incompleto, uma carta não possuída, limite de oito favoritos e **Preencher manualmente** caso o OCR não carregue.
8. Confira os cards compactos e a ausência de corte no Safari, inclusive títulos e botões.

**Não publique em produção se houver falha de confirmação, duplicação involuntária, imagem armazenada por engano ou associação ambígua de pilotos.** Para reverter, reimplante o ZIP 5.5.11E.
