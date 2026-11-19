# GBR Racing Lab — Pit Wall GBR / 4 fases em um único ZIP

## Publicar em prévia, não em produção

Base de referência: `GBR_RACING_LAB_MEGA_AUDITORIA_NOVEMBRO_2026_FOTOS_CORRIGIDAS_IMPLANTAVEL.zip`.

Novo menu **Pit Wall** no desktop; no iPhone, **Mais → Pit Wall GBR**.

O pacote é uma implantação completa (HTML, CSS, JS, imagens, Worker), não é um patch nem deve ser enviado parcialmente. No Cloudflare use o projeto **`gbr-racing-lab-homologacao`**, nunca `gbr-racing-lab` (produção) antes de homologar. O tipo de integração/forma de upload deve ser confirmado no painel; não altere a branch de produção do projeto principal. O pacote não foi enviado automaticamente ao Cloudflare nem ao GitHub.

## Conteúdo

- Saúde da garagem: detecta possíveis duplicações, cartas sem números, níveis S12 pendentes e imagens sem referência. **Não altera registros.**
- Engenheiro de GP: permite escolher evento/categoria/pista, compara com a garagem atual e recusa sugerir setup quando as regras oficiais não estão confirmadas. Não inventa ordem de pistas, chuva, voltas ou estratégia exata de pneus.
- Comparador: peças da mesma categoria ou pilotos possuídos, diferença numérica e retorno por milhão de moedas a partir de um custo informado pelo jogador (não extraído do jogo).
- Histórico: resumo das corridas registradas e mensagem conservadora de evidências da Inteligência GBR.
- Radar: revisão editorial estática; links para Hutch/AllClash.
- Compartilhamento: texto e card PNG pelo navegador, mediante clique. Download de calendário .ics de novembro com lembrete um dia antes para importação no app Calendário. **Não há push em segundo plano.**

## Lista de verificação de homologação (sem fazer alterações na garagem)

1. No iPhone, login e menu **Mais → Pit Wall GBR**; conferir que aparece apenas sua garagem.
2. No diagnóstico, conferir o aviso de níveis sem referência para itens S12 (não preencher números falsos).
3. Selecionar São Paulo / Campeão / Interlagos; conferir cinco destaques e o bônus do evento; Las Vegas e Catar não podem exibir setup calculado sem regras.
4. Comparar duas peças da mesma categoria; informar custo e verificar que o ROI é exibido como indicador matemático, não garantia.
5. Gerar card PNG e salvar/compartilhar; importar calendário .ics, verificar datas e alarme. Confirmar leitura no Safari.
6. Confirmar Eventos GP, Biblioteca Visual, favoritos, Montador, login, sincronização e fotos do GP do México como antes.

## Reversão

Reimplantar o ZIP anterior `GBR_RACING_LAB_MEGA_AUDITORIA_NOVEMBRO_2026_FOTOS_CORRIGIDAS_IMPLANTAVEL.zip`. Nenhuma migração de banco, configuração Supabase ou dado pessoal foi alterado por este pacote.

## Limitações

Valores de níveis superiores das sete peças novas S12 não encontrados em fonte oficial verificável; permanecem pendentes. Sem notificações push remotas. Acesso real no Safari requer homologação. Os nomes/raridades históricos e imagens de usuário têm precedência como antes. Nenhuma alteração no GitHub foi realizada.
