function doGet() {
  return ContentService.createTextOutput("Servidor Ativo.");
}

function doPost(e) {
  try {
    const SPREADSHEET_ID = "1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";
    // Correção: Selecionar explicitamente a primeira aba
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    
    const d = JSON.parse(e.postData.contents);

    const calcMin = (h) => {
      if(!h || typeof h !== "string" || !h.includes(':')) return 0;
      const p = h.split(':');
      // Correção: Garantir que p[0] e p[1] sejam tratados como números
      return (parseInt(p[0], 10) * 60) + parseInt(p[1], 10);
    };

    // Lógica de cálculo robusta
    const ent = calcMin(d.entrada);
    const almS = calcMin(d.almocoSai);
    const almV = calcMin(d.almocoVolta);
    const sai = calcMin(d.saida);

    const totalMin = (almS - ent) + (sai - almV);
    const hDec = (totalMin / 60).toFixed(2);
    const saldo = totalMin - 480; // 480 min = 8 horas

    sheet.appendRow([
      d.data, 
      d.entrada || "--:--", 
      d.almocoSai || "--:--", 
      d.almocoVolta || "--:--", 
      d.saida || "--:--", 
      hDec, 
      saldo, 
      d.geo || "Sem localização", 
      new Date() // Data/Hora do servidor para auditoria
    ]);

    return ContentService.createTextOutput("OK");
  } catch(err) {
    // Retorna o erro exato para o console do navegador facilitando o debug
    return ContentService.createTextOutput("Erro: " + err.message);
  }
}
