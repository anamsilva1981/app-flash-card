<div align="center">

# 📚 App Flash Card

### Estude com contexto. Revise com intenção. Aprenda de verdade.

Aplicação de estudos **mobile-first** criada para organizar conteúdos, transformar aprendizado em flashcards e apoiar revisões espaçadas em um único lugar.

[![Angular](https://img.shields.io/badge/Angular-20-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Cypress](https://img.shields.io/badge/Cypress-E2E-17202C?logo=cypress&logoColor=white)](https://www.cypress.io/)
[![CI](https://github.com/anamsilva1981/app-flash-card/actions/workflows/ci.yml/badge.svg)](https://github.com/anamsilva1981/app-flash-card/actions/workflows/ci.yml)

**Português** · [English version](#english-version)

</div>

---

## ✨ Sobre o projeto

O **App Flash Card** nasceu de um problema real do meu próprio processo de estudo.

Eu costumava estudar escrevendo, organizando conceitos, criando perguntas, exemplos e tentando explicar o conteúdo com minhas próprias palavras. Com o tempo, esse processo ficou espalhado entre cadernos, anotações, links, conteúdos e flashcards em lugares diferentes — e organizar o estudo começou a consumir tempo demais.

A pergunta que deu origem ao projeto foi simples:

> **E se todo esse processo de estudo pudesse acontecer em um único lugar?**

Foi assim que a aplicação começou.

O que inicialmente seria apenas uma ferramenta pessoal evoluiu para uma aplicação completa e, ao mesmo tempo, para um **case de engenharia Front-end**, reunindo decisões de arquitetura, experiência do usuário, autenticação, persistência, sincronização, internacionalização, testes automatizados e CI/CD.

O objetivo não é apenas memorizar respostas. A proposta é apoiar todo o ciclo:

```text
Organizar → Estudar → Compreender → Criar flashcards → Revisar → Consolidar
```

---

## 🎯 O problema que a aplicação resolve

Ferramentas de flashcards normalmente começam no momento da revisão. O App Flash Card foi pensado para começar antes: **na organização do que ainda precisa ser aprendido**.

A aplicação separa dois momentos importantes:

- **Estudar** — organizar matérias, tópicos, prioridades, anotações, referências e conteúdos pendentes.
- **Revisar** — transformar conhecimento em flashcards e utilizar repetição espaçada para reforçar o aprendizado.

Fluxo principal:

```text
Matéria → A estudar → Conteúdo concluído → Histórico → Flashcards → Revisões
```

---

## 🖥️ Experiência do produto

A aplicação foi construída com foco em uma experiência simples, responsiva e orientada ao estudo.

### Principais funcionalidades

- 🔐 Cadastro, login, confirmação de e-mail e recuperação de senha
- 👤 Isolamento dos dados por conta de usuário
- 📚 Organização por matérias e tópicos
- 📝 Fila **A estudar** com prioridade, anotações e links
- ✅ Registro dos conteúdos concluídos
- 🧠 Criação manual de flashcards
- 💡 Flashcards com pergunta, resposta, explicação e exemplo prático
- 🔁 Revisão com níveis de dificuldade
- 📅 Agendamento das próximas revisões
- 🔎 Filtros por matéria e tópico
- 📈 Progresso e histórico de estudos
- 🗓️ Rotina de estudos e exportação para calendário
- 💾 Backup/exportação dos estudos
- 📶 Experiência offline com sincronização posterior
- 📱 Interface responsiva para mobile e desktop
- 🌎 Interface em Português e Inglês
- ♿ Cuidados com acessibilidade e semântica
- 🗑️ Fluxo de exclusão de conta e política de privacidade

<!--
GALERIA DE SCREENSHOTS
Adicionar antes da divulgação no LinkedIn:

## 📸 Screenshots

| Início | Matérias |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Subjects](docs/screenshots/subjects.png) |

| Conteúdo | Flashcards |
|---|---|
| ![Study](docs/screenshots/study.png) | ![Flashcards](docs/screenshots/flashcards.png) |
-->

---

## 🧩 Stack

| Camada | Tecnologia |
|---|---|
| Front-end | Angular 20 |
| Linguagem | TypeScript 5.9 |
| UI | Angular Material / CDK |
| Reatividade | RxJS |
| Backend as a Service | Supabase |
| Autenticação | Supabase Auth |
| Testes unitários | Node Test Runner + c8 |
| Testes E2E | Cypress 15 |
| PWA / Offline | Angular Service Worker |
| Qualidade | ESLint + Prettier |
| CI/CD | GitHub Actions |
| Deploy | GitHub Pages |

---

## 🏗️ Engenharia e decisões técnicas

Este projeto também foi desenvolvido como exercício prático de engenharia de software aplicada a um produto real.

### Arquitetura Front-end

A aplicação utiliza Angular com APIs standalone e separação de responsabilidades entre autenticação, regras de estudo, sincronização, gerenciamento das matérias e experiência principal.

O foco da arquitetura é manter:

- responsabilidades bem definidas;
- baixo acoplamento;
- código testável;
- regras de negócio separadas da interface;
- evolução segura do produto.

### Persistência e segurança de dados

O Supabase é utilizado para autenticação e persistência na nuvem. Os dados de estudo são associados à conta autenticada e o projeto possui validações automatizadas para cenários de persistência e isolamento entre usuários.

Nenhuma chave privada ou `service_role` deve ser utilizada no frontend. A aplicação trabalha apenas com configuração pública apropriada para clientes web.

### Offline e sincronização

O navegador mantém o estado necessário para permitir continuidade de uso quando a conexão não está disponível, sincronizando alterações posteriormente quando possível.

### Internacionalização

A interface possui alternância entre **PT-BR / EN**, preferência persistida no navegador e atualização do atributo HTML `lang`, preservando acessibilidade e semântica entre sessões.

---

## 🧪 Estratégia de qualidade

O projeto possui uma esteira de qualidade automatizada que executa verificações antes das principais mudanças.

```text
Format → Lint → Build → Unit Tests → Coverage → E2E → Integration
```

A suíte inclui:

- testes unitários das regras de estudo;
- cobertura mínima automatizada;
- testes E2E com Cypress;
- testes de persistência com backend descartável;
- testes de isolamento de dados entre usuários;
- validação do fluxo de exclusão de conta;
- build de produção no CI.

### Comandos principais

```bash
npm run format:check
npm run lint
npm test
npm run test:coverage
npm run test:integration
npm run e2e
npm run build
```

---

## 🚀 Executando localmente

### Pré-requisitos

- Node.js 22+
- npm

### 1. Clone o repositório

```bash
git clone https://github.com/anamsilva1981/app-flash-card.git
cd app-flash-card
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias utilizando apenas credenciais públicas apropriadas para o frontend.

> Nunca utilize uma chave `service_role`, senha ou segredo privado dentro da aplicação cliente.

### 4. Inicie o projeto

```bash
npm start
```

Por padrão, a aplicação será executada em:

```text
http://localhost:4200
```

---

## 🔐 Variáveis de ambiente

O projeto utiliza configuração de ambiente para separar dados públicos de infraestrutura do código-fonte.

Exemplo:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
APP_OWNER_NAME=
APP_SUPPORT_URL=
APP_PRIVACY_UPDATED_AT=
```

Durante a configuração, os scripts geram o arquivo `src/app/app-config.generated.ts`, que **não deve ser versionado**.

---

## ⚙️ CI/CD

O projeto utiliza GitHub Actions em duas frentes:

**Quality Gate**

Valida formatação, lint, build, cobertura de testes, Cypress e integração antes de mudanças estruturais.

**Deploy**

A branch `main` representa a versão de produção. O deploy para GitHub Pages ocorre automaticamente após a validação da aplicação.

---

## 📁 Visão da estrutura

```text
app-flash-card/
├── .github/          # workflows de CI/CD
├── cypress/          # testes end-to-end
├── database/         # scripts e estrutura de persistência
├── docs/             # documentação técnica
├── scripts/          # automações de configuração e testes
├── src/              # aplicação Angular
├── tests/
│   ├── unit/         # testes unitários
│   └── integration/  # testes de integração
├── angular.json
├── cypress.config.js
├── package.json
└── README.md
```

---

## 💭 O que este projeto representa

Mais do que uma aplicação de flashcards, este projeto representa a evolução de uma necessidade pessoal para um produto funcional.

Durante o desenvolvimento, trabalhei não apenas na implementação das funcionalidades, mas também em decisões envolvendo:

- arquitetura e organização do código;
- experiência do usuário;
- modelagem e persistência de dados;
- autenticação e autorização;
- estratégia de testes;
- acessibilidade;
- experiência offline;
- internacionalização;
- automação de qualidade e deploy.

É um projeto construído **enquanto eu estudava — e que também me fez estudar muito para conseguir construí-lo.**

---

## 🤝 Feedback

O App Flash Card é gratuito e nasceu como uma ferramenta de estudo pessoal.

Se você testar a aplicação e encontrar um problema ou tiver alguma sugestão, fique à vontade para abrir uma issue no repositório.

---

<div align="center">

Desenvolvido por **Ana Maria** como projeto de estudo, engenharia e portfólio Front-end.

</div>

---

# English version

## 📚 App Flash Card

**Study with context. Review with intention. Learn for real.**

App Flash Card is a **mobile-first learning application** built to organize study content, transform knowledge into flashcards and support spaced-repetition reviews in one place.

The project started from a real problem in my own learning process: notes, references, topics and flashcards were spread across different places, and organizing the study process was becoming more time-consuming than studying itself.

The question behind the project was simple:

> **What if the entire learning workflow could live in one place?**

What started as a personal tool evolved into a complete application and a **Front-end engineering portfolio case**, combining product thinking, Angular architecture, authentication, cloud persistence, offline behavior, automated testing, accessibility, internationalization and CI/CD.

### Main learning flow

```text
Organize → Study → Understand → Create flashcards → Review → Retain
```

## Key features

- Sign-up, login, email confirmation and password recovery
- Account-scoped study data
- Subjects and topics organization
- Study queue with priorities, notes and references
- Completed-content history
- Manual flashcard creation
- Flashcards with question, answer, explanation and practical example
- Difficulty-based review flow
- Automatic review scheduling
- Subject and topic filters
- Study progress and history
- Study routine and calendar export
- Study backup/export
- Offline experience with later synchronization
- Responsive mobile and desktop UI
- Portuguese / English interface
- Accessibility considerations
- Privacy policy and account deletion flow

## Tech stack

- Angular 20
- TypeScript 5.9
- Angular Material / CDK
- RxJS
- Supabase Auth and persistence
- Cypress E2E
- Node Test Runner + c8
- Angular Service Worker / PWA
- ESLint + Prettier
- GitHub Actions
- GitHub Pages

## Engineering highlights

The project was designed not only as a product, but also as a practical software-engineering exercise.

It includes automated quality gates for formatting, linting, production builds, unit tests, coverage, end-to-end tests and integration scenarios using a disposable backend.

The application also validates persistence and user-data isolation while keeping private credentials outside the client application.

## Run locally

```bash
git clone https://github.com/anamsilva1981/app-flash-card.git
cd app-flash-card
npm install
cp .env.example .env
npm start
```

Node.js 22+ is required.

## Tests

```bash
npm test
npm run test:coverage
npm run test:integration
npm run e2e
```

## Build

```bash
npm run build
```

## Deployment

`main` is the production branch. Deployment to GitHub Pages is automated through GitHub Actions after the application passes the configured quality checks.

---

<div align="center">

Built by **Ana Maria** as a Front-end learning, engineering and portfolio project.

</div>
