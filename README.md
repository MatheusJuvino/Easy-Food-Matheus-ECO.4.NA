# EasyFood

Sistema de gerenciamento de restaurantes desenvolvido como projeto acadêmico. O EasyFood possui uma API REST para cadastro e consulta de restaurantes, autenticação de usuários com JWT e uma interface web própria.

Autor: Matheus Juvino

## Objetivo

Desenvolver uma aplicação para gerenciamento de restaurantes, aplicando conceitos de:

- API REST
- Banco de dados
- Autenticação
- Arquitetura em camadas
- Frontend e backend
- Git e GitHub

## Tecnologias

Backend:

- Node.js
- Express
- Prisma ORM
- SQLite (arquivo local `dev.db`, para rodar sem instalar PostgreSQL)
- JWT
- bcryptjs
- dotenv
- CORS
- multer e sharp (upload e otimização de imagens)

Frontend (pasta `public`, visual próprio deste projeto):

- HTML5
- CSS3
- JavaScript

## Funcionalidades

- Cadastro de usuários
- Login
- Autenticação com JWT
- Listagem de restaurantes
- Cadastro de restaurantes (protegido)
- Endereço fictício e busca por proximidade
- API de pratos e upload de imagens
- Interface web

## Arquitetura

Requisição → Routes → Controller → Service → Prisma → Banco

```
easy-food/
├── docs/adr/
├── public/          # frontend deste projeto (não substituído)
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── app.js
│   ├── database/
│   └── modules/
│       ├── auth/
│       ├── restaurants/
│       ├── dishes/
│       └── shared/
├── .gitignore
├── package.json
└── server.js
```

## Autenticação

A autenticação usa JSON Web Token (JWT).

- POST `/auth/register` e POST `/register` — cadastro de usuário
- POST `/auth/login` e POST `/login` — login
- GET `/auth/me` e GET `/me` — usuário autenticado
- PUT `/me` — atualiza nome e endereço fictício
- POST `/restaurants` exige token JWT

O frontend atual continua usando `/register`, `/login`, `/me` e `/restaurants`.

## Restaurantes e pratos

- GET `/restaurants` — listar (aceita `minRating`, `maxRating` e `ordenar=proximidade`)
- POST `/restaurants` — cadastrar (JWT)
- GET `/restaurants/:id/dishes` — listar pratos
- POST `/restaurants/:id/dishes` — cadastrar prato (JWT)

## Como executar

1. Instale as dependências:

```
npm install
npx prisma generate
```

2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`.

3. Aplique as migrations:

```
npx prisma migrate deploy
```

4. (Opcional) Popular o banco:

```
node prisma/seed.js
```

5. Inicie o servidor:

```
npm start
```

6. Abra `http://localhost:3000`

## Documentação

As decisões de arquitetura estão em `adrs/` e `docs/adr/`.
