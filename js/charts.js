let grafico

function gerarGrafico(){

const canvas=document.getElementById("graficoHoras")

if(!canvas) return

const dados=JSON.parse(localStorage.getItem("ponto_db") || "[]")

if(dados.length===0) return

const labels=dados.map(d=>d.data)

const horas=dados.map(d=>((480+(d.saldo||0))/60).toFixed(2))

if(grafico) grafico.destroy()

grafico=new Chart(canvas,{

type:"bar",

data:{

labels:labels,

datasets:[{

label:"Horas Trabalhadas",

data:horas,

backgroundColor:"rgba(54,162,235,0.6)"

}]

},

options:{

responsive:true,

plugins:{
legend:{display:false}
},

scales:{
y:{
beginAtZero:true,
title:{
display:true,
text:"Horas"
}
}
}

}

})

}

window.onload=gerarGrafico
