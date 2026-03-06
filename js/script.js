const API_URL = "https://script.google.com/macros/s/AKfycbyERIOLmvKu5jwniMUfjnPDNjpW6Zlkjzv430o7jah7VJNGc-9V7K6Cq16Q8_2rwHs/exec";
const jornada = 8; // horas de jornada
const modoTeste = true;

let db = JSON.parse(localStorage.getItem("ponto_db") || "[]");
let hoje = new Date().toLocaleDateString();

if(!db.find(r=>r.data===hoje)){
    db.push({data:hoje, entrada:null, saidaAlmoco:null, voltaAlmoco:null, saida:null, saldo:0, gps:""});
}

salvar();
renderizarHistorico();
atualizarStatus();
if(typeof gerarGrafico==="function") gerarGrafico();

function agora(){ return new Date().toLocaleTimeString(); }
function salvar(){ localStorage.setItem("ponto_db", JSON.stringify(db)); }

function registrarEntrada(){
    registrarHora("entrada");
}

function registrarSaidaAlmoco(){
    registrarHora("saidaAlmoco");
}

function registrarVoltaAlmoco(){
    registrarHora("voltaAlmoco");
}

function registrarSaida(){
    registrarHora("saida");
}

function registrarHora(campo){
    let registro = db.find(r=>r.data===hoje);
    registro[campo] = agora();
    registro.gps = "teste";
    calcularSaldo(registro);
    salvar();
    enviarServidor(registro);
    atualizarStatus();
    renderizarHistorico();
    if(typeof gerarGrafico==="function") gerarGrafico();
}

function converterMinutos(h){
    if(!h) return 0;
    const [hh,mm]=h.split(":").map(Number);
    return hh*60 + mm;
}

function calcularSaldo(registro){
    const entrada = converterMinutos(registro.entrada);
    const saida = converterMinutos(registro.saida);
    const almocoSai = converterMinutos(registro.saidaAlmoco);
    const almocoVolta = converterMinutos(registro.voltaAlmoco);
    let total=0;
    if(entrada && saida) total = saida - entrada;
    if(almocoSai && almocoVolta) total -= (almocoVolta - almocoSai);
    registro.saldo = total - jornada*60;
}

function atualizarStatus(){
    let r = db.find(r=>r.data===hoje);
    document.getElementById("horaRegistro").innerText = "Horário do registro: " + (r.entrada || "--:--:--");
    let trabalhado = r.saldo + jornada*60;
    let faltante = Math.max(0, jornada*60 - trabalhado);
    let extra = Math.max(0, trabalhado - jornada*60);
    document.getElementById("horasFeitas").innerText = `Horas trabalhadas: ${Math.floor(trabalhado/60)}h ${trabalhado%60}m`;
    document.getElementById("horasFaltantes").innerText = `Horas faltantes: ${Math.floor(faltante/60)}h ${faltante%60}m`;
    document.getElementById("horasExtras").innerText = `Horas extras: ${Math.floor(extra/60)}h ${extra%60}m`;
}

function enviarServidor(registro){
    fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            data:registro.data,
            entrada:registro.entrada,
            almocoSai:registro.saidaAlmoco,
            almocoVolta:registro.voltaAlmoco,
            saida:registro.saida,
            saldo:registro.saldo,
            geo:registro.gps
        })
    }).then(r=>r.text()).then(res=>console.log("GoogleSheets:",res)).catch(err=>console.error(err));
}

function renderizarHistorico(){
    const tbody = document.querySelector("#tabela tbody");
    tbody.innerHTML = "";
    db.slice().reverse().forEach(r=>{
        let tr=document.createElement("tr");
        tr.innerHTML=`<td>${r.data}</td><td>${r.entrada||""}</td><td>${r.saida||""}</td><td>${formatarSaldo(r.saldo)}</td>`;
        tbody.appendChild(tr);
    });
}

function formatarSaldo(min){
    const sinal = min>=0?"+":"-";
    min=Math.abs(min);
    return `${sinal}${Math.floor(min/60)}h ${min%60}m`;
}

function exportarCSV(){
    let csv="Data,Entrada,Saida,Saldo\n";
    db.forEach(r=>{csv+=`${r.data},${r.entrada||""},${r.saida||""},${r.saldo}\n`});
    let blob=new Blob([csv],{type:"text/csv"});
    let a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="ponto.csv";
    a.click();
}
