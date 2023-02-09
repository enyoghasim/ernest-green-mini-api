const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

const stores = require("./stores.json");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({}));
const port = process.env.PORT || 8900;

function distance(lat1, lon1, lat2, lon2) {
  const radius = 6371; // Earth's radius in kilometers

  const dlat = toRadians(lat2 - lat1);
  const dlon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dlon / 2) *
      Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = radius * c;
  return d;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

app.post("/closest-store", async (req, res) => {
  try {
    let { location, radius } = req.body;
    radius = radius || 10;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!location) {
      // return res.status(400).send({ error: "Location is required" });
      return res.send([]);
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${apiKey}`
    );
    const origin = response.data.results[0].geometry.location;

    const storeDistances = [];
    for (const store of stores) {
      storeDistances.push({
        name: store.name,
        address: store.address,
        lat: store.latitude,
        lng: store.longitude,
        distance: distance(
          origin.lat,
          origin.lng,
          store.latitude,
          store.longitude
        ),
      });
    }
    storeDistances.sort((a, b) => {
      const distanceA = parseInt(a?.distance);
      const distanceB = parseInt(b?.distance);
      return distanceA - distanceB;
    });
    const closestStores = storeDistances.filter((store) => {
      return parseInt(store.distance) <= radius;
    });
    return res.send(
      closestStores.map((e) => ({
        ...e,
        url: `http://maps.google.com/?saddr=Current%20Location&daddr=${e.address}`,
      }))
    );
  } catch (error) {
    console.error(error);
    return res.send([]);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// storeDistances.push({
//   name: store.name,
//   address: store.address,
//   distance: distance / 1000,
//   lat: response?.data?.rows[0]?.elements[0]?.distance?.lat,
//   lng: response?.data?.rows[0]?.elements[0]?.distance?.lng,
// });
