# EasyFood

Projeto acadêmico de Engenharia de Software: catálogo de restaurantes com API em Node.js e interface web própria.

Autor: Matheus Juvino

## O que o sistema faz

- Lista restaurantes cadastrados
- Permite cadastrar um novo restaurante (nome, categoria e avaliação)
- Grava os dados no PostgreSQL usando Prisma

## Tecnologias

- Backend: Node.js, Express, Prisma
- Banco: PostgreSQL
- Frontend: HTML, CSS e JavaScript (pasta `public`)

## Como executar

1. Instale as dependências:

```
npm install
npx prisma generate
```

2. Configure o arquivo `.env` com a variável `DATABASE_URL` apontando para o PostgreSQL.

3. Aplique as migrations (se o banco ainda não tiver a tabela):

```
npx prisma migrate deploy
```

4. Inicie o servidor:

```
npm start
```

5. Abra no navegador: `http://localhost:3000`

## API

| Método | Rota            | Função                 |
|--------|-----------------|------------------------|
| GET    | `/restaurants`  | Lista os restaurantes  |
| POST   | `/restaurants`  | Cadastra restaurante   |

Campos do cadastro: `name`, `category` e `rating` (opcional; padrão 0).
Nome e categoria são obrigatórios.
