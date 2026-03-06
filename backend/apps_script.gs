function doPost(e) {

  try {

    if (!e || !e.postData) {

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "erro",
          mensagem: "Nenhum dado recebido"
        }))
        .setMimeType(ContentService.MimeType.JSON);

    }

    const dados = JSON.parse(e.postData.contents);

    const planilha = SpreadsheetApp
      .openById("1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE")
      .getSheets()[0];

    const linha = [

      dados.data || "",
      dados.entrada || "",
      dados.almocoSai || "",
      dados.almocoVolta || "",
      dados.saida || "",
      dados.saldo || "",
      dados.geo || ""

    ];

    planilha.appendRow(linha);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "ok"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "erro",
        mensagem: erro.message
      }))
      .setMimeType(ContentService.MimeType.JSON);

  }

}
