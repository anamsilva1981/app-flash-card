# App Flash Card

> **PT-BR** · [English version](#english-version)

Aplicação de estudos **mobile-first** criada em Angular para organizar aprendizado, transformar conteúdos em flashcards e manter uma rotina de revisão espaçada.

O projeto nasceu como uma ferramenta pessoal de estudos e hoje funciona como um **case de engenharia Front-end**, reunindo arquitetura Angular, autenticação, persistência em nuvem, experiência offline, testes E2E, acessibilidade, internacionalização e CI/CD em uma aplicação real.

## Objetivo do projeto

Mais do que um gerador de flashcards, o App Flash Card separa dois momentos da aprendizagem:

- **Estudar** — organizar conhecimento novo, matérias, tópicos, prioridades, anotações e rotina.
- **Revisar** — consolidar o que foi aprendido usando flashcards e repetição espaçada.

Fluxo principal:

`Matéria → A estudar → Concluir estudo → Histórico → Flashcards → Revisões`

## Principais funcionalidades

- Cadastro, login, confirmação de e-mail e recuperação de senha com Supabase Auth
- Isolamento dos dados de estudo por conta
- Matérias, tópicos e rotina de estudos configuráveis
- Fila **A estudar** com prioridade, anotações e links
- Registro de conteúdos concluídos no histórico
- Criação manual de flashcards
- Flashcards com pergunta, resposta, explicação e exemplo prático
- Revisão com **Não sei / Difícil / Sei / Fácil**
- Agendamento das próximas revisões
- Filtros por matéria e tópico
- Progresso e histórico de estudos
- Lembretes e exportação da rotina para calendário
- Backup/exportação dos estudos
- Experiência offline com sincronização posterior
- Interface responsiva para celular e desktop
- Política de privacidade e fluxo de exclusão de conta
- Interface internacionalizada em **Português e Inglês (PT-BR / EN)**
- Idioma persistido no navegador e atributo `lang` atualizado para acessibilidade

## Stack

- **Angular 20**
- **TypeScript 5.9**
- Angular Material / CDK
- RxJS
- Supabase Auth e persistência
- Cypress para testes E2E
- PWA / experiência offline
- Plus Jakarta Sans
- GitHub Actions
- GitHub Pages

## Decisões técnicas que este projeto demonstra

### Arquitetura Front-end
A aplicação usa Angular standalone e separa responsabilidades de autenticação, sincronização, revisão espaçada, gerenciamento de matérias e experiência principal.

### Persistência e sincronização
O Supabase é responsável pela autenticação e pelos dados na nuvem. O navegador mantém os dados necessários para experiência offline e sincroniza alterações quando possível.

### Internacionalização
A interface possui alternância **PT / EN**, preferência persistida em `localStorage` e atualização de `document.documentElement.lang`, mantendo o idioma escolhido durante novas sessões.

### Qualidade
O projeto possui testes automatizados para fluxos críticos e Cypress para validar a experiência ponta a ponta antes de refatorações e mudanças estruturais.

### Produto e UX
O desenvolvimento considera experiência mobile-first, onboarding, estados vazios, feedback de sincronização, acessibilidade, fluxo de autenticação e continuidade do aprendizado.

## Estrutura

```text
src/
├── app/
│   ├── app.component.*
│   ├── session.component.*
│   ├── subject-manager.component.*
│   ├── i18n.service.ts
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

## Build

```bash
npm run build
```

## Testes

```bash
npm test
npm run e2e
```

## Deploy

A branch `main` é a branch de produção. O deploy é automatizado com GitHub Actions para GitHub Pages.

---

# English version

A **mobile-first learning application** built with Angular to organize study topics, turn knowledge into flashcards and maintain a spaced-repetition review routine.

The project started as a personal study tool and evolved into a **Front-end engineering portfolio case**, combining Angular architecture, authentication, cloud persistence, offline behavior, E2E testing, accessibility, internationalization and CI/CD in a real application.

## Project goal

Rather than treating flashcards as isolated content, the application separates learning into two stages:

- **Study** — organize new knowledge, subjects, topics, priorities, notes and study routines.
- **Review** — reinforce what was learned through flashcards and spaced repetition.

Main flow:

`Subject → Study queue → Complete study → History → Flashcards → Reviews`

## Key features

- Sign-up, login, email confirmation and password recovery with Supabase Auth
- Account-scoped study data
- Configurable subjects, topics and study routines
- Study queue with priorities, notes and links
- Completed-content history
- Manual flashcard creation
- Flashcards with question, answer, explanation and practical example
- Review flow with **Again / Hard / Good / Easy** style feedback
- Automatic scheduling of future reviews
- Subject and topic filters
- Study progress and history
- Reminders and calendar export
- Study backup/export
- Offline experience with later synchronization
- Responsive mobile and desktop UI
- Privacy policy and account deletion flow
- **Portuguese / English (PT-BR / EN)** interface
- Persisted language preference and accessible HTML `lang` updates

## Tech stack

- **Angular 20**
- **TypeScript 5.9**
- Angular Material / CDK
- RxJS
- Supabase Auth and persistence
- Cypress E2E testing
- PWA / offline experience
- Plus Jakarta Sans
- GitHub Actions
- GitHub Pages

## Engineering highlights

### Front-end architecture
The application uses Angular standalone APIs and separates authentication, synchronization, spaced-repetition logic, subject management and the main user experience into distinct responsibilities.

### Persistence and synchronization
Supabase handles authentication and cloud data. The browser keeps the state required for offline usage and synchronizes pending changes when possible.

### Internationalization
The interface supports **PT / EN** switching, persists the selected locale in `localStorage`, and updates `document.documentElement.lang` for accessibility and semantic correctness.

### Quality
Automated tests cover critical product rules, while Cypress validates end-to-end user flows before structural refactors and feature changes.

### Product and UX
The project includes mobile-first interaction design, onboarding, empty states, synchronization feedback, authentication flows, accessibility concerns and learning-continuity decisions.

## Run locally

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test
npm run e2e
```

## Deployment

The `main` branch is the production branch. Deployment is automated through GitHub Actions and GitHub Pages.
