let grafico;
function gerarGrafico(){
    const ctx=document.getElementById("graficoHoras");
    if(!ctx) return;
    const dados=JSON.parse(localStorage.getItem("ponto_db")||"{}");
    const registros=Object.keys(dados).map(d=>({data:d,...dados[d]}));
    if(registros.length===0) return;
    const jornada=480;
    const labels=registros.map(r=>r.data);
    const horas=registros.map(r=>(jornada+(r.saldo||0))/60);
    if(grafico) grafico.destroy();
    grafico=new Chart(ctx,{
        type:"bar",
        data:{
            labels:labels,
            datasets:[{
                label:"Horas Trabalhadas",
                data:horas,
                backgroundColor:"rgba(54,162,235,0.6)",
                borderColor:"rgba(54,162,235,1)",
                borderWidth:1,
                borderRadius:6
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{display:false},
                tooltip:{callbacks:{label:function(ctx){const h=Math.floor(ctx.raw);const m=Math.round((ctx.raw-h)*60);return `${h}h ${m}min`;}}}
            },
            scales:{
                y:{beginAtZero:true,title:{display:true,text:"Horas"}},
                x:{title:{display:true,text:"Dias"}}
            }
        }
    });
}
