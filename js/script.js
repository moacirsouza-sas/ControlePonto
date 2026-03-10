const API="https://script.google.com/macros/s/AKfycbwdhnnoTzV-U-if6fvjb2uI7e-1wJxUebQ8HM4IqXsI9rD4EFCjW6v4HpRE9YFTEtU/exec"

let hoje=new Date().toLocaleDateString("pt-BR")

document.getElementById("dataHoje").innerText=hoje

let dados={

entrada:null,
almocoSai:null,
almocoVolta:null,
saida:null

}

function hora(){

return new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})

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
.then(r=>{

alert("Registro enviado com sucesso")
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

alert("Exportação CSV em desenvolvimento")

}

function abrirPlanilha(){

window.open("https://docs.google.com/spreadsheets","_blank")

}

