const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../database/prisma");
const {
  textoSeguro,
  emailValido,
  dadosLocal,
  usuarioPublico
} = require("../shared/safe-text");

const JWT_SECRET = process.env.JWT_SECRET;

async function register(body) {
  const name = textoSeguro(body.name);
  const email = textoSeguro(body.email).toLowerCase();
  const password = String(body.password || "");
  const local = dadosLocal(body);

  if (!name || !email || !password) {
    const error = new Error("Nome, e-mail e senha são obrigatórios.");
    error.statusCode = 400;
    throw error;
  }

  if (!emailValido(email)) {
    const error = new Error("Informe um e-mail válido.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("A senha deve ter pelo menos 6 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    const error = new Error("Já existe um usuário com este e-mail.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.user.create({
    data: { name, email, passwordHash, ...local }
  });

  return usuarioPublico(usuario);
}

async function login(body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    const error = new Error("E-mail e senha são obrigatórios.");
    error.statusCode = 400;
    throw error;
  }

  const usuario = await prisma.user.findUnique({ where: { email } });
  if (!usuario) {
    const error = new Error("E-mail ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const senhaOk = await bcrypt.compare(password, usuario.passwordHash);
  if (!senhaOk) {
    const error = new Error("E-mail ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: usuario.id,
      userId: usuario.id,
      email: usuario.email
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: usuarioPublico(usuario)
  };
}

async function getMe(userId) {
  const usuario = await prisma.user.findUnique({
    where: { id: Number(userId) }
  });

  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return usuarioPublico(usuario);
}

async function updateMe(userId, body) {
  const name = textoSeguro(body.name);
  const local = dadosLocal(body);

  if (!name) {
    const error = new Error("O nome é obrigatório.");
    error.statusCode = 400;
    throw error;
  }

  if (!local.cidade || !local.bairro || !local.endereco) {
    const error = new Error("Informe endereço, cidade e bairro.");
    error.statusCode = 400;
    throw error;
  }

  const usuario = await prisma.user.update({
    where: { id: Number(userId) },
    data: { name, ...local }
  });

  return usuarioPublico(usuario);
}

async function updateProfilePhoto(userId, photo) {
  const usuario = await prisma.user.update({
    where: { id: Number(userId) },
    data: { photo },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      endereco: true,
      cidade: true,
      bairro: true,
      latitude: true,
      longitude: true
    }
  });

  return usuarioPublico(usuario);
}

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  updateProfilePhoto
};
