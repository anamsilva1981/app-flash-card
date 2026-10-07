# Plano de refatoração — arquitetura nível sênior

Branch de execução: `refactor/senior-feature-architecture`

Objetivo: reorganizar o frontend Angular por domínio/feature, reduzir acoplamento, remover arquivos soltos da raiz de `src/app`, aproximar testes das unidades que validam, manter responsabilidades claras e preservar todos os fluxos funcionais existentes.

## Regras de execução

- Cada item concluído deve ser marcado com `[x]` apenas depois de implementação e validação correspondente.
- Mudanças serão feitas em etapas pequenas e verificáveis.
- Nenhuma etapa será considerada concluída apenas por mover arquivos; imports, estilos, testes e comportamento devem permanecer válidos.
- O encerramento exige build, lint, testes unitários, Cypress E2E e testes de integração aprovados.
- A `main` não será alterada durante a refatoração; a integração ocorrerá somente após o Quality Gate final.

## Checklist de execução

### 1. Baseline e arquitetura-alvo

- [x] Criar branch exclusiva para a refatoração.
- [x] Inventariar a estrutura atual de `src/app`, `tests` e `cypress`.
- [x] Registrar este plano de execução no repositório.
- [ ] Definir mapa definitivo de responsabilidades entre `core`, `shared` e `features`.
- [ ] Identificar dependências cruzadas entre features e pontos de acoplamento indevido.

### 2. Estrutura base

- [ ] Criar `src/app/core` para infraestrutura e serviços globais.
- [ ] Criar `src/app/shared` para componentes, pipes, modelos e utilitários reutilizáveis.
- [ ] Reorganizar `src/app/features` por domínio, com uma pasta por funcionalidade.
- [ ] Manter na raiz de `src/app` apenas os arquivos de composição da aplicação.

### 3. Features

- [ ] Criar feature `cards` e mover editor, modelos e regras específicas de flashcards.
- [ ] Criar feature `review` e mover tela, store e regras de agendamento de revisão.
- [ ] Criar feature `history` e mover histórico e componentes relacionados.
- [ ] Criar feature `progress` e mover regras/tela de progresso.
- [ ] Criar feature `study-plan` e mover plano de estudos, calendário e regras relacionadas.
- [ ] Criar feature `subjects` e mover gerenciamento, seleção e navegação de matérias/tópicos.
- [ ] Criar feature `settings` e mover configuração visual/funcional da tela de configurações.
- [ ] Criar feature `account` e mover painel e regras de conta que pertencem à experiência de usuário.
- [ ] Criar feature `home` para composição da tela inicial.

### 4. Core

- [ ] Mover autenticação e sessão global para `core/auth` quando aplicável.
- [ ] Mover persistência/sincronização para `core/persistence`.
- [ ] Mover backup para `core/backup`.
- [ ] Mover internacionalização para `core/i18n`.
- [ ] Mover lembretes e integração de calendário global para `core/notifications` ou domínio apropriado.
- [ ] Organizar configuração da aplicação em `core/config`.

### 5. Shared

- [ ] Mover `AppIconComponent` para `shared/components/app-icon`.
- [ ] Mover `LanguageSwitcherComponent` para localização adequada (`shared` ou `core/i18n/components`).
- [ ] Separar modelos compartilhados de modelos específicos de feature.
- [ ] Separar utilitários compartilhados de regras de domínio.

### 6. Facades, stores e services

- [ ] Revisar `AppFacade` para evitar God Facade.
- [ ] Distribuir comandos/queries para facades/stores específicos por feature.
- [ ] Garantir que componentes de apresentação não conheçam detalhes de persistência.
- [ ] Garantir que features não importem internals de outras features.
- [ ] Manter contratos públicos explícitos para dependências entre camadas.

### 7. Componentes e estilos

- [ ] Criar pasta própria para cada page/component complexo.
- [ ] Colocalizar `.ts`, `.html`, `.css/.scss` e teste da unidade.
- [ ] Retirar estilos específicos de features do `app.component.css`.
- [ ] Reduzir o `AppComponent` à composição/layout global.
- [ ] Revisar `SubjectManagerComponent` e `SessionComponent` para divisão quando houver responsabilidades múltiplas.

### 8. Tipagem e domínio

- [ ] Eliminar arquivo genérico `models.ts` em favor de modelos por contexto.
- [ ] Manter DTOs de persistência separados de modelos de domínio quando necessário.
- [ ] Revisar `any`, unions implícitas e contratos frágeis.
- [ ] Preservar compatibilidade dos dados já persistidos.

### 9. Testes unitários e specs

- [ ] Adotar padrão de testes colocalizados para components/services/stores novos ou movidos.
- [ ] Criar/ajustar specs para `cards`.
- [ ] Criar/ajustar specs para `review`.
- [ ] Criar/ajustar specs para `history`.
- [ ] Criar/ajustar specs para `progress`.
- [ ] Criar/ajustar specs para `study-plan`.
- [ ] Criar/ajustar specs para `subjects`.
- [ ] Criar/ajustar specs para `account`.
- [ ] Criar/ajustar specs para infraestrutura crítica (`sync`, persistência, backup, i18n).
- [ ] Atualizar o runner/configuração para executar os testes colocalizados sem depender de arquivos órfãos.

### 10. Imports, boundaries e qualidade estática

- [ ] Atualizar todos os imports após a reorganização.
- [ ] Remover imports relativos excessivamente profundos quando uma API pública da feature for adequada.
- [ ] Criar regra/documentação de boundaries entre `core`, `shared` e `features`.
- [ ] Garantir Prettier e ESLint aprovados.
- [ ] Garantir ausência de arquivos de implementação soltos na raiz de `src/app` além da composição da aplicação.

### 11. Testes funcionais e regressão

- [ ] Executar testes unitários completos.
- [ ] Executar cobertura e confirmar que os limiares continuam atendidos ou melhoraram.
- [ ] Executar todos os cenários Cypress E2E.
- [ ] Executar integração com backend Supabase descartável.
- [ ] Executar cenário de persistência real no navegador contra backend descartável.
- [ ] Verificar fluxos de cadastro/login/recuperação quando cobertos pela suíte.
- [ ] Verificar criação/edição de matéria, tópico e flashcard.
- [ ] Verificar revisão e agendamento.
- [ ] Verificar histórico/progresso.
- [ ] Verificar refresh, logout/login e isolamento por conta.
- [ ] Verificar backup/importação e cenários negativos existentes.

### 12. Encerramento

- [ ] Atualizar este documento com o resultado real de cada etapa.
- [ ] Registrar estrutura final e decisões arquiteturais.
- [ ] Registrar testes executados e resultados.
- [ ] Abrir PR para `main` somente com Quality Gate verde.
- [ ] Integrar na `main` somente após validação completa.

## Arquitetura-alvo inicial

```text
src/app/
├── core/
│   ├── auth/
│   ├── backup/
│   ├── config/
│   ├── i18n/
│   └── persistence/
├── shared/
│   ├── components/
│   ├── models/
│   └── utils/
├── features/
│   ├── account/
│   ├── cards/
│   ├── history/
│   ├── home/
│   ├── progress/
│   ├── review/
│   ├── settings/
│   ├── study-plan/
│   └── subjects/
├── app.component.ts
├── app.component.html
└── app.component.css
```

A arquitetura final pode ajustar nomes/pastas quando a análise de dependências mostrar uma fronteira melhor, mas qualquer desvio deve ser documentado aqui.
