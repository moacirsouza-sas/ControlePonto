function doGet() {

return ContentService
.createTextOutput("API Ponto Pro funcionando")
.setMimeType(ContentService.MimeType.TEXT);

}

function doPost(e){

try{

const SPREADSHEET_ID = "1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";

const aba = SpreadsheetApp
.openById(SPREADSHEET_ID)
.getSheets()[0];

if(aba.getLastRow() === 0){

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

const dados = JSON.parse(e.postData.contents);

aba.appendRow([

dados.data,
dados.entrada,
dados.almocoSai,
dados.almocoVolta,
dados.saida,
dados.saldo,
dados.geo,
new Date()

]);

return ContentService
.createTextOutput("OK")
.setMimeType(ContentService.MimeType.TEXT);

}catch(err){

return ContentService
.createTextOutput("Erro: "+err)
.setMimeType(ContentService.MimeType.TEXT);

}

}
