exigirLogin();
montarMenu("busca");

const form = document.getElementById("form-busca");
const aviso = document.getElementById("aviso");
const lista = document.getElementById("lista-restaurantes");
const nomeUsuario = document.getElementById("nome-usuario");
const usuario = obterUsuario();

if (usuario && nomeUsuario) {
  nomeUsuario.textContent = usuario.name;
}

async function buscar() {
  lista.innerHTML = '<p class="vazio">Buscando...</p>';

  const minRating = form.minRating.value;
  const maxRating = form.maxRating.value;
  const params = new URLSearchParams();

  if (minRating !== "") params.set("minRating", minRating);
  if (maxRating !== "") params.set("maxRating", maxRating);
  if (form.ordenar.value === "proximidade") {
    params.set("ordenar", "proximidade");
  }

  try {
    const resposta = await fetch("/restaurants?" + params.toString(), {
      headers: headersComToken()
    });
    const json = await resposta.json();

    if (!resposta.ok) {
      throw new Error(json.error || "Não foi possível buscar restaurantes.");
    }

    if (!json.length) {
      lista.innerHTML = '<p class="vazio">Nenhum restaurante encontrado com esses filtros.</p>';
      return;
    }

    lista.innerHTML = json.map(cardRestaurante).join("");
  } catch (erro) {
    lista.innerHTML = '<p class="vazio">Não foi possível concluir a busca.</p>';
    mostrarAviso(aviso, erro.message, "erro");
  }
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  buscar();
});

buscar();
