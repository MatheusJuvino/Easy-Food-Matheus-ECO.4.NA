const form = document.getElementById("form-cadastro");
const aviso = document.getElementById("aviso");

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const dados = new FormData(form);
  const corpo = {
    name: String(dados.get("name") || "").trim(),
    email: String(dados.get("email") || "").trim(),
    password: String(dados.get("password") || "")
  };

  if (!corpo.name || !corpo.email || !corpo.password) {
    mostrarAviso(aviso, "Preencha nome, e-mail e senha.", "erro");
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
