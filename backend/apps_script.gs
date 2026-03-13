function doPost(e){

const SPREADSHEET_ID="1ItfOyHZhqiZVQcaYIq4S3Dz4PLdeu_LRwNSXFLyw5sE"

const aba=SpreadsheetApp
.openById(SPREADSHEET_ID)
.getSheets()[0]

const dados=JSON.parse(e.postData.contents)

const entrada=new Date("1970-01-01T"+dados.entrada+":00")
const almocoSai=new Date("1970-01-01T"+dados.almocoSai+":00")
const almocoVolta=new Date("1970-01-01T"+dados.almocoVolta+":00")
const saida=new Date("1970-01-01T"+dados.saida+":00")

const manha=(almocoSai-entrada)
const tarde=(saida-almocoVolta)

const total=(manha+tarde)/60000

const jornada=480

const saldo=total-jornada

aba.appendRow([

dados.data,
dados.entrada,
dados.almocoSai,
dados.almocoVolta,
dados.saida,
total,
saldo,
dados.geo,
new Date()

])

return ContentService
.createTextOutput("OK")

}
