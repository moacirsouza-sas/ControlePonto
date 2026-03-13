let grafico

function gerarGrafico(){

const canvas=document.getElementById("graficoHoras")

const banco=JSON.parse(localStorage.getItem("ponto_db")||"[]")

if(banco.length===0) return

const labels=banco.map(d=>d.data)

const horas=banco.map(d=>{

if(!d.entrada || !d.saida) return 0

let e=d.entrada.split(":")
let s=d.saida.split(":")

let entrada=parseInt(e[0])*60+parseInt(e[1])
let saida=parseInt(s[0])*60+parseInt(s[1])

return((saida-entrada)/60).toFixed(2)

})

if(grafico) grafico.destroy()

grafico=new Chart(canvas,{
type:"bar",
data:{
labels:labels,
datasets:[{
label:"Horas Trabalhadas",
data:horas
}]
}
})

}
