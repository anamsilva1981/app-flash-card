# Plano de refatoração — arquitetura nível sênior

Branch de execução: `refactor/senior-feature-architecture-quality`

Objetivo: reorganizar o frontend Angular por domínio/feature, reduzir acoplamento, remover arquivos soltos da raiz de `src/app`, aproximar testes das unidades que validam, manter responsabilidades claras e preservar todos os fluxos funcionais existentes.

## Regras de execução

- Cada item concluído é marcado com `[x]` somente após implementação e validação correspondente.
- Mudanças são feitas em etapas pequenas e verificáveis.
- Nenhuma etapa é considerada concluída apenas por mover arquivos; imports, estilos, testes e comportamento devem permanecer válidos.
- O encerramento exige build, lint, testes unitários, Cypress E2E e testes de integração aprovados.
- A `main` não será alterada até o checklist arquitetural ficar realmente concluído e o Quality Gate final permanecer verde.

## Checklist de execução

### 1. Baseline e arquitetura-alvo

- [x] Criar branch exclusiva para a refatoração.
- [x] Inventariar a estrutura atual de `src/app`, `tests` e `cypress`.
- [x] Registrar este plano de execução no repositório.
- [x] Definir mapa de responsabilidades entre `core`, `shared` e `features`.
- [x] Identificar dependências cruzadas entre features e pontos de acoplamento indevido por checker automatizado.

### 2. Estrutura base

- [x] Criar `src/app/core` para infraestrutura e serviços globais.
- [x] Criar `src/app/shared` para componentes, modelos e código reutilizável.
- [x] Reorganizar `src/app/features` por domínio, com uma pasta por funcionalidade.
- [x] Manter na raiz de `src/app` apenas os arquivos de composição da aplicação.

### 3. Features

- [ ] Concluir feature `cards`, movendo também modelos/regras específicas hoje ainda compartilhadas com `core`.
- [ ] Concluir feature `review`, movendo regras/store específicos que não precisam permanecer globais.
- [ ] Concluir feature `history`, aproximando regra de histórico da feature quando não for compartilhada.
- [ ] Concluir feature `progress`, aproximando regra de progresso da feature quando não for compartilhada.
- [ ] Concluir feature `study-plan`, aproximando plano/calendário específicos da feature.
- [ ] Concluir feature `subjects`, aproximando gerenciamento, seleção e navegação da feature sem criar dependência circular.
- [x] Criar feature `settings` e isolar sua página.
- [ ] Concluir feature `account`, separando experiência de usuário de autenticação/sessão global.
- [x] Criar feature `home` para composição da tela inicial.

### 4. Core

- [ ] Organizar autenticação e sessão global em `core/auth`.
- [ ] Organizar persistência/sincronização em `core/persistence`.
- [ ] Organizar backup em `core/backup`.
- [ ] Organizar internacionalização em `core/i18n`.
- [ ] Organizar lembretes e integração de calendário global em `core/notifications` ou fronteira equivalente.
- [ ] Organizar configuração da aplicação em `core/config`.

### 5. Shared

- [x] Mover `AppIconComponent` para `shared/components/app-icon`.
- [ ] Mover `LanguageSwitcherComponent` para `core/i18n/components` ou `shared` conforme a fronteira final.
- [x] Separar modelos compartilhados por contexto (`card`, `study`, `subject`, `review`, `ui`, `persistence`).
- [x] Separar código compartilhado de regras específicas de tela onde a dependência era evidente.

### 6. Facades, stores e services

- [ ] Quebrar o `AppFacade` para evitar God Facade e reduzir seu tamanho/responsabilidades.
- [ ] Distribuir comandos/queries para facades/stores específicos por feature quando apropriado.
- [x] Manter componentes de apresentação sem acesso direto ao backend/persistência.
- [x] Impedir imports de internals de outra feature por checker de boundaries.
- [x] Criar contratos públicos (`public-api.ts`) para features consumidas externamente.

### 7. Componentes e estilos

