const API_URL = "https://script.google.com/macros/s/AKfycbzgdyO8v9wlYYDNNg_YRU_SH7SmIW2g1G2j3COUJ7keP2mXF8ydknvtXZt5FAjduuk/exec";

function registrar(){

const entrada = document.getElementById("entrada").value;
const almocoSai = document.getElementById("almocoSai").value;
const almocoVolta = document.getElementById("almocoVolta").value;
const saida = document.getElementById("saida").value;

if(!entrada || !saida){

alert("Entrada e saída são obrigatórios");
return;

}

const dataHoje = new Date().toLocaleDateString("pt-BR");

const minutos =
(new Date(`1970-01-01T${saida}`) -
new Date(`1970-01-01T${entrada}`)) / 60000;

const saldo = minutos - 540;

const dados = {

data:dataHoje,
entrada:entrada,
almocoSai:almocoSai,
almocoVolta:almocoVolta,
saida:saida,
saldo:saldo,
geo:"gps"

};

fetch(API_URL,{

method:"POST",
body:JSON.stringify(dados)

})
.then(res=>res.text())
.then(resposta=>{

alert("Registro salvo");

})
.catch(erro=>{

alert("Erro ao enviar dados");

});

}
