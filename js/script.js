const API="https://script.google.com/macros/s/AKfycbye-H3LzD2R_WpisAVm6i4hn3ZnRQlFKBJu4XM32UplR4s4KcaC08FVGulKxjdfonc/exec"

let hoje=new Date().toLocaleDateString("pt-BR")

document.getElementById("dataHoje").innerText=hoje

let dados={

entrada:null,
almocoSai:null,
almocoVolta:null,
saida:null

}

function hora(){

return new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})

}

function registrarAgora(){

if(!dados.entrada){

dados.entrada=hora()
document.getElementById("entrada").innerText=dados.entrada

}

else if(!dados.almocoSai){

dados.almocoSai=hora()
document.getElementById("saidaAlmoco").innerText=dados.almocoSai

}

else if(!dados.almocoVolta){

dados.almocoVolta=hora()
document.getElementById("voltaAlmoco").innerText=dados.almocoVolta

}

else if(!dados.saida){

dados.saida=hora()
document.getElementById("saidaFinal").innerText=dados.saida

}

else{

alert("Todos os registros do dia já foram feitos.")

}

}

function arquivarDia(){

if(!dados.entrada || !dados.saida){

alert("Registro incompleto.")
return

}

fetch(API,{

method:"POST",

body:JSON.stringify({

data:hoje,
entrada:dados.entrada,
almocoSai:dados.almocoSai,
almocoVolta:dados.almocoVolta,
saida:dados.saida,
saldo:0,
geo:"gps"

})

})

.then(r=>r.text())
.then(()=>{

alert("Registro enviado com sucesso")

salvarLocal()
resetarDia()

})
.catch(()=>alert("Erro ao enviar registro"))

}

function resetarDia(){

dados={

entrada:null,
almocoSai:null,
almocoVolta:null,
saida:null

}

document.getElementById("entrada").innerText="--:--"
document.getElementById("saidaAlmoco").innerText="--:--"
document.getElementById("voltaAlmoco").innerText="--:--"
document.getElementById("saidaFinal").innerText="--:--"

}

function baixarCSV(){

let banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

if(banco.length===0){

alert("Sem dados para exportar")
return

}

let csv="Data,Entrada,SaidaAlmoco,VoltaAlmoco,Saida\n"

banco.forEach(d=>{

csv+=`${d.data},${d.entrada},${d.almocoSai||""},${d.almocoVolta||""},${d.saida}\n`

})

let blob=new Blob([csv],{type:"text/csv"})

let url=URL.createObjectURL(blob)

let a=document.createElement("a")

a.href=url
a.download="ponto.csv"
a.click()

}

function abrirPlanilha(){

window.open("https://docs.google.com/spreadsheets","_blank")

}

function salvarLocal(){

let banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

banco.push({

data:hoje,
entrada:dados.entrada,
almocoSai:dados.almocoSai,
almocoVolta:dados.almocoVolta,
saida:dados.saida,
saldo:0

})

localStorage.setItem("ponto_db",JSON.stringify(banco))

carregarHistorico()

}

function carregarHistorico(){

let banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

let tabela=document.querySelector("#historico tbody")

tabela.innerHTML=""

banco.slice(-5).reverse().forEach(d=>{

let tr=document.createElement("tr")

tr.innerHTML=`

<td>${d.data}</td>
<td>${d.entrada}</td>
<td>${d.saida}</td>

`

tabela.appendChild(tr)

})

}

carregarHistorico()

function abrirAjuste(){

const painel=document.getElementById("painelAjuste")

if(painel.style.display==="none" || painel.style.display===""){

painel.style.display="block"

document.getElementById("ajEntrada").value=dados.entrada||""
document.getElementById("ajAlmocoSai").value=dados.almocoSai||""
document.getElementById("ajAlmocoVolta").value=dados.almocoVolta||""
document.getElementById("ajSaida").value=dados.saida||""

}else{

painel.style.display="none"

}

}

function salvarAjuste(){

dados.entrada=document.getElementById("ajEntrada").value
dados.almocoSai=document.getElementById("ajAlmocoSai").value
dados.almocoVolta=document.getElementById("ajAlmocoVolta").value
dados.saida=document.getElementById("ajSaida").value

if(dados.entrada)
document.getElementById("entrada").innerText=dados.entrada

if(dados.almocoSai)
document.getElementById("saidaAlmoco").innerText=dados.almocoSai

if(dados.almocoVolta)
document.getElementById("voltaAlmoco").innerText=dados.almocoVolta

if(dados.saida)
document.getElementById("saidaFinal").innerText=dados.saida

alert("Horário ajustado")

}


