require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const MALDIVES = [73.5093, 4.1755]; // [lng, lat], Malé

(async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);

    const result = await Listing.updateMany(
      {
        $or: [
          { "geometry.type": { $exists: false } },
          { "geometry.coordinates.0": { $exists: false } },
        ],
      },
      { $set: { geometry: { type: "Point", coordinates: [...MALDIVES] } } },
    );

    console.log(`Updated ${result.modifiedCount} listings`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
