//---------------------------------------------------------------------------//
// SCRIPT DOWNLOAD DOS DADOS CHIRPS DAILY DE PRECIPITACAO
//---------------------------------------------------------------------------//

// Data: 30/11/2022
// Descrição: Este script cria uma tabela com dados da coleção CHIRPS/DAILY de precipitação.

// ÁREA DE INTERESSE
var aoi = ee.FeatureCollection('Colar aqui caminho do Asset');

// 1) VISUALIZA ÁREA DE INTERESSE;
Map.addLayer(aoi.draw({color: '000000', strokeWidth: 1}), {}, 'drawn');
Map.centerObject(aoi, 8);

// 2) COLEÇÃO CHIRPS/DAILY DE PRECIPITAÇÃO;
var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY") // Seleciona coleção de imagens
                    .select('precipitation') // Seleciona banda
                    .filterDate('2019-03-01','2022-04-01') // Seleciona data
                    .filterBounds(aoi); // Seleciona região de interesse

print("Número de imagens", chirps.size());

// 3) FILTRA DATA PARA A COLEÇÃO DE IMAGENS;
function date (image) {
  return image.set({date: image.date().format('YYYY-MM-dd')});
}

// 4) APLICA DATA PARA COLEÇÃO DE IMAGENS 
var precipitacao_date = chirps.map(date);
print('Coleção e propriedades', precipitacao_date);

// 5) GERA DADOS DE PRECIPITACAO A PARTIR DA FUNÇÃO
var precipitacao = precipitacao_date.map(function(image){
 
            var indices = image.clip(aoi).reduceRegions({
              collection:aoi,
              reducer:ee.Reducer.mean()
            });

            indices = indices.map(function(f) { return f.set({date: image.get('date')})});
            return indices.copyProperties(image,['system:time_start']);
          });
  print(precipitacao);
  
// 6) CRIA TABELA CONTENDO DADOS DE PRECIPITAÇÃO (mm) DIÁRIA;
var precipitacao_chirps = precipitacao.flatten().select('Exemplo: Date, mean'); // Features do arquivo
print('Informações para tabela', precipitacao_chirps);

//---------------------------------------------------------------------------//
// EXPORTAR DADOS DE PRECIPITAÇÃO
//---------------------------------------------------------------------------//

Export.table.toDrive({
  collection: (precipitacao_chirps), // Seleciona coleção de informações que deseja exportar
  description: 'CSV_Export', // Cria descrição do arquivo (Opcional)
  folder: 'Script_Precipitacao', // Cria nome do arquivo
  fileNamePrefix: 'CHIRPS_Precipitaticao', // Cria pasta
  fileFormat: 'CSV', // Extensão do arquivo
  selectors: ['Exemplo: Date, mean'] // Seleciona dados para tabela
});

//---------------------------------------------------------------------------//
// FIM
//---------------------------------------------------------------------------//
