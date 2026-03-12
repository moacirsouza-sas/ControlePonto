const API="https://script.google.com/macros/s/AKfycbyXERgpmH2Hmvm4nCiijsnECSDSfGfsTe-5wEMaqspI6YpcBeO0AWKTvMoLpx2YDG8/exec"

const PLANILHA="https://docs.google.com/spreadsheets/d/SEU_ID"

let hoje = new Date().toLocaleDateString("pt-BR");
document.getElementById("dataHoje").innerText = hoje;

let gps = "";
let endereco = "";
let dados = { entrada: null, almocoSai: null, almocoVolta: null, saida: null };

function hora() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function registrarAgora() {
    if (!dados.entrada) { dados.entrada = hora(); document.getElementById("entrada").innerText = dados.entrada; }
    else if (!dados.almocoSai) { dados.almocoSai = hora(); document.getElementById("saidaAlmoco").innerText = dados.almocoSai; }
    else if (!dados.almocoVolta) { dados.almocoVolta = hora(); document.getElementById("voltaAlmoco").innerText = dados.almocoVolta; }
    else if (!dados.saida) { dados.saida = hora(); document.getElementById("saidaFinal").innerText = dados.saida; }
}

function obterGPS() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        gps = `${lat},${lon} (${Math.round(pos.coords.accuracy)}m)`;
        document.querySelector(".gps").innerText = `GPS ativo (${Math.round(pos.coords.accuracy)}m)`;
        document.getElementById("mapa").innerHTML = `<iframe width="100%" height="200" src="https://google.com{lat},${lon}&z=15&output=embed"></iframe>`;
        buscarEndereco(lat, lon);
    }, null, { enableHighAccuracy: true });
}

async function buscarEndereco(lat, lon) {
    try {
        const r = await fetch(`https://openstreetmap.org{lat}&lon=${lon}&format=json`);
        const d = await r.json();
        endereco = d.display_name;
        document.getElementById("endereco").innerText = endereco;
    } catch(e) { console.error("Erro GPS"); }
}

function arquivarDia() {
    if (!dados.entrada || !dados.saida) return alert("Registre ao menos Entrada e Saída Final");
    document.getElementById("statusSync").innerText = "🟡 enviando...";

    fetch(API, {
        method: "POST",
        mode: "no-cors", // Resolve erro da Imagem 1
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, data: hoje, geo: gps + " | " + endereco })
    }).then(() => {
        document.getElementById("statusSync").innerText = "🟢 sincronizado";
        salvarLocal();
        resetarDia();
    }).catch(() => {
        document.getElementById("statusSync").innerText = "🔴 erro conexão";
    });
}

function salvarLocal() {
    let banco = JSON.parse(localStorage.getItem("ponto_db") || "[]");
    banco.push({ ...dados, data: hoje });
    localStorage.setItem("ponto_db", JSON.stringify(banco));
    carregarHistorico();
    if (window.gerarGrafico) gerarGrafico();
}

function carregarHistorico() {
    let banco = JSON.parse(localStorage.getItem("ponto_db") || "[]");
    document.querySelector("#historico tbody").innerHTML = banco.slice(-5).reverse().map(d => 
        `<tr><td>${d.data}</td><td>${d.entrada}</td><td>${d.saida || '--:--'}</td></tr>`).join('');
}

function abrirAjuste() {
    const p = document.getElementById("painelAjuste");
    p.style.display = (p.style.display === "none" || p.style.display === "") ? "block" : "none";
}

function salvarAjuste() {
    dados.entrada = document.getElementById("ajEntrada").value;
    dados.almocoSai = document.getElementById("ajAlmocoSai").value;
    dados.almocoVolta = document.getElementById("ajAlmocoVolta").value;
    dados.saida = document.getElementById("ajSaida").value;
    ["entrada", "saidaAlmoco", "voltaAlmoco", "saidaFinal"].forEach((id, i) => {
        document.getElementById(id).innerText = Object.values(dados)[i] || "--:--";
    });
    abrirAjuste();
}

function resetarDia() {
    dados = { entrada: null, almocoSai: null, almocoVolta: null, saida: null };
    ["entrada", "saidaAlmoco", "voltaAlmoco", "saidaFinal"].forEach(id => document.getElementById(id).innerText = "--:--");
}

function abrirPlanilha() { window.open(PLANILHA, "_blank"); }

window.addEventListener("load", () => { obterGPS(); carregarHistorico(); if(window.gerarGrafico) gerarGrafico(); });

