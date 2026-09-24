exigirLogin();

const API = "/restaurants";
const aviso = document.getElementById("aviso");
const tabela = document.getElementById("tabela-restaurantes");
const form = document.getElementById("form-restaurante");
const botaoAtualizar = document.getElementById("botao-atualizar");
const botaoSair = document.getElementById("botao-sair");
const nomeUsuario = document.getElementById("nome-usuario");
const totalRestaurantes = document.getElementById("total-restaurantes");

const usuario = obterUsuario();
if (usuario && nomeUsuario) {
  nomeUsuario.textContent = usuario.name;
}

botaoSair.addEventListener("click", sair);

async function carregarRestaurantes() {
  tabela.innerHTML = '<p class="vazio">Carregando...</p>';

  try {
    const resposta = await fetch(API);
    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os restaurantes.");
    }

    const restaurantes = await resposta.json();
    if (totalRestaurantes) {
      const qtd = restaurantes.length;
      totalRestaurantes.textContent = qtd === 1 ? "1 restaurante" : qtd + " restaurantes";
    }

    if (!restaurantes.length) {
      tabela.innerHTML = '<p class="vazio">Nenhum restaurante cadastrado ainda.</p>';
      return;
    }

    tabela.innerHTML = restaurantes
      .map(function (item) {
        return (
          '<article class="card-restaurante">' +
          '<span class="card-id">' + item.id + "</span>" +
          "<div><strong>" + item.name + "</strong><small>" + (item.category || "Sem categoria") + "</small></div>" +
          '<span class="nota">★ ' + formatarNota(item.rating) + "</span>" +
          "</article>"
        );
      })
      .join("");
  } catch (erro) {
    tabela.innerHTML = '<p class="vazio">Erro ao buscar restaurantes.</p>';
    mostrarAviso(aviso, erro.message, "erro");
  }
}

function formatarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }
  return Number(valor).toFixed(1);
}

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  if (!obterToken()) {
    mostrarAviso(aviso, "Faça login para cadastrar restaurantes.", "erro");
    window.location.href = "/login.html";
    return;
  }

  const dados = new FormData(form);
  const ratingInformado = dados.get("rating");

  const corpo = {
    name: String(dados.get("name") || "").trim(),
    category: String(dados.get("category") || "").trim(),
    rating: ratingInformado === "" ? 0 : Number(ratingInformado)
  };

  if (!corpo.name || !corpo.category) {
    mostrarAviso(aviso, "Nome e categoria são obrigatórios.", "erro");
    return;
  }

  try {
    const resposta = await fetch(API, {
      method: "POST",
      headers: headersComToken(),
      body: JSON.stringify(corpo)
    });

    const json = await resposta.json();

    if (resposta.status === 401) {
      mostrarAviso(aviso, json.error || "Faça login para cadastrar restaurantes.", "erro");
      sair();
      return;
    }

    if (!resposta.ok) {
      throw new Error(json.error || "Não foi possível cadastrar o restaurante.");
    }

    form.reset();
    mostrarAviso(aviso, 'Restaurante "' + json.name + '" cadastrado com sucesso.', "sucesso");
    carregarRestaurantes();
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});

botaoAtualizar.addEventListener("click", carregarRestaurantes);
carregarRestaurantes();
