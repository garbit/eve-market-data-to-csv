const { Parser } = require('json2csv');
const axios = require('axios');
const fs = require('fs');
const dateFormat = require('dateformat');
const nrc = require('node-run-cmd');
let config = JSON.parse(fs.readFileSync('import-config.json'));

// Checks if a string station name is NullSec (i.e. R3-K7K - Bartertown vs. Jita IV - Moon 4 - Caldari Navy Assembly Plant)
function isNullsecStation(stationName){
  let nameParts = stationName.split(" - ");

  if (nameParts[0].indexOf('-') > -1)
  {
    return true;
  }

  return false;
}

// Get price history for item by region_id
async function getMarketHistoryData(regionId, itemId) {
  var data = null;
  try {
    var data = await axios.get(`https://esi.evetech.net/v1/markets/${regionId}/history/?type_id=${itemId}`);
  }
  catch(e) {
    console.log(e);
    return [];
  }
  data = data.data;

  let days = 10;

  if(data.length < days) {
    return "Not Enough Data";
  }

  // calculate average over last N days from results
  let addedAverage = 0;
  for(let i = data.length - days; i < data.length; i++) {
    addedAverage += data[i].average;
  }
  addedAverage = addedAverage / days;

  return addedAverage;
}

// Get market data for given item by type_id
async function getMarketDataByTypeId(id) {
  var data = null;
  try {
    var data = await axios.get(`https://evemarketer.com/api/v1/markets/types/${id}?language=en`);
  }
  catch(e) {
    console.log(e);
    return [];
  }

  data = data.data;

  // item id, name, price, region, system, station
  let item_sale = {
    name: "",
    volume_entered: "",
    volume_remain: "",
    price: "",
    region: "",
    station: "",
  };

  item_sale.item_id = data.type.id;
  item_sale.name = data.type.name;

  let rows = [];
  let sales = [];

  // check config to see if we exclude nullsec
  if(config.excludeNullsec) {
    // create an array of sales that are not in null sec
    for(let i = 0; i < data.sell.length; i++) {
      let record = data.sell[i];
      if (!isNullsecStation(record.station.name)) {
        sales.push(record);
      }
    }
  }
  else {
    // if we aren't excluding nullsec just add the data to the sales array
    sales = data.sell;
  }

  // if we have sales and sales.length > 5 then process the pricing data
  if(sales.length > 0) {
    if(sales.length >= 5) {

      // retrieve market history for item by the "comparison region" that has been set in the import-config.json
      let averagePrice = await getMarketHistoryData(config.comparisonRegion, sales[0].type_id);

      // loop over 5 results from sales data
      for(let i = 0; i < 5; i++) {
        let record = sales[i];

        let pcDecrease = "";
        let outputAverage = averagePrice;

        if(i > 0) {
          outputAverage = "";
        }

        // calculate percentage decrease of an item for sale against the average price of our item in our comparison region
        pcDecrease = `${(((averagePrice - record.price) / averagePrice) * 100).toFixed(2)}%`;

        // update rows to add to csv
        rows.push({
          "name": item_sale.name,
          "volume_entered": record.volume_entered,
          "volume_remain": record.volume_remain,
          "price": record.price,
          "percentage_decrease": pcDecrease,
          "potential_profit": ((averagePrice - record.price) * record.volume_remain).toFixed(2),
          "average_price": outputAverage,
          "region": record.region.name,
          "station": record.station.name,
        });
      }
    }
  }
  else {
    console.log('No market data available');
  }

  return rows;
}

// fetch data
(async () => {

  // import items from config
  let items = config.items;
  let requests = [];

  // create axios request promises
  items.forEach((item) => {
    requests.push(getMarketDataByTypeId(item.id));
  });

  // execute all requests for data
  let rows = await Promise.all(requests).then((results) => {

    // concatonate the results
    let rows = Array.prototype.concat.apply([], results);

    // specify headers of the csv file
    const fields = ['name', 'volume_entered', 'volume_remain', 'price', 'percentage_decrease', 'potential_profit', 'average_price', 'region', 'station'];

    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(rows)

    // set filename
    let filename = dateFormat(new Date(), "yyyy-mm-dd-hh:MM:ss");

    // write file
    fs.writeFileSync(`exports/${filename}.csv`, csv);

    // debug output
    console.log(`Imported ${rows.length} rows`);
    console.log(`Output: exports/${filename}.csv`);

    // if user wants libreoffice to open after execute, run on command line
    if(config.openFile) {
      console.log('Opening File...');
      nrc.run(`libreoffice exports/${filename}.csv`);
    }

  });
})();