const API_URL = "https://script.google.com/macros/s/AKfycbyERIOLmvKu5jwniMUfjnPDNjpW6Zlkjzv430o7jah7VJNGc-9V7K6Cq16Q8_2rwHs/exec";

/* ATIVAR OU DESATIVAR TESTES */
const modoTeste = true;

// banco local
let db = JSON.parse(localStorage.getItem("ponto_db") || "[]");

function agora(){
    const d = new Date();
    return d.toLocaleTimeString();
}

// CONVERTER HORAS PARA MINUTOS
function converterMinutos(hora){
    const [h,m] = hora.split(":").map(Number);
    return h*60 + m;
}

// FORMATAR SALDO EM +HH:MM / -HH:MM
function formatarSaldo(min){
    const sinal = min >= 0 ? "+" : "-";
    min = Math.abs(min);
    const h = Math.floor(min/60);
    const m = min % 60;
    return `${sinal}${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

// REGISTRAR PONTO MANUAL (para inputs HTML se existirem)
function registrar(){
    const entrada = document.getElementById("entrada").value;
    const almocoSai = document.getElementById("almocoSai").value;
    const almocoVolta = document.getElementById("almocoVolta").value;
    const saida = document.getElementById("saida").value;

    if(!entrada || !saida){
        alert("Entrada e saída obrigatórios");
        return;
    }

    const dataHoje = new Date().toLocaleDateString("pt-BR");

    /* BLOQUEIO DE REGISTRO DUPLICADO */
    if(!modoTeste && db.find(r => r.data === dataHoje)){
        alert("Registro de hoje já existe.");
        return;
    }

    const minutosEntrada = converterMinutos(entrada);
    const minutosSaida = converterMinutos(saida);

    let minutosTrabalhados = minutosSaida - minutosEntrada;

    if(almocoSai && almocoVolta){
        const minutosAlmoco = converterMinutos(almocoVolta) - converterMinutos(almocoSai);
        minutosTrabalhados -= minutosAlmoco;
    }

    const saldo = minutosTrabalhados - 480; // jornada padrão 8h = 480 min

    const registro = {
        data: dataHoje,
        entrada,
        almocoSai,
        almocoVolta,
        saida,
        saldo
    };

    db.push(registro);
    localStorage.setItem("ponto_db", JSON.stringify(db));
    enviarGoogleSheets(registro);
    renderizarHistorico();
    atualizarHoras(registro);

    if(typeof gerarGrafico === "function"){
        gerarGrafico();
    }
}

// ENVIAR PARA GOOGLE SHEETS
function enviarGoogleSheets(d){
    fetch(API_URL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            data:d.data,
            entrada:d.entrada,
            almocoSai:d.almocoSai,
            almocoVolta:d.almocoVolta,
            saida:d.saida,
            saldo:d.saldo,
            geo:"gps"
        })
    })
    .then(r=>r.text())
    .then(res=>console.log("GoogleSheets:",res))
    .catch(err=>console.error("Erro envio:",err));
}

// RENDERIZAR HISTÓRICO
function renderizarHistorico(){
    const tbody = document.querySelector("#tabela tbody");
    if(!tbody) return; // se tabela não existir, ignora
    tbody.innerHTML = "";
    db.slice().reverse().forEach(r=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.data}</td>
            <td>${r.entrada}</td>
            <td>${r.saida}</td>
            <td>${formatarSaldo(r.saldo)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// EXPORTAR CSV
function exportarCSV(){
    let csv = "Data,Entrada,Saida,Saldo\n";
    db.forEach(r=>{
        csv += `${r.data},${r.entrada},${r.saida},${r.saldo}\n`;
    });
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ponto.csv";
    a.click();
}

// CALCULAR SALDO TOTAL
function saldoTotal(){
    return db.reduce((acc,r)=>acc+r.saldo,0);
}

// ATUALIZAR HORAS TRABALHADAS, FALTANTES E EXTRAS
function atualizarHoras(registro){
    const minutosTrabalhados = registro.entrada && registro.saida ? 
        converterMinutos(registro.saida) - converterMinutos(registro.entrada) - 
        ((registro.almocoSai && registro.almocoVolta) ? converterMinutos(registro.almocoVolta)-converterMinutos(registro.almocoSai):0)
        : 0;

    const faltantes = 480 - minutosTrabalhados; // 8h = 480 min
    const extra = minutosTrabalhados - 480;

    document.getElementById("horaAtual")?.innerText = "Horário do registro: " + agora();
    document.getElementById("horasFeitas")?.innerText = `Horas trabalhadas: ${Math.floor(minutosTrabalhados/60)}h ${Math.floor(minutosTrabalhados%60)}m`;
    document.getElementById("horasFaltantes")?.innerText = `Horas faltantes: ${faltantes>0 ? Math.floor(faltantes/60)+"h "+Math.floor(faltantes%60)+"m":"0h 0m"}`;
    document.getElementById("horasExtra")?.innerText = `Horas extras: ${extra>0 ? Math.floor(extra/60)+"h "+Math.floor(extra%60)+"m":"0h 0m"}`;
}

// INICIALIZAÇÃO AO CARREGAR
window.onload = ()=>{
    renderizarHistorico();
    if(db.length > 0){
        atualizarHoras(db[db.length-1]); // mostra últimas horas registradas
    }
    if(typeof gerarGrafico==="function"){
        gerarGrafico();
    }
};
