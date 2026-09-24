exigirLogin();
montarMenu("busca");

const form = document.getElementById("form-busca");
const aviso = document.getElementById("aviso");
const lista = document.getElementById("lista-restaurantes");
const campoBusca = document.getElementById("campo-busca");
const nomeUsuario = document.getElementById("nome-usuario");
const usuario = obterUsuario();
if (usuario && nomeUsuario) nomeUsuario.textContent = usuario.name;

let carregados = [];

function aplicarTexto() {
  const termo = campoBusca.value.trim().toLowerCase();
  const filtrados = carregados.filter(function (item) {
    const texto = [item.name, item.category, item.bairro, item.cidade, item.endereco].join(" ").toLowerCase();
    return !termo || texto.indexOf(termo) !== -1;
  });
  if (!filtrados.length) {
    lista.innerHTML = '<p class="vazio">Nenhum restaurante encontrado com esses filtros.</p>';
    return;
  }
  lista.innerHTML = filtrados.map(cardRestaurante).join("");
}

async function buscar() {
  lista.innerHTML = '<p class="vazio">Buscando...</p>';
  const params = new URLSearchParams();
  if (form.minRating.value !== "") params.set("minRating", form.minRating.value);
  if (form.maxRating.value !== "") params.set("maxRating", form.maxRating.value);
  if (form.ordenar.value === "proximidade") params.set("ordenar", "proximidade");

  try {
    const resposta = await fetch("/restaurants?" + params.toString(), { headers: headersComToken() });
    const json = await resposta.json();
    if (!resposta.ok) throw new Error(json.error || "Não foi possível buscar restaurantes.");
    carregados = json;
    if (form.ordenar.value === "melhor") {
      carregados.sort(function (a, b) { return Number(b.rating || 0) - Number(a.rating || 0); });
    }
    aplicarTexto();
  } catch (erro) {
    lista.innerHTML = '<p class="vazio">Não foi possível concluir a busca.</p>';
    mostrarAviso(aviso, erro.message, "erro");
  }
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  buscar();
});
campoBusca.addEventListener("input", aplicarTexto);
buscar();
