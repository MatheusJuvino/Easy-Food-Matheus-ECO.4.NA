exigirLogin();
montarMenu("catalogo");

const aviso = document.getElementById("aviso");
const lista = document.getElementById("lista-restaurantes");
const chips = document.getElementById("chips-categorias");
const campoBusca = document.getElementById("campo-busca");
const ordenar = document.getElementById("ordenar");
const botaoAtualizar = document.getElementById("botao-atualizar");
const tituloLista = document.getElementById("titulo-lista");

const usuario = obterUsuario();
if (usuario) {
  const nome = usuario.name || "usuário";
  const nomeUsuario = document.getElementById("nome-usuario");
  const nomeHero = document.getElementById("nome-hero");
  if (nomeUsuario) nomeUsuario.textContent = nome;
  if (nomeHero) nomeHero.textContent = nome;
}

let todos = [];
let categoriaAtiva = "todos";

function textoDe(item) {
  return [item.name, item.category, item.bairro, item.cidade, item.endereco]
    .join(" ")
    .toLowerCase();
}

function atualizarStats(listaItens) {
  document.getElementById("stat-qtd").textContent = listaItens.length;
  const notas = listaItens.map(function (item) { return Number(item.rating || 0); });
  const media = notas.length ? notas.reduce(function (a, b) { return a + b; }, 0) / notas.length : 0;
  document.getElementById("stat-nota").textContent = media.toFixed(1);
  const cidades = [];
  listaItens.forEach(function (item) {
    if (item.cidade && cidades.indexOf(item.cidade) === -1) cidades.push(item.cidade);
  });
  document.getElementById("stat-cidades").textContent = cidades.length;
}

function montarChips() {
  const categorias = [];
  todos.forEach(function (item) {
    const cat = item.category || "Outros";
    if (categorias.indexOf(cat) === -1) categorias.push(cat);
  });

  let html = '<button type="button" class="chip-filtro ativo" data-cat="todos">✨ Todos ' + todos.length + "</button>";
  categorias.forEach(function (cat) {
    const qtd = todos.filter(function (item) { return (item.category || "Outros") === cat; }).length;
    html += '<button type="button" class="chip-filtro" data-cat="' + escaparHtml(cat) + '">' +
      iconeCategoria(cat) + " " + escaparHtml(cat) + " " + qtd + "</button>";
  });
  chips.innerHTML = html;
}

function filtrar() {
  const termo = campoBusca.value.trim().toLowerCase();
  let resultado = todos.filter(function (item) {
    const cat = item.category || "Outros";
    const passaCategoria = categoriaAtiva === "todos" || cat === categoriaAtiva;
    const passaTexto = !termo || textoDe(item).indexOf(termo) !== -1;
    return passaCategoria && passaTexto;
  });

  if (ordenar.value === "melhor") {
    resultado.sort(function (a, b) { return Number(b.rating || 0) - Number(a.rating || 0); });
  } else {
    resultado.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  }

  atualizarStats(todos);
  const titulo = categoriaAtiva === "todos" ? "Todos os restaurantes" : categoriaAtiva;
  tituloLista.innerHTML = escaparHtml(titulo) + " <span>" + resultado.length + (resultado.length === 1 ? " lugar" : " lugares") + "</span>";

  if (!resultado.length) {
    lista.innerHTML = '<p class="vazio">Nenhum restaurante encontrado com essa pesquisa.</p>';
    return;
  }

  lista.innerHTML = resultado.map(cardRestaurante).join("");
}

async function carregarRestaurantes() {
  lista.innerHTML = '<p class="vazio">Carregando...</p>';
  try {
    const resposta = await fetch("/restaurants");
    if (!resposta.ok) throw new Error("Não foi possível carregar os restaurantes.");
    todos = await resposta.json();
    montarChips();
    filtrar();
  } catch (erro) {
    lista.innerHTML = '<p class="vazio">Erro ao buscar restaurantes.</p>';
    mostrarAviso(aviso, erro.message, "erro");
  }
}

chips.addEventListener("click", function (evento) {
  const botao = evento.target.closest(".chip-filtro");
  if (!botao) return;
  categoriaAtiva = botao.getAttribute("data-cat");
  Array.prototype.forEach.call(chips.querySelectorAll(".chip-filtro"), function (item) {
    item.classList.toggle("ativo", item === botao);
  });
  filtrar();
});

campoBusca.addEventListener("input", filtrar);
ordenar.addEventListener("change", filtrar);
botaoAtualizar.addEventListener("click", carregarRestaurantes);
carregarRestaurantes();
