# GBR Racing Lab — Modo Pódio Global, 04/11/2026

**Este pacote é uma versão completa de PRÉVIA, sem deploy automático.** A base enviada estava identificada como prévia. **Não publicar na produção sem homologação no iPhone/Safari, teste com duas contas e aprovação explícita.**

## O que mudou

1. Novo módulo em **Pit Wall → Modo Pódio Global**, em desktop e no menu **Mais → Pit Wall GBR** no celular.
2. Cadastro manual de bots ou jogadores observados no GP: evento, categoria, pista, etapa, corrida, data, largada, chegada, duas cartas de pilotos; opcionais: até sete peças, pneus, paradas, posições perdidas no pit e por desgaste, liderança, melhor volta e nota.
3. Relatório **global por categoria/série**, abrangendo todos os eventos e pistas, isolando bots dos jogadores e Duelos. Taxa de pódio usa como denominador todos os bots que você cadastrou, inclusive os que não chegaram ao Top 3.
4. Três perfis observacionais e alternativas de dupla de pilotos da própria garagem, apenas com regras do GP confirmadas e amostra adequada. Peças continuam oriundas do Engenheiro de GP. **Não há leitura automática do jogo, predição de vitória nem números inventados.**
5. `gpPodiumObservations` é um campo novo no JSON individual da garagem; acompanha backup e sincronização existente. Não houve migrações SQL, alterações de autenticação ou RLS.

## Como homologar

1. Faça backup da garagem, salve o ZIP atual e use ambiente Cloudflare de **homologação**, não o projeto de produção.
2. Faça login com uma conta e abra **Pit Wall → Modo Pódio Global**. Registre um bot com largada 8 e chegada 2 no São Paulo/Campeão; registre também um bot fora do pódio e confira se não aparece taxa artificial de Top 3 de 100%.
3. Confira preenchimento de pilotos, peças, pneus, paradas e melhor volta. Valide erros para data inválida, chegada fora de 1–24, etapa incompatível e campos HTML.
4. Faça logout/login e teste sincronização PC↔iPhone da observação, inclusive exclusão após confirmação. Com outra conta, confirme isolamento entre garagens; o relatório não pode incluir dados alheios.
5. Confira menu Duelos e rotação 04–17/11, Série 12, favoritos, login/recuperação, baús e imagens. Verifique que as regras de São Paulo permanecem preservadas e futuros GPs sem regras confirmadas não oferecem setup.
6. Se falhar, restaure o ZIP anterior e mantenha exportadas as novas observações de GP em JSON; não mude políticas do banco para contornar falhas.

**Status técnico:** 195 ativos públicos no Worker, com hashes atualizados; suíte de testes Node executada localmente, relatório em `RELATORIO_PODIO_GLOBAL_20261104.md`; teste visual e autenticação real ainda não verificados.
