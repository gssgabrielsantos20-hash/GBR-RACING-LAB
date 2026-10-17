# ADR 0003 — Importar setups favoritos de prints do F1 Clash

**Status:** implementação candidata 5.5.12, aguardando validação do usuário no Safari.

## Contexto
O usuário guarda até oito setups pessoais (7 peças, 2 pilotos). A garagem já possui cadastro assistido por print com OCR Tesseract.js no navegador, mas o editor de favoritos exigia selecionar todas as cartas manualmente. O jogo apresenta carro e pilotos em telas/slots distintos, portanto uma leitura automatizada não pode fundir prints sem confirmação.

## Decisão
Implementar interface assistida **Meus setups → Importar prints** com dois anexos opcionais, OCR reutilizado de `GBRGaragePlus.loadOCR`, reconhecimento conservador de nomes em `setup-print-parser.js`, e envio de sugestões ao **editor de favoritos atual**. Somente um clique explícito em Salvar grava o snapshot já validado por `GBRFavoriteModel.make`, que exige propriedade `owned`, seis peças obrigatórias e dois pilotos distintos. Preservar limite de oito e ausência de mudanças no Supabase. Nenhum arquivo do print ou texto OCR é persistido ou enviado ao backend pela funcionalidade.

## Alternativas
- Salvar imagem diretamente no banco: rejeitada por ampliar superfície de dados pessoais, custo, controle de acesso e falta de metadados verificáveis.
- Criar OCR/IA remota: rejeitada por dependência de API/segredos, privacidade, custo e risco de confusão de nomes/atributos.
- Registrar cartas automaticamente a partir da imagem: rejeitada pela perda de integridade de `owned`, nível e atributos.
- Reutilizar reconhecimento local, pré-seleção conservadora e revisão humana: escolhida.

## Segurança, performance e limites
- Não há upload dos prints ao Supabase. Imagens ficam como URL de objeto local e são revogadas em Fechar/revisão.
- Validação de MIME e tamanho (PNG/JPEG/WebP; até 12 MiB). As sugestões vêm somente do inventário autorizado pelo aplicativo; não se escolhe carta não possuída.
- Se a CDN/Tesseract falhar, a seleção manual continua disponível sem bloquear o recurso.
- OCR por imagem ocorre somente quando solicitado, sem polling ou chamadas ao banco.
- Risco: OCR pode não ler nomes pequenos, confundindo cartas com nomes próximos. Casos ambíguos não recebem seleção automática; o usuário revisa antes de salvar. **Validação no Safari real é obrigatória antes da produção.**
- Reversível por republicação do ZIP 5.5.11E. Deve-se auditar atualização do Worker em toda nova versão.

## Gatilhos de revisão
Considerar motor OCR local empacotado se a CDN deixar de carregar em mais de 5% das tentativas. Avaliar índices/armazenamento somente se o modelo de favoritos passar do objeto de garagem atual, o que está fora deste escopo.
