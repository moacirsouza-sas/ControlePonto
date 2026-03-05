function gerarGrafico(){

const db=JSON.parse(localStorage.getItem("ponto_db")||"[]");

const labels=db.map(i=>i.data);

const saldo=db.map(i=>i.saldo);

const ctx=document.getElementById("graficoHoras");

if(!ctx) return;

new Chart(ctx,{

type:"bar",

data:{

labels:labels,

datasets:[{

label:"Saldo diário (min)",
data:saldo

}]

},

options:{

responsive:true,

scales:{

y:{

beginAtZero:true

}

}

}

});

}
