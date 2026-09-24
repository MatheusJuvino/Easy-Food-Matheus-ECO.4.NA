const form = document.getElementById("form-login");
const aviso = document.getElementById("aviso");

if (obterToken()) {
  window.location.href = "/";
}

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const dados = new FormData(form);
  const corpo = {
    email: String(dados.get("email") || "").trim(),
    password: String(dados.get("password") || "")
  };

  if (!corpo.email || !corpo.password) {
    mostrarAviso(aviso, "Informe e-mail e senha.", "erro");
    return;
  }

  try {
    const resposta = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo)
    });

    const json = await resposta.json();

    if (!resposta.ok) {
      throw new Error(json.error || "Não foi possível entrar.");
    }

    salvarSessao(json.token, json.user);
    window.location.href = "/";
  } catch (erro) {
    mostrarAviso(aviso, erro.message, "erro");
  }
});
