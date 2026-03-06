const API_URL = "https://script.google.com/macros/s/AKfycbyERIOLmvKu5jwniMUfjnPDNjpW6Zlkjzv430o7jah7VJNGc-9V7K6Cq16Q8_2rwHs/exec";

const jornada = 480;

let dados = JSON.parse(localStorage.getItem("dados")) || {dias:{}};

let hoje = new Date().toLocaleDateString("pt-BR");

if(!dados.dias[hoje]){

dados.dias[hoje]={

entrada:null,
saidaAlmoco:null,
voltaAlmoco:null,
saida:null

};

}

function salvar(){

localStorage.setItem("dados",JSON.stringify(dados));

}

function agora(){

return new Date().toLocaleTimeString("pt-BR");

}

function registrarEntrada(){

dados.dias[hoje].entrada=agora();

registrar("Entrada registrada");

}

function registrarSaidaAlmoco(){

dados.dias[hoje].saidaAlmoco=agora();

registrar("Saída almoço registrada");

}

function registrarVoltaAlmoco(){

dados.dias[hoje].voltaAlmoco=agora();

registrar("Volta almoço registrada");

}

function registrarSaida(){

dados.dias[hoje].saida=agora();

registrar("Saída registrada");

}

function registrar(msg){

salvar();

document.getElementById("status").innerText=msg;

document.getElementById("horaRegistro").innerText=agora();

calcularHoras();

enviarServidor();

renderizarHistorico();

if(typeof gerarGrafico==="function") gerarGrafico();

}

function converter(h){

if(!h) return 0;

let p=h.split(":");

return parseInt(p[0])*60+parseInt(p[1]);

}

function calcularHoras(){

let d=dados.dias[hoje];

let entrada=converter(d.entrada);

let saida=converter(d.saida);

let almocoSai=converter(d.saidaAlmoco);

let almocoVolta=converter(d.voltaAlmoco);

let total=0;

if(entrada && saida){

total=saida-entrada;

if(almocoSai && almocoVolta){

total-=almocoVolta-almocoSai;

}

}

let faltante=Math.max(jornada-total,0);

let extra=Math.max(total-jornada,0);

document.getElementById("horasFeitas").innerText=formatar(total);
document.getElementById("horasFaltantes").innerText=formatar(faltante);
document.getElementById("horasExtras").innerText=formatar(extra);

}

function formatar(m){

let h=Math.floor(m/60);
let min=m%60;

return `${h}h ${min}m`;

}

function enviarServidor(){

let d=dados.dias[hoje];

fetch(API_URL,{

method:"POST",

body:JSON.stringify({

data:hoje,
entrada:d.entrada,
almocoSai:d.saidaAlmoco,
almocoVolta:d.voltaAlmoco,
saida:d.saida,
saldo:0,
geo:"gps"

})

})

.then(r=>r.text())
.then(res=>console.log(res))
.catch(err=>console.log(err));

}

function renderizarHistorico(){

let tbody=document.querySelector("#tabela tbody");

tbody.innerHTML="";

Object.keys(dados.dias).forEach(data=>{

let d=dados.dias[data];

let tr=document.createElement("tr");

tr.innerHTML=`
<td>${data}</td>
<td>${d.entrada||""}</td>
<td>${d.saida||""}</td>
<td>-</td>
`;

tbody.appendChild(tr);

});

}

function exportarCSV(){

let csv="Data,Entrada,Saida\n";

Object.keys(dados.dias).forEach(data=>{

let d=dados.dias[data];

csv+=`${data},${d.entrada||""},${d.saida||""}\n`;

});

let blob=new Blob([csv],{type:"text/csv"});

let a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="ponto.csv";

a.click();

}

window.onload=()=>{

renderizarHistorico();

calcularHoras();

};

