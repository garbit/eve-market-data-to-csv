const { Parser } = require('json2csv');
const axios = require('axios');
const fs = require('fs');
const dateFormat = require('dateformat');

async function getMarketDataByTypeId(id) {
  console.log('*************');
  console.log(`Importing item_id ${id}`);
  console.log('*************');
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

  if(data.sell.length > 0) {
    if(data.sell.length >= 5) {
      for(let i = 0; i < 5; i++) {
        let record = data.sell[i];
        rows.push({
          "name": item_sale.name,
          "volume_entered": record.volume_entered,
          "volume_remain": record.volume_remain,
          "price": record.price,
          "region": record.region.name,
          "station": record.station.name,
        });
      }
    }
    else {
      let record = data.sell[0];
        rows.push({
          "name": item_sale.name,
          "volume_entered": record.volume_entered,
          "volume_remain": record.volume_remain,
          "price": record.price,
          "region": record.region.name,
          "station": record.station.name,
        });
    }
  }
  else {
    console.log('No market data available');
  }

  return rows;
}

async function combineData(requests) {
  return await Promise.all(requests);
}

// fetch data
(async () => {

  let typeIds = JSON.parse(fs.readFileSync('import-config.json'));
  let items = [];

  typeIds.forEach((item) => {
    items.push(getMarketDataByTypeId(item.id));
  });

  console.log('Starting import');

  let rows = await Promise.all(items).then((result) => {
    let rows = Array.prototype.concat.apply([], result);
    const fields = ['name', 'volume_entered', 'volume_remain', 'price', 'region', 'station'];

    const json2csvParser = new Parser({ fields });
    let csv = json2csvParser.parse(rows)
    let filename = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    fs.writeFileSync(`exports/${filename}.csv`, csv);

  });
})();