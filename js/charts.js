let grafico;

function gerarGrafico(){

const ctx=document.getElementById("graficoHoras");

if(!ctx) return;

const dados=JSON.parse(localStorage.getItem("ponto_db")||"[]");

const labels=dados.map(d=>d.data);

const horas=dados.map(d=>(540+d.saldo)/60);

if(grafico) grafico.destroy();

grafico=new Chart(ctx,{

type:"bar",

data:{

labels:labels,

datasets:[{

label:"Horas Trabalhadas",

data:horas

}]

},

options:{

responsive:true,

plugins:{

legend:{display:false}

},

scales:{

y:{

beginAtZero:true

}

}

}

});

}
