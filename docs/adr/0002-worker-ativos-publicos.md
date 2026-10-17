# ADR 0002 — Worker publica somente ativos públicos (5.5.10)

**Status:** aprovado pelo usuário para o pacote definitivo; validação automatizada concluída.

## Contexto
A auditoria comparativa 5.5.9A → 5.5.10 evidenciou regressão na superfície de publicação: a lista embutida no Worker passou de 70 para 96 rotas, incluindo `.sql`, testes, relatórios, documentação e metadados auxiliares. A aplicação é um site estático com um Worker que resolve requisições a partir de arquivos embutidos.

## Decisão
Aplicar **negação por padrão** à seleção do pacote HTTP: somente arquivos necessários à renderização da interface e de seus assets (HTML, CSS, JS, imagens e webmanifest) são incorporados ao `_worker.js`. Relatórios, testes, SQL e manifestos locais permanecem no ZIP de auditoria, mas não podem ser recuperados por URL. Não é alterado o handler de requisições nem o modelo de sessão/autenticação.

## Alternativas
- **Reutilizar exatamente a lista de 70 recursos da versão anterior:** não acrescenta SQL novo, mas mantém relatórios internos já expostos; rejeitada por superfície desnecessária.
- **Publicar todos os arquivos da pasta:** mais simples, porém reproduz o achado A-01; rejeitada.
- **Servir somente extensões necessárias à execução/visualização (escolhida):** reduz superfície, não exige backend extra e preserva comportamento funcional.

## Consequências, escala, riscos e rollback
- Sem novas requisições de API, armazenamento ou recursos privados no Worker. O processamento permanece estático e com custo previsível para 10x de acesso.
- Os documentos de auditoria são inspecionáveis no ZIP, não na URL do aplicativo. Caso exista algum link funcional para documento interno, ele será 404 e deve ser avaliado antes da publicação; a verificação dos links estáticos atuais não detectou tal dependência.
- A decisão é reversível: voltar ao arquivo `_worker.js` da versão 5.5.9A ou reimplantar aquele ZIP.
- Revisar essa lista ao introduzir novos formatos de arquivo públicos e atualizar a suíte de integridade/negação de acesso.
