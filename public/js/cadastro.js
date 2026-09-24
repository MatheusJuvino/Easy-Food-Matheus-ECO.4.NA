const form = document.getElementById("form-cadastro");
const aviso = document.getElementById("aviso");

montarMenu("cadastro");
preencherSelectsLocal(form.cidade, form.bairro, form.latitude, form.longitude);

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const dados = new FormData(form);
  const corpo = {
    name: String(dados.get("name") || "").trim(),
    email: String(dados.get("email") || "").trim(),
    password: String(dados.get("password") || "")
  };
  Object.assign(corpo, dadosLocalDoFormulario(form));

  if (!corpo.name || !corpo.email || !corpo.password || !corpo.endereco || !corpo.cidade || !corpo.bairro) {
    mostrarAviso(aviso, "Preencha os dados da conta e o endereço fictício.", "erro");
    return;
  }

  try {
    const resposta = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo)
    });

    const json = await resposta.json();

    if (!resposta.ok) {
      throw new Error(json.error || "Não foi possível criar a conta.");
    }

    mostrarAviso(aviso, "Conta criada. Faça login para continuar.", "sucesso");
    setTimeout(function () {
      window.location.href = "/login.html";
    }, 800);
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});
