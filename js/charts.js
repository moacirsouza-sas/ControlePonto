let grafico;

function paraMin(h) {
    if (!h) return 0;
    const [hrs, min] = h.split(':').map(Number);
    return hrs * 60 + min;
}

function gerarGrafico() {
    const canvas = document.getElementById("graficoHoras");
    const banco = JSON.parse(localStorage.getItem("ponto_db") || "[]");
    if (banco.length === 0) return;

    const labels = banco.slice(-7).map(d => d.data);
    const horasData = banco.slice(-7).map(d => {
        const total = (paraMin(d.almocoSai) - paraMin(d.entrada)) + (paraMin(d.saida) - paraMin(d.almocoVolta));
        return (total / 60).toFixed(2);
    });

    if (grafico) grafico.destroy();
    grafico = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{ label: "Horas Reais", data: horasData, backgroundColor: "#4a6cf7" }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}
