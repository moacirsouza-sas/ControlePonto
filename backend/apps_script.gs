function doPost(e) {
  try {
    const SPREADSHEET_ID = "1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    const d = JSON.parse(e.postData.contents);

    const toM = (h) => {
      if(!h || h.indexOf(':') === -1) return 0;
      const p = h.split(':');
      return parseInt(p[0]) * 60 + parseInt(p[1]);
    };

    const totalMin = (toM(d.almocoSai) - toM(d.entrada)) + (toM(d.saida) - toM(d.almocoVolta));
    const hDec = (totalMin / 60).toFixed(2);
    const saldo = totalMin - 480; // Saldo baseado em 8h diárias

    sheet.appendRow([
      d.data, d.entrada, d.almocoSai, d.almocoVolta, d.saida, 
      hDec, saldo, d.geo, new Date()
    ]);

    return ContentService.createTextOutput("Sucesso");
  } catch(err) {
    return ContentService.createTextOutput("Erro: " + err.message);
  }
}
