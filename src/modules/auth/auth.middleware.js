const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function usuarioDoToken(decoded) {
  const id = decoded.id || decoded.userId || decoded.sub;
  return {
    ...decoded,
    id,
    userId: decoded.userId || id
  };
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Faça login para continuar."
    });
  }

  const token = authHeader.slice(7);

  try {
    req.user = usuarioDoToken(jwt.verify(token, JWT_SECRET));
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Sessão inválida ou expirada. Faça login novamente."
    });
  }
}

function authenticateOptional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      req.user = usuarioDoToken(jwt.verify(authHeader.slice(7), JWT_SECRET));
    } catch (error) {
      req.user = null;
    }
  }

  next();
}

module.exports = authenticate;
module.exports.authenticateOptional = authenticateOptional;
