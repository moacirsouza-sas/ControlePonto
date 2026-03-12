let grafico;

function calcHoras(d) {
    const paraMin = h => {
        if(!h) return 0;
        const [hrs, min] = h.split(':').map(Number);
        return hrs * 60 + min;
    };
    const total = (paraMin(d.almocoSai) - paraMin(d.entrada)) + (paraMin(d.saida) - paraMin(d.almocoVolta));
    return total > 0 ? (total / 60).toFixed(2) : 0;
}

function gerarGrafico() {
    const ctx = document.getElementById("graficoHoras").getContext('2d');
    const banco = JSON.parse(localStorage.getItem("ponto_db") || "[]");
    if (banco.length === 0) return;

    const labels = banco.slice(-7).map(d => d.data);
    const valores = banco.slice(-7).map(d => calcHoras(d));

    if (grafico) grafico.destroy();
    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Horas Reais",
                data: valores,
                backgroundColor: "#4a6cf7",
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 12 } }
        }
    });
}
