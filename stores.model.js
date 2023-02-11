const { Schema, model } = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const storeSchema = new Schema({
  name: {
    type: String,
    required: "Please enter a name",
    unique: true,
  },
  address: {
    type: String,
    required: "Please enter an address",
  },
  latitude: Number,
  longitude: Number,
});

async function getLatLongFromUrl(url) {
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    url
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  // console.log("apiUrl", apiUrl);
  const response = await axios.get(apiUrl);

  if (response.data.status !== "OK") {
    throw new Error(`Failed to get lat/long for URL ${url}`);
  }

  const { lat, lng } = response.data.results[0].geometry.location;
  if (!lat || !lng) {
    throw new Error(`Failed to get lat/long for URL ${url}`);
  }
  // console.log("lat, lng", lat, lng);
  return { lat, lng };
}

const getLatLngMiddleWare = async function (next) {
  const store = this;
  // console.log("getLatLngMiddleWare", store, store.isModified("address"));
  if (store.isModified("address")) {
    const { address } = store;
    try {
      const { lat, lng } = await getLatLongFromUrl(address);
      store.latitude = lat;
      store.longitude = lng;
      return next();
    } catch (e) {
      // console.error(e);
      const err = new Error(e);
      return next(err);
    }
  }
  next();
};

storeSchema.pre("save", getLatLngMiddleWare);

module.exports = model("Stores", storeSchema);
