const API_URL = "https://script.google.com/macros/s/AKfycbyERIOLmvKu5jwniMUfjnPDNjpW6Zlkjzv430o7jah7VJNGc-9V7K6Cq16Q8_2rwHs/exec";

let db = JSON.parse(localStorage.getItem("ponto_db") || "{}");

let hoje = new Date().toLocaleDateString();

if(!db[hoje]){

db[hoje] = {
entrada:"",
almocoSai:"",
almocoVolta:"",
saida:"",
saldo:""
};

}

function registrar(tipo){

let agora = new Date();
let hora = agora.toLocaleTimeString();

db[hoje][tipo] = hora;

document.getElementById("horaRegistro").innerText = hora;

salvarLocal();

enviarServidor();

atualizarTela();

}

function salvarLocal(){

localStorage.setItem("ponto_db", JSON.stringify(db));

}

function enviarServidor(){

navigator.geolocation.getCurrentPosition(function(pos){

let dados = {

data: hoje,
entrada: db[hoje].entrada,
almocoSai: db[hoje].almocoSai,
almocoVolta: db[hoje].almocoVolta,
saida: db[hoje].saida,
saldo: db[hoje].saldo,
geo: pos.coords.latitude + "," + pos.coords.longitude

};

fetch(API_URL,{

method:"POST",
body:JSON.stringify(dados)

})
.then(r=>r.text())
.then(r=>console.log(r));

});

}

function atualizarTela(){

let hist = document.getElementById("historico");

hist.innerHTML="";

for(let data in db){

let tr = document.createElement("tr");

tr.innerHTML = `

<td>${data}</td>
<td>${db[data].entrada}</td>
<td>${db[data].saida}</td>
<td>${db[data].saldo}</td>

`;

hist.appendChild(tr);

}

}

function exportarCSV(){

let csv="Data,Entrada,Saida,Saldo\n";

for(let data in db){

csv += `${data},${db[data].entrada},${db[data].saida},${db[data].saldo}\n`;

}

let blob = new Blob([csv],{type:"text/csv"});

let link = document.createElement("a");

link.href = URL.createObjectURL(blob);

link.download="ponto.csv";

link.click();

}

atualizarTela();
