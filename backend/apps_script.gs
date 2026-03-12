// Resolve erro da Imagem 3
function doGet() {
  return ContentService.createTextOutput("Backend Ponto Pro: Ativo.");
}

function doPost(e) {
  try {
    // Resolve erro da Imagem 2
    if (!e || !e.postData) return ContentService.createTextOutput("Sem dados");

    const SPREADSHEET_ID = "1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    const d = JSON.parse(e.postData.contents);

    const calcMin = (h) => {
      if(!h) return 0;
      const p = h.split(':');
      return parseInt(p[0]) * 60 + parseInt(p[1]);
    };

    const totalMin = (calcMin(d.almocoSai) - calcMin(d.entrada)) + (calcMin(d.saida) - calcMin(d.almocoVolta));
    const hDec = (totalMin / 60).toFixed(2);
    const saldo = totalMin - 480; // Meta 8h

    sheet.appendRow([d.data, d.entrada, d.almocoSai, d.almocoVolta, d.saida, hDec, saldo, d.geo, new Date()]);

    return ContentService.createTextOutput("Sucesso");
  } catch(err) {
    return ContentService.createTextOutput("Erro: " + err.message);
  }
}
