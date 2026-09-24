exigirLogin();
montarMenu("novo");

const form = document.getElementById("form-restaurante");
const aviso = document.getElementById("aviso");
const nomeUsuario = document.getElementById("nome-usuario");
const usuario = obterUsuario();

if (usuario && nomeUsuario) {
  nomeUsuario.textContent = usuario.name;
}

preencherSelectsLocal(
  form.cidade,
  form.bairro,
  form.latitude,
  form.longitude
);

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const ratingInformado = form.rating.value;
  const corpo = Object.assign(
    {
      name: String(form.name.value || "").trim(),
      category: String(form.category.value || "").trim(),
      rating: ratingInformado === "" ? 0 : Number(ratingInformado)
    },
    dadosLocalDoFormulario(form)
  );

  if (!corpo.name || !corpo.category) {
    mostrarAviso(aviso, "Nome e categoria são obrigatórios.", "erro");
    return;
  }

  if (corpo.rating < 0 || corpo.rating > 5) {
    mostrarAviso(aviso, "A avaliação deve ser de 0 a 5 estrelas.", "erro");
    return;
  }

  if (!corpo.endereco || !corpo.cidade || !corpo.bairro) {
    mostrarAviso(aviso, "Informe o endereço fictício completo do restaurante.", "erro");
    return;
  }

  try {
    const resposta = await fetch("/restaurants", {
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
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});
