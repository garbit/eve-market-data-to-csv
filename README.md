# About
This tool allows you to retrieve JSON data from evemarketer and convert the data into csv. The tool selects the top 5 lowest value sells along with market volme and pricing information.

## Install
Install the required packages using ```npm```:
1. ```npm install```
2. Create ```import-config.json``` file and add your items + ids you wish to import (see below)
3. ```npm run start```
4. ```Profit```

## Define items to import
You must create an ```import-config.json``` (use the import-config.example.json file for a reference) to add items to define which items you wish to import.

The file is an array of JSON objects with name, type id:
```
[
  {
    "name": "Tungsten",
    "id": "16637"
  },
  {
    "name": "Titanium,
    "id": "16638"
  }
]
```

## Example file output
|  "item_id"| "name"" | ""volume_entered"" | ""volume_remain"" | ""price"" | ""region"" | ""station"
|-----------|---------|--------------------|-------------------|-----------|------------|-----------|
| 16638"| ""Titanium""| "139"| "139"| "3000"| ""Great Wildlands""| ""N-6Z8B - Alpha Paradiso Free Trade Zone"
| 16638"| ""Titanium""| "2267"| "2267"| "6000"| ""Syndicate""| ""EF-F36 III - Moon 1 - Intaki Space Police Logistic Support"
| 16638"| ""Titanium""| "5000"| "5000"| "6450"| ""Syndicate""| ""I0AB-R VI - Intaki Space Police Assembly Plant"
| 16638"| ""Titanium""| "8535"| "8535"| "6599"| ""Kor-Azor""| ""Fensi VII - Moon 10 - Zoar and Sons Factory"
| 16638"| ""Titanium""| "7890"| "7890"| "6700"| ""Devoid""| ""Esescama VIII - Moon 3 - Imperial Armaments Warehouse"
| 16638"| ""Titanium""| "93135"| "92135"| "6990"| ""The Forge""| ""Perimeter - Tranquility Trading Tower"