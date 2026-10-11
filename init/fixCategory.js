require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

(async () => {
  await mongoose.connect(process.env.ATLAS_URI);

  const result = await Listing.updateMany(
    { $or: [{ category: { $exists: false } }, { category: null }] },
    { $set: { category: "Trending" } },
  );

  console.log(`Updated ${result.modifiedCount} listings`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
