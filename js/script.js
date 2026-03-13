const API="https://script.google.com/macros/s/AKfycbyRAyYdpFB_VLhbCCPPccto5-5-ywbQRFRSVR1eaNB1II0vPCMyNK22iBqpwfJtdPo/exec"

const PLANILHA="https://docs.google.com/spreadsheets/d/1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE/edit"
const JORNADA_MINUTOS=540

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

function horaParaMinutos(valor){
if(!valor) return null

const [h,m]=valor.split(":").map(Number)
if(Number.isNaN(h) || Number.isNaN(m)) return null

return h*60+m
}

function calcularMinutosTrabalhados(registro=dados){
const entrada=horaParaMinutos(registro.entrada)
const almocoSai=horaParaMinutos(registro.almocoSai)
const almocoVolta=horaParaMinutos(registro.almocoVolta)
const saida=horaParaMinutos(registro.saida)

if([entrada,almocoSai,almocoVolta,saida].some(v=>v===null)) return null

const manha=almocoSai-entrada
const tarde=saida-almocoVolta

if(manha<0 || tarde<0) return null

return manha+tarde
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
`<iframe width="100%" height="200" src="https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed"></iframe>`
}

async function buscarEndereco(lat,lon){
try{
const url=`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
const r=await fetch(url)
if(!r.ok) return
const d=await r.json()

endereco=d.display_name || ""

document.getElementById("endereco").innerText=endereco
}catch(_){
// endereço é opcional
}
}

function enviarParaPlanilha(payload){
return new Promise((resolve,reject)=>{
const img=new Image()
const params=new URLSearchParams(payload)
params.set("_ts",Date.now())

img.onload=()=>resolve()
img.onerror=()=>reject(new Error("Falha ao enviar para planilha"))
img.src=`${API}?${params.toString()}`
})
}

function arquivarDia(){
const totalMinutos=calcularMinutosTrabalhados()

if(totalMinutos===null){
alert("Registro incompleto ou inválido")
return
}

const saldo=totalMinutos-JORNADA_MINUTOS

const payload={
data:hoje,
entrada:dados.entrada,
almocoSai:dados.almocoSai,
almocoVolta:dados.almocoVolta,
saida:dados.saida,
totalMinutos:String(totalMinutos),
saldo:String(saldo),
geo:gps+" | "+endereco
}

document.getElementById("statusSync").innerText="🟡 enviando..."

enviarParaPlanilha(payload)
.then(()=>{
document.getElementById("statusSync").innerText="🟢 sincronizado"
salvarLocal(totalMinutos,saldo,true)
resetarDia()
})
.catch(()=>{
document.getElementById("statusSync").innerText="🔴 erro de sincronização"
salvarLocal(totalMinutos,saldo,false)
alert("Falha no envio para planilha. Registro salvo localmente.")
})
}

function salvarLocal(totalMinutos,saldo,sincronizado){
const banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

banco.push({
data:hoje,
entrada:dados.entrada,
almocoSai:dados.almocoSai,
almocoVolta:dados.almocoVolta,
saida:dados.saida,
totalMinutos,
saldo,
sincronizado:!!sincronizado
})

localStorage.setItem("ponto_db",JSON.stringify(banco))

carregarHistorico()
if(typeof gerarGrafico==="function") gerarGrafico()
}

function carregarHistorico(){
const banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")
const tabela=document.querySelector("#historico tbody")

tabela.innerHTML=""

banco.slice(-5).reverse().forEach(d=>{
const tr=document.createElement("tr")
tr.innerHTML=`<td>${d.data}</td><td>${d.entrada ?? "--:--"}</td><td>${d.saida ?? "--:--"}</td>`
tabela.appendChild(tr)
})
}

function baixarCSV(){
const banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

if(banco.length===0){
alert("Sem dados para exportar.")
return
}

const cabecalho=["Data","Entrada","Saída Almoço","Volta Almoço","Saída Final","Minutos Trabalhados","Saldo (min)","Sincronizado"]
const linhas=banco.map(d=>[
d.data,
d.entrada,
d.almocoSai,
d.almocoVolta,
d.saida,
d.totalMinutos ?? "",
d.saldo ?? "",
d.sincronizado?"SIM":"NÃO"
])

const csv=[cabecalho,...linhas]
.map(colunas=>colunas.map(valor=>`"${String(valor ?? "").replaceAll('"','""')}"`).join(","))
.join("\n")

const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"})
const url=URL.createObjectURL(blob)
const a=document.createElement("a")
a.href=url
a.download=`ponto-pro-${hoje.replaceAll("/", "-")}.csv`
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
URL.revokeObjectURL(url)
}

function abrirPlanilha(){
window.open(PLANILHA,"_blank")
}

function resetarDia(){
dados={entrada:null,almocoSai:null,almocoVolta:null,saida:null}

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
dados.entrada=document.getElementById("ajEntrada").value || null
dados.almocoSai=document.getElementById("ajAlmocoSai").value || null
dados.almocoVolta=document.getElementById("ajAlmocoVolta").value || null
dados.saida=document.getElementById("ajSaida").value || null

document.getElementById("entrada").innerText=dados.entrada || "--:--"
document.getElementById("saidaAlmoco").innerText=dados.almocoSai || "--:--"
document.getElementById("voltaAlmoco").innerText=dados.almocoVolta || "--:--"
document.getElementById("saidaFinal").innerText=dados.saida || "--:--"

alert("Horário ajustado")
}

window.addEventListener("load",()=>{
obterGPS()
carregarHistorico()
if(typeof gerarGrafico==="function") gerarGrafico()
})





