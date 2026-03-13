function doPost(e) {

  const SPREADSHEET_ID = "1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";
  const JORNADA_MINUTOS = 540;

  try {
    const aba = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheets()[0];

    const dados = JSON.parse(e.postData.contents);

    if (!dados.entrada || !dados.almocoSai || !dados.almocoVolta || !dados.saida) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "erro", mensagem: "Dados incompletos." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const entrada = new Date("1970-01-01T" + dados.entrada + ":00");
    const almocoSai = new Date("1970-01-01T" + dados.almocoSai + ":00");
    const almocoVolta = new Date("1970-01-01T" + dados.almocoVolta + ":00");
    const saida = new Date("1970-01-01T" + dados.saida + ":00");

    const manha = (almocoSai - entrada);
    const tarde = (saida - almocoVolta);

    const totalCalculado = (manha + tarde) / 60000;
    const total = Number(dados.totalMinutos ?? totalCalculado);
    const saldo = Number(dados.saldo ?? (total - JORNADA_MINUTOS));

    aba.appendRow([
      dados.data,
      dados.entrada,
      dados.almocoSai,
      dados.almocoVolta,
      dados.saida,
      total,
      saldo,
      dados.geo || "",
      new Date(),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "erro", mensagem: erro.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

