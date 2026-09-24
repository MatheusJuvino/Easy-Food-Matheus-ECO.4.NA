const API = "/restaurants";

const aviso = document.getElementById("aviso");
const tabela = document.getElementById("tabela-restaurantes");
const form = document.getElementById("form-restaurante");
const botaoAtualizar = document.getElementById("botao-atualizar");

function mostrarAviso(texto, tipo) {
  aviso.hidden = false;
  aviso.className = "aviso " + tipo;
  aviso.textContent = texto;
}

function formatarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }
  return Number(valor).toFixed(1);
}

async function carregarRestaurantes() {
  tabela.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

  try {
    const resposta = await fetch(API);
    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os restaurantes.");
    }

    const restaurantes = await resposta.json();

    if (!restaurantes.length) {
      tabela.innerHTML = '<tr><td class="vazio" colspan="4">Nenhum restaurante cadastrado ainda.</td></tr>';
      return;
    }

    tabela.innerHTML = restaurantes
      .map(function (item) {
        return (
          "<tr>" +
          "<td>" + item.id + "</td>" +
          "<td>" + item.name + "</td>" +
          "<td>" + (item.category || "-") + "</td>" +
          "<td>" + formatarNota(item.rating) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  } catch (erro) {
    tabela.innerHTML = '<tr><td class="vazio" colspan="4">Erro ao buscar restaurantes.</td></tr>';
    mostrarAviso(erro.message, "erro");
  }
}

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const dados = new FormData(form);
  const ratingInformado = dados.get("rating");

  const corpo = {
    name: String(dados.get("name") || "").trim(),
    category: String(dados.get("category") || "").trim(),
    rating: ratingInformado === "" ? 0 : Number(ratingInformado)
  };

  if (!corpo.name || !corpo.category) {
    mostrarAviso("Nome e categoria são obrigatórios.", "erro");
    return;
  }

  try {
    const resposta = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo)
    });

    const json = await resposta.json();

    if (!resposta.ok) {
      throw new Error(json.error || "Não foi possível cadastrar o restaurante.");
    }

    form.reset();
    mostrarAviso('Restaurante "' + json.name + '" cadastrado com sucesso.', "sucesso");
    carregarRestaurantes();
  } catch (erro) {
    mostrarAviso(erro.message, "erro");
  }
});

botaoAtualizar.addEventListener("click", carregarRestaurantes);

carregarRestaurantes();
