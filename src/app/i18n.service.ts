import { Injectable, signal } from '@angular/core';

type Locale = 'pt-BR' | 'en';

const STORAGE_KEY = 'study-locale';

const EN: Record<string, string> = {
  'Uma nova versão está pronta.': 'A new version is ready.',
  'Atualizar': 'Update',
  'Voltar': 'Back',
  'Voltar ao aplicativo': 'Back to the app',
  'Voltar ao início': 'Back to home',
  'Revisão livre': 'Free review',
  'Progresso da sessão': 'Session progress',
  'Conteúdo': 'Content',
  'Sessão': 'Session',
  'Todos': 'All',
  'RESPOSTA': 'ANSWER',
  'PERGUNTA': 'QUESTION',
  'Avalie abaixo como foi lembrar': 'Rate below how easy it was to remember',
  'Toque para ver a resposta': 'Tap to reveal the answer',
  'Entender melhor': 'Understand better',
  'ENTENDA MELHOR': 'UNDERSTAND BETTER',
  'EXEMPLO PRÁTICO': 'PRACTICAL EXAMPLE',
  'Não sei': "Don't know",
  'Difícil': 'Hard',
  'Sei': 'Got it',
  'Fácil': 'Easy',
  'Prática': 'Practice',
  'Virar card': 'Flip card',
  'Revisão concluída': 'Review complete',
  'Próxima sessão': 'Next session',
  'REVISÃO': 'REVIEW',
  'Revisar flashcards': 'Review flashcards',
  'Uma sessão de cada vez.': 'One session at a time.',
  'cards aguardando revisão': 'cards waiting for review',
  'Vamos aprender um pouco hoje?': 'Ready to learn something today?',
  'dia seguido': 'day streak',
  'dias seguidos': 'day streak',
  'PRIMEIROS PASSOS': 'GETTING STARTED',
  'Crie seu primeiro baralho': 'Create your first deck',
  'Um baralho reúne os flashcards de um assunto, como Inglês, JavaScript ou Matemática.': 'A deck groups flashcards from one subject, such as English, JavaScript or Mathematics.',
  'Criar meu primeiro baralho': 'Create my first deck',
  'Adicione o primeiro tópico': 'Add your first topic',
  'Tópicos são os assuntos que você quer estudar dentro desse baralho.': 'Topics are the subjects you want to study inside this deck.',
  'Adicionar tópico': 'Add topic',
  'Escolha quando estudar': 'Choose when to study',
  'Defina os dias em que este baralho deve aparecer na sua rotina.': 'Choose the days when this deck should appear in your study routine.',
  'Escolher dias de estudo': 'Choose study days',
  'Crie seu primeiro flashcard': 'Create your first flashcard',
  'Registre uma pergunta, a resposta e, se quiser, uma explicação e um exemplo.': 'Add a question, its answer and, if you want, an explanation and an example.',
  'Criar primeiro flashcard': 'Create first flashcard',
  'SUA REVISÃO DIÁRIA': 'YOUR DAILY REVIEW',
  'Tudo em dia!': 'All caught up!',
  'Sua revisão está em dia. Você também pode praticar livremente.': 'Your reviews are up to date. You can also practice freely.',
  'Começar revisão': 'Start review',
  'Explorar flashcards': 'Explore flashcards',
  'Baralhos do dia': "Today's decks",
  'baralho': 'deck',
  'baralhos': 'decks',
  'Nenhum tópico pendente': 'No pending topics',
  'tópico pendente': 'pending topic',
  'tópicos pendentes': 'pending topics',
  'Pronta para estudar': 'Ready to study',
  'Estudos em dia': 'Studies up to date',
  'Hoje, no seu ritmo': 'Today, at your pace',
  'Escolha os dias dos seus baralhos para organizar o próximo estudo.': 'Choose study days for your decks to organize your next session.',
  'Organizar minha rotina': 'Organize my routine',
  'Adicionar um tópico': 'Add a topic',
  'Capturar um tópico': 'Capture a topic',
  'PLANO DE ESTUDO': 'STUDY PLAN',
  'Estudar': 'Study',
  'Todos os tópicos pendentes': 'All pending topics',
  'Caixa de entrada': 'Inbox',
  'Editar tópico': 'Edit topic',
  'Título do tópico': 'Topic title',
  'Baralho': 'Deck',
  '(opcional)': '(optional)',
  'Adicionar novo baralho': 'Add new deck',
  'Nome do novo baralho': 'New deck name',
  'Adicionar': 'Add',
  'Cancelar': 'Cancel',
  'Observação': 'Notes',
  'Anotações sobre o que você quer estudar...': 'Notes about what you want to study...',
  'Link': 'Link',
  'Prioridade': 'Priority',
  'Baixa': 'Low',
  'Média': 'Medium',
  'Alta': 'High',
  'Salvar alterações': 'Save changes',
  'Fechar formulário': 'Close form',
  'SEUS ESTUDOS': 'YOUR STUDIES',
  'Meu progresso': 'My progress',
  'Acompanhe seu ritmo de revisão.': 'Track your review pace.',
  'Para revisar': 'To review',
  'Cards cadastrados': 'Cards created',
  'Dias no histórico': 'Days in history',
  'Privacidade': 'Privacy',
  'Privacidade dos seus estudos': 'Your study privacy',
  'O que armazenamos': 'What we store',
  'Para que usamos': 'How we use it',
  'No seu dispositivo': 'On your device',
  'Lembretes': 'Reminders',
  'Exportar e excluir': 'Export and delete',
  'Contato': 'Contact',
  'Solicitar exclusão da conta': 'Request account deletion',
  'Excluir sua conta': 'Delete your account',
  'Entrar para excluir minha conta': 'Sign in to delete my account',
  'Preparando seus estudos…': 'Preparing your studies…',
  'APRENDA UM POUCO TODOS OS DIAS': 'LEARN A LITTLE EVERY DAY',
  'Seu próximo aprendizado começa aqui': 'Your next learning journey starts here',
  'Recupere seu acesso': 'Recover your access',
  'Escolha uma nova senha': 'Choose a new password',
  'Bem-vinda de volta': 'Welcome back',
  'Organize o que estudar. Revise o que aprendeu.': 'Organize what to study. Review what you learned.',
  'Seu nome': 'Your name',
  'E-mail': 'Email',
  'Senha': 'Password',
  '8 caracteres': '8 characters',
  'Letra maiúscula': 'Uppercase letter',
  'Letra minúscula': 'Lowercase letter',
  'Número': 'Number',
  'Caractere especial': 'Special character',
  'Criar conta': 'Create account',
  'Enviar link': 'Send link',
  'Salvar nova senha': 'Save new password',
  'Entrar': 'Sign in',
  'Esqueci minha senha': 'Forgot my password',
  'Criar uma conta': 'Create an account',
  'Já tenho uma conta': 'I already have an account',
  'Ir para o login': 'Go to sign in',
  'Entendi': 'Got it',
  'Conta criada com sucesso!': 'Account created successfully!',
  'Verifique seu e-mail': 'Check your email',
  'Não foi possível concluir': 'Could not complete the request',
  'Aguarde…': 'Please wait…',
  'Perfil': 'Profile',
  'Suporte': 'Support',
  'Configurações': 'Settings',
  'Histórico': 'History',
  'Progresso': 'Progress',
  'Início': 'Home',
  'Editar': 'Edit',
  'Excluir': 'Delete',
  'Salvar': 'Save',
  'Concluir': 'Complete',
  'Novo flashcard': 'New flashcard',
  'Editar flashcard': 'Edit flashcard',
  'Pergunta': 'Question',
  'Resposta': 'Answer',
  'Explicação': 'Explanation',
  'Exemplo': 'Example',
  'Exemplo prático': 'Practical example'
};

