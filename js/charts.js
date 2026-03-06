let grafico;

function gerarGrafico(){
    const ctx=document.getElementById("graficoHoras");
    if(!ctx) return;
    if(db.length===0) return;

    const jornadaMin = 480;
    const labels=db.map(d=>d.data);
    const horas=db.map(d=>(jornadaMin + (d.saldo||0))/60);

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
                tooltip:{
                    callbacks:{
                        label:function(context){
                            let h=context.raw;
                            let horas=Math.floor(h);
                            let minutos=Math.round((h-horas)*60);
                            return `${horas}h ${minutos}min`;
                        }
                    }
                }
            },
            scales:{
                y:{beginAtZero:true, title:{display:true, text:"Horas"}},
                x:{title:{display:true, text:"Dias"}}
            }
        }
    });
}
