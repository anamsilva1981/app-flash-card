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

| Legado                          | Status             | Consumidores atuais                  | Destino                              |
| ------------------------------- | ------------------ | ------------------------------------ | ------------------------------------ |
| core/data/study-store.ts        | ainda usado        | core/app-facade.ts                   | core/state/study-store.ts            |
| core/data/study-repository.ts   | ainda usado        | core/app-facade.ts                   | core/application/study-repository.ts |
| core/data/review-store.ts       | ainda usado        | core/app-facade.ts                   | features/review/application          |
| core/data/calendar-store.ts     | ainda usado        | core/app-facade.ts                   | features/history/application         |
| core/data/subject-navigation.ts | ainda usado        | core/app-facade.ts                   | features/subjects/application        |
| core/data/reminder-service.ts   | ainda usado        | core/app-facade.ts                   | core/notifications                   |
| core/data/validation.ts         | ainda usado        | core/backup.ts, core/remote-state.ts | core/persistence/validation.ts       |
| core/data/relations.ts          | ainda usado        | core/backup.ts, core/onboarding.ts   | domínio da feature proprietária      |
| core/data/account-service.ts    | removido na Fase 2 | nenhum                               | concluído                            |
| core/data/persistence.ts        | removido na Fase 2 | nenhum                               | concluído                            |

O antigo core/app-facade.ts também foi removido na Fase 2: nenhum consumidor
ativo dependia dele; o shell usa app.facade.ts.

## Portas do shell

O bootstrap fornece SESSION_APPLICATION à feature de conta. Assim,
SessionComponent pode montar a aplicação autenticada sem importar
AppComponent, preservando a composição em main.ts e evitando dependência
feature para shell.

## Fases 3 e 4

As features passaram a consumir o repositório por adaptadores de capacidade em
core/application/feature-repositories.ts. Os adaptadores preservam os mesmos
casos de uso e delegam temporariamente ao StudyRepository, permitindo migrar a
persistência por agregado sem alterar comportamento ou contratos Supabase.
