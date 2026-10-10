# Auditoria de cobertura estrutural de testes

Data: 07/10/2026

Objetivo: garantir que a arquitetura refatorada não tenha apenas componentes testados, mas também cobertura estrutural explícita para facades, stores, services, repositories, navegação e regras de domínio relevantes.

## Estratégia de testes

A cobertura é dividida em camadas complementares:

1. **Specs colocalizados (`*.spec.ts`)**
   - Garantem que componentes, facades, stores, services, repositories, navigation e regras de domínio relevantes tenham um teste explícito junto da unidade.
   - São executados por `scripts/run-colocated-tests.mjs`.

2. **Testes unitários comportamentais (`tests/unit`)**
   - Validam regras de negócio, persistência local, sincronização, lifecycle, autenticação e repository com cenários reais de lógica.
   - Executados com cobertura por `npm run test:coverage`.

3. **Cypress E2E (`cypress/e2e`)**
   - Valida os fluxos funcionais da interface de ponta a ponta.
   - Inclui autenticação, onboarding, isolamento de tópicos por baralho, detalhes de tópico e dados do usuário.

4. **Integração com backend descartável (`tests/integration` + Cypress real backend)**
   - Valida persistência, isolamento/RLS, rollback, idempotência, exclusão de conta e persistência real no navegador.

## Regra automática de cobertura estrutural

Foi criado `scripts/check-test-structure.mjs`.

A esteira falha quando uma unidade relevante não possui `.spec.ts` colocalizado. A regra cobre:

- `*.component.ts`
- `*.facade.ts`
- `*-store.ts` / `*.store.ts`
- `*-service.ts` / `*.service.ts`
- `*-repository.ts` / `*.repository.ts`
- `*-navigation.ts` / `*.navigation.ts`
- arquivos com implementação real dentro de `domain/`

Arquivos de domínio que são apenas reexports não exigem spec próprio, pois não possuem comportamento.

## Cobertura estrutural adicionada nesta auditoria

### Composition / Application

- `app.facade.spec.ts`

### Features

- Cards: `cards.facade.spec.ts` + spec do card editor.
- Home: `home.facade.spec.ts` + `onboarding.spec.ts` + spec da home page.
- Progress: `progress.facade.spec.ts` + spec da progress page.
- History: `calendar-store.spec.ts`, `history.facade.spec.ts` + spec da history page.
- Review: `review-store.spec.ts`, `review.facade.spec.ts`, `review-schedule.spec.ts` + spec da review page.
- Settings: `settings.facade.spec.ts` + spec da settings page.
- Study Plan: `study-plan.facade.spec.ts`, `study-clock.spec.ts` + spec da study-plan page.
- Subjects: `subject-navigation.spec.ts` + specs de subject manager e topic editor.
- Account: specs de session e account panel; autenticação de infraestrutura possui testes unitários e integração.

### Core

- `account-service.spec.ts`
- `reminder-service.spec.ts`
- `i18n.service.spec.ts`
- `study-repository.spec.ts`
- `study-store.spec.ts`
- `app-navigation.spec.ts`

### Shared Domain

- `flashcard.spec.ts`
- `progress.spec.ts`
- `relations.spec.ts`
- `study-history.spec.ts`
- `study-plan.spec.ts`
- `subject-selectors.spec.ts`

## Testes comportamentais existentes preservados

- `tests/unit/account.test.mjs`
- `tests/unit/domain.test.mjs`
- `tests/unit/lifecycle.test.mjs`
- `tests/unit/repository.test.mjs`
- `tests/unit/sync.test.mjs`
- `tests/integration/backend.test.mjs`

Os specs colocalizados não substituem esses testes. Eles adicionam rastreabilidade estrutural; os testes unitários centralizados continuam responsáveis pela validação detalhada do comportamento.

## Parte 2 - fortalecimento dos testes unitários

A auditoria mostrou que vários specs colocalizados eram apenas smoke tests de carregamento. Nesta etapa, os pontos com estado/comportamento próprio foram fortalecidos sem duplicar cenários que já possuem cobertura detalhada em `tests/unit`.

- [x] `StudyStore`: snapshot/apply, subjects ativos e restauração de cache.
- [x] `ReviewStore`: filtro por assunto, cartões vencidos, início de sessão, modo prática e reset da UI.
- [x] `CalendarStore`: seleção de dia, contagem mensal, mudança de mês e idioma do rótulo.
- [x] `I18nService`: tradução/interpolação, idioma inicial, toggle, persistência e atributo `lang`.
- [x] Regras de domínio críticas permanecem cobertas pelos specs colocalizados e por `tests/unit/domain.test.mjs`.
- [x] `AccountService`, `StudyRepository`, persistência e sincronização permanecem com specs estruturais e testes comportamentais dedicados em `tests/unit`, evitando duplicação artificial de casos.
- [x] Facades finos mantêm teste estrutural; comportamento de negócio fica nas stores/services/domain que eles orquestram.

Critério desta etapa: não criar testes apenas para aumentar quantidade. Unidades com comportamento próprio devem ter assertions de comportamento; adapters/orquestradores finos podem ser validados estruturalmente quando o comportamento delegado já possui teste dedicado.

## Critério de liberação antes do merge

A refatoração só pode ser considerada segura para merge quando todos os itens abaixo estiverem verdes na mesma revisão da branch:

- [ ] Prettier
- [ ] ESLint
- [ ] Architecture boundaries
- [ ] Structural test coverage
- [ ] Colocated specs
- [ ] Angular build
- [ ] Unit tests + coverage thresholds
- [ ] Cypress E2E completo
- [ ] Backend integration descartável
- [ ] Cypress de persistência com backend real descartável

O resultado final da execução será registrado neste documento após o Quality Gate concluir.
