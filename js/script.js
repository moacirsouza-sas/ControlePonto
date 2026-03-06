const API_URL = "https://script.google.com/macros/s/AKfycbwsyTEH5GsW1YAJR6Zu_N_u2mhPWl3K-leGqihpm_lPOIOx3vl24ZsUy23_DJU7wg0/exec";

let db=JSON.parse(localStorage.getItem("ponto_db")||"[]")

function registrar(){

const entrada=document.getElementById("entrada").value
const almocoSai=document.getElementById("almocoSai").value
const almocoVolta=document.getElementById("almocoVolta").value
const saida=document.getElementById("saida").value

if(!entrada||!saida){

alert("Entrada e saída obrigatórias")
return

}

const dataHoje=new Date().toLocaleDateString("pt-BR")

const minutosEntrada=converterMinutos(entrada)
const minutosSaida=converterMinutos(saida)

let minutosTrabalhados=minutosSaida-minutosEntrada

if(almocoSai&&almocoVolta){

const minutosAlmoco=
converterMinutos(almocoVolta)-converterMinutos(almocoSai)

minutosTrabalhados-=minutosAlmoco

}

const saldo=minutosTrabalhados-480

const registro={

data:dataHoje,
entrada,
almocoSai,
almocoVolta,
saida,
saldo

}

db.push(registro)

localStorage.setItem("ponto_db",JSON.stringify(db))

enviarGoogleSheets(registro)

renderizarHistorico()

if(typeof gerarGrafico==="function") gerarGrafico()

}

function converterMinutos(h){

const[t,m]=h.split(":").map(Number)

return t*60+m

}

function formatarSaldo(min){

const sinal=min>=0?"+":"-"

min=Math.abs(min)

const h=Math.floor(min/60)
const m=min%60

return `${sinal}${h}h ${m}m`

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
geo:"app"

})

})

.then(r=>r.text())
.then(r=>console.log("Planilha:",r))
.catch(e=>console.log("Erro:",e))

}

function renderizarHistorico(){

const tbody=document.querySelector("#tabela tbody")

tbody.innerHTML=""

db.slice().reverse().forEach(r=>{

const tr=document.createElement("tr")

tr.innerHTML=`

<td>${r.data}</td>
<td>${r.entrada}</td>
<td>${r.saida}</td>
<td>${formatarSaldo(r.saldo)}</td>

`

tbody.appendChild(tr)

})

}

function exportarCSV(){

let csv="Data,Entrada,Saida,Saldo\n"

db.forEach(r=>{

csv+=`${r.data},${r.entrada},${r.saida},${r.saldo}\n`

})

const blob=new Blob([csv],{type:"text/csv"})

const a=document.createElement("a")

a.href=URL.createObjectURL(blob)

a.download="ponto.csv"

a.click()

}

window.onload=()=>{

renderizarHistorico()

if(typeof gerarGrafico==="function") gerarGrafico()

}
