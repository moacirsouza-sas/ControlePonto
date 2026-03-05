function doPost(e) {

try {

var aba = SpreadsheetApp
.openById("1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE")
.getSheets()[0];

if (!e || !e.postData) {

return ContentService
.createTextOutput("Nenhum dado recebido")
.setMimeType(ContentService.MimeType.TEXT);

}

var dados = JSON.parse(e.postData.contents);

aba.appendRow([

dados.data || "",
dados.entrada || "",
dados.almocoSai || "",
dados.almocoVolta || "",
dados.saida || "",
dados.saldo || "",
dados.geo || ""

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
