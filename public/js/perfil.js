exigirLogin();
montarMenu("perfil");

const form = document.getElementById("form-perfil");
const formFoto = document.getElementById("form-foto");
const aviso = document.getElementById("aviso");
const nomeUsuario = document.getElementById("nome-usuario");
const fotoPerfil = document.getElementById("foto-perfil");

function mostrarFoto(caminho) {
  if (!fotoPerfil) return;
  if (caminho) {
    fotoPerfil.src = caminho;
    fotoPerfil.hidden = false;
  } else {
    fotoPerfil.hidden = true;
  }
}

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
  mostrarFoto(json.photo);
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

formFoto.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  const arquivo = formFoto.image.files[0];
  if (!arquivo) {
    mostrarAviso(aviso, "Escolha uma imagem.", "erro");
    return;
  }

  const dados = new FormData();
  dados.append("image", arquivo);

  try {
    const resposta = await fetch("/auth/me/image", {
      method: "POST",
      headers: headersSomenteToken(),
      body: dados
    });
    const json = await resposta.json();
    if (!resposta.ok) {
      throw new Error(json.error || "Não foi possível enviar a foto.");
    }
    salvarSessao(obterToken(), json.user);
    mostrarFoto(json.user && json.user.photo);
    mostrarAviso(aviso, "Foto de perfil atualizada.", "sucesso");
    formFoto.reset();
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});

carregarPerfil().catch(function (erro) {
  mostrarAviso(aviso, erro.message, "erro");
});
