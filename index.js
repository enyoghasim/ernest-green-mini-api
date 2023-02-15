const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
// const stores = require("./stores.json");

const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
// import * as AdminJSMongoose from "@adminjs/mongoose";
const AdminJSMongoose = require("@adminjs/mongoose");
const store = require("./stores.model");
const admins = require("./admin.model");
const { compareSync } = require("bcryptjs");
// const session = require("express-session");

// const ConnectSession = Connect(session);

// const sessionStore = new ConnectSession({});

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});
const adminjs = new AdminJS({
  resources: [store, admins],
});

const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "password",
};

const authenticate = async (email, password) => {
  // if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
  //   return Promise.resolve(DEFAULT_ADMIN);
  // }
  try {
    const userDetails = await admins.findOne({ email });
    if (userDetails) {
      //compare password
      const { password: hashedPassword } = userDetails;

      const isPasswordValid = await compareSync(password, hashedPassword);
      if (isPasswordValid) {
        return Promise.resolve(userDetails);
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch {
    return null;
  }
  return null;
};

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminjs,
  {
    cookieName: "adminjs",
    cookiePassword: "complicatedsecurepassword",
    authenticate,
  },
  null,
  {
    resave: false,
    saveUninitialized: true,
  }
);
adminjs.watch();

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({}));
app.use(adminjs.options.rootPath, adminRouter);

if (process.env.NODE_ENV === "development") {
  adminjs.watch();
}
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
  let stores;
  try {
    stores = await store.find({});
  } catch {
    return res.status(200).send([]);
  }
  try {
    let { location, radius } = req.body;
    radius = radius || 10;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!location) {
      // return res.status(400).send({ error: "Location is required" });
      return res.send([]);
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${location},Australia&key=${apiKey}`
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

mongoose
  .connect(process.env.MONGO_DB_URL)

  .then(async (e) => {
    console.log("mongodb started");
  })
  .then(() => {
    app.listen(port, () => {
      // console.log(`Server listening at http://localhost:${port}`);
      console.log(
        `AdminJS started on http://localhost:${port}${adminjs.options.rootPath}`
      );
    });
  });

// storeDistances.push({
//   name: store.name,
//   address: store.address,
//   distance: distance / 1000,
//   lat: response?.data?.rows[0]?.elements[0]?.distance?.lat,
//   lng: response?.data?.rows[0]?.elements[0]?.distance?.lng,
// });
