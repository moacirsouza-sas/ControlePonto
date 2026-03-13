const API = "https://script.google.com/macros/s/AKfycbwOC9FMcoRFB0WkE8C8NjQq08g3NHEa7Prwf3bjAKzb8aNO8nM0EQjPgn_H28TxWw/exec";
const PLANILHA = "https://docs.google.com/spreadsheets/d/1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE/edit";

const JORNADA_MINUTOS = 540;
const STORAGE_KEY = "ponto_db";

const hoje = new Date().toLocaleDateString("pt-BR");

document.getElementById("dataHoje").innerText = hoje;

let gps = "";
let endereco = "";

let dados = {
  entrada: null,
  almocoSai: null,
  almocoVolta: null,
  saida: null,
};

function hora() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function horaParaMinutos(valor) {
  if (!valor || typeof valor !== "string") return null;

  const [h, m] = valor.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  return h * 60 + m;
}

function calcularMinutosTrabalhados(registro = dados) {
  const entrada = horaParaMinutos(registro.entrada);
  const almocoSai = horaParaMinutos(registro.almocoSai);
  const almocoVolta = horaParaMinutos(registro.almocoVolta);
  const saida = horaParaMinutos(registro.saida);

  if ([entrada, almocoSai, almocoVolta, saida].some((valor) => valor === null)) {
    return null;
  }

  if (almocoSai < entrada || almocoVolta < almocoSai || saida < almocoVolta) {
    return null;
  }

  const manha = almocoSai - entrada;
  const tarde = saida - almocoVolta;

  return manha + tarde;
}

function registrarAgora() {
  if (!dados.entrada) {
    dados.entrada = hora();
    document.getElementById("entrada").innerText = dados.entrada;
    return;
  }

  if (!dados.almocoSai) {
    dados.almocoSai = hora();
    document.getElementById("saidaAlmoco").innerText = dados.almocoSai;
    return;
  }

  if (!dados.almocoVolta) {
    dados.almocoVolta = hora();
    document.getElementById("voltaAlmoco").innerText = dados.almocoVolta;
    return;
  }

  if (!dados.saida) {
    dados.saida = hora();
    document.getElementById("saidaFinal").innerText = dados.saida;
    return;
  }

  alert("Todos os pontos do dia já foram registrados.");
}

function obterGPS() {
  if (!navigator.geolocation) {
    document.querySelector(".gps").innerText = "GPS não suportado";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function sucesso(pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const precisao = Math.round(pos.coords.accuracy);

      gps = `${lat},${lon} (${precisao}m)`;
      document.querySelector(".gps").innerText = `GPS ativo (${precisao}m)`;

      mostrarMapa(lat, lon);
      buscarEndereco(lat, lon);
    },
    function erro() {
      document.querySelector(".gps").innerText = "GPS bloqueado";
    },
    { enableHighAccuracy: true }
  );
}

function mostrarMapa(lat, lon) {
  document.getElementById("mapa").innerHTML = `
    <iframe
      width="100%"
      height="200"
      src="https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed"
    ></iframe>
  `;
}

async function buscarEndereco(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const resposta = await fetch(url);
    if (!resposta.ok) return;

    const payload = await resposta.json();
    endereco = payload.display_name || "";

    document.getElementById("endereco").innerText = endereco;
  } catch (_) {
    // endereço é opcional, segue sem bloquear o fluxo principal
  }
}

function lerBanco() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function salvarBanco(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function arquivarDia() {
  const totalMinutos = calcularMinutosTrabalhados();

  if (totalMinutos === null) {
    alert("Registro incompleto ou em ordem inválida.");
    return;
  }

  const saldo = totalMinutos - JORNADA_MINUTOS;

  const payload = {
    data: hoje,
    entrada: dados.entrada,
    almocoSai: dados.almocoSai,
    almocoVolta: dados.almocoVolta,
    saida: dados.saida,
    totalMinutos,
    saldo,
    geo: `${gps} | ${endereco}`,
  };

  document.getElementById("statusSync").innerText = "🟡 enviando...";

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (resposta) => {
      if (!resposta.ok) {
        throw new Error("Falha HTTP ao sincronizar.");
      }

      let retorno = { status: "ok" };
      try {
        retorno = await resposta.json();
      } catch (_) {
        // alguns endpoints podem responder vazio; considera sucesso HTTP
      }

      if (retorno.status && retorno.status !== "ok") {
        throw new Error(retorno.mensagem || "API retornou erro.");
      }

      document.getElementById("statusSync").innerText = "🟢 sincronizado";
      salvarLocal(payload, true);
      resetarDia();
    })
    .catch(() => {
      document.getElementById("statusSync").innerText = "🔴 erro de sincronização";
      salvarLocal(payload, false);
      alert("Falha no envio para a planilha. Registro salvo localmente.");
      resetarDia();
    });
}

