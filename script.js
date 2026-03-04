const jornada = 8;

// Carregar dados
let dados = JSON.parse(localStorage.getItem("dados")) || {
    dias:{},
    saldoTotal:0
};

// Data segura (não muda formato)
let hoje = new Date().toISOString().split("T")[0];

// Criar dia se não existir
if(!dados.dias[hoje]){

dados.dias[hoje]={

entrada:null,
saidaAlmoco:null,
voltaAlmoco:null,
saida:null,
gps:null,
horas:0,
extra:0

};

}

// Salvar dados
function salvar(){

localStorage.setItem("dados",JSON.stringify(dados));
backupAuto();

}

// Hora atual
function agora(){

return new Date().getTime();

}

// GPS seguro
function gps(){

navigator.geolocation.getCurrentPosition(pos=>{

let g=pos.coords.latitude+","+pos.coords.longitude;

dados.dias[hoje].gps=g;

document.getElementById("gps").innerText=g;

salvar();

},()=>{

document.getElementById("gps").innerText="GPS não autorizado";

});

}

// Entrada
function registrarEntrada(){

dados.dias[hoje].entrada=agora();

gps();

salvar();
atualizar();

}

// Saída almoço
function registrarSaidaAlmoco(){

dados.dias[hoje].saidaAlmoco=agora();

salvar();
atualizar();

}

// Volta almoço
function registrarVoltaAlmoco(){

dados.dias[hoje].voltaAlmoco=agora();

salvar();
atualizar();

}

// Saída final
function registrarSaida(){

dados.dias[hoje].saida=agora();

calcular();

gps();

salvar();
atualizar();

}

// Calcular horas
function calcular(){

let d=dados.dias[hoje];

if(d.entrada && d.saida){

let manha=0;
let tarde=0;

// Com almoço
if(d.saidaAlmoco && d.voltaAlmoco){

manha=d.saidaAlmoco-d.entrada;
tarde=d.saida-d.voltaAlmoco;

}
// Sem almoço
else{

manha=d.saida-d.entrada;

}

let total=(manha+tarde)/3600000;

d.horas=total.toFixed(2);

let extra=total-jornada;

if(extra<0)extra=0;

d.extra=extra.toFixed(2);

calcularSaldo();

}

}

// Saldo acumulado
function calcularSaldo(){

let soma=0;

for(let dia in dados.dias){

soma+=Number(dados.dias[dia].extra||0);

}

dados.saldoTotal=soma.toFixed(2);

}

// Atualizar tela
function atualizar(){

let d=dados.dias[hoje];

document.getElementById("horas").innerText=d.horas||0;
document.getElementById("extra").innerText=d.extra||0;
document.getElementById("saldo").innerText=dados.saldoTotal||0;

// Almoço
if(d.saidaAlmoco && d.voltaAlmoco){

let alm=(d.voltaAlmoco-d.saidaAlmoco)/3600000;

document.getElementById("almoco").innerText=alm.toFixed(2)+" h";

}

// GPS
if(d.gps){

document.getElementById("gps").innerText=d.gps;

}

}

// Backup automático
function backupAuto(){

let texto=JSON.stringify(dados);

localStorage.setItem("backup",texto);

}

// Exportar backup
function exportar(){

let texto=JSON.stringify(dados);

let blob=new Blob([texto]);

let a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="backup_ponto.json";

a.click();

}

// Importar backup
function importar(e){

let arquivo=e.target.files[0];

let leitor=new FileReader();

leitor.onload=function(){

dados=JSON.parse(leitor.result);

salvar();
atualizar();

}

leitor.readAsText(arquivo);

}

// Iniciar
atualizar();
