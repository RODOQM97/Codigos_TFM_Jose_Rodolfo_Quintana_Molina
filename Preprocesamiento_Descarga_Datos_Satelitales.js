
var sensor;


var typeLandsat = ['LC09', 'LC08','LE07'];

var field = Grande;
var field_puntos = Grande_2020;

var umbral = 100;
var date = ['2022-05-28','2022-11-15'];

//===========================================================================================================

 function maskcloudS2sr(image){
   var slc = image.select('SCL');
   
   var cloud3 = slc.eq(3)
                   .or(slc.eq(8))
                   .or(slc.eq(9))
                   .or(slc.eq(10));
                   
    return image.updateMask(cloud3.not());
 }

//============================================================================================
function maskCloudL07_TOA(image){

  var qa = image.select('QA_PIXEL');
  var cloudL07_TOA = qa.bitwiseAnd(1 << 3).eq(0) 
                       .and(qa.bitwiseAnd(1 << 4).eq(0)); 
  
  return image.updateMask(cloudL07_TOA);
}

function maskCloudL08_TOA(image){

  var qa = image.select('QA_PIXEL');
  var cloudL08_TOA = qa.bitwiseAnd(1 << 3).eq(0)
                       .and(qa.bitwiseAnd(1 << 4).eq(0)); 
  
  return image.updateMask(cloudL08_TOA);
}


function maskCloudL09_TOA(image){
 
  var qa = image.select('QA_PIXEL');
  var cloudL09_TOA = qa.bitwiseAnd(1 << 3).eq(0)
                       .and(qa.bitwiseAnd(1 << 4).eq(0)); 
  
  return image.updateMask(cloudL09_TOA);
}


function maskCloudL07_SR(image){
  var qa = image.select('QA_PIXEL');
  var cloudL07_SR = qa.bitwiseAnd(1 << 3).eq(0) 
                 .and(qa.bitwiseAnd(1 << 4).eq(0)); 
  
  return image.updateMask(cloudL07_SR);
}


function maskCloudL08_SR(image){
  var qa = image.select('QA_PIXEL');
  var cloudL08_SR = qa.bitwiseAnd(1 << 3).eq(0) 
                 .and(qa.bitwiseAnd(1 << 4).eq(0)); 
  
  return image.updateMask(cloudL08_SR);
}


function maskCloudL09_SR(image){
  var qa = image.select('QA_PIXEL');
  var cloudL09_SR = qa.bitwiseAnd(1 << 3).eq(0) 
                 .and(qa.bitwiseAnd(1 << 4).eq(0)); 
  
  return image.updateMask(cloudL09_SR);
}

//==========================================================================================================

function Sentinel2srCollection(date, field, umbral){
  
  var bands = [ 'B2', 'B3','B4','B5','B6','B7', 'B8','B8A', 'B11', 'B12', 'SCL'];
	var BandNamesS2 = [ 'blue', 'green','red','REdge1','REdge2','REdge3','nir','REdge4', 'swir1', 'swir2', 'SCL'];
  
  var SentinelCollection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") 
                             .filterBounds(field.geometry())
                             .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than', umbral) 
                             .filterDate(date[0], date[1]) 
                             .select(bands, BandNamesS2); 
  
  SentinelCollection = SentinelCollection.map(function(image){

    var tile = image.getString('MGRS_TILE');
    return image.set({ 'satalite':'Sentinel2','tile':tile});
  });
  
  SentinelCollection = SentinelCollection.map(maskcloudS2sr);
  return SentinelCollection;
}

//============================================================================================================================

var LandsatCollectionTOA = function (date, sensor, field, umbral){
  var bands;
  if (sensor == 'LE07'){
    bands = ['B6_VCID_1', 'QA_PIXEL'];
  }
  else if (sensor == 'LC08'){
    bands = ['B10', 'QA_PIXEL'];
  }
  else if (sensor == 'LC09')
  {
    bands = ['B10', 'QA_PIXEL'];
  }
  
 var BandNamesTOA = ['tir', 'QA_PIXEL']; 

 var CollectionTOA = ee.ImageCollection('LANDSAT/'+sensor+'/C02/T1_TOA')
                          .filterBounds(field.geometry())
                          .filterMetadata('CLOUD_COVER','less_than', umbral)
                          .filterDate(date[0], date[1])
                          .select(bands, BandNamesTOA);

CollectionTOA = CollectionTOA.map(function(image)
{
  var title = image.getNumber('WRS_PATH').format('%d').cat(ee.String('-'))
                     .cat(image.getNumber('WRS_ROW').format('%d'));
    
    return image.set({'sensor' : sensor, 'satelite' : 'Landsat'});
});

 if ( sensor == 'LE07')
 {
  CollectionTOA = CollectionTOA.map(maskCloudL07_TOA);
 }
 else if ( sensor == 'LC08')
 {
  CollectionTOA = CollectionTOA.map(maskCloudL08_TOA);
 }
 else if ( sensor == 'LC09' );
 {
  CollectionTOA = CollectionTOA.map(maskCloudL09_TOA); 
 }
 
 return CollectionTOA;
}

