const { Parser } = require('json2csv');
const axios = require('axios');
const fs = require('fs');
const dateFormat = require('dateformat');

// 16638
// fetch data

async function getData(id){
  var data = await axios.get(`https://evemarketer.com/api/v1/markets/types/${id}?language=en`);

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
  return rows;
}
(async () => {
  let rows = await getData("16638");

  const fields = ['name', 'volume_entered', 'volume_remain', 'price', 'region', 'station'];

  const json2csvParser = new Parser({ fields });
  let csv = json2csvParser.parse(rows)
  let filename = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
  fs.writeFileSync(`exports/${filename}.csv`, csv);

})();