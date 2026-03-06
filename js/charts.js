let grafico;

function gerarGrafico(){
    const ctx = document.getElementById("graficoHoras");
    if(!ctx) return;

    const dados = JSON.parse(localStorage.getItem("ponto_db") || "[]");
    if(dados.length === 0){
        console.log("Sem dados para gerar gráfico");
        return;
    }

    const jornada = 480; // 8h em minutos

    // Labels do gráfico: datas
    const labels = dados.map(d => d.data);

    // Horas trabalhadas: (jornada + saldo) / 60 = horas em decimal
    const horas = dados.map(d => (jornada + (d.saldo || 0)) / 60);

    // Se gráfico já existe, destruir antes de recriar
    if(grafico) grafico.destroy();

    grafico = new Chart(ctx,{
        type: "bar",
        data:{
            labels: labels,
            datasets:[{
                label: "Horas Trabalhadas",
                data: horas,
                backgroundColor: "rgba(54,162,235,0.6)",
                borderColor: "rgba(54,162,235,1)",
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options:{
            responsive: true,
            plugins:{
                legend:{ display:false },
                tooltip:{
                    callbacks:{
                        label:function(context){
                            const h = context.raw;
                            const horas = Math.floor(h);
                            const minutos = Math.round((h - horas) * 60);
                            return `${horas}h ${minutos}min`;
                        }
                    }
                }
            },
            scales:{
                y:{
                    beginAtZero:true,
                    title:{
                        display:true,
                        text:"Horas"
                    }
                },
                x:{
                    title:{
                        display:true,
                        text:"Dias"
                    }
                }
            }
        }
    });
}
