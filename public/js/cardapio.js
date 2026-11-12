exigirLogin();
montarMenu("catalogo");

const aviso = document.getElementById("aviso");
const lista = document.getElementById("lista-pratos");
const form = document.getElementById("form-prato");
const nomeRestaurante = document.getElementById("nome-restaurante");
const dadosRestaurante = document.getElementById("dados-restaurante");
const nomeUsuario = document.getElementById("nome-usuario");
const usuario = obterUsuario();
if (usuario && nomeUsuario) nomeUsuario.textContent = usuario.name;

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get("id");

function cardPrato(prato) {
  const imagem = prato.imageUrl
    ? '<img src="' + escaparHtml(prato.imageUrl) + '" alt="' + escaparHtml(prato.name) + '">'
    : '<div class="prato-sem-foto">🍽️</div>';

  return (
    '<article class="card-prato">' +
    imagem +
    "<div>" +
    "<strong>" + escaparHtml(prato.name) + "</strong>" +
    "<p>" + escaparHtml(prato.description) + "</p>" +
    '<p class="preco">R$ ' + Number(prato.price).toFixed(2) + "</p>" +
    '<form class="form-foto-prato" data-id="' + prato.id + '">' +
    '<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required>' +
    '<button type="submit" class="botao-secundario">Enviar foto</button>' +
    "</form>" +
    "</div></article>"
  );
}

async function carregar() {
  if (!restaurantId) {
    lista.innerHTML = '<p class="vazio">Restaurante não informado.</p>';
    return;
  }

  const resposta = await fetch("/restaurants/" + encodeURIComponent(restaurantId));
  const json = await resposta.json();
  if (!resposta.ok) throw new Error(json.error || "Não foi possível carregar o restaurante.");

  nomeRestaurante.textContent = json.name;
  dadosRestaurante.textContent = [json.category, json.endereco, json.bairro, json.cidade].filter(Boolean).join(" · ");

  const pratosResposta = await fetch("/restaurants/" + encodeURIComponent(restaurantId) + "/dishes");
  const pratos = await pratosResposta.json();
  if (!pratosResposta.ok) throw new Error(pratos.error || "Não foi possível carregar os pratos.");

  if (!pratos.length) {
    lista.innerHTML = '<p class="vazio">Nenhum prato cadastrado ainda.</p>';
    return;
  }

  lista.innerHTML = pratos.map(cardPrato).join("");
}

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  const corpo = {
    name: String(form.name.value || "").trim(),
    description: String(form.description.value || "").trim(),
    price: Number(form.price.value)
  };

  try {
    const resposta = await fetch("/restaurants/" + encodeURIComponent(restaurantId) + "/dishes", {
      method: "POST",
      headers: headersComToken(),
      body: JSON.stringify(corpo)
    });
    const json = await resposta.json();
    if (!resposta.ok) throw new Error(json.error || "Não foi possível cadastrar o prato.");
    form.reset();
    mostrarAviso(aviso, 'Prato "' + json.name + '" cadastrado.', "sucesso");
    await carregar();
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});

lista.addEventListener("submit", async function (evento) {
  const formFoto = evento.target.closest(".form-foto-prato");
  if (!formFoto) return;
  evento.preventDefault();

  const arquivo = formFoto.image.files[0];
  if (!arquivo) {
    mostrarAviso(aviso, "Escolha uma imagem.", "erro");
    return;
  }

  const dados = new FormData();
  dados.append("image", arquivo);

  try {
    const resposta = await fetch("/dishes/" + encodeURIComponent(formFoto.getAttribute("data-id")) + "/image", {
      method: "POST",
      headers: headersSomenteToken(),
      body: dados
    });
    const json = await resposta.json();
    if (!resposta.ok) throw new Error(json.error || "Não foi possível enviar a foto do prato.");
    mostrarAviso(aviso, "Foto do prato atualizada.", "sucesso");
    await carregar();
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});

carregar().catch(function (erro) {
  lista.innerHTML = '<p class="vazio">Não foi possível carregar o cardápio.</p>';
  mostrarAviso(aviso, erro.message, "erro");
});
