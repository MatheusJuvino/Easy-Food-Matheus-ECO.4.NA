# ADR-003 — Autenticação com JWT

| Campo  | Valor            |
|--------|------------------|
| Status | Aceito           |
| Data   | 2026-09-24       |
| Autor  | Matheus Juvino   |

## Contexto

O cadastro de restaurantes precisa ser feito só por usuário autenticado.

## Decisão

Usar JWT (JSON Web Token) com senha armazenada em hash bcrypt.

## Rotas

- POST `/auth/register` e POST `/register`
- POST `/auth/login` e POST `/login`
- GET `/auth/me` e GET `/me`
- PUT `/me` para atualizar o endereço fictício
- POST `/restaurants` exige `Authorization: Bearer TOKEN`
