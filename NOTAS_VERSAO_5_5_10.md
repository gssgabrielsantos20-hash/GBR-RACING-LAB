# GBR Racing Lab 5.5.10 — Catálogo de Pilotos Lendários

- Inclusão no catálogo de **22 pilotos lendários**, com todos os 15 anteriormente ausentes.
- Os pilotos aparecem na **Minha garagem** como **não possuídos** e **sem atributos ou série presumidos**. Cada jogador informa sua carta, seu nível, seus atributos e sua série quando necessário.
- A **Biblioteca Visual** identifica individualmente os 22 pilotos. A edição da foto legada de `D. Hill` continua disponível.
- Nomes abreviados como `G. Hill`, `D.Hill`, `G. Villeneuve` e `J. Villeneuve` são reconhecidos sem trocar os pilotos.
- Mapeamento de referência externa para **17 imagens previamente verificadas** no AllClash; imagens de Andretti, Mansell, Fittipaldi, Brabham e Fangio permanecem pendentes de verificação, disponíveis para upload pelo administrador.
- Cadastro por print aprimorado para os lendários.
- Atualização **não destrutiva**: dados da garagem, favoritos, fotos compartilhadas, duelos, pistas, eventos e avisos não são alterados ou removidos.

> Status: pacote de teste preparado. A publicação só ocorrerá após aprovação e implantação no Cloudflare. O navegador Safari real não foi testado nesta etapa.

## Ajustes finais para publicação (16/10/2026)

- **Zephyr:** a miniatura de asa dianteira agora usa a imagem `f1clash-frontwing-zephyr.jpg`, confirmada no AllClash (2026/04). O mesmo resolvedor compartilhado alimenta `03 / Cartas em destaque`, a garagem e os setups. Fotos previamente cadastradas na academia e overrides locais seguem com prioridade maior que a referência externa.
- **Worker seguro:** corrigida a exposição identificada na auditoria A-01. O Worker serve exclusivamente páginas, scripts, folhas de estilo e imagens do app. Arquivos de teste, SQL, documentos técnicos, relatórios e manifestos permanecem no pacote de auditoria, mas **não são servidos por HTTP**.
- **Cache:** revisões de URL do `card-art.js` atualizadas em `index.html` e `auditoria-imagens.html` para evitar a miniatura antiga no Safari.
- **Escopo:** nenhum bônus, dado de jogador, RLS, registro Supabase, setup salvo ou regra de evento foi alterado.