function salvarLocal(payload, sincronizado) {
  const banco = lerBanco();

  banco.push({
    data: payload.data,
    entrada: payload.entrada,
    almocoSai: payload.almocoSai,
    almocoVolta: payload.almocoVolta,
    saida: payload.saida,
    totalMinutos: payload.totalMinutos,
    saldo: payload.saldo,
    sincronizado,
  });

  salvarBanco(banco);
  carregarHistorico();

  if (typeof gerarGrafico === "function") {
    gerarGrafico();
  }
}

function carregarHistorico() {
  const banco = lerBanco();
  const tabela = document.querySelector("#historico tbody");

  tabela.innerHTML = "";

  banco
    .slice(-5)
    .reverse()
    .forEach((registro) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${registro.data}</td>
        <td>${registro.entrada ?? "--:--"}</td>
        <td>${registro.saida ?? "--:--"}</td>
      `;
      tabela.appendChild(tr);
    });
}

function baixarCSV() {
  const banco = lerBanco();

  if (banco.length === 0) {
    alert("Sem dados para exportar.");
    return;
  }

  const cabecalho = [
    "Data",
    "Entrada",
    "Saída Almoço",
    "Volta Almoço",
    "Saída Final",
    "Minutos Trabalhados",
    "Saldo (min)",
    "Sincronizado",
  ];

  const linhas = banco.map((registro) => [
    registro.data,
    registro.entrada,
    registro.almocoSai,
    registro.almocoVolta,
    registro.saida,
    registro.totalMinutos ?? "",
    registro.saldo ?? "",
    registro.sincronizado ? "SIM" : "NÃO",
  ]);

  const csv = [cabecalho, ...linhas]
    .map((colunas) =>
      colunas
        .map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `ponto-pro-${hoje.replaceAll("/", "-")}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function abrirPlanilha() {
  window.open(PLANILHA, "_blank");
}

function resetarDia() {
  dados = {
    entrada: null,
    almocoSai: null,
    almocoVolta: null,
    saida: null,
  };

  document.getElementById("entrada").innerText = "--:--";
  document.getElementById("saidaAlmoco").innerText = "--:--";
  document.getElementById("voltaAlmoco").innerText = "--:--";
  document.getElementById("saidaFinal").innerText = "--:--";
}

function abrirAjuste() {
  const painel = document.getElementById("painelAjuste");

  if (painel.style.display === "none" || painel.style.display === "") {
    painel.style.display = "block";

    document.getElementById("ajEntrada").value = dados.entrada || "";
    document.getElementById("ajAlmocoSai").value = dados.almocoSai || "";
    document.getElementById("ajAlmocoVolta").value = dados.almocoVolta || "";
    document.getElementById("ajSaida").value = dados.saida || "";
  } else {
    painel.style.display = "none";
  }
}

function salvarAjuste() {
  const ajuste = {
    entrada: document.getElementById("ajEntrada").value || null,
    almocoSai: document.getElementById("ajAlmocoSai").value || null,
    almocoVolta: document.getElementById("ajAlmocoVolta").value || null,
    saida: document.getElementById("ajSaida").value || null,
  };

  const camposPreenchidos = Object.values(ajuste).filter(Boolean).length;
  if (camposPreenchidos > 0 && camposPreenchidos < 4) {
    alert("Para ajuste manual, preencha os 4 horários.");
    return;
  }

  if (camposPreenchidos === 4 && calcularMinutosTrabalhados(ajuste) === null) {
    alert("A sequência dos horários está inválida.");
    return;
  }

  dados = ajuste;

  document.getElementById("entrada").innerText = dados.entrada || "--:--";
  document.getElementById("saidaAlmoco").innerText = dados.almocoSai || "--:--";
  document.getElementById("voltaAlmoco").innerText = dados.almocoVolta || "--:--";
  document.getElementById("saidaFinal").innerText = dados.saida || "--:--";

  alert("Horário ajustado.");
}

function atualizarCronometro() {
  const el = document.getElementById("cronometro");
  if (!el) return;

  const totalMinutos = calcularMinutosTrabalhados();
  if (totalMinutos === null) {
    el.innerText = "00:00:00";
    return;
  }

  const horas = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
  const minutos = String(totalMinutos % 60).padStart(2, "0");
  el.innerText = `${horas}:${minutos}:00`;
}

window.addEventListener("load", () => {
  obterGPS();
  carregarHistorico();

  if (typeof gerarGrafico === "function") {
    gerarGrafico();
  }

  atualizarCronometro();
  setInterval(atualizarCronometro, 1000);
});





