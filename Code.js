//Load Sentinel-1 C-band SAR Ground Range collection (log scale, VV, ascending)
//Load Sentinel-1 C-band SAR Ground Range collection (log scale, VV, descending)
var collectionVV = ee.ImageCollection('COPERNICUS/S1_GRD')
.filter(ee.Filter.eq('instrumentMode', 'IW'))
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
.filterMetadata('resolution_meters', 'equals' , 10)
.filterBounds(UP)
.select('VV');
print(collectionVV, 'Collection VV'); 

// Load Sentinel-1 C-band SAR Ground Range collection (log scale, VH, descending)
var collectionVH = ee.ImageCollection('COPERNICUS/S1_GRD')
.filter(ee.Filter.eq('instrumentMode', 'IW'))
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
.filterMetadata('resolution_meters', 'equals' , 10)
.filterBounds(UP)
.select('VH');
print(collectionVH, 'Collection VH');

//Filter by date
var SARVV = collectionVV.filterDate('2019-05-01', '2019-10-31').mosaic();
var SARVH = collectionVH.filterDate('2019-05-01', '2019-10-31').mosaic();

// Add the SAR images to "layers" in order to display them

Map.centerObject(UP, 9);

// Map.addLayer(SARVV, {min:-15,max:0}, 'SAR VV', 0);
// Map.addLayer(SARVH, {min:-25,max:0}, 'SAR VH', 0);

//Apply filter to reduce speckle
var SMOOTHING_RADIUS = 50;
var SARVV_filtered = SARVV.focal_mean(SMOOTHING_RADIUS, 'circle', 'meters');
var SARVH_filtered = SARVH.focal_mean(SMOOTHING_RADIUS, 'circle', 'meters');

//Display the SAR filtered images
Map.addLayer(SARVV_filtered, {min:-24.51,max:-1.88}, 'SAR VV Filtered',0);
Map.addLayer(SARVH_filtered, {min:-27.83,max:-9.61}, 'SAR VH Filtered',0);

// Add the image collection of Sentinel-2

// First quarter (Jan - Apr)
var collection_1stqtr = ee.ImageCollection("COPERNICUS/S2_SR")
    .filterDate('2019-01-01', '2019-04-30')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
    .filterBounds(UP)
    .median()
    .clip(UP);

