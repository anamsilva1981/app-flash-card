# Análise e plano de refatoração

Análise de 06/10/2026, baseada na branch `refactor/study-plan-domain` (PR #4). Esta etapa remove dados fixos; não conclui toda a arquitetura proposta abaixo.

## Alterações realizadas nesta etapa

- Removida a biblioteca pessoal de perguntas/respostas (`seed-cards.ts`) e o instalador de exemplos. Novas contas começam vazias; cards existentes continuam vindo do cache, da conta ou de backups completos.
- Removidos a lista fixa de matérias e os ícones associados a nomes específicos. A identidade do baralho é determinada pelo cadastro, incluindo `deck_key` existente.
- Removidas condições especiais para AWS na interface. Aliases para histórico são recebidos como dados, não definidos por nome de matéria.
- URL e chave pública do Supabase, responsável, contato e data da política vêm de variáveis de ambiente. O arquivo gerado e `.env` não são versionados.
- Fuso horário usa o dispositivo, inclusive em lembretes e exportação de agenda. Datas já persistidas não são reescritas. Localização de datas acompanha o idioma escolhido.
- Origem permitida na função de exclusão passa a usar `APP_ALLOWED_ORIGINS` com lista explícita; origens desconhecidas recebem 403.
- Caminho de publicação usa o nome do repositório no workflow.
- Backups antigos que contêm somente progresso são recusados antes de alterações, com orientação para exportar um backup completo do aplicativo anterior.

## Ações necessárias, por prioridade

| Prioridade | Ação                                               | Evidência e critério de conclusão                                                                                                                                                                                                             |
| ---------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0         | Configurar a implantação antes de integrar este PR | Definir as cinco variáveis de `.env.example` no GitHub Actions e `APP_ALLOWED_ORIGINS` no ambiente da Edge Function. Build e função precisam usar valores da instalação.                                                                      |
| P1         | Criar stores/services Angular por funcionalidade   | `AppComponent` ainda gerencia formulários, navegação, cache, sincronização, revisão e backup. Extrair estado e casos de uso; componentes passam a coordenar a apresentação.                                                                   |
| P1         | Tornar a importação de backup transacional         | O fluxo valida primeiro, mas aplica vários caches e escritas separadas. Uma falha de armazenamento após uma escrita pode deixar importação parcial. Preparar um estado completo e persistir de forma atômica/idempotente, com rollback local. |
| P1         | Reforçar sincronização e troca de conta            | `sync.ts` usa fila e promessa globais; leitores consultam o documento inteiro repetidamente. Centralizar snapshot por conta, cancelar leituras antigas e testar trocas de conta durante leituras/escritas e conflitos entre abas.             |
| P1         | Testar persistência real e autorização             | Cypress intercepta a API e o teste de regras usa mocks do Supabase. Adicionar ambiente de teste isolado para logout/login, refresh, falha de rede, retry, RLS, suporte e exclusão; nunca usar contas reais nos testes.                        |
| P1         | Migrar traduções para chaves explícitas            | `I18nService` observa o DOM inteiro com MutationObserver e traduz textos por correspondência. Usar chaves em templates/serviços e limitar tradução à interface, preservando conteúdo criado pelo usuário.                                     |
| P2         | Unificar modelos e remover `any`                   | `ManagedSubject` está declarado em um componente e é importado por domínios; `StudyItem` e Card são duplicados. Criar modelos independentes, DTOs tipados e validação do snapshot remoto.                                                     |
| P2         | Normalizar relações por ID                         | Matérias, cards e tópicos ainda se relacionam por nomes e `deck_key`. Migrar gradualmente para `subject_id`/`topic_id`, com compatibilidade e testes para renomear/arquivar/importar.                                                         |
| P2         | Separar telas e dividir bundle                     | O template/CSS raiz contém quase todas as telas. Criar componentes de Home, revisão, fila, calendário, configurações e editores; avaliar lazy loading com Angular Router e budgets de bundle.                                                 |
| P2         | Encapsular efeitos e ciclo de vida                 | Eventos de window, timers e assinaturas precisam de serviços e limpeza consistente. Cobrir criação/destruição repetida, retomada de sessão e notificações.                                                                                    |
| P2         | Padronizar formatação e análise estática           | TS, CSS e suíte de testes têm trechos em linhas longas. Adicionar formatter/linter e organizar testes por domínio; execução obrigatória na esteira.                                                                                           |
| P2         | Melhorar ergonomia dos testes e erros              | Adicionar seletores de teste estáveis, cenários negativos, validação de tipos/dados, mensagens de erro observáveis e medição real de cobertura. 13 cenários E2E planejados não equivalem a 100% de cobertura.                                 |

## Limites e compatibilidade

- Não são dados pessoais chumbados: textos da interface, placeholders, tradução PT/EN, enums de estado/prioridade, nomes de operações do protocolo e parâmetros do algoritmo de revisão. Esses valores são parte do produto; devem ser centralizados ou traduzidos quando apropriado, não apagados.
- `seed_card_progress` é o nome legado de uma operação persistida no protocolo e na fila offline, não uma biblioteca de conteúdo. Renomear exige migração coordenada do backend e das filas já existentes.
- Migrações SQL históricas contêm a conversão antiga de AWS e rotinas pessoais. Não foram reescritas: fazem parte do histórico aplicado. Esta etapa não executa SQL nem altera registros de estudo; uma mudança no banco requer uma nova migração e testes de compatibilidade.
- `.env` local conserva as configurações da instalação apenas para validação; não vai no commit. O bundle público contém a URL/chave pública configurada, como exige o cliente web do Supabase. Chaves privilegiadas são rejeitadas pelo gerador.
- Exportações de backup continuam preservando cards e progresso já cadastrados. Backup v1 sem conteúdo deve ser reexportado pelo aplicativo anterior antes da migração.

## Validação

- Build Angular e testes de regras executados localmente.
- Acrescentados testes de configuração inválida, chave privilegiada, fronteira de data em fusos distintos, agenda em outro fuso, backup completo e antigo, preservação de card existente e aliases arbitrários.
- Acrescentados dois cenários Cypress: conta vazia sem seeds e matéria arbitrária com cards salvos após reload.
- Resultado de Cypress deve ser conferido na execução do Quality Gate deste PR; a instalação do navegador local não estava disponível no ambiente de análise.

## Execução das prioridades — segunda etapa

| Prioridade           | Estado                                         | Implementação                                                                                                                                                                                                                                                    |
| -------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0                   | Bloqueada na instalação                        | O gerador exige configuração completa e a CI usa fixtures. A conexão disponível não permite definir variáveis administrativas do GitHub nem segredos da Edge Function. Definir as cinco variáveis de `.env.example` e `APP_ALLOWED_ORIGINS` antes da publicação. |
| P1 stores/services   | Implementada                                   | StudyStore, StudyRepository, ReviewStore, CalendarStore, AccountService, ReminderService e AppFacade. Estado criado por instância da conta, com apresentação em componentes separados.                                                                           |
| P1 backup            | Implementada; migração pendente de implantação | Cache e fila gravados em um único envelope local. Quota não modifica sinais nem dados. Operações de importação usam RPC em lote transacional/idempotente.                                                                                                        |
| P1 sincronização     | Implementada                                   | Snapshot compartilhado por conta/revisão, token capturado por requisição, cancelamento, fila por conta e Web Locks para concorrência entre abas. Respostas antigas não substituem gravações novas.                                                               |
| P1 persistência real | Preparada para CI isolada                      | Supabase Docker descartável, usuários artificiais, RLS, suporte privado, rollback/idempotência, exclusão em cascata e Cypress com API real. Não usa dados ou usuários de produção.                                                                               |
| P1 tradução          | Implementada                                   | Catálogo PT/EN e pipe explícito; removido MutationObserver. Conteúdo de cards, nomes e tópicos não é traduzido.                                                                                                                                                  |
| P2 modelos/relações  | Implementada                                   | Modelos independentes, validadores de entrada, subject_id/topic_id normalizados com compatibilidade para nomes antigos.                                                                                                                                          |
| P2 telas/bundle      | Implementada                                   | Home, estudo, revisão, histórico, progresso, configurações e editores em componentes deferred. Budgets obrigatórios no build.                                                                                                                                    |
| P2 ciclo de vida     | Implementada                                   | DestroyRef limpa eventos, timer e assinatura; conta chaveia nova instância de estado; recuperação de senha tem proteção contra sessão inicial atrasada.                                                                                                          |
| P2 qualidade/testes  | Implementada                                   | Prettier, ESLint, testes separados e cobertura c8 com limiares mínimos: 80% linhas/statements e 70% branches/functions. Seletores data-cy no editor e cenários negativos.                                                                                        |

### Implantação e compatibilidade

1. Configurar GitHub Actions com os valores da instalação e Supabase Edge Functions com a origem permitida.
2. Executar a CI desta etapa, incluindo o backend local descartável.
3. Aplicar `20261006095921_atomic_account_batch.sql` no backend antes de publicar o frontend. Migração aditiva; nenhuma migração histórica deve ser reaplicada ou reescrita.
4. Publicar a Edge Function configurada e o frontend; verificar login, gravação, backup e exclusão com uma conta de teste.

A configuração isolada usa apenas a migração que cria o modelo privado atual e a nova migração de lote. Migrações históricas dependem de tabelas antigas e não constituem um bootstrap limpo.

### Verificação local desta etapa

- Build Angular aprovado; bundle inicial aproximadamente 669 kB, com telas em chunks lazy.
- Testes cobrem regras, relacionamentos, importação, quota, isolamento, replay, snapshot atrasado, concorrência e recuperação/CORS.
- Cobertura medida nos módulos importados pela suíte (exclui catálogo/configuração gerada): 84,56% linhas/statements, 78,77% branches e 79,68% funções na medição inicial. Não representa cobertura da aplicação inteira ou do HTML.
- Lint/formatação e resultados de integração/Cypress devem ser conferidos no Quality Gate do PR. Produção não foi alterada nesta etapa.
