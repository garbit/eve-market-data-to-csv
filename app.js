const { Parser } = require('json2csv');
const axios = require('axios');
const fs = require('fs');
const dateFormat = require('dateformat');

// fetch data
(async () => {
  var data = await axios.get('https://evemarketer.com/api/v1/markets/types/16638?language=en');
  data = data.data;

  // item id, name, price, region, system, station
  let item_sale = {
    item_id: "",
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
      for(let i = 0; i < 6; i++) {
        let record = data.sell[i];
        rows.push({
          "item_id" : item_sale.item_id,
          "name": item_sale.name,
          "volume_entered": record.volume_entered,
          "volume_remain": record.volume_remain,
          "price": record.price,
          "region": record.region.name,
          "station": record.station.name,
        });
      }
    }
  }

  const fields = ['item_id', 'name', 'volume_entered', 'volume_remain', 'price', 'region', 'station'];

  const json2csvParser = new Parser({ fields });
  let csv = json2csvParser.parse(rows)
  let filename = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
  fs.writeFileSync(`exports/${filename}.csv`, csv);

})();