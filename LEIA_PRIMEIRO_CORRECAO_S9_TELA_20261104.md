# GBR Racing Lab — Série 9 visível em Duelos (prévia, 04/11/2026)

**Este ZIP não foi publicado** e não altera GitHub, Supabase ou os dados de contas existentes.

**Correção:** na aba Duelos, a seção "Pistas dos duelos por série" passa a identificar Séries 9, 10, 11 e 12, e a Série 9 apresenta Barcelona (7 voltas), Monza (4), Jeddah (6) e Silverstone (7) na janela estimada 04 a 10/11/2026. O campo "Pista (opcional)" prioriza as quatro pistas vigentes da série escolhida, mantendo todas as pistas da biblioteca em outro grupo. Se a série mudar, a pista previamente escolhida é desmarcada para evitar uso de contexto incorreto. O Pódio Global e as demais funções não foram modificados.

**Por que o iPhone exibiu texto antigo?** A captura enviada é de uma versão anterior, embora o ZIP de prévia anterior já tivesse os dados da S9. Não foi possível comprovar se a implantação ainda serve a versão antiga ou se o iPhone está com cache antigo. Publicar uma versão nova no ambiente de homologação e verificar a versão carregada é necessário para confirmar a causa.

**Homologação recomendada:**
1. Publicar em um ambiente de homologação (não produção); acessar pelo Safari do iPhone em aba privada, para diminuir a interferência de cache.
2. Abrir Duelos → Série 9 e ver "Série 9 · 4 pistas", Barcelona, Monza, Jeddah, Silverstone.
3. Conferir o campo Pista e as voltas, trocar para Série 10 e verificar que a seleção anterior é limpa.
4. Verificar ao fim do período que S9 não continua sinalizada como vigente; as datas finais são *inferidas* do contador do vídeo.
5. Inspecionar Pit Wall, Pódio Global, login, conta/garagem, Baús e a sincronização de duas contas.

**Rollback:** restaurar `GBR_LAB_04NOV_ROTACAO_S9_S12.zip`. Não há migrations, alteração de dados ou rotação de chaves.
