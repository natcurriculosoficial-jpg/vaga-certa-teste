# Roteiro de teste manual — Vaga Certa

Execute na interface real (avagacerta.com) antes de divulgar. Marque cada item.
Use um e-mail real que você acessa (ex.: `seuemail+teste1@gmail.com`).

## 1. Cadastro e e-mail
- [ ] Abrir a landing page (deslogado) → clicar em **Criar conta grátis**
- [ ] Preencher nome, e-mail, telefone e senha (mín. 8 caracteres, 1 maiúscula, 1 número, 1 símbolo)
- [ ] Ver a tela "Verifique seu e-mail"
- [ ] Receber o e-mail **em português**, remetente `contato@avagacerta.com`, assunto "Confirme seu cadastro"
- [ ] Clicar no link de confirmação → conseguir entrar
- [ ] Em até 15 min, receber o e-mail de **boas-vindas**

## 2. Onboarding e estado inicial
- [ ] Completar o onboarding (área, cargo, nível)
- [ ] No Dashboard, o saldo deve ser **3 créditos** (do trial), não 33
- [ ] O plano exibido é **Essencial (teste)** durante os 7 dias

## 3. Currículo com IA
- [ ] Adicionar uma experiência e clicar em **gerar bullets com IA** → texto aparece
- [ ] Gerar objetivo com IA → saldo de créditos **diminui** a cada uso
- [ ] Ao zerar os créditos, aparece o aviso **"Seus créditos acabaram"** (modal bonito, NÃO página de erro)

## 4. LinkedIn com IA
- [ ] Gerar headline e "sobre" → textos aparecem e são salvos

## 5. Recursos por plano (no trial Essencial)
- [ ] Tentar abrir **Simulador de Entrevista** → bloqueado ("recurso do plano Candidato")
- [ ] Tentar abrir **Job Tracker** → bloqueado
- [ ] Tentar **postar na Comunidade** → bloqueado

## 6. Pagamento PIX (plano)
- [ ] Ir em Planos → assinar **Candidato** → escolher **PIX**
- [ ] Informar CPF (na 1ª vez) → QR Code aparece
- [ ] Pagar o PIX de verdade (valor real!) OU usar um valor de teste pequeno
- [ ] Em até 2 min o modal mostra **"Pagamento confirmado"** e o plano vira Candidato
- [ ] Receber e-mail de **recibo**
- [ ] Agora o Simulador de Entrevista e o Job Tracker **funcionam**
- [ ] O saldo de créditos passa a ser o do plano (80 no Candidato)

## 7. Pagamento cartão (plano)
- [ ] Assinar um plano → escolher **Cartão** → redireciona ao Stripe
- [ ] Pagar com cartão → volta ao app com plano ativo
- [ ] Receber e-mail de recibo

## 8. Recarga de créditos
- [ ] Comprar um pacote de créditos (PIX ou cartão) → após pagar, saldo aumenta

## 9. Reembolso (fazer no painel Asaas/Stripe)
- [ ] Reembolsar um pagamento **feito há menos de 7 dias** → conta volta pro **Free**, acesso cortado, e-mail de reembolso recebido
- [ ] (Opcional) Reembolsar um pagamento **com mais de 7 dias** → mantém acesso até o fim do período pago

## 10. Segurança (rápido)
- [ ] Sair da conta → tentar abrir `/dashboard` direto na URL → é mandado para a landing/login
- [ ] Com dois usuários diferentes, confirmar que um não vê os dados do outro

---
**Plano Profissional:** IA ilimitada (créditos não diminuem), export sem marca d'água, tudo liberado.
