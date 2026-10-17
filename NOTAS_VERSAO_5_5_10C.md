# GBR Racing Lab 5.5.10C — Ícones GP com fallback real

## Correção do GP dos Estados Unidos
- Recuperação das miniaturas de **Oliver Bearman**, **Gabriel Bortoleto** e **Tailwind** em "03 / Cartas em destaque".
- As imagens já existentes de **Fracture** e **Motion Link V2** permanecem.
- As cinco miniaturas foram recortadas da imagem do GP dos Estados Unidos já presente no aplicativo (`assets/events/us-gp-2026.png`), para dispensar dependência de servidor externo neste painel.

## Evita repetição do problema
- O componente comum de imagens (`card-art.js`) deixa de apagar a miniatura imediatamente quando uma URL externa falha: tenta a próxima fonte válida antes de exibir o placeholder.
- Prioridade: imagem configurada pela academia ou no dispositivo, imagem local do evento quando disponível, imagem de referência externa e, na ausência de todas, placeholder explícito.
- Os novos eventos usam automaticamente a convenção de arquivo `assets/events/featured/<id-do-evento>-<nome-da-carta>.webp` e o resolvedor de referências existente. Sem imagem em nenhuma fonte, o aplicativo continua exibindo placeholder — não inventa fotos nem garante existência de imagens futuras.
- Os lendários com referência não verificada deixam de receber URLs supostas.

## Compatibilidade
- Sem alteração nas regras de bônus, cálculos, eventos, banco ou autenticação.
- Não há migração Supabase nem atualização em contas.
- Scripts receberam query strings novos para atualização de cache no Safari.
