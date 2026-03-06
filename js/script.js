const API_URL = "https://script.google.com/macros/s/AKfycbzLc9b1aC2kRlGjL9LYrzaEnBcT65CWC76zhKc_Wig_qJodPuzOOGeYbMqa33sxrBo/exec";

let db = JSON.parse(localStorage.getItem("ponto_db") || "[]");

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

if(db.find(r => r.data === dataHoje)){
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

const saldo = minutosTrabalhados - 540;

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

if(typeof gerarGrafico === "function"){
gerarGrafico();
}

}

function converterMinutos(hora){

const [h,m] = hora.split(":").map(Number);
return h*60 + m;

}

function formatarSaldo(min){

const sinal = min >= 0 ? "+" : "-";
min = Math.abs(min);

const h = Math.floor(min/60);
const m = min % 60;

return `${sinal}${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;

}

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

function renderizarHistorico(){

const tbody = document.querySelector("#tabela tbody");

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

function saldoTotal(){

return db.reduce((acc,r)=>acc+r.saldo,0);

}

window.onload = ()=>{

renderizarHistorico();

if(typeof gerarGrafico==="function"){
gerarGrafico();
}

};



