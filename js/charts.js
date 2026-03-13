let grafico;

function registroParaHoras(registro) {
  if (typeof registro.totalMinutos === "number") {
    return Number((registro.totalMinutos / 60).toFixed(2));
  }

  if (!registro.entrada || !registro.almocoSai || !registro.almocoVolta || !registro.saida) {
    return 0;
  }

  const [eh, em] = registro.entrada.split(":").map(Number);
  const [lh, lm] = registro.almocoSai.split(":").map(Number);
  const [vh, vm] = registro.almocoVolta.split(":").map(Number);
  const [sh, sm] = registro.saida.split(":").map(Number);

  const entrada = eh * 60 + em;
  const almocoSai = lh * 60 + lm;
  const almocoVolta = vh * 60 + vm;
  const saida = sh * 60 + sm;

  const minutos = (almocoSai - entrada) + (saida - almocoVolta);
  return Number((Math.max(minutos, 0) / 60).toFixed(2));
}

function gerarGrafico() {
  const canvas = document.getElementById("graficoHoras");
  const banco = JSON.parse(localStorage.getItem("ponto_db") || "[]");

  if (!canvas || banco.length === 0) {
    if (grafico) {
      grafico.destroy();
      grafico = null;
    }
    return;
  }

  const labels = banco.map((registro) => registro.data);
  const horas = banco.map((registro) => registroParaHoras(registro));

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Horas Trabalhadas",
          data: horas,
          backgroundColor: "#6366f1",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Horas",
          },
        },
      },
    },
  });
}
