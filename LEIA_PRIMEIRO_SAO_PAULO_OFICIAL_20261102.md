# GBR Racing Lab — Pit Wall + GP de São Paulo oficial — 02/11/2026

## Status

Este ZIP contém o site completo para **homologação**, não um patch isolado. **Nenhuma implantação ou alteração de GitHub/Supabase foi feita por esta atualização local.** Base preservada: `GBR_RACING_LAB_PIT_WALL_4_FASES_NOVEMBRO_2026_PREVIA(1).zip` (arquivo anexado pelo responsável).

## Mudanças verificadas no evento

- Período das etapas **4 a 8 de novembro de 2026**, conforme confirmação posterior do responsável (o banner do print antigo indica 4–9; divergência documentada no ADR 0008).
- **Classificatória (04–06/11):** São Paulo (9 voltas, 0%, 26–30 °C); Abu Dhabi (8, 0%, 26–30 °C); Suzuka (7, 100%, 18–22 °C); Zandvoort (8, 0%, 24–28 °C).
- **Abertura (07/11):** São Paulo (9, 0%, 26–30 °C); Xangai (7, 0%, 22–24 °C); Abu Dhabi (8, 0%, 26–30 °C); Spa (6, 0%, 22–24 °C); Suzuka (7, 100%, 18–22 °C); Silverstone (8, 0%, 22–23 °C); Zandvoort (8, 0%, 24–28 °C); São Paulo (9, 0%, 26–30 °C).
- **Final (08/11):** mesmas oito corridas da Abertura, na mesma ordem e com as mesmas voltas, chuva e temperaturas, conforme confirmação explícita do responsável. Não há pendências de sequência nesta etapa.
- **Patrocinador:** Júnior (Zephyr 5+: +2 troféus, 3 mil moedas, +3 pontos); Competidor (Zephyr 7+: +3, 40 mil, +4); Contendor (Barrichello Lendário 1+: +4, 500 mil, +5); Campeão (Barrichello Lendário e/ou Eco Cell+ 1+: +6 pontos por etapa mostrada). O jogo solicita usar ao menos um dos recursos indicados. **Não se presume +12 pontos pelo uso dos dois.**
- Bônus original +10%, Samba, pilotos lendários e especiais permitidos: preservados.

### Arquivos alterados

- `events-gp.js`: dados e etapas oficiais, seletor responsivo por prova, notas de confiabilidade e premiações.
- `events-gp.css`: três etapas responsivas para iPhone/desktop.
- `gbr-pit-wall.js`: referência corrigida ao calendário confirmado no módulo de planejamento.
- `_worker.js` e `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json`: recursos reconstruídos e SHA-256 atualizados; **193 recursos públicos** preservados.
- `tests/sao-paulo-calendario-oficial-20261102.test.js`: teste de regressão atualizado; dois testes anteriores atualizados para terminologia e contexto de fonte.
- `docs/adr/0008-sao-paulo-datas-final-fixa-20261102.md`: decisão corrigida, riscos e rollback.

### Validação essencial

- `node --check` em todos os `.js` públicos do pacote.
- Os seis testes em `tests/*.test.js` devem passar, incluindo verificação byte a byte do Worker e negação de rotas não públicas.
- Teste visual no Safari e login real: **não verificado**. Conferir na prévia antes de atualizar a produção.

### Publicação segura e rollback

Teste em uma implantação isolada, como o projeto `gbr-racing-lab-homologacao`, sem substituir a produção. Faça login no iPhone e abra **Pistas → Eventos de GP → São Paulo**. Mude entre Classificatória / Abertura / Final; confira Suzuka 100% e a Final com oito provas na mesma ordem da Abertura. Verifique o Pit Wall e o calendário `.ics` com último dia 8 (DTEND exclusivo em 9/11).

Rollback: reimplante o ZIP original enviado `GBR_RACING_LAB_PIT_WALL_4_FASES_NOVEMBRO_2026_PREVIA(1).zip`. Garagem/Supabase não sofrem migration, e seus dados não devem ser sobrescritos.
