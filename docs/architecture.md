# Arquitetura canônica

## Regra de dependência

shared contém somente modelos, componentes e utilitários sem conhecimento de
core ou features. core contém infraestrutura transversal e não conhece a UI de
features. Cada feature possui domínio, aplicação e apresentação próprios.
Uma feature pode consumir outra somente por public-api.ts. O shell (app)
compõe as features por suas APIs públicas.

## Estado da migração

Esta Fase 1 não remove a implementação legada. Ela impede novas dependências e
registra os consumidores que ainda precisam ser migrados.

| Legado | Status | Consumidores atuais | Destino |
| --- | --- | --- | --- |
| core/data/study-store.ts | ainda usado | core/app-facade.ts | core/state/study-store.ts |
| core/data/study-repository.ts | ainda usado | core/app-facade.ts | core/application/study-repository.ts |
| core/data/review-store.ts | ainda usado | core/app-facade.ts | features/review/application |
| core/data/calendar-store.ts | ainda usado | core/app-facade.ts | features/history/application |
| core/data/subject-navigation.ts | ainda usado | core/app-facade.ts | features/subjects/application |
| core/data/reminder-service.ts | ainda usado | core/app-facade.ts | core/notifications |
| core/data/validation.ts | ainda usado | core/backup.ts, core/remote-state.ts | core/persistence/validation.ts |
| core/data/relations.ts | ainda usado | core/backup.ts, core/onboarding.ts | domínio da feature proprietária |
| core/data/account-service.ts | sem consumidor encontrado | nenhum | removível após confirmação |
| core/data/persistence.ts | sem consumidor encontrado | nenhum | removível após confirmação |

## Portas do shell

O bootstrap fornece SESSION_APPLICATION à feature de conta. Assim,
SessionComponent pode montar a aplicação autenticada sem importar
AppComponent, preservando a composição em main.ts e evitando dependência
feature para shell.
