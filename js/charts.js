let grafico;

function gerarGrafico(){

const ctx=document.getElementById("graficoHoras");

if(!ctx) return;

let dados=JSON.parse(localStorage.getItem("dados")||'{"dias":{}}');

let labels=[];
let horas=[];

Object.keys(dados.dias).forEach(data=>{

let d=dados.dias[data];

if(d.entrada && d.saida){

let e=converter(d.entrada);
let s=converter(d.saida);

horas.push((s-e)/60);

labels.push(data);

}

});

if(grafico) grafico.destroy();

grafico=new Chart(ctx,{

type:"bar",

data:{
labels:labels,
datasets:[{
label:"Horas",
data:horas
}]
}

});

}

function converter(h){

let p=h.split(":");

return parseInt(p[0])*60+parseInt(p[1]);

}
