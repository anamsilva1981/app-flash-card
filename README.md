# App Flash Card

Aplicação de estudos **mobile-first** criada para organizar o aprendizado, transformar conteúdos em flashcards e manter uma rotina de revisão espaçada.

O projeto começou como uma ferramenta pessoal de estudos e está evoluindo para um produto em que cada pessoa pode criar sua conta, organizar matérias, registrar o que está estudando e acompanhar suas revisões.

## Principais funcionalidades

- Cadastro, login, confirmação de e-mail e recuperação de senha com Supabase Auth
- Validação de senha no cadastro e na redefinição
- Dados de estudo vinculados à conta do usuário
- Matérias e rotina de estudos configuráveis
- Fila **A estudar** com prioridade, anotações e links
- Registro de conteúdos concluídos no histórico
- Criação manual de flashcards
- Flashcards com pergunta, resposta, explicação e exemplo prático
- Revisão com **Não sei / Difícil / Sei / Fácil**
- Agendamento de próximas revisões
- Filtros por matéria e tópico
- Progresso e histórico de estudos
- Lembretes e exportação da rotina para calendário
- Backup/exportação dos estudos
- Interface responsiva para celular e desktop
- Política de privacidade e fluxo de exclusão de conta

## Fluxo de estudo

A experiência separa dois momentos:

**Estudar** — adquirir conhecimento novo. O usuário organiza matérias e tópicos, define prioridades, adiciona anotações e conclui o conteúdo estudado.

**Revisar** — consolidar o conhecimento. Os flashcards entram em ciclos de revisão de acordo com a avaliação feita pelo usuário.

O fluxo principal é:

`Matéria → A estudar → Concluir estudo → Histórico → Flashcards → Revisões`

## Tecnologias

- Angular 20
- TypeScript 5.9
- Angular Material / CDK
- RxJS
- Supabase (Auth e persistência)
- Plus Jakarta Sans
- GitHub Actions
- GitHub Pages

## Estrutura

A aplicação está concentrada em `src/app`, com componentes para a experiência principal, autenticação, gerenciamento de matérias, sincronização e persistência dos estudos.

```text
src/
├── app/
│   ├── app.component.*
│   ├── session.component.*
│   ├── subject-manager.component.*
│   ├── account.ts
│   ├── sync.ts
│   └── ...
├── index.html
├── main.ts
└── styles.css
```

## Executar localmente

Requisitos: Node.js e npm.

```bash
npm install
npm start
```

A aplicação fica disponível pelo servidor de desenvolvimento do Angular.

## Build

```bash
npm run build
```

## Testes

```bash
npm test
```

A suíte cobre regras importantes do produto, incluindo revisão espaçada, prioridades, sincronização offline, isolamento de dados por conta, lembretes e autenticação.

## Persistência e autenticação

O Supabase é usado para autenticação e sincronização dos dados. A aplicação também mantém dados locais necessários para a experiência e para cenários offline.

Cada conta deve acessar somente os próprios estudos. As políticas de acesso no banco fazem parte da arquitetura de segurança do projeto.

## Deploy

A branch `main` é a branch de produção. O deploy atual é automatizado pelo GitHub Actions para GitHub Pages.

> O projeto está em evolução. A infraestrutura de publicação pode ser migrada para Vercel e domínio próprio antes da disponibilização comercial.

## Status do projeto

Em desenvolvimento ativo. O foco atual é consolidar a experiência de cadastro, estudos, criação de flashcards, revisão, persistência e acabamento da interface antes da publicação para usuários finais.
