const API="https://script.google.com/macros/s/AKfycbya9YvdvxhYNqyHyxLHFoOFw8X1DCwAe4CJPOYg8IimoeU-JkRMG81W0qpeLtzbn44/exec"

const PLANILHA="https://docs.google.com/spreadsheets/d/SEU_ID"

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

if(!navigator.geolocation){

document.querySelector(".gps").innerText="GPS não suportado"
return

}

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
src="https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed"></iframe>`

}

async function buscarEndereco(lat,lon){

const url=`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`

const r=await fetch(url)

const d=await r.json()

endereco=d.display_name

document.getElementById("endereco").innerText=endereco

}

function arquivarDia(){

if(!dados.entrada || !dados.saida){

alert("Registro incompleto")
return

}

document.getElementById("statusSync").innerText="🟡 enviando..."

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

document.getElementById("statusSync").innerText="🟢 sincronizado"

salvarLocal()

resetarDia()

})

.catch(()=>{

document.getElementById("statusSync").innerText="🔴 erro — tentando novamente"

setTimeout(arquivarDia,5000)

})

}

function abrirPlanilha(){

window.open(PLANILHA,"_blank")

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

document.getElementById("entrada").innerText=dados.entrada
document.getElementById("saidaAlmoco").innerText=dados.almocoSai
document.getElementById("voltaAlmoco").innerText=dados.almocoVolta
document.getElementById("saidaFinal").innerText=dados.saida

alert("Horário ajustado")

}

window.addEventListener("load",()=>{

obterGPS()

})