// Second quarter (May - Aug)
var collection_2ndqtr = ee.ImageCollection("COPERNICUS/S2_SR")
    .filterDate('2019-05-01', '2019-08-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
    .filterBounds(UP)
    .median()
    .clip(UP);

// Third quarter (Sept - Dec)
var collection_3rdqtr = ee.ImageCollection("COPERNICUS/S2_SR")
    .filterDate('2019-09-01', '2019-12-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
    .filterBounds(UP)
    .median()
    .clip(UP);


// Calculate NDVI for first quarter
var ndvi_1stqtr = collection_1stqtr.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Calculate NDMI for first quarter
var ndmi_1stqtr = collection_1stqtr.normalizedDifference(['B8', 'B11']).rename('NDMI');

// Calculate NDWI for first quarter
var ndwi_1stqtr = collection_1stqtr.normalizedDifference(['B8', 'B12']).rename('NDWI');

// Calculate NDBI for first quarter
var ndbi_1stqtr = collection_1stqtr.normalizedDifference(['B11', 'B8']).rename('NDBI');

// Calculate NDVI for second quarter
var ndvi_2ndqtr = collection_2ndqtr.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Calculate NDMI for second quarter
var ndmi_2ndqtr = collection_2ndqtr.normalizedDifference(['B8', 'B11']).rename('NDMI');

// Calculate NDWI for second quarter
var ndwi_2ndqtr = collection_2ndqtr.normalizedDifference(['B8', 'B12']).rename('NDWI');

// Calculate NDBI for second quarter
var ndbi_2ndqtr = collection_2ndqtr.normalizedDifference(['B11', 'B8']).rename('NDBI');

// Calculate NDVI for third quarter
var ndvi_3rdqtr = collection_3rdqtr.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Calculate NDMI for third quarter
var ndmi_3rdqtr = collection_3rdqtr.normalizedDifference(['B8', 'B11']).rename('NDMI');

// Calculate NDWI for third quarter
var ndwi_3rdqtr = collection_3rdqtr.normalizedDifference(['B8', 'B12']).rename('NDWI');

// Calculate NDBI for third quarter
var ndbi_3rdqtr = collection_3rdqtr.normalizedDifference(['B11', 'B8']).rename('NDBI');

// Concatenate all quarters into a single image
var composite = ee.Image.cat(collection_1stqtr, collection_2ndqtr, collection_3rdqtr);

// Add NDVI, NDMI, NDWI, and NDBI for each quarter as separate bands
composite = composite.addBands(ndvi_1stqtr).addBands(ndmi_1stqtr).addBands(ndwi_1stqtr).addBands(ndbi_1stqtr)
                    .addBands(ndvi_2ndqtr).addBands(ndmi_2ndqtr).addBands(ndwi_2ndqtr).addBands(ndbi_2ndqtr)
                    .addBands(ndvi_3rdqtr).addBands(ndmi_3rdqtr).addBands(ndwi_3rdqtr).addBands(ndbi_3rdqtr);




var composite = composite.addBands(SARVV_filtered).addBands(SARVH_filtered);

print(composite,'composite');

/***Do not un-comment this section of code****///



Map.addLayer(composite, {bands: ['B6', 'B3', 'B2'], min: 0, max: 2500, gamma: 1.1}, 'Sentinel_2_UP',0);
 
var FCC_image_dec = {bands: ['B8', 'B4', 'B3'], min: 0, max: 2500, gamma: 1.1};
Map.addLayer(composite, FCC_image_dec, "Sentinel_FCC20_UP",0);
var TCC_image_dec = {bands: ['B4', 'B3', 'B2'], min: 0, max: 2500, gamma: 1.1};
Map.addLayer(composite, TCC_image_dec, "Sentinel_TCC20_UP",0);




Map.centerObject(UP, 8);
Map.addLayer(UP_locations, {}, 'UP_locations');

// // create a new feature collection using the training points
var newfc =
Vegetation.merge(Cropland).merge(Wetland).merge(Builtup).merge(Fallow_land)
.merge(Waterbody);

print (newfc)


//create variables for classification
var label = 'landcover';
var bands = ['B7', 'B7_1', 'B7_2', 'B3', 'B3_1', 'B3_2', 'B4', 'B4_1',
'B4_2', 'B8', 'B8_1', 'B8_2', 'NDVI', 'NDVI_1', 'NDVI_2', 'NDMI', 'NDMI_1', 'NDMI_2', 'NDWI', 'NDWI_1', 'NDWI_2', 'VV', 'VH']
var input = composite.select(bands);

print(bands);
var points = input.sampleRegions({
  collection:newfc,
  properties: [label],
  scale:30,
});  

var trainingData = points.randomColumn();
var training = trainingData.filter(ee.Filter.lessThan('random', 0.7));
var testing = trainingData.filter(ee.Filter.greaterThanOrEquals('random', 0.7));



// Classification Model
//var classifier = ee.Classifier.libsvm().train(training, label, bands);
//var classifier = ee.Classifier.smileCart(10).train(training, label, bands);
var classifier = ee.Classifier.smileRandomForest(300,4).train(training, label, bands);
var classified = input.classify(classifier);

//Majority Filter and Kernel

var kernel = ee.Kernel.manhattan(1);

var fmajority = classified.reduceNeighborhood({
  reducer:ee.Reducer.mode(),
  kernel:kernel
})/*.reproject('EPSG:4326', null, 10)*/

var final_classification = fmajority;

//Print Confusion Matrix and Overall Accuracy
var confusionMatrix = classifier.confusionMatrix();
print('Confusion matrix: ', confusionMatrix);
print('Training Overall Accuracy: ', confusionMatrix.accuracy());
var kappa = confusionMatrix.kappa();
print('Training Kappa', kappa);
 
var validation = testing.classify(classifier);
var testAccuracy = validation.errorMatrix('landcover', 'classification');
print('Validation Error Matrix RF: ', testAccuracy);
print('Validation Overall Accuracy RF: ', testAccuracy.accuracy());
var kappa1 = testAccuracy.kappa();
print('Validation Kappa', kappa1);

// Define a palette for the classification.
var landcoverPalette = [
  '2D690A', //Vegetation (0)
  'A5F70A', //Cropland (1)
  '0AEEF7', // Wetland(2)
  'EB3407', //Builtup (3)
  '915D09', //Fallow_land (4)
  '093B72', //Waterbody (5)
];

Map.addLayer(final_classification,{palette: landcoverPalette});

// Export the classified image

Export.image.toDrive({
  image: final_classification,
  description: 'Classified_Haryana',
  scale: 10,
  region: UP,
  maxPixels: 1e13,
});