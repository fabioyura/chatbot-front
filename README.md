# Dashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# Dashboard - Fluxo de Autenticação JWT (Bearer Token)

Este projeto utiliza autenticação baseada em **JWT (Bearer Token)** para proteger rotas e consumir APIs seguras. Abaixo está um guia rápido para desenvolvedores sobre como funciona o fluxo de autenticação e como está implementado no código.

## Como funciona o fluxo de autenticação

1. **Login**
   - O usuário informa e-mail/CPF e senha na tela de login.
   - O front-end faz um POST para `/api/Auth/login`.
   - O backend responde com um JWT (token) e informações do usuário.
   - O token é salvo no `localStorage` pelo `AuthService`.

2. **Envio automático do token**
   - Um **interceptor HTTP** (`AuthInterceptor`) adiciona automaticamente o header `Authorization: Bearer <token>` em todas as requisições HTTP feitas pelo Angular.
   - Não é necessário adicionar o token manualmente em cada requisição.

3. **Proteção de rotas**
   - O `AuthGuard` protege rotas sensíveis (ex: `/enterprise`, `/enterprise/:id/prompt`).
   - Se o usuário não estiver autenticado (sem token), é redirecionado para a tela de login.

4. **Logout**
   - O método `logout()` do `AuthService` remove o token do `localStorage`.
   - O usuário é redirecionado para a tela de login e perde acesso às rotas protegidas.

5. **Validação no backend**
   - O backend valida o token JWT recebido no header `Authorization` em cada requisição protegida.
   - Se o token for inválido ou ausente, retorna 401 (não autorizado).

## Principais arquivos relacionados

- `src/app/core/services/auth.service.ts` — Serviço responsável por login, logout e armazenamento do token.
- `src/app/core/services/auth.interceptor.ts` — Interceptor que adiciona o token JWT nas requisições HTTP.
- `src/app/core/services/auth.guard.ts` — Guarda de rota que protege páginas sensíveis.
- `src/app/app.routes.ts` — Configuração das rotas protegidas.
- `src/app/shared/components/header/header.component.ts` — Botão de logout visível quando autenticado.

## Exemplo de uso do AuthService

```typescript
this.authService.login(email, password).subscribe({
  next: (res) => {
    this.router.navigate(['/enterprise', res.enterpriseId, 'prompt']);
  },
  error: (err) => {
  }
});

this.authService.logout();
this.router.navigate(['/login']);
```

## Observações
- O token é salvo no `localStorage` e enviado automaticamente em todas as requisições autenticadas.
- Para adicionar novas rotas protegidas, basta usar o `canActivate: [AuthGuard]` na configuração da rota.

---

Se tiver dúvidas sobre o fluxo de autenticação ou precisar adaptar para outro backend, consulte o `AuthService` e o `AuthInterceptor` para ajustes.
