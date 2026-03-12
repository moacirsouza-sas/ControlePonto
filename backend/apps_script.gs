function doGet() {

return ContentService
.createTextOutput("API Ponto Pro funcionando")
.setMimeType(ContentService.MimeType.TEXT);

}

function doPost(e){

try{

const SPREADSHEET_ID="1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE";

const aba = SpreadsheetApp
.openById(SPREADSHEET_ID)
.getSheets()[0];

const dados = JSON.parse(e.postData.contents);

// horários seguros (evita erro se faltar almoço)
const entrada = dados.entrada || "00:00";
const almocoSai = dados.almocoSai || entrada;
const almocoVolta = dados.almocoVolta || entrada;
const saida = dados.saida || "00:00";

// converter horários
const e1 = new Date("1970-01-01T"+entrada+":00");
const e2 = new Date("1970-01-01T"+almocoSai+":00");
const e3 = new Date("1970-01-01T"+almocoVolta+":00");
const e4 = new Date("1970-01-01T"+saida+":00");

// cálculo de horas
const manha = (e2 - e1);
const tarde = (e4 - e3);

const totalMin = Math.round((manha + tarde) / 60000);

// jornada padrão 8h
const jornada = 480;

const saldo = totalMin - jornada;

// registrar na planilha
aba.appendRow([

dados.data || "",
entrada,
almocoSai,
almocoVolta,
saida,
totalMin,
saldo,
dados.geo || "",
new Date()

]);

return ContentService
.createTextOutput("OK")
.setMimeType(ContentService.MimeType.TEXT);

}catch(err){

return ContentService
.createTextOutput("ERRO: "+err)
.setMimeType(ContentService.MimeType.TEXT);

}

}
