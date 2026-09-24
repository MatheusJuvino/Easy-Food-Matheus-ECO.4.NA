const LOCAIS = [
  { cidade: "São Paulo", bairro: "Centro", lat: -23.5505, lng: -46.6333 },
  { cidade: "São Paulo", bairro: "Pinheiros", lat: -23.5674, lng: -46.6932 },
  { cidade: "São Paulo", bairro: "Vila Mariana", lat: -23.5893, lng: -46.6347 },
  { cidade: "São Paulo", bairro: "Moema", lat: -23.602, lng: -46.666 },
  { cidade: "Campinas", bairro: "Cambuí", lat: -22.8893, lng: -47.0456 },
  { cidade: "Campinas", bairro: "Barão Geraldo", lat: -22.818, lng: -47.083 },
  { cidade: "Santos", bairro: "Gonzaga", lat: -23.9675, lng: -46.3334 },
  { cidade: "Santos", bairro: "Ponta da Praia", lat: -23.986, lng: -46.3 }
];

function cidadesDisponiveis() {
  const cidades = [];
  LOCAIS.forEach(function (item) {
    if (cidades.indexOf(item.cidade) === -1) {
      cidades.push(item.cidade);
    }
  });
  return cidades;
}

function bairrosDaCidade(cidade) {
  return LOCAIS.filter(function (item) {
    return item.cidade === cidade;
  });
}

function coordenadaDoBairro(cidade, bairro) {
  return LOCAIS.find(function (item) {
    return item.cidade === cidade && item.bairro === bairro;
  }) || null;
}

function preencherSelectsLocal(selectCidade, selectBairro, campoLat, campoLng, valores) {
  selectCidade.innerHTML = '<option value="">Selecione a cidade</option>';
  cidadesDisponiveis().forEach(function (cidade) {
    const option = document.createElement("option");
    option.value = cidade;
    option.textContent = cidade;
    selectCidade.appendChild(option);
  });

  function atualizarBairros() {
    const cidade = selectCidade.value;
    selectBairro.innerHTML = '<option value="">Selecione o bairro</option>';
    bairrosDaCidade(cidade).forEach(function (item) {
      const option = document.createElement("option");
      option.value = item.bairro;
      option.textContent = item.bairro;
      selectBairro.appendChild(option);
    });
    atualizarCoordenadas();
  }

  function atualizarCoordenadas() {
    const ponto = coordenadaDoBairro(selectCidade.value, selectBairro.value);
    if (campoLat) campoLat.value = ponto ? ponto.lat : "";
    if (campoLng) campoLng.value = ponto ? ponto.lng : "";
  }

  if (!selectCidade.dataset.locaisPronto) {
    selectCidade.addEventListener("change", atualizarBairros);
    selectBairro.addEventListener("change", atualizarCoordenadas);
    selectCidade.dataset.locaisPronto = "1";
  }

  if (valores && valores.cidade) {
    selectCidade.value = valores.cidade;
    atualizarBairros();
    if (valores.bairro) {
      selectBairro.value = valores.bairro;
      atualizarCoordenadas();
    }
  }
}
