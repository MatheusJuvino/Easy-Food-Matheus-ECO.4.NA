function buildHtml({ header, body, footer }) {
  return (
    "<!DOCTYPE html><html lang=\"pt-BR\"><head><meta charset=\"UTF-8\"><title>EasyFood</title></head><body>" +
    "<h2>" + (header || "EasyFood") + "</h2>" +
    "<p>" + (body || "") + "</p><hr>" +
    "<small>" + (footer || "Equipe EasyFood") + "</small>" +
    "</body></html>"
  );
}

async function sendEmail({ to, toName, subject, header, body, footer }) {
  const html = buildHtml({ header, body, footer });

  console.log("\n========== E-MAIL SIMULADO ==========");
  console.log("Destinatário: " + (toName || "") + " <" + to + ">");
  console.log("Assunto: " + subject);
  console.log("Mensagem: " + body);
  console.log("Status: Envio simulado com sucesso!");
  console.log("=====================================\n");

  return {
    success: true,
    simulated: true,
    to,
    subject,
    html
  };
}

module.exports = {
  sendEmail,
  buildHtml
};
