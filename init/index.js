require("dotenv").config();
const mongoose = require("mongoose");
const sampleListings = require("./data.js");
const Listing = require("../models/listing.js");

const OWNER_ID = "6ace2f818eb2a30b7e252d12";

const initDB = async () => {
  await mongoose.connect(process.env.ATLAS_URI);
  console.log("connected to DB");

  await Listing.deleteMany({});

  const listings = sampleListings.map((obj) => ({
    ...obj,
    owner: OWNER_ID,
  }));

  await Listing.insertMany(listings);
  console.log("data was initialized");
  await mongoose.disconnect();
};

initDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
