const TOKEN_KEY = "easyfood_token";
const USER_KEY = "easyfood_usuario";

function salvarSessao(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function obterUsuario() {
  const texto = localStorage.getItem(USER_KEY);
  if (!texto) {
    return null;
  }
  return JSON.parse(texto);
}

function sair() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login.html";
}

function headersComToken() {
  const token = obterToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = "Bearer " + token;
  }
  return headers;
}

function exigirLogin() {
  if (!obterToken()) {
    window.location.href = "/login.html";
  }
}

function mostrarAviso(elemento, texto, tipo) {
  elemento.hidden = false;
  elemento.className = "aviso " + tipo;
  elemento.textContent = texto;
}
