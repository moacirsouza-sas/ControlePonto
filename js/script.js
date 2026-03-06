const API_URL = "https://script.google.com/macros/s/AKfycbyERIOLmvKu5jwniMUfjnPDNjpW6Zlkjzv430o7jah7VJNGc-9V7K6Cq16Q8_2rwHs/exec";
const modoTeste = true;
let db = JSON.parse(localStorage.getItem("ponto_db") || "[]");

// Funções de registro
function agora(){ return new Date().toLocaleTimeString(); }
function converterMinutos(hora){ const [h,m] = hora.split(":").map(Number); return h*60 + m; }
function formatarSaldo(min){ const sinal = min>=0?"+":"-"; min=Math.abs(min); return `${sinal}${String(Math.floor(min/60)).padStart(2,"0")}:${String(min%60).padStart(2,"0")}`; }

function registrarEntrada(){ registrarHora("entrada","Entrada registrada"); }
function registrarSaidaAlmoco(){ registrarHora("saidaAlmoco","Saída almoço registrada"); }
function registrarVoltaAlmoco(){ registrarHora("voltaAlmoco","Volta almoço registrada"); }
function registrarSaida(){ registrarHora("saida","Saída registrada"); }

function registrarHora(tipo,msg){
    let hoje = new Date().toLocaleDateString();
    if(!db[hoje]) db[hoje] = {entrada:null,saidaAlmoco:null,voltaAlmoco:null,saida:null,saldo:0};
    db[hoje][tipo] = agora();
    localStorage.setItem("ponto_db",JSON.stringify(db));
    document.getElementById("status").innerText = msg;
    atualizarHoras(db[hoje]);
    enviarServidor(db[hoje],hoje);
    renderizarHistorico();
    gerarGrafico();
}

function enviarServidor(registro,dataHoje){
    fetch(API_URL,{
        method:"POST",
        body:JSON.stringify({
            data:dataHoje,
            entrada:registro.entrada,
            almocoSai:registro.saidaAlmoco,
            almocoVolta:registro.voltaAlmoco,
            saida:registro.saida,
            saldo:registro.saldo,
            geo:"gps"
        })
    }).then(r=>r.text()).then(res=>console.log(res)).catch(err=>console.error(err));
}

// Histórico
function renderizarHistorico(){
    const tbody=document.querySelector("#tabela tbody");
    tbody.innerHTML="";
    Object.keys(db).forEach(data=>{
        const r=db[data];
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${data}</td><td>${r.entrada||""}</td><td>${r.saida||""}</td><td>${formatarSaldo(r.saldo)}</td>`;
        tbody.appendChild(tr);
    });
}

// Exportar CSV
function exportarCSV(){
    let csv="Data,Entrada,Saida,Saldo\n";
    Object.keys(db).forEach(d=>{
        const r=db[d];
        csv+=`${d},${r.entrada||""},${r.saida||""},${r.saldo||0}\n`;
    });
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="ponto.csv"; a.click();
}

// Atualizar horas no card
function atualizarHoras(registro){
    const entrada=registro.entrada,saida=registro.saida;
    let minutosTrabalhados=0;
    if(entrada && saida){
        minutosTrabalhados=converterMinutos(saida)-converterMinutos(entrada);
        if(registro.saidaAlmoco && registro.voltaAlmoco){
            minutosTrabalhados-=converterMinutos(registro.voltaAlmoco)-converterMinutos(registro.saidaAlmoco);
        }
    }
    const faltantes=Math.max(0,480-minutosTrabalhados);
    const extra=Math.max(0,minutosTrabalhados-480);
    registro.saldo=minutosTrabalhados-480;

    document.getElementById("horaAtual").innerText="Horário do registro: "+agora();
    document.getElementById("horasFeitas").innerText=`Horas trabalhadas: ${Math.floor(minutosTrabalhados/60)}h ${minutosTrabalhados%60}m`;
    document.getElementById("horasFaltantes").innerText=`Horas faltantes: ${Math.floor(faltantes/60)}h ${faltantes%60}m`;
    document.getElementById("horasExtra").innerText=`Horas extras: ${Math.floor(extra/60)}h ${extra%60}m`;
}

// Inicialização
window.onload=()=>{
    renderizarHistorico();
    const ult=Object.values(db).slice(-1)[0];
    if(ult) atualizarHoras(ult);
    gerarGrafico();
};
