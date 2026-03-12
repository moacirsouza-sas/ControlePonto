let grafico;

function paraMin(h) {
    if (!h || !h.includes(':')) return 0;
    const p = h.split(':');
    return (parseInt(p[0]) * 60) + parseInt(p[1]);
}

function gerarGrafico() {
    const canvas = document.getElementById("graficoHoras");
    const banco = JSON.parse(localStorage.getItem("ponto_db") || "[]");
    if (banco.length === 0) return;

    const labels = banco.slice(-7).map(d => d.data);
    const horasData = banco.slice(-7).map(d => {
        // Cálculo: (Saída Almoço - Entrada) + (Saída Final - Volta Almoço)
        const total = (paraMin(d.almocoSai) - paraMin(d.entrada)) + (paraMin(d.saida) - paraMin(d.almocoVolta));
        return (total / 60).toFixed(2);
    });

    if (grafico) grafico.destroy();
    grafico = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{ 
                label: "Horas Reais", 
                data: horasData, 
                backgroundColor: "#4a6cf7" 
            }]
        },
        options: { 
            responsive: true, 
            plugins: { legend: { display: false } } 
        }
    });
}
