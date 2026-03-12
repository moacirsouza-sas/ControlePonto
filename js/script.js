const API="https://script.google.com/macros/s/AKfycbye-H3LzD2R_WpisAVm6i4hn3ZnRQlFKBJu4XM32UplR4s4KcaC08FVGulKxjdfonc/exec"

const PLANILHA="https://docs.google.com/spreadsheets/d/1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE/edit#gid=0"

let hoje=new Date().toLocaleDateString("pt-BR")

document.getElementById("dataHoje").innerText=hoje

let dados={
entrada:null,
almocoSai:null,
almocoVolta:null,
saida:null
}

let gps="indisponivel"

function hora(){
return new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})
}

function status(msg){
let el=document.getElementById("statusSync")
if(el) el.innerText=msg
}

function obterGPS(){

if(!navigator.geolocation){
gps="gps indisponivel"
return
}

navigator.geolocation.getCurrentPosition(

pos=>{
gps=pos.coords.latitude+","+pos.coords.longitude
},

()=>{
gps="gps bloqueado"
}

)

}

obterGPS()

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

alert("Todos registros feitos.")

}

}

function enviarRegistro(payload){

return fetch(API,{
method:"POST",
body:JSON.stringify(payload)
})
.then(r=>r.text())

}

async function arquivarDia(){

if(!dados.entrada || !dados.saida){

alert("Registro incompleto.")
return

}

let payload={
data:hoje,
entrada:dados.entrada,
almocoSai:dados.almocoSai,
almocoVolta:dados.almocoVolta,
saida:dados.saida,
saldo:0,
geo:gps
}

if(!navigator.onLine){

status("📡 offline - salvo local")
salvarLocal(payload,true)
return

}

status("⏳ sincronizando")

try{

await enviarRegistro(payload)

status("✅ sincronizado")

salvarLocal(payload,false)

resetarDia()

}catch{

status("⚠ erro - aguardando internet")

salvarLocal(payload,true)

}

}

function salvarLocal(payload,pending){

let banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

payload.pending=pending

banco.push(payload)

localStorage.setItem("ponto_db",JSON.stringify(banco))

carregarHistorico()

gerarGrafico()

}

async function reenviarPendentes(){

let banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

for(let r of banco){

if(r.pending){

try{

await enviarRegistro(r)

r.pending=false

}catch{}

}

}

localStorage.setItem("ponto_db",JSON.stringify(banco))

}

setInterval(()=>{

if(navigator.onLine){

reenviarPendentes()

}

},15000)

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

function abrirPlanilha(){
window.open(PLANILHA,"_blank")
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

window.addEventListener("load",()=>{

carregarHistorico()

})



