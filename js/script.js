const API = "https://script.google.com/macros/s/AKfycbxptl7OigMrmAW9HOrHcuGdyy1sK7AA6I1M25nwWBKSnUWZ9qI9cnolWpeSw0kHxb4/exec";

const PLANILHA="https://docs.google.com/spreadsheets/d/1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE"

let hoje=new Date().toLocaleDateString("pt-BR")

document.getElementById("dataHoje").innerText=hoje

let gps=""
let endereco=""

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

}

function obterGPS(){

navigator.geolocation.getCurrentPosition(

function(pos){

const lat=pos.coords.latitude
const lon=pos.coords.longitude
const precisao=Math.round(pos.coords.accuracy)

gps=lat+","+lon+" ("+precisao+"m)"

document.querySelector(".gps").innerText="GPS ativo ("+precisao+"m)"

mostrarMapa(lat,lon)

buscarEndereco(lat,lon)

},

function(){

document.querySelector(".gps").innerText="GPS bloqueado"

},

{enableHighAccuracy:true}

)

}

function mostrarMapa(lat,lon){

document.getElementById("mapa").innerHTML=

`<iframe width="100%" height="200"
src="https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed">
</iframe>`

}

async function buscarEndereco(lat,lon){

const url=`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`

const r=await fetch(url)

const d=await r.json()

endereco=d.display_name

document.getElementById("endereco").innerText=endereco

}

function arquivarDia(){

fetch(API,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

data:hoje,
entrada:dados.entrada,
almocoSai:dados.almocoSai,
almocoVolta:dados.almocoVolta,
saida:dados.saida,
geo:gps+" | "+endereco

})

})
.then(()=>{

alert("Registro enviado")

salvarLocal()

resetarDia()

})
.catch(()=>{

alert("Erro ao enviar")

})

}

function salvarLocal(){

let banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

banco.push({

data:hoje,
entrada:dados.entrada,
almocoSai:dados.almocoSai,
almocoVolta:dados.almocoVolta,
saida:dados.saida

})

localStorage.setItem("ponto_db",JSON.stringify(banco))

carregarHistorico()

if(typeof gerarGrafico==="function"){
gerarGrafico()
}

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

function abrirPlanilha(){

window.location.href=PLANILHA

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

window.addEventListener("load",()=>{

obterGPS()

carregarHistorico()

})





