let grafico

function gerarGrafico(){

const ctx=document.getElementById("graficoHoras")

if(!ctx) return

const dados=JSON.parse(localStorage.getItem("ponto_db")||"[]")

if(dados.length===0) return

const labels=dados.map(d=>d.data)

const horas=dados.map(d=>(480+(d.saldo||0))/60)

if(grafico) grafico.destroy()

grafico=new Chart(ctx,{

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

plugins:{legend:{display:false}}

}

})

}
