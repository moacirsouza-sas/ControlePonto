const API_URL="https://script.google.com/macros/s/AKfycbzgdyO8v9wlYYDNNg_YRU_SH7SmIW2g1G2j3COUJ7keP2mXF8ydknvtXZt5FAjduuk/exec";

let db=JSON.parse(localStorage.getItem("ponto_db")||"[]");

function registrar(){

const entrada=document.getElementById("entrada").value;
const almocoSai=document.getElementById("almocoSai").value;
const almocoVolta=document.getElementById("almocoVolta").value;
const saida=document.getElementById("saida").value;

if(!entrada||!saida){

alert("Entrada e saída obrigatórios");
return;

}

const dataHoje=new Date().toLocaleDateString("pt-BR");

const minutos=(new Date(`1970-01-01T${saida}`)-new Date(`1970-01-01T${entrada}`))/60000;

const saldo=minutos-540;

const registro={

data:dataHoje,
entrada,
almocoSai,
almocoVolta,
saida,
saldo

};

db.push(registro);

localStorage.setItem("ponto_db",JSON.stringify(db));

enviarGoogleSheets(registro);

renderizarHistorico();

gerarGrafico();

}

function enviarGoogleSheets(d){

fetch(API_URL,{

method:"POST",
body:JSON.stringify({
data:d.data,
entrada:d.entrada,
almocoSai:d.almocoSai,
almocoVolta:d.almocoVolta,
saida:d.saida,
saldo:d.saldo,
geo:"gps"
})

});

}

function renderizarHistorico(){

const tbody=document.querySelector("#tabela tbody");

tbody.innerHTML="";

db.slice().reverse().forEach(r=>{

const tr=document.createElement("tr");

tr.innerHTML=`

<td>${r.data}</td>
<td>${r.entrada}</td>
<td>${r.saida}</td>
<td>${r.saldo}</td>

`;

tbody.appendChild(tr);

});

}

function exportarCSV(){

let csv="Data,Entrada,Saida,Saldo\n";

db.forEach(r=>{

csv+=`${r.data},${r.entrada},${r.saida},${r.saldo}\n`;

});

const blob=new Blob([csv]);

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="ponto.csv";

a.click();

}

window.onload=()=>{

renderizarHistorico();

gerarGrafico();

};
