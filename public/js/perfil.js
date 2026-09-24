exigirLogin();
montarMenu("perfil");

const form = document.getElementById("form-perfil");
const aviso = document.getElementById("aviso");
const nomeUsuario = document.getElementById("nome-usuario");

async function carregarPerfil() {
  const resposta = await fetch("/me", { headers: headersComToken() });
  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.error || "Não foi possível carregar o perfil.");
  }

  salvarSessao(obterToken(), json);
  if (nomeUsuario) {
    nomeUsuario.textContent = json.name;
  }

  form.name.value = json.name || "";
  form.endereco.value = json.endereco || "";
  preencherSelectsLocal(form.cidade, form.bairro, form.latitude, form.longitude, json);
}

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const corpo = Object.assign(
    { name: String(form.name.value || "").trim() },
    dadosLocalDoFormulario(form)
  );

  if (!corpo.name || !corpo.endereco || !corpo.cidade || !corpo.bairro) {
    mostrarAviso(aviso, "Preencha nome e o endereço fictício completo.", "erro");
    return;
  }

  try {
    const resposta = await fetch("/me", {
      method: "PUT",
      headers: headersComToken(),
      body: JSON.stringify(corpo)
    });
    const json = await resposta.json();

    if (!resposta.ok) {
      throw new Error(json.error || "Não foi possível salvar o endereço.");
    }

    salvarSessao(obterToken(), json);
    if (nomeUsuario) {
      nomeUsuario.textContent = json.name;
    }
    mostrarAviso(aviso, "Endereço salvo. Agora você pode buscar os restaurantes mais próximos.", "sucesso");
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});

carregarPerfil().catch(function (erro) {
  mostrarAviso(aviso, erro.message, "erro");
});
