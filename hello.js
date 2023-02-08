const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const stores = [
  {
    name: "MYAREE SUPA IGA",
    address: "67 North Lake Road, Myaree., WA 6154",
  },
  {
    name: "MOSMAN PARK SUPA IGA",
    address: "140 Wellington St, Mosman Park, WA 6012",
  },
  {
    name: "SOUTH FREMANTLE IGA",
    address: "Wanneroo Farmer’s Market, 37-39 Prindiville Dr, Wangara, WA 6065",
  },
  {
    name: "SPUDSHED WANEROO",
    address: "Wanneroo Farmer’s Market, 37-39 Prindiville Dr, Wangara, WA 6065",
  },
  {
    name: "SPUDSHED BALDIVIS",
    address: "124 Kerosene Ln, Baldivis, WA 6171",
  },
  {
    name: "SPUDSHED MANDURAH",
    address: "566 Pinjarra Rd, Furnissdale, WA 6209",
  },
  {
    name: "SPUDSHED KELMSCOTT",
    address: "2853 Albany Hwy, Kelmscott, WA 6111",
  },
  {
    name: "SPUDSHED JANDAKOT",
    address: "630 Karel Ave, Jandakot, WA 6164",
  },
  {
    name: "SPUDSHED INNALOO",
    address: "37 Ellen Stirling Blvd, Innaloo, WA 6018",
  },
  {
    name: "SPUDSHED MORLEY",
    address: "243-253 Walter Rd W, Morley, WA 6062",
  },
  {
    name: "SPUDSHED BENTLEY",
    address: "1140 Albany Hwy, Bentley, WA 6102",
  },
  {
    name: "DUNCRAIG FRESH IGA",
    address: "15/50 Marri Rd, Duncraig, WA 6023",
  },
  {
    name: "BROADWAY IGA",
    address: "33/88 Broadway, Crawley, WA 6009",
  },
  {
    name: "ALKIMOS FRESH IGA",
    address: "1/1 Graceful Blvd, Alkimos, WA 6038",
  },
  {
    name: "ROSSMOYNE IGA",
    address: "Third Ave & Central Road, Rossmoyne, WA 6148",
  },
  {
    name: "MORRIS FRESH IGA",
    address: "1/27 Morris Pl, Innaloo, WA 6018",
  },
  {
    name: "ATWELL FRESH IGA",
    address: "Stargate Atwell Shopping Centre, 129 Lydon Blvd, Atwell, WA 6164",
  },
  {
    name: "THE PARK HIVE IGA",
    address:
      "Shop T1 The Park Hive Shopping Centre, 1 Macquarie Blvd, Hammond Park, WA 6164",
  },
  {
    name: "MARMION IGA",
    address: "Marmion Village Shopping Centre, Shepard Way, Maylands, WA 6051",
  },
  {
    name: "THE DOWNS IGA",
    address: "Shop 6 The Downs, 3 Bournemouth Crescent, Wembley Downs, WA 6019",
  },
  {
    name: "LYNWOOD SUPA IGA",
    address: "Shop 1/ 6-12 Lynwood Ave, Lynwood, WA 6147",
  },
  {
    name: "KINROSS SUPA IGA",
    address: "Cnr Connolly Dr & Selkirk Ave, Kinross, WA 6028",
  },
  {
    name: "FARMER JACKS – BUTLER",
    address: "Corner, Connolly Drive & Lukin Drive, Butler, WA 6036",
  },
  {
    name: "CARINE IGA",
    address: "Carine Shopping Centre, 473 Beach Rd, Duncraig, WA 6023",
  },
];

async function getLatLong(address) {
  const encodedAddress = encodeURIComponent(address);
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  return response.data.results[0].geometry.location;
}

async function main() {
  const updatedStores = [];

  for (const store of stores) {
    const latLong = await getLatLong(store.address);
    updatedStores.push({
      name: store.name,
      address: store.address,
      latitude: latLong.lat,
      longitude: latLong.lng,
    });
  }

  fs.writeFile("stores.json", JSON.stringify(updatedStores), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Stores successfully updated with lat and long.");
    }
  });
}

main();
