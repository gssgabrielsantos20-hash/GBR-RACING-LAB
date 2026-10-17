# GBR Racing Lab 5.5.10B — correção estrutural dos ícones em Eventos GP

## Problema identificado
No bloco **03 / Cartas em destaque**, alguns GPs exigiam ajustes manuais após publicação porque a renderização das miniaturas dependia de objetos incompletos:

- pilotos de evento com raridade `any` eram enviados ao resolvedor sem uma variante concreta de imagem;
- peças destacadas sem mapeamento explícito em `card-art.js` ficavam sem miniatura;
- a checagem `Cadastrado na garagem` para pilotos marcava qualquer piloto destacado do evento, em vez do piloto correto da linha.

## Correção aplicada
### Arquivo: `card-art.js`
- adicionado fallback estrutural para **peças**, derivando o slug da imagem a partir de `categoria + nome` (ex.: `Asa traseira + Tailwind` → `rearwing-tailwind`);
- adicionado fallback estrutural para **pilotos**, aceitando raridade flexível (`any`) e tentando variantes conhecidas como **Escolhas do Paddock**, Rare, Epic, Legendary e Common;
- adicionada blindagem para não confundir **nome de peça** com **piloto**.

### Arquivo: `events-gp.js`
- criada resolução do item visual real para o card destacado, usando a base da garagem em vez de um objeto sintético incompleto;
- corrigida a lógica de ownership para pilotos, agora validando o piloto correto da linha;
- o HTML do bloco destacado passou a usar o item resolvido, preservando compatibilidade com futuras publicações de evento.

### Arquivo: `index.html`
- atualizados os query strings de `card-art.js` e `events-gp.js` para forçar refresh após a publicação.

## Evidência de validação
### Testes executados
- `tests/zephyr-event-image.test.js` ✅
- `tests/us-event-featured-icons.test.js` ✅
- `node -c card-art.js` ✅
- `node -c events-gp.js` ✅

## Resultado esperado
- GP dos Estados Unidos: Oliver Bearman, Gabriel Bortoleto e Tailwind exibem miniaturas corretamente.
- Próximos GPs com pilotos `any` e peças da base passam a resolver ícones sem exigir correção manual por evento.