//============================================================================================================================

var LandsatCollectionSR = function  (date, sensor, field, umbral){
 var bands;
 if (sensor == 'LE07')
 {
   bands = ['ST_EMIS', 'QA_PIXEL'];
 }
 else if (sensor == 'LC08')
 {
   bands = ['ST_EMIS', 'QA_PIXEL'];
 }
 else if  (sensor == 'LC09')
 {
   bands = ['ST_EMIS', 'QA_PIXEL'];
 }

 var BandNamesSR = ['EMM','QA_PIXEL']; 

 var CollectionSR = ee.ImageCollection('LANDSAT/'+sensor+'/C02/T1_L2')
                          .filterBounds(field.geometry())
                          .filterMetadata('CLOUD_COVER','less_than', umbral)
                          .filterDate(date[0], date[1])
                          .select(bands, BandNamesSR);

 CollectionSR = CollectionSR.map(function(image){
  
   var title = image.getNumber('WRS_PATH').format('%d').cat(ee.String('-'))
                     .cat(image.getNumber('WRS_ROW').format('%d'));
    
    return image.set({'sensor' : sensor, 'satelite' : 'Landsat'});
});


  if (sensor == 'LE07')
  {
    CollectionSR = CollectionSR.map(maskCloudL07_SR);
  }
  else if (sensor == 'LC08')
  {
    CollectionSR = CollectionSR.map(maskCloudL08_SR);
  }
  else if (sensor == 'LC09');
  {
    CollectionSR = CollectionSR.map(maskCloudL09_SR);
  }
  
  return CollectionSR;
}
//===================================================================================================================================

var EMMS = function (image) {
  
  var emms =image.select('EMM').multiply(0.0001);
    emms = emms.rename('EMMS').copyProperties(image,["system:time_start","satelite","sensor"]);
     return image.addBands(emms);
    
};

var BT = function (image) {
 
  var bt = image.select('tir');
    bt = bt.rename('BT').copyProperties(image,["system:time_start","satelite","sensor"]);
     return image.addBands(bt);
};

var LN = function (image){
  
  var ln = ee.Image(EMMS(image).select('EMMS').log());
   ln = ln.rename('LN').copyProperties(image,["system:time_start","satelite","sensor"]);
   return image.addBands(ln);
};

var LST1 = function (image) {

  var ln = LN(image).select('LN');
  var tir = image.select('tir').rename('BT');
  var lst1 = image.expression(
    ' ( (BT / ( 1 + ((0.000010895 * BT)/ (0.01438)) * LN)) - 273.15 )',
    {
     BT: tir,
     LN : ln.select('LN')
    });
    lst1 = lst1.rename('LST').copyProperties(image,["system:time_start", "satelite", "sensor"]);
    return lst1;
};

//====================================================================================================================================================

var NDVI_S2 = function (image){
  
  var red = image.select('red').multiply(0.0001);
  var nir = image.select('nir').multiply(0.0001);
  var ndvi_s2 = image.expression(
    '( ( NIR - RED ) / ( NIR + RED ) )',
    {
      RED : red,
      NIR : nir
    });
  ndvi_s2 = ndvi_s2.rename(['NDVI_S2']).copyProperties(image,["system:time_start","satelite","sensor"]);
  return ndvi_s2;
};


//================================================================================================================================================0

var TCARIOSAVI_S2 = function (image){
  
  var red = image.select('red').multiply(0.0001);
  var redge1 = image.select('REdge1').multiply(0.0001);
  var green = image.select('green').multiply(0.0001);
  var tcari_s2 = image.expression(
    '( 3 * (( REDGE1 - RED ) - ((0.2*(REDGE1 - GREEN)) * (REDGE1 / RED))) )',
    {
      RED : red,
      REDGE1 : redge1,
      GREEN : green
    });
    
  var nir = image.select('nir').multiply(0.0001);
  var red1 = image.select('red').multiply(0.0001);
  var osavi_s2 = image.expression(
    '((1 + 0.16) * ((NIR - RED)/(NIR + RED + 0.16)) )',
    {
    NIR : nir,
    RED : red1
    });
    
  var tcariosavi_s2 = image.expression(
    '(TCARI_S2 / OSAVI_S2)',
    {
      TCARI_S2 : tcari_s2,
      OSAVI_S2 : osavi_s2
    });
    
  
  tcariosavi_s2 = tcariosavi_s2.rename(['TCARIOSAVI_S2']).copyProperties(image,["system:time_start","satelite","sensor"]);
  return tcariosavi_s2;
};

