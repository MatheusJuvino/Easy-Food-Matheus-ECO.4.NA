require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Defina JWT_SECRET no arquivo .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Faça login para cadastrar restaurantes." });
  }

  const token = header.slice(7);

  try {
    const dados = jwt.verify(token, JWT_SECRET);
    req.usuario = dados;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST — Cadastrar usuário
app.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  if (!emailValido(email)) {
    return res.status(400).json({ error: "Informe um e-mail válido." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const existente = await prisma.user.findUnique({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: "Já existe um usuário com este e-mail." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    res.status(201).json({
      id: usuario.id,
      name: usuario.name,
      email: usuario.email
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST — Login (gera JWT)
app.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const senhaOk = await bcrypt.compare(password, usuario.passwordHash);
    if (!senhaOk) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET — Listar restaurantes
app.get("/restaurants", async (req, res) => {
  try {
    const restaurantes = await prisma.restaurant.findMany();
    res.json(restaurantes);
  } catch (error) {
    console.error("Erro ao buscar restaurantes:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST — Cadastrar restaurante (somente autenticado)
app.post("/restaurants", autenticar, async (req, res) => {
  const { name, category, rating } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: "Nome e categoria são obrigatórios" });
  }

  try {
    const novoRestaurante = await prisma.restaurant.create({
      data: {
        name,
        category,
        rating: rating || 0,
        userId: req.usuario.userId
      }
    });

    res.status(201).json(novoRestaurante);
  } catch (error) {
    console.error("Erro ao cadastrar restaurante:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.listen(3000, () => {
  console.log("EasyFood rodando na porta 3000");
});
