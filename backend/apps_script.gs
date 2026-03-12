function doGet() {
  return ContentService.createTextOutput("Backend Ponto Pro Ativo.");
}

function doPost(e) {
  try {
    const SPREADSHEET_ID = "1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    
    const d = JSON.parse(e.postData.contents);

    const calcM = (h) => {
      if(!h || !h.includes(':')) return 0;
      const p = h.split(':');
      return (parseInt(p[0]) * 60) + parseInt(p[1]);
    };

    const totalMin = (calcM(d.almocoSai) - calcM(d.entrada)) + (calcM(d.saida) - calcM(d.almocoVolta));
    const hDec = (totalMin / 60).toFixed(2);
    const saldo = totalMin - 480; // Meta 8h

    sheet.appendRow([
      d.data, 
      d.entrada, 
      d.almocoSai, 
      d.almocoVolta, 
      d.saida, 
      hDec, 
      saldo, 
      d.geo, 
      new Date()
    ]);

    return ContentService.createTextOutput("OK");
  } catch(err) {
    return ContentService.createTextOutput("Erro: " + err.message);
  }
}
