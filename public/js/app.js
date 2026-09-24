exigirLogin();
montarMenu("catalogo");

const aviso = document.getElementById("aviso");
const lista = document.getElementById("lista-restaurantes");
const botaoAtualizar = document.getElementById("botao-atualizar");
const nomeUsuario = document.getElementById("nome-usuario");
const totalRestaurantes = document.getElementById("total-restaurantes");

const usuario = obterUsuario();
if (usuario && nomeUsuario) {
  nomeUsuario.textContent = usuario.name;
}

async function carregarRestaurantes() {
  lista.innerHTML = '<p class="vazio">Carregando...</p>';

  try {
    const resposta = await fetch("/restaurants");
    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os restaurantes.");
    }

    const restaurantes = await resposta.json();
    if (totalRestaurantes) {
      const qtd = restaurantes.length;
      totalRestaurantes.textContent = qtd === 1 ? "1 restaurante" : qtd + " restaurantes";
    }

    if (!restaurantes.length) {
      lista.innerHTML = '<p class="vazio">Nenhum restaurante cadastrado ainda.</p>';
      return;
    }

    lista.innerHTML = restaurantes.map(cardRestaurante).join("");
  } catch (erro) {
    lista.innerHTML = '<p class="vazio">Erro ao buscar restaurantes.</p>';
    mostrarAviso(aviso, erro.message, "erro");
  }
}

botaoAtualizar.addEventListener("click", carregarRestaurantes);
carregarRestaurantes();