//====================================================================================================================================================

var GNDVI_S2 = function (image){
  
  var green = image.select('green').multiply(0.0001);
  var nir = image.select('nir').multiply(0.0001);
  var gndvi_s2 = image.expression(
    '( ( NIR - GREEN ) / ( NIR + GREEN ) )',
    {
      GREEN : green,
      NIR : nir
    });
  gndvi_s2 = gndvi_s2.rename(['GNDVI_S2']).copyProperties(image,["system:time_start","satelite","sensor"]);
  return gndvi_s2;
};

//=======================================================================================================================================0

var NDRE_S2 = function (image){
  
  var nir = image.select('nir').multiply(0.0001);
  var redge1 = image.select('REdge1').multiply(0.0001);
  var ndre_s2 = image.expression(
    '( ( NIR - REDGE1 ) / ( NIR + REDGE1 ) )',
    {
      NIR : nir,
      REDGE1 : redge1
    });
  ndre_s2 = ndre_s2.rename(['NDRE_S2']).copyProperties(image,["system:time_start","satelite","sensor"]);
  return ndre_s2;
};

//===============================================================================================================================================
function MSI_S2(image){
  
  var swir1 = image.select('swir1').multiply(0.0001);
  var nir = image.select('nir').multiply(0.0001);
  var msi_s2 = image.expression(
    '((SWIR1 / NIR)) ',
    {
      SWIR1 : swir1,
      NIR : nir
    });
    
    msi_s2 = msi_s2.rename(['MSI_S2']).float().copyProperties(image,["system:time_start","satelite"]);
    return msi_s2;
}

//=======================================================================================================================================

var Sentinel = Sentinel2srCollection(date, field, umbral);

sensor = typeLandsat[0];
var colL09_TOA = LandsatCollectionTOA(date, sensor,field, umbral);
var colL09_SR = LandsatCollectionSR (date, sensor, field, umbral);
var CollectionL09 = colL09_TOA.combine(colL09_SR);


sensor = typeLandsat[1];
var colL08_TOA = LandsatCollectionTOA(date, sensor, field, umbral);
var colL08_SR = LandsatCollectionSR (date, sensor, field, umbral);
var CollectionL08 = colL08_TOA.combine(colL08_SR);


sensor = typeLandsat[2];
var colL07_TOA = LandsatCollectionTOA(date, sensor, field, umbral);
var colL07_SR = LandsatCollectionSR (date, sensor, field, umbral);
var CollectionL07 = colL07_TOA.combine(colL07_SR);

 
var ColLandsat0708 = CollectionL07.merge(CollectionL08);
var ColLandsat = ColLandsat0708.merge(CollectionL09);
//=========================================================================================================================================0

 
var LST = ColLandsat.map(LST1).mean().clip(field);

var NDVI = Sentinel.map(NDVI_S2).first().clip(field);

var TCARIOSAVI = Sentinel.map(TCARIOSAVI_S2).first().clip(field);

var GNDVI = Sentinel.map(GNDVI_S2).first().clip(field);

var NDRE = Sentinel.map(NDRE_S2).first().clip(field);

var MSI = Sentinel.map(MSI_S2).first().clip(field);

//==========================================================================================================================================

