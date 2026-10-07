# Refatoração e arquitetura — checklist de execução

Atualizado em 07/10/2026. Base: main após PR #6 (`96b4a5c`). Este checklist é o status atual; a análise histórica abaixo não constitui prova de conclusão desta etapa.

## Critério de encerramento

Cada item precisa de implementação, evidência de teste e revisão final. Usar estados **pendente**, **parcial**, **implementado / validação pendente**, **validado**, **bloqueado** ou **avaliado / sem mudança necessária**. Não declarar ausência de bugs nem cobertura de 100%. Preservar dados existentes, visual atual e contratos do backend. Aplicativo Ionic será construído depois da conclusão desta base; esta etapa prepara o compartilhamento.

## Atividades e validação ponto a ponto

| ID  | Atividade                                           | Estado                            | Critério / validação                                                                                                   |
| --- | --------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A01 | Dividir AppFacade em funcionalidades                | implementado / validação pendente | Formulários, revisão, onboarding e backup em serviços separados; fluxos Cypress preservados.                           |
| A02 | Limitar o estado exposto a cada tela                | implementado / validação pendente | Contratos específicos por tela, sem acesso irrestrito ao facade. Build strictTemplates.                                |
| A03 | Separar fluxo de autenticação da apresentação       | implementado / validação pendente | Estado e casos de uso fora do componente; login/cadastro/recuperação e troca de conta testados.                        |
| A04 | Separar casos de uso e acesso a dados               | pendente                          | Operações por funcionalidade com repositório de persistência delimitado e sem mensagens de UI.                         |
| A05 | Encapsular sessão e sincronização                   | pendente                          | Dependências e ciclo de vida explícitos; isolamento, cancelamento e fila testados.                                     |
| A06 | Substituir eventos globais por comunicação tipada   | implementado / validação pendente | Contrato tipado de eventos/estado, sem strings distribuídas.                                                           |
| A07 | Extrair biblioteca de domínio independente          | validado                          | Regras importáveis sem Angular, componentes, DOM ou armazenamento. Check obrigatório na CI.                            |
| A08 | Criar interfaces de plataforma                      | parcial                           | Armazenamento, arquivos, notificações, conectividade, relógio e links substituíveis.                                   |
| A09 | Isolar APIs do navegador nos adaptadores            | parcial                           | Casos de uso sem DOM direto; implementações web testadas.                                                              |
| A10 | Introduzir navegação por rotas                      | pendente                          | Acesso direto, refresh, voltar/avançar e sessão protegida testados.                                                    |
| A11 | Organizar workspace compartilhado                   | pendente                          | Web e bibliotecas com limites de importação, build e deploy preservados; sem app mobile ainda.                         |
| D01 | Completar relações e filtros por ID                 | parcial                           | Renomear/mover/arquivar sem perder vínculos; compatibilidade com nomes legados.                                        |
| D02 | Tornar IDs de cards resistentes a colisões          | validado                          | Criações simultâneas sem sobrescrita; manter IDs numéricos existentes.                                                 |
| D03 | Validar cache e fila offline                        | parcial                           | Dados inválidos/quota tratados sem perda silenciosa; testes de recuperação.                                            |
| D04 | Tornar revisão composta transacional                | implementado / validação pendente | Progresso e histórico num lote idempotente; rollback real.                                                             |
| D05 | Definir conflitos entre dispositivos                | pendente                          | Política documentada e cenário concorrente; sem prometer mesclagem não implementada.                                   |
| D06 | Separar falhas temporárias de fila inválida         | pendente                          | Retry seletivo, operação bloqueada observável e recuperação explícita.                                                 |
| U01 | Distribuir CSS por funcionalidade                   | pendente                          | Estilos de tela encapsulados; comparação de layout desktop/mobile.                                                     |
| U02 | Centralizar elementos visuais recorrentes           | pendente                          | Padrões reutilizáveis para mensagens/modais/campos sem redesenhar o produto.                                           |
| U03 | Concluir tradução e remover sentinelas em português | parcial                           | PT/EN incluindo aria-labels; conteúdo do usuário preservado.                                                           |
| U04 | Padronizar erros tipados                            | pendente                          | Códigos de erro no domínio/dados; tradução somente na apresentação.                                                    |
| U05 | Reagir à virada de dia                              | validado                          | Revisões, calendário e rotina atualizados sem refresh; relógio controlado em testes.                                   |
| U06 | Restaurar revisão aleatória                         | validado                          | Embaralhamento testável sem alterar ordem da coleção original.                                                         |
| U07 | Definir offline e lembretes por plataforma          | pendente                          | Limites de app fechado documentados; adaptadores e fallbacks testados.                                                 |
| U08 | Remover legado e duplicações sem uso                | pendente                          | Usos conferidos, compatibilidade mantida e testes completos.                                                           |
| Q01 | Testes unitários das mudanças                       | parcial                           | Casos negativos e limites para todos os novos comportamentos.                                                          |
| Q02 | Testes de componentes e navegação                   | pendente                          | UI conecta ações corretas; foco, formulários e histórico de navegação.                                                 |
| Q03 | Ampliar testes com backend real descartável         | pendente                          | Matérias/tópicos/cards, revisão, backup, preferências, suporte, exclusão, isolamento e retry.                          |
| Q04 | Documentar arquitetura e impor dependências         | parcial                           | Mapa de camadas e verificação automática de importações na esteira.                                                    |
| Q05 | Configuração e validação da publicação              | bloqueado                         | Cinco variáveis GitHub e APP_ALLOWED_ORIGINS exigem acesso administrativo indisponível. Não usar fixtures em produção. |
| Q06 | Avaliar crescimento do snapshot JSON                | pendente                          | Registrar custos/limites e critérios de migração; não reestruturar banco sem evidência.                                |
| Q07 | Revisão final deste checklist                       | pendente                          | Comparar cada item com código e resultados; listar pendências reais e link da CI.                                      |

