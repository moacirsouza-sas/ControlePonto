function doGet() {

  return ContentService
    .createTextOutput("API Ponto Pro funcionando")
    .setMimeType(ContentService.MimeType.TEXT);

}

function doPost(e) {

  try {

    const SPREADSHEET_ID = "1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";
    const aba = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];

    // cria cabeçalho automaticamente se planilha estiver vazia
    if (aba.getLastRow() === 0) {
      aba.appendRow([
        "Data",
        "Entrada",
        "Saída Almoço",
        "Volta Almoço",
        "Saída",
        "Saldo",
        "GPS",
        "Registro Servidor"
      ]);
    }

    // valida se recebeu dados
    if (!e || !e.postData) {
      return ContentService
        .createTextOutput("Nenhum dado recebido")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // converte JSON recebido
    const dados = JSON.parse(e.postData.contents);

    const data = dados.data || "";
    const entrada = dados.entrada || "";
    const almocoSai = dados.almocoSai || "";
    const almocoVolta = dados.almocoVolta || "";
    const saida = dados.saida || "";
    const saldo = dados.saldo || "";
    const geo = dados.geo || "";

    // grava na planilha
    aba.appendRow([
      data,
      entrada,
      almocoSai,
      almocoVolta,
      saida,
      saldo,
      geo,
      new Date()
    ]);

    return ContentService
      .createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (erro) {

    return ContentService
      .createTextOutput("Erro: " + erro.message)
      .setMimeType(ContentService.MimeType.TEXT);

  }

}
