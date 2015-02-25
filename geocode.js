var async = require('async');
var parse = require('csv-parse');
var csvStringify = require('csv-stringify');
var fs = require('fs');


var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter);

function init(readPath, writePath, opts) {

  var defaults = {
    delimiter : "\t",
    addressStringAccessor: defaultAddressAccessor,
    latColumnName: 'latitude',
    lonColumnName: 'longitude',
    interval: 1000,
    test: false
  }

  function defaultAddressAccessor(d) {
    return d.address;
  }

  for(var i in defaults) {
    if(!opts[i]) {
      opts[i] = defaults[i];
    }
  }

  async.waterfall([
    loadData,
    parseData,
    saveData
  ], finish);

  function loadData(cb) {
    fs.readFile(readPath, function(err, input) {
      parse(input, {delimiter: opts.delimiter, columns:true }, function(err, output){
        if(opts.test) {
          output = output.slice(0,3);
        }
        cb(err, output);
      });
    })
  }

  function parseData(csv, mainCb) {
    console.log('parseData')

    var listOfFunctionsToParse = [];


    csv.forEach(function(hospitalRow, index) {
      listOfFunctionsToParse.push(function(cb) {
        var stringToSearch = opts.addressStringAccessor(hospitalRow);
        geocoder.geocode(stringToSearch)
          .then(function(res) {
            console.log('found loc');
            setTimeout(function() {
              console.log('svaing');
              hospitalRow[opts.latColumnName] = res[0].latitude;
              hospitalRow[opts.lonColumnName] = res[0].longitude;
              cb();
            }, opts.interval);
          })
          .catch(function(err) {
            setTimeout(function() {
              console.log(err);
              cb();
            }, opts.interval);
          })
      })
    });


    async.series(listOfFunctionsToParse,
      function(err, data) {

        mainCb(err, csv);
      }
    );
  }

  function saveData(csv, cb) {
    console.log('saveData')
    csvStringify(csv, {delimiter : opts.delimiter, header : true}, function(err, string) {
      console.log(string);
      fs.writeFile(writePath, string, function(err) {
        if(err) {
          cb(err, "finished with errors");
        } else {
          cb(err, "finished with no errors");
        }
      })
    })

  }

  function finish(err, result) {
    console.log(err);
    console.log(result);
  }

}

module.exports = init;
