// get postal code from user
const express = require("express");
const { Client } = require("@googlemaps/google-maps-services-js");
const dotenv = require("dotenv");

dotenv.config();

const client = new Client({});

const app = express();

app.get("/api/:postalCode", (req, res) => {
  const postalCode = req.params.postalCode;

  if (!postalCode) {
    res.status(400).send("Postal code is required");
  }

  //   get lat and long from postal code from googlemaps/google-maps-services-js
  client.geocode(
    {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        address: postalCode,
      },
    },
    (err, response) => {
      if (err) {
        return res.status(500).send({
          message: "Error getting lat and long from postal code",
        });
      }
      console.log(response);

      //   const { lat, lng } = response.data.results[0].geometry.location;
      //   console.log(lat, lng);
    }
  );
});

app.listen(8900, () =>
  console.log("Listening on port http://localhost:8900...")
);
