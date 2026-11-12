function textoSeguro(valor) {
  return String(valor || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function lerNota(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return 0;
  }
  const nota = Number(valor);
  if (Number.isNaN(nota) || nota < 0 || nota > 5) {
    return null;
  }
  return nota;
}

function dadosLocal(body) {
  return {
    endereco: textoSeguro(body.endereco) || null,
    cidade: textoSeguro(body.cidade) || null,
    bairro: textoSeguro(body.bairro) || null,
    latitude: body.latitude === "" || body.latitude == null ? null : Number(body.latitude),
    longitude: body.longitude === "" || body.longitude == null ? null : Number(body.longitude)
  };
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    photo: usuario.photo || null,
    endereco: usuario.endereco,
    cidade: usuario.cidade,
    bairro: usuario.bairro,
    latitude: usuario.latitude,
    longitude: usuario.longitude
  };
}

function restaurantePublico(item) {
  return {
    id: item.id,
    name: textoSeguro(item.name) || "Restaurante",
    category: textoSeguro(item.category),
    rating: item.rating == null ? 0 : Number(item.rating),
    photo: item.photo || null,
    endereco: textoSeguro(item.endereco),
    cidade: textoSeguro(item.cidade),
    bairro: textoSeguro(item.bairro),
    latitude: item.latitude,
    longitude: item.longitude,
    userId: item.userId
  };
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const raio = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return raio * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

module.exports = {
  textoSeguro,
  emailValido,
  lerNota,
  dadosLocal,
  usuarioPublico,
  restaurantePublico,
  distanciaKm
};