- [x] Criar pasta própria para cada page/component complexo reorganizado.
- [x] Colocalizar `.ts`, `.html` e `.spec.ts`; manter stylesheet local quando o componente possui estilo próprio.
- [ ] Retirar estilos específicos de features ainda concentrados em `app.component.css`.
- [x] Manter o `AppComponent` focado em composição/layout global.
- [ ] Revisar e dividir `SubjectManagerComponent` e `SessionComponent` caso a análise final confirme responsabilidades múltiplas.

### 8. Tipagem e domínio

- [ ] Eliminar o alias genérico remanescente `core/models.ts`, mantendo somente modelos explícitos por contexto.
- [x] Manter DTOs de persistência separados dos modelos de domínio quando necessário.
- [ ] Fazer auditoria final de `any`, unions implícitas e contratos frágeis.
- [x] Preservar compatibilidade dos dados persistidos, validada pela suíte de integração e persistência real.

### 9. Testes unitários e specs

- [x] Adotar padrão de specs colocalizados para componentes novos/movidos.
- [x] Criar/ajustar spec para `cards`.
- [x] Criar/ajustar spec para `review`.
- [x] Criar/ajustar spec para `history`.
- [x] Criar/ajustar spec para `progress`.
- [x] Criar/ajustar spec para `study-plan`.
- [x] Criar/ajustar specs para `subjects`.
- [x] Criar/ajustar specs para `account`.
- [x] Preservar testes existentes de infraestrutura crítica (`sync`, persistência, backup, i18n) na suíte unitária.
- [x] Atualizar runner para executar specs colocalizados no Quality Gate.

### 10. Imports, boundaries e qualidade estática

- [x] Atualizar imports após a reorganização já realizada.
- [x] Criar APIs públicas para reduzir dependência direta de internals entre features.
- [x] Criar checker automático de boundaries entre `core`, `shared` e `features`.
- [x] Garantir Prettier e ESLint aprovados.
- [x] Garantir ausência de arquivos de implementação soltos na raiz de `src/app` além da composição da aplicação.

### 11. Testes funcionais e regressão — execução 07/10/2026

Quality Gate do PR #9 / run `37660436503` após correção do runner Angular:

- [x] Executar testes unitários completos.
- [x] Executar cobertura e manter os limiares configurados.
- [x] Executar todos os cenários Cypress E2E.
- [x] Executar integração com backend Supabase descartável.
- [x] Executar cenário de persistência real no navegador contra backend descartável.
- [x] Verificar fluxos de cadastro/login/recuperação cobertos pela suíte existente.
- [x] Verificar criação/edição de matéria, tópico e flashcard pelos cenários existentes.
- [x] Verificar revisão e agendamento pelos testes existentes.
- [x] Verificar histórico/progresso pelos testes existentes.
- [x] Verificar refresh, logout/login e isolamento por conta.
- [x] Verificar persistência, rollback, exclusão e cenários negativos do backend isolado.

Resultado da execução: `quality = success` e `integration = success`.

### 12. Encerramento

- [x] Atualizar este documento com o resultado real da etapa atual.
- [ ] Registrar estrutura final depois que os itens arquiteturais pendentes acima forem concluídos.
- [x] Registrar testes executados e resultados atuais.
- [x] Abrir PR draft para `main` para executar o Quality Gate (`#9`).
- [ ] Integrar na `main` somente após concluir também as pendências arquiteturais; Quality Gate verde sozinho não encerra a refatoração.

## Arquitetura-alvo

```text
src/app/
├── core/
│   ├── auth/
│   ├── backup/
│   ├── config/
│   ├── i18n/
│   ├── notifications/
│   └── persistence/
├── shared/
│   ├── components/
│   ├── models/
│   └── domain/
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

## Pendências obrigatórias antes do merge

1. Estruturar o `core` por subdomínios, removendo o agrupamento plano atual.
2. Reduzir/quebrar o `AppFacade` e distribuir responsabilidades para stores/facades de domínio.
3. Mover estilos específicos das features para seus componentes e reduzir `app.component.css`.
4. Finalizar a separação das regras que ainda permanecem em `core` mas pertencem claramente a uma feature.
5. Remover `core/models.ts` e concluir auditoria de tipagem.
6. Reexecutar o Quality Gate completo e atualizar todos os checkboxes antes de liberar o PR para merge.