## Auditoria intermediária — 07/10/2026

Esta etapa está em execução. O checklist ainda tem pendências e não autoriza afirmar que todo o aplicativo foi refatorado. Resultados locais: 29 testes unitários aprovados; lint e verificação de dependências aprovados; build Angular aprovado. A suíte integrada será executada no PR, em ambiente descartável, pois este ambiente local não dispõe de Docker nem do binário Cypress. As medições de cobertura se referem aos módulos importados pela suíte unitária, não a todo o aplicativo.

- A01–A03: serviços `EditorFacade`, `ReviewFacade`, `OnboardingFacade`, `BackupFacade` e `AuthFlow`; contratos `Pick` específicos por tela. O facade raiz mantém encaminhamentos de compatibilidade. Faltam validação completa da UI e substituição dos encaminhamentos quando as telas puderem consumir seus serviços diretamente.
- A06: publicadores e assinantes tipados em `platform/events.ts`; eventos de conta e apresentação passam pelo contrato. Eventos nativos e controle de sessão ainda usam o adaptador web.
- A07/Q04: regras e modelos em `libs/domain/src`, sem Angular, Supabase ou APIs do navegador. `npm run check:architecture` verifica imports e referências proibidas, integrado ao lint da CI. Camadas de aplicação/dados ainda precisam de regras adicionais.
- A08/A09/U07: interfaces de armazenamento, arquivos, relógio, conectividade, notificações e links em `libs/platform/src`. Adaptador web centraliza downloads, notificações e idioma do documento. Ainda há dependência concreta do adaptador na aplicação; faltam injeção pelos contratos e a implementação futura em Capacitor. O web não agenda notificações com o app fechado; service worker continua desabilitado e offline limita-se aos dados já carregados/fila local.
- D01: revisão filtra por `subject_id`/`topic_id`, mantendo leitura por nomes para dados legados. Outros seletores por nome ainda precisam migrar.
- D02: geração de IDs numéricos com 52 bits de UUID; checagem de colisão antes da gravação, com limite de tentativas. IDs existentes permanecem. Testes cobrem segurança numérica e 1.000 criações.
- D03: cache valida coleções/preferências e estrutura da fila; rejeita gravações inválidas e preserva envelope inválido. Leitura usa fallback seguro. Falta fluxo de recuperação explícita de cache/fila corrompida, sem descarte silencioso.
- D04: mutações com múltiplas operações usam um lote único; teste confirma progresso+histórico no mesmo lote durável. Rollback/idempotência real precisam de nova execução da integração.
- U05/U06: relógio reativo atualiza rotina/revisões/calendário na virada de dia; embaralhamento Fisher–Yates tem fonte aleatória controlável para teste e não modifica a coleção original.

### Arquitetura atual e próxima organização

`features` → `application` → `data` → backend/persistência. `libs/domain` fornece modelos, validação e regras puras; `libs/platform` define capacidades do ambiente. Reexportações em `src/app` preservam caminhos antigos durante a migração. Esta organização ainda não é um workspace com apps web/mobile: A11 continua pendente. Monorepo é a organização de vários apps/pacotes no mesmo repositório; monólito modular é a organização interna do backend. Adicionar Ionic ao mesmo repositório não exige transformar o backend em monólito.

### Conflitos e snapshot — avaliação preliminar

O backend serializa mutações e deduplica IDs de operações, mas não mescla edições concorrentes do mesmo campo. Atualmente vence a última operação aceita pelo servidor; uma edição offline antiga pode chegar depois de uma nova. D05 exige cenário concorrente e política explícita de produto antes de marcar conclusão. O snapshot JSON completo simplifica transações e backup, mas aumenta transferência, validação e contenção conforme a conta cresce. Q06 exige medição com volumes representativos; índices/normalização devem ser decididos a partir de tamanho, latência e contenção observados, não somente por preferência arquitetural.

## Matriz de integração exigida

Login/cadastro/recuperação; onboarding; baralhos (criar/renomear/arquivar/restaurar); tópicos (criar/editar/material/concluir); cards (criar/editar/revisar/praticar); histórico/calendário/progresso; perfil/rotina/idioma; backup/importação/legado; fila offline/retry/troca de conta; suporte/exclusão. Cypress com mocks verifica a UI; backend descartável verifica persistência, autorização e transações. Cada falha encontrada deve ser corrigida antes de marcar a validação como concluída.

