// node init/index.js  |  always run this script from root folder
// WARNING: this deletes ALL existing listings before seeding
require("dotenv").config();
const mongoose = require("mongoose");
const sampleListings = require("./data.js");
const Listing = require("../models/listing.js");

const MALDIVES = [73.5093, 4.1755]; // [lng, lat], Malé
const OWNER_ID = "6acb9693110c6225fea14013"; // must be the _id of a real user
const DEFAULT_CATEGORY = "Trending"; // used when a listing in data.js has no category

const initDB = async () => {
  await mongoose.connect(process.env.ATLAS_URI);
  console.log("connected to DB");

  await Listing.deleteMany({});

  const listings = sampleListings.map((obj) => ({
    ...obj,
    category: obj.category || DEFAULT_CATEGORY,
    owner: OWNER_ID,
    geometry: { type: "Point", coordinates: [...MALDIVES] },
  }));

  await Listing.insertMany(listings);
  console.log("data was initialized");
  await mongoose.disconnect();
};

initDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
