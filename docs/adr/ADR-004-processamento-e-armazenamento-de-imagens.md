# ADR-004 — Processamento e armazenamento de imagens

| Campo  | Valor            |
|--------|------------------|
| Status | Aceito           |
| Data   | 2026-11-12       |
| Autor  | Matheus Juvino   |

## Contexto

A base do EasyFood passou a aceitar foto de perfil, foto de restaurante e imagem de prato.

## Decisão

Receber o arquivo com multer, converter com sharp para WebP e gravar em `uploads/`.

O frontend atual do projeto não usa essas rotas; elas existem na API para manter a mesma base em camadas.
