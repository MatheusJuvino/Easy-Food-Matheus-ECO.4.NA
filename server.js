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
    return res.status(401).json({ error: "Faça login para continuar." });
  }

  const token = header.slice(7);

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

function autenticarOpcional(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.usuario = jwt.verify(header.slice(7), JWT_SECRET);
    } catch (error) {
      req.usuario = null;
    }
  }
  next();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    endereco: usuario.endereco,
    cidade: usuario.cidade,
    bairro: usuario.bairro,
    latitude: usuario.latitude,
    longitude: usuario.longitude
  };
}

function lerNota(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return 0;
  }
  const nota = Number(valor);
  if (Number.isNaN(nota) || nota < 0 || nota > 5) {
    return null;
  }
  return nota;
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const raio = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return raio * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function textoSeguro(valor) {
  return String(valor || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

function dadosLocal(body) {
  return {
    endereco: textoSeguro(body.endereco) || null,
    cidade: textoSeguro(body.cidade) || null,
    bairro: textoSeguro(body.bairro) || null,
    latitude: body.latitude === "" || body.latitude == null ? null : Number(body.latitude),
    longitude: body.longitude === "" || body.longitude == null ? null : Number(body.longitude)
  };
}

app.post("/register", async (req, res) => {
  const name = textoSeguro(req.body.name);
  const email = textoSeguro(req.body.email).toLowerCase();
  const password = String(req.body.password || "");
  const local = dadosLocal(req.body);

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
      data: { name, email, passwordHash, ...local }
    });

    res.status(201).json(usuarioPublico(usuario));
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

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

    res.json({ token, user: usuarioPublico(usuario) });
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/me", autenticar, async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({ where: { id: req.usuario.userId } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.json(usuarioPublico(usuario));
  } catch (error) {
    console.error("Erro ao buscar perfil:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.put("/me", autenticar, async (req, res) => {
  const name = textoSeguro(req.body.name);
  const local = dadosLocal(req.body);

  if (!name) {
    return res.status(400).json({ error: "O nome é obrigatório." });
  }

  if (!local.cidade || !local.bairro || !local.endereco) {
    return res.status(400).json({ error: "Informe endereço, cidade e bairro." });
  }

  try {
    const usuario = await prisma.user.update({
      where: { id: req.usuario.userId },
      data: { name, ...local }
    });
    res.json(usuarioPublico(usuario));
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/restaurants", autenticarOpcional, async (req, res) => {
  try {
    let restaurantes = await prisma.restaurant.findMany();
    restaurantes = restaurantes.map(function (item) {
      return {
        id: item.id,
        name: textoSeguro(item.name) || "Restaurante",
        category: textoSeguro(item.category),
        rating: item.rating == null ? 0 : Number(item.rating),
        endereco: textoSeguro(item.endereco),
        cidade: textoSeguro(item.cidade),
        bairro: textoSeguro(item.bairro),
        latitude: item.latitude,
        longitude: item.longitude,
        userId: item.userId
      };
    });
    const minRating = req.query.minRating === undefined || req.query.minRating === "" ? null : Number(req.query.minRating);
    const maxRating = req.query.maxRating === undefined || req.query.maxRating === "" ? null : Number(req.query.maxRating);

    if (minRating != null && !Number.isNaN(minRating)) {
      restaurantes = restaurantes.filter(function (item) {
        return Number(item.rating || 0) >= minRating;
      });
    }

    if (maxRating != null && !Number.isNaN(maxRating)) {
      restaurantes = restaurantes.filter(function (item) {
        return Number(item.rating || 0) <= maxRating;
      });
    }

    if (req.query.ordenar === "proximidade") {
      if (!req.usuario) {
        return res.status(401).json({ error: "Faça login para buscar os restaurantes mais próximos." });
      }

      const usuario = await prisma.user.findUnique({ where: { id: req.usuario.userId } });
      if (!usuario || usuario.latitude == null || usuario.longitude == null) {
        return res.status(400).json({ error: "Cadastre seu endereço em Meu endereço para buscar os mais próximos." });
      }

      restaurantes = restaurantes
        .map(function (item) {
          const copia = Object.assign({}, item);
          if (item.latitude != null && item.longitude != null) {
            copia.distanciaKm = Number(
              distanciaKm(usuario.latitude, usuario.longitude, item.latitude, item.longitude).toFixed(2)
            );
          } else {
            copia.distanciaKm = null;
          }
          return copia;
        })
        .sort(function (a, b) {
          if (a.distanciaKm == null) return 1;
          if (b.distanciaKm == null) return -1;
          return a.distanciaKm - b.distanciaKm;
        });
    }

    res.json(restaurantes);
  } catch (error) {
    console.error("Erro ao buscar restaurantes:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/restaurants", autenticar, async (req, res) => {
  const name = textoSeguro(req.body.name);
  const category = textoSeguro(req.body.category);
  const rating = lerNota(req.body.rating);
  const local = dadosLocal(req.body);

  if (!name || !category) {
    return res.status(400).json({ error: "Nome e categoria são obrigatórios" });
  }

  if (rating === null) {
    return res.status(400).json({ error: "A avaliação deve ser um número de 0 a 5." });
  }

  if (!local.endereco || !local.cidade || !local.bairro) {
    return res.status(400).json({ error: "Informe endereço, cidade e bairro do restaurante." });
  }

  try {
    const novoRestaurante = await prisma.restaurant.create({
      data: {
        name,
        category,
        rating,
        userId: req.usuario.userId,
        ...local
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
