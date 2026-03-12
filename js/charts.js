let grafico

function gerarGrafico(){

const canvas=document.getElementById("graficoHoras")

const banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

if(banco.length===0) return

const labels=banco.map(d=>d.data)

const horas=banco.map(()=>8)

if(grafico) grafico.destroy()

grafico=new Chart(canvas,{

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
plugins:{legend:{display:false}},
scales:{
y:{beginAtZero:true}
}
}

})

}
