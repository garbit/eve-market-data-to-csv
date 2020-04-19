# About
This tool allows you to retrieve the top 5 lowest value sell order for a given item along with market volume and pricing information. The tool also uses historic market data (last 10 days) to calculate possible percentage profit given a regional average of your trading area i.e. Jita.

The tool retrieves JSON data from evemarketer.com and evetech.net for pricing and historic market data and converts the output to a formatted csv file.

## Install
Install the required packages using ```npm```:
1. ```npm install```
2. Create ```import-config.json``` file and add your items + ids you wish to import (see below)
3. ```npm run start```
4. ```Profit```

## Import Config
You must create an ```import-config.json``` (use the import-config.example.json file for a reference) to add items to define which items you wish to import.

| Option | Values | Description |
|--------|--------|-------------|
| excludeNullSec (boolean) | [true, false] | Allows user to exclude / include NullSec stations from the results list |
| comparisonRegion (string) | Region_id (i.e. 10000002) - https://evemarketer.com/regions/**10000002**/types/28268[String] | Uses region average to create price comparison / average profit / loss available for each item in list |
| openFile | [true, false] | Opens csv in LibreOffice after each ```npm run start``` command |
| items (array) | ```{   "name": "Enriched Uranium", "id": "44" }``` - (i.e. https://evemarketer.com/types/**44**) | Specifies which items you wish to query on |

The file is an array of JSON objects with name, type id:
```
{
  "excludeNullsec": false,
  "comparisonRegion": "10000002",
  "openFile": true,
  "items": [
    {
      "name": "Enriched Uranium",
      "id": "44"
    },
    {
      "name": "Oxygen",
      "id": "3683"
    },
    {
      "name": "Mechanical Parts",
      "id": "3689"
    },
  ]
}
```

## Example file output
 | name | volume_entered | volume_remain | price | percentage_decrease | potential_profit | average_price | region | station |
 |------|------|------|------|------|------|------|------|------|
 | Enriched Uranium | 500 | 500 | 9,001 | 27.71% | 1,725,000 | 12,451 | Kador | Aphend VII - Moon 7 - Carthum Conglomerate Foundry |
| Enriched Uranium | 4665 | 4665 | 10,000 | 19.69% | 11,433, 915 | 12,451 | Stain | TG-Z23 III - Moon 8 - True Power Logistic Support |
| Enriched Uranium | 2997 | 2997 | 11,200 | 10.05% | 3,749,247 | 12,451 | Providence | R3-K7K - Bartertown |
| Enriched Uranium | 140 | 140 | 11,500 | 7.64% | 133,140 | 12,451 | Verge Vendor | Alenia IV - Moon 3 - Quafe Company School |
| Enriched Uranium | 2230 | 2230 | 11,750 | 5.63% | 1,563,230 | 12,451 | Verge Vendor | Jufvitte IX - Aliastra Warehouse |

## Apis
This script uses two APIs to retrieve pricing data:

| API | Usage | Description |
|-----|------|-------------|
| ```https://esi.evetech.net/v1/markets``` | Market History Data | For calculating previous market data average over last 10 days |
| ```https://evemarketer.com/api/v1/markets/``` | Pricing data for individual items | Shows lowest current sell orders available for any given item |
