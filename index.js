var geocodeCSV = require('./app/data/geocode');

opts = {
  addressStringAccessor: creatorFunction,
  interval: 1200,
  test: true
}

function creatorFunction(rowData) {
  return rowData.address + ", " + rowData.city + " " + rowData.state;
}

geocodeCSV('./app/data/cost.txt', './app/data/proceduresGeocoded.txt', opts);
