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

function montarMenu(pagina) {
  const nav = document.getElementById("menu-principal");
  if (!nav) {
    return;
  }

  if (!obterToken()) {
    nav.innerHTML =
      '<a href="/login.html"' + (pagina === "login" ? ' class="ativo"' : "") + ">Entrar</a>" +
      '<a href="/cadastro.html"' + (pagina === "cadastro" ? ' class="ativo"' : "") + ">Criar conta</a>";
    return;
  }

  nav.innerHTML =
    '<a href="/index.html"' + (pagina === "catalogo" ? ' class="ativo"' : "") + ">Catálogo</a>" +
    '<a href="/busca.html"' + (pagina === "busca" ? ' class="ativo"' : "") + ">Buscar</a>" +
    '<a href="/novo-restaurante.html"' + (pagina === "novo" ? ' class="ativo"' : "") + ">Novo restaurante</a>" +
    '<a href="/perfil.html"' + (pagina === "perfil" ? ' class="ativo"' : "") + ">Meu endereço</a>" +
    '<button type="button" id="botao-sair" class="botao-sair">Sair</button>';

  const botaoSair = document.getElementById("botao-sair");
  if (botaoSair) {
    botaoSair.addEventListener("click", sair);
  }
}

function formatarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }
  return Number(valor).toFixed(1);
}

function escaparHtml(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cardRestaurante(item) {
  const local = [item.endereco, item.bairro, item.cidade].filter(Boolean).join(" — ") || "Endereço não informado";
  const distancia =
    item.distanciaKm == null ? "" : "<small>" + Number(item.distanciaKm).toFixed(1) + " km de você</small>";

  return (
    '<article class="card-restaurante">' +
    '<span class="card-id">' + escaparHtml(item.id) + "</span>" +
    "<div><strong>" + escaparHtml(item.name) + "</strong><small>" +
    escaparHtml(item.category || "Sem categoria") + " · " + escaparHtml(local) +
    "</small>" +
    distancia +
    "</div>" +
    '<span class="nota">★ ' + formatarNota(item.rating) + "</span>" +
    "</article>"
  );
}

function dadosLocalDoFormulario(form) {
  return {
    endereco: String(form.endereco.value || "").trim(),
    cidade: String(form.cidade.value || "").trim(),
    bairro: String(form.bairro.value || "").trim(),
    latitude: form.latitude.value,
    longitude: form.longitude.value
  };
}
