const sharp = require("sharp");

const BASE = "http://localhost:3000";

async function json(res) {
  const body = await res.json().catch(function () { return {}; });
  return { status: res.status, body };
}

async function main() {
  const email = "aula8+" + Date.now() + "@easyfood.test";
  const password = "123456";

  const cadastro = await json(await fetch(BASE + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Aluno Aula 8",
      email,
      password,
      endereco: "Rua Teste, 1",
      cidade: "São Paulo",
      bairro: "Centro",
      latitude: -23.55,
      longitude: -46.63
    })
  }));
  if (cadastro.status !== 201) throw new Error("register " + cadastro.status + " " + JSON.stringify(cadastro.body));

  const login = await json(await fetch(BASE + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  }));
  if (!login.body.token) throw new Error("login falhou");
  const token = login.body.token;
  const auth = { Authorization: "Bearer " + token, "Content-Type": "application/json" };

  const restaurante = await json(await fetch(BASE + "/restaurants", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      name: "Cantina Aula 8",
      category: "Teste",
      rating: 4,
      endereco: "Rua A",
      cidade: "São Paulo",
      bairro: "Centro",
      latitude: -23.55,
      longitude: -46.63
    })
  }));
  if (restaurante.status !== 201) throw new Error("restaurant " + restaurante.status);
  const restaurantId = restaurante.body.id;

  const prato = await json(await fetch(BASE + "/restaurants/" + restaurantId + "/dishes", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      name: "Suco de laranja",
      description: "Natural",
      price: 8.5
    })
  }));
  if (prato.status !== 201) throw new Error("dish " + prato.status + " " + JSON.stringify(prato.body));
  console.log("Cadastrar prato:", prato.status);

  const png = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#ff6600" }
  }).png().toBuffer();

  const formPerfil = new FormData();
  formPerfil.append("image", new Blob([png], { type: "image/png" }), "perfil.png");
  const fotoPerfil = await json(await fetch(BASE + "/auth/me/image", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: formPerfil
  }));
  if (fotoPerfil.status !== 200 || !fotoPerfil.body.user || !fotoPerfil.body.user.photo) {
    throw new Error("perfil image " + fotoPerfil.status + " " + JSON.stringify(fotoPerfil.body));
  }
  console.log("Foto perfil:", fotoPerfil.body.user.photo);

  const formPrato = new FormData();
  formPrato.append("image", new Blob([png], { type: "image/png" }), "prato.png");
  const fotoPrato = await json(await fetch(BASE + "/dishes/" + prato.body.id + "/image", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: formPrato
  }));
  if (fotoPrato.status !== 200 || !fotoPrato.body.imageUrl) {
    throw new Error("dish image " + fotoPrato.status + " " + JSON.stringify(fotoPrato.body));
  }
  console.log("Foto prato:", fotoPrato.body.imageUrl);

  const me = await json(await fetch(BASE + "/auth/me", { headers: { Authorization: "Bearer " + token } }));
  if (!me.body.photo) throw new Error("me sem photo");

  const cardapio = await json(await fetch(BASE + "/restaurants/" + restaurantId + "/dishes"));
  if (!cardapio.body[0] || !cardapio.body[0].imageUrl) throw new Error("cardapio sem imageUrl");

  const img = await fetch(BASE + fotoPrato.body.imageUrl);
  if (!img.ok) throw new Error("url imagem " + img.status);
  console.log("URL da imagem:", img.status, img.headers.get("content-type"));

  const formSemJwt = new FormData();
  formSemJwt.append("image", new Blob([png], { type: "image/png" }), "perfil.png");
  const semJwt = await json(await fetch(BASE + "/auth/me/image", { method: "POST", body: formSemJwt }));
  if (semJwt.status !== 401) throw new Error("esperado 401, veio " + semJwt.status);
  console.log("Sem JWT:", semJwt.status);

  const txt = new FormData();
  txt.append("image", new Blob(["nao e imagem"], { type: "text/plain" }), "a.txt");
  const invalido = await json(await fetch(BASE + "/auth/me/image", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: txt
  }));
  if (invalido.status < 400) throw new Error("arquivo invalido deveria falhar");
  console.log("Arquivo inválido:", invalido.status);

  const form404 = new FormData();
  form404.append("image", new Blob([png], { type: "image/png" }), "prato.png");
  const inexistente = await json(await fetch(BASE + "/dishes/999999/image", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form404
  }));
  if (inexistente.status !== 404) throw new Error("esperado 404, veio " + inexistente.status);
  console.log("Prato inexistente:", inexistente.status);

  console.log("Atividade 8: todos os testes passaram.");
}

main().catch(function (erro) {
  console.error(erro);
  process.exit(1);
});
