# EasyFood

Projeto acadêmico de Engenharia de Software: catálogo de restaurantes com API em Node.js e interface web própria.

Autor: Matheus Juvino

## O que o sistema faz

- Cadastro de usuário (a senha é gravada com hash bcrypt, nunca em texto puro)
- Login com geração de JWT
- Endereço fictício do usuário e do restaurante (cidade e bairro)
- Listagem de restaurantes
- Cadastro de restaurante **somente após o login**
- Busca por faixa de avaliação (0 a 5) e pelos mais próximos

## Fluxo

1. Criar conta em `/cadastro.html` (com endereço fictício)
2. Fazer login em `/login.html`
3. Receber o JWT
4. Usar o menu: Catálogo, Buscar, Novo restaurante, Meu endereço

## Tecnologias

- Backend: Node.js, Express, Prisma
- Banco: SQLite (arquivo `dev.db`, gerado na sua máquina)
- Autenticação: bcryptjs (hash da senha) e JWT (sessão)
- Frontend: HTML, CSS e JavaScript (pasta `public`)

## Como executar

1. Instale as dependências:

```
npm install
npx prisma generate
```

2. Copie `.env.example` para `.env` e preencha:

- `DATABASE_URL` — neste projeto local use `file:./dev.db` (SQLite)
- `JWT_SECRET` com um texto longo e secreto (não compartilhe)

3. Aplique as migrations:

```
npx prisma migrate deploy
```

4. Inicie o servidor:

```
npm start
```

5. Abra no navegador: `http://localhost:3000` (a tela inicial redireciona para o login)

## API

| Método | Rota            | Autenticação | Função                |
|--------|-----------------|--------------|-----------------------|
| POST   | `/register`     | Não          | Cadastra usuário      |
| POST   | `/login`        | Não          | Login e retorno do JWT|
| GET    | `/me`           | JWT          | Dados e endereço      |
| PUT    | `/me`           | JWT          | Atualiza endereço     |
| GET    | `/restaurants`  | Opcional     | Lista/filtra restaurantes |
| POST   | `/restaurants`  | JWT          | Cadastra restaurante  |

A avaliação vai de 0 a 5. A busca aceita `minRating`, `maxRating` e `ordenar=proximidade`.

O cadastro de restaurante envia o header:

`Authorization: Bearer SEU_TOKEN`
