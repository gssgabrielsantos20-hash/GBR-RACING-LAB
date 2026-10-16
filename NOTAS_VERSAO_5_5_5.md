# Notas da versão 5.5.5

## Correção de associação de pilotos lendários (Hill)

- Corrigida a associação indevida entre **Graham Hill** e **Damon Hill** na Biblioteca Visual.
- O fallback de imagem agora prioriza o **nome completo do piloto**, evitando que ambos sejam tratados apenas como `Hill`.
- A Biblioteca Visual / Auditoria agora lista separadamente **Graham Hill** e **Damon Hill**, preservando **D. Hill** para cadastros anteriores.
- O cadastro assistido por print passou a reconhecer melhor pilotos lendários com nomes compostos, incluindo **Graham Hill** e **Damon Hill**.

## Impacto

- **Não** altera garagens, níveis, peças, login, academia, duelos ou pistas.
- **Não** altera schema nem permissões do Supabase.
- A correção atua somente no catálogo visual, fallback de miniaturas e reconhecimento assistido.
