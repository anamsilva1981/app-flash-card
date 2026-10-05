# Preparação para lançamento

A versão web mantém Angular e o visual atual. Android, AAB e Google Play ficam para uma etapa posterior.

## Implementado

- Acesso por e-mail e senha, cadastro com confirmação e recuperação de senha.
- Modo sem conta com armazenamento apenas neste dispositivo.
- Conta nova sem matérias nem histórico de Ana. Biblioteca de exemplo opcional.
- Criação e edição de flashcards por matéria: tópico, pergunta, resposta, explicação e exemplo.
- Cache e fila offline separados por conta. Operações atômicas e idempotentes na nuvem.
- RLS por `auth.uid()`; nenhuma credencial administrativa no frontend.
- Backup versão 2 com o conteúdo completo dos cards; importação de versões 1 e 2.
- Recuperação explícita dos estudos anteriores no mesmo dispositivo.
- Nome, dias e horário de estudo. Agenda ICS e avisos opcionais enquanto a página está aberta.
- Política de privacidade e página externa de exclusão. Exclusão autenticada, revogação de sessões e cascade de dados.
- Solicitações de suporte em `support_requests`, restritas ao autor e à administração. Não há envio automático de e-mail ao responsável.
- CI com build e testes.

## Validação técnica

Testes automatizados: intervalos, prioridade, fila offline, repetição após falha, separação de caches entre contas, visitante sem envio à nuvem, arquivo de calendário, preservação do catálogo original e shell offline.

Banco: duas identidades temporárias em transação com rollback verificaram isolamento de leitura e alteração, conclusão atômica de tópico e idempotência de operações. Nenhuma conta de teste foi mantida.

## Antes de convidar usuários para cadastro

1. Em Supabase → Authentication → URL Configuration, configurar Site URL e Redirect URLs para `https://anamsilva1981.github.io/app-flash-card/`.
2. Configurar SMTP próprio e confirmar os templates de confirmação e redefinição. O provedor de e-mail padrão do Supabase possui limites e restrições que não servem como garantia de envio em produção.
3. Testar com duas contas reais: confirmação de e-mail, login, redefinição, troca de dispositivo, desconexão e exclusão. Os testes de banco não substituem esse teste de entrega de e-mail.
4. Acompanhar solicitações em `support_requests` e definir um canal público de suporte antes da loja. O perfil no GitHub é o contato provisório escolhido.
5. Revisar a política com as práticas efetivas e preencher Segurança dos dados na Play Console quando a versão Android existir.

## Limites dos lembretes

Sem aplicação Android nem servidor de Web Push, não prometemos notificações com o navegador fechado. A agenda ICS pode ser importada em um calendário que ofereça alarmes. Os avisos do navegador precisam de permissão e da página aberta.

## Próxima etapa Android

Capacitor, ícone e assets definitivos da loja, comportamento do botão Voltar e teclado, dispositivos Android reais, AAB assinado, ficha da loja, classificação e teste fechado quando aplicável. A integração Android não foi criada nesta etapa.