var cmap1 = ['red', 'yellow', 'green', 'cyan', 'blue' ];
var palleteNDVI = [
   'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ];

Map.centerObject(field, 15);

Map.addLayer(LST, {min: 20, max: 40, palette: cmap1 }, 'LST');

Map.addLayer(NDVI, {min: 0, max: 1, palette: palleteNDVI }, 'NDVI');

Map.addLayer(TCARIOSAVI, {min: 0, max: 0.3, palette:palleteNDVI }, 'TCARI/OSAVI');

Map.addLayer(GNDVI, {min: 0, max: 1, palette: palleteNDVI }, 'GNDVI');

Map.addLayer(NDRE, {min: 0, max: 1, palette: palleteNDVI }, 'NDRE');

Map.addLayer(MSI, {min: 0, max: 1, palette: palleteNDVI }, 'MSI');

Map.addLayer(Arroto_2020, { color: 'red' }, 'New_Points');

//============================================================================================================================================
var addIndices = function(image) {

  var ndvi  = NDVI_S2(image);
  var tcari = TCARIOSAVI_S2(image);
  var gndvi = GNDVI_S2(image);
  var ndre  = NDRE_S2(image);
  var msi   = MSI_S2(image);

  return ee.Image.cat([
    ndvi,
    tcari,
    gndvi,
    ndre,
    msi

  ]).copyProperties(image, ['system:time_start']);
};

//=========================================================================================
var addDate = function(img) {
  var date = ee.Date(img.get('system:time_start')).format('YYYY-MM-dd');
  return img.set('date', date);
};

var Sentinel_dated = Sentinel.map(addDate);

var uniqueDates = ee.List(Sentinel_dated.aggregate_array('date')).distinct();

var Sentinel_daily = ee.ImageCollection(
  uniqueDates.map(function(d) {
    d = ee.String(d);
    var daily = Sentinel_dated
      .filter(ee.Filter.eq('date', d))
      .mean()
      .set('system:time_start', ee.Date(d).millis());
    return daily;
  })
);

//============================================================================================
var IndicesCol = Sentinel_daily.map(addIndices);

var interpolate = function(img) {

  var t = ee.Number(img.get('system:time_start'));

  var prev = IndicesCol
    .filter(ee.Filter.lt('system:time_start', t))
    .sort('system:time_start', false)
    .first();

  var next = IndicesCol
    .filter(ee.Filter.gt('system:time_start', t))
    .sort('system:time_start')
    .first();

  var interp = ee.Algorithms.If(
    prev,
    ee.Algorithms.If(
      next,

      ee.Image(prev).add(
        ee.Image(next)
          .subtract(prev)
          .multiply(
            t.subtract(prev.get('system:time_start'))
             .divide(
               ee.Number(next.get('system:time_start'))
               .subtract(prev.get('system:time_start'))
             )
          )
      ),

      img
    ),
    img
  );

  return img
    .unmask(ee.Image(interp))
    .copyProperties(img, ['system:time_start']);
};


var Indices_interp = IndicesCol.map(interpolate);

//=========================================================================================
var extractIndices = function(image) {

  var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd');

  var sampled = image.reduceRegions({
    collection: field_puntos,
    reducer: ee.Reducer.first(),
    scale: 10
  });

  return sampled.map(function(f) {
    return f.set('date', date);
  });
};

var TS_final = Indices_interp
  .map(extractIndices)
  .flatten();

Export.table.toDrive({
  collection: TS_final,
  description: 'S2_Indices_TS_Interpolated_Grande2022',
  fileFormat: 'CSV'
});


//=========================================================================================

var addDate = function(img) {
  var date = ee.Date(img.get('system:time_start')).format('YYYY-MM-dd');
  return img.set('date', date);
};

var Landsat_dated = ColLandsat.map(addDate);

var uniqueDates_LS = ee.List(
  Landsat_dated.aggregate_array('date')
).distinct();

var Landsat_daily = ee.ImageCollection(
  uniqueDates_LS.map(function(d) {
    d = ee.String(d);

    var daily = Landsat_dated
      .filter(ee.Filter.eq('date', d))
      .mean()
      .set('system:time_start', ee.Date(d).millis());

    return daily;
  })
);


var Landsat_LST = Landsat_daily.map(LST1);

var extract_LST = function(image) {

  var date = ee.Date(image.get('system:time_start'))
    .format('YYYY-MM-dd');

  var sampled = image.reduceRegions({
    collection: field_puntos,
    reducer: ee.Reducer.first(),
    scale: 30   
  });

  return sampled.map(function(f) {
    return f.set('date', date);
  });
};

var LST_final = Landsat_LST
  .map(extract_LST)
  .flatten();


Export.table.toDrive({
  collection: LST_final,
  description: 'LST_Arroto2',
  fileFormat: 'CSV'
});

print('Daily size');
print(Landsat_daily.size());

print('Bands example');
print(Landsat_daily.first().bandNames());
//==================================================================================

var SentinelPoint_NDVI = Sentinel.map(NDVI_S2);

var chart = ui.Chart.image.series({
  imageCollection: SentinelPoint_NDVI,
  region: field,
  reducer: ee.Reducer.mean(),
  scale: 10,
  xProperty: 'system:time_start'
})

.setOptions({
  title: 'First NDVI Value',
  hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
  vAxis: {
    title: 'NDVI_Point',
    titleTextStyle: {italic: false, bold: true}
  },
  lineWidth: 5,
  colors: ['blue'],
  curveType: 'function'
});
print(chart);

//===========================================================================

var SentinelPoint_NDVI = ColLandsat.map(LST1);

var chart = ui.Chart.image.series({
  imageCollection: SentinelPoint_NDVI,
  region: field,
  reducer: ee.Reducer.mean(),
  scale: 10,
  xProperty: 'system:time_start'
})

.setOptions({
  title: 'First NDVI Value',
  hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
  vAxis: {
    title: 'NDVI_Point',
    titleTextStyle: {italic: false, bold: true}
  },
  lineWidth: 5,
  colors: ['blue'],
  curveType: 'function'
});
print(chart);

//====================================================================================

Export.image.toDrive({ image: NDVI, 
  description: 'Camino_11_23_2020', 
  region: field, 
  scale: 10, 
  fileFormat: 'GeoTIFF', 
  formatOptions: { cloudOptimized: true }
});






