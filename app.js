const { Parser } = require('json2csv');
const axios = require('axios');
const fs = require('fs');
const dateFormat = require('dateformat');
const nrc = require('node-run-cmd');
let config = JSON.parse(fs.readFileSync('import-config.json'));

function isNullsecStation(stationName){
  let nameParts = stationName.split(" - ");

 // console.log(nameParts);

  if (nameParts[0].indexOf('-') > -1)
  {
    return true;
  }
  else {
    return false;
  }

}

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

  let addedAverage = 0;
  for(let i = data.length - days; i < data.length; i++) {
    addedAverage += data[i].average;
  }
  addedAverage = addedAverage / days;

  return addedAverage;
}

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
    sales = data.sell;
  }

  if(sales.length > 0) {
    if(sales.length >= 5) {
      let averagePrice = await getMarketHistoryData(config.comparisonRegion, sales[0].type_id);
      for(let i = 0; i < 5; i++) {
        let record = sales[i];

        let pcDecrease = "";
        let outputAverage = averagePrice;
        if(i > 0) {
          outputAverage = "";
        }

        pcDecrease = `${(((averagePrice - record.price) / averagePrice) * 100).toFixed(2)}%`;

        rows.push({
          "name": item_sale.name,
          "volume_entered": record.volume_entered,
          "volume_remain": record.volume_remain,
          "price": record.price,
          "percentage_decrease": pcDecrease,
          "potential_profit": (averagePrice - record.price) * record.volume_remain,
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
  //console.log(await getMarketHistoryData("10000002","3683"));

  //console.log('Starting import')

  let items = config.items;
  let requests = [];

  items.forEach((item) => {
    requests.push(getMarketDataByTypeId(item.id));
  });

  let rows = await Promise.all(requests).then((results) => {
    let rows = Array.prototype.concat.apply([], results);
    const fields = ['name', 'volume_entered', 'volume_remain', 'price', 'percentage_decrease', 'potential_profit', 'average_price', 'region', 'station'];

    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(rows)
    let filename = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    fs.writeFileSync(`exports/${filename}.csv`, csv);
    console.log(`Imported ${rows.length} rows`);
    console.log(`Output: exports/${filename}.csv`);

    if(config.openFile) {
      console.log('Opening File...');
      nrc.run(`libreoffice exports/${filename}.csv`);
    }

  });
})();