const PATTERNS: Array<[RegExp, (...parts: string[]) => string]> = [
  [/^Olá!$/, () => 'Hello!'],
  [/^Olá, (.+)!$/, name => `Hello, ${name}!`],
  [/^(\d+) cards pendentes$/, count => `${count} pending cards`],
  [/^(\d+) flashcards para revisar$/, count => `${count} flashcards to review`],
  [/^(\d+) dias seguidos de estudo$/, count => `${count}-day study streak`],
  [/^(\d+) dia\(s\)$/, count => `${count} day(s)`],
  [/^Concluir (.+)$/, title => `Complete ${title}`],
  [/^Uma sessão de (.+) cards para manter seu ritmo\.$/, amount => `A session of ${amount} cards to keep your momentum.`],
  [/^Você concluiu esta sessão\. (\d+) cards continuam pendentes neste conteúdo\.$/, count => `You completed this session. ${count} cards are still pending in this content.`],
  [/^Todos os tópicos pendentes · (\d+)$/, count => `All pending topics · ${count}`]
];

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly language = signal<Locale>(this.initialLocale());
  private readonly textSource = new WeakMap<Text, string>();
  private readonly attributeSource = new WeakMap<Element, Map<string, string>>();
  private observer?: MutationObserver;

  start(): void {
    document.documentElement.lang = this.language();
    this.apply(document.body);
    if (this.observer) return;
    this.observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData' && record.target instanceof Text) this.translateTextNode(record.target);
        if (record.type === 'attributes' && record.target instanceof Element && record.attributeName) this.translateAttribute(record.target, record.attributeName);
        record.addedNodes.forEach(node => this.apply(node));
      }
    });
    this.observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title']
    });
  }

  toggle(): void {
    this.setLanguage(this.language() === 'pt-BR' ? 'en' : 'pt-BR');
  }

  setLanguage(locale: Locale): void {
    this.language.set(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    this.apply(document.body, true);
  }

  private initialLocale(): Locale {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'pt-BR') return saved;
    return navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
  }

  private apply(node: Node, force = false): void {
    if (node instanceof Text) this.translateTextNode(node, force);
    if (node instanceof Element) {
      ['placeholder', 'aria-label', 'title'].forEach(attribute => this.translateAttribute(node, attribute, force));
      node.childNodes.forEach(child => this.apply(child, force));
    }
  }

  private translateTextNode(node: Text, force = false): void {
    const value = node.nodeValue ?? '';
    if (!value.trim()) return;
    let source = this.textSource.get(node);
    if (!source) {
      source = value;
      this.textSource.set(node, source);
    } else if (!force && this.language() === 'en' && value !== this.translate(source)) {
      source = value;
      this.textSource.set(node, source);
    }
    const target = this.language() === 'en' ? this.translate(source) : source;
    if (value !== target) node.nodeValue = target;
  }

  private translateAttribute(element: Element, attribute: string, force = false): void {
    if (!element.hasAttribute(attribute)) return;
    const value = element.getAttribute(attribute) ?? '';
    let sources = this.attributeSource.get(element);
    if (!sources) {
      sources = new Map<string, string>();
      this.attributeSource.set(element, sources);
    }
    let source = sources.get(attribute);
    if (!source) {
      source = value;
      sources.set(attribute, source);
    } else if (!force && this.language() === 'en' && value !== this.translate(source)) {
      source = value;
      sources.set(attribute, source);
    }
    const target = this.language() === 'en' ? this.translate(source) : source;
    if (value !== target) element.setAttribute(attribute, target);
  }

  private translate(value: string): string {
    const leading = value.match(/^\s*/)?.[0] ?? '';
    const trailing = value.match(/\s*$/)?.[0] ?? '';
    const core = value.trim();
    const direct = EN[core];
    if (direct) return `${leading}${direct}${trailing}`;
    for (const [pattern, replacer] of PATTERNS) {
      const match = core.match(pattern);
      if (match) return `${leading}${replacer(...match.slice(1))}${trailing}`;
    }
    return value;
  }
}