---

# Histórico das etapas anteriores

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
| P1 backup            | Implementada; migração pendente de implantação | Cache e fila gravados em um único envelope local. Quota e limites de lote são verificados sem modificar sinais nem dados. Operações de importação usam RPC em lote transacional/idempotente.                                                                     |
| P1 sincronização     | Implementada                                   | Snapshot compartilhado por conta/revisão, token capturado por requisição, cancelamento, fila por conta e Web Locks para concorrência entre abas. Respostas antigas não substituem gravações novas.                                                               |
| P1 persistência real | Implementada com CI isolada                    | Supabase Docker descartável, usuários artificiais, RLS, suporte privado, rollback/idempotência, exclusão em cascata e Cypress com API real. Não usa dados ou usuários de produção.                                                                               |
| P1 tradução          | Implementada                                   | Catálogo PT/EN e pipe explícito; removido MutationObserver. Conteúdo de cards, nomes e tópicos não é traduzido.                                                                                                                                                  |
| P2 modelos/relações  | Implementada                                   | Modelos independentes, validadores de entrada, subject_id/topic_id normalizados com compatibilidade para nomes antigos.                                                                                                                                          |
| P2 telas/bundle      | Implementada                                   | Home, estudo, revisão, histórico, progresso, configurações e editores em componentes deferred. Budgets obrigatórios no build.                                                                                                                                    |
| P2 ciclo de vida     | Implementada                                   | DestroyRef limpa eventos, timer e assinatura; conta chaveia nova instância de estado; recuperação de senha tem proteção contra sessão inicial atrasada.                                                                                                          |
| P2 qualidade/testes  | Implementada                                   | Prettier, ESLint, testes separados e cobertura c8 com limiares mínimos: 80% linhas/statements e 70% branches/functions. Seletores data-cy no editor e cenários negativos.                                                                                        |

### Implantação e compatibilidade

1. Configurar GitHub Actions com os valores da instalação e Supabase Edge Functions com a origem permitida.
2. Executar a CI desta etapa, incluindo o backend local descartável.
3. Confirmar `20261007130849_atomic_account_batch.sql` no histórico do backend antes de publicar o frontend (aplicada em produção em 07/10/2026). Migração aditiva; nenhuma migração histórica deve ser reaplicada ou reescrita.
4. Publicar a Edge Function configurada e o frontend; verificar login, gravação, backup e exclusão com uma conta de teste.

A configuração isolada usa apenas a migração que cria o modelo privado atual e a nova migração de lote. Migrações históricas dependem de tabelas antigas e não constituem um bootstrap limpo.

### Verificação local desta etapa

- Build Angular aprovado; bundle inicial aproximadamente 671 kB, com telas em chunks lazy.
- 24 testes unitários aprovados localmente. Testes cobrem regras, relacionamentos, importação, quota, isolamento, replay, snapshot atrasado, concorrência e recuperação/CORS.
- Cobertura medida nos módulos importados pela suíte (exclui catálogo/configuração gerada): 88,96% linhas/statements, 79,33% branches e 84,21% funções. Não representa cobertura da aplicação inteira ou do HTML.
- CI aprova build, lint/formatação, 24 testes unitários, 14 cenários Cypress com API interceptada e 6 cenários reais no backend descartável (incluindo exclusão). O cenário Cypress com API real verifica criação/revisão, refresh e logout/login; seu resultado final está no Quality Gate do PR. Produção não foi alterada nesta etapa.

## Integração com a main — 07/10/2026

- Integradas as nove alterações da main até `86b90d5`, preservando a arquitetura de stores/services e as traduções explícitas.
- Onboarding encerra no primeiro clique de criação de tópico/card e reconhece conteúdo de qualquer baralho; relações de tópicos respeitam IDs após renomear.
- Detalhes de tópicos usam modal com foco contido, retorno de foco, link para o material e edição pelo botão interno. Campos mobile usam fonte de pelo menos 16 px.
- Removida a lista global de tópicos da tela de baralhos; cada baralho mantém seu conteúdo isolado.
- Acrescentadas as três suítes Cypress da main e suporte a fixtures por cenário, mantendo os mocks do backend refatorado.
- A migração `atomic_account_batch` foi aplicada no projeto app-flash-card em 07/10/2026. Conferidos security invoker, search_path e permissões: anon sem EXECUTE, authenticated com EXECUTE. Nenhum registro de estudo foi alterado.
- A configuração das cinco variáveis do GitHub e de `APP_ALLOWED_ORIGINS` continua necessária. A função publicada ainda é a versão anterior; não publicar a versão refatorada sem configurar a origem.

O arquivo da nova migração e o bootstrap de testes usam a versão `20261007130849` registrada pelo Supabase na aplicação, evitando que uma implantação futura tente reaplicar a mesma migração com outro timestamp.
