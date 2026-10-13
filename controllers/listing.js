const Listing = require("../models/listing.js");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_PUBLIC_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });
const { CATEGORIES } = require("../utils/categories.js");
const { deleteImage } = require("../cloudConfig.js");

// Escape regex special characters so users can't inject patterns like ".*" or "(a+)+"
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  const validCategory = CATEGORIES.some((c) => c.name === category);

  // req.query.q can be an array if the URL repeats it, so only accept a string
  const searchQuery =
    typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";

  const filter = {};
  if (validCategory) filter.category = category;
  if (searchQuery) {
    const regex = new RegExp(escapeRegex(searchQuery), "i");
    filter.$or = [
      { title: regex },
      { location: regex },
      { country: regex },
      { category: regex },
    ];
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", {
    allListings,
    categories: CATEGORIES,
    activeCategory: validCategory ? category : null,
    searchQuery,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", { categories: CATEGORIES });
};

const pickListingFields = ({
  title,
  description,
  price,
  location,
  country,
  category,
}) => ({
  title,
  description,
  price,
  location,
  country,
  category,
});

const geocode = async (location) => {
  const response = await geocodingClient
    .forwardGeocode({ query: location, limit: 1 })
    .send();
  return response.body.features[0]?.geometry;
};

// Create New Listing
module.exports.createListing = async (req, res) => {
  const geometry = await geocode(req.body.listing.location);
  if (!geometry) {
    if (req.file) await deleteImage(req.file.filename); // deleting orphan upload
    req.flash(
      "error",
      "Could not find that location. Try being more specific.",
    );
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(pickListingFields(req.body.listing));
  newListing.owner = req.user._id;
  newListing.geometry = geometry;
  if (req.file) {
    newListing.image = { filename: req.file.filename, url: req.file.path };
  }

  try {
    await newListing.save();
  } catch (err) {
    if (req.file) await deleteImage(req.file.filename);
    throw err;
  }

  req.flash("success", "Listing Created Successfully");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Requested Listing Does Not Exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Requested Listing Does Not Exist");
    return res.redirect("/listings");
  }
  // Resize the Preview image using Cloudinary transformations
  const originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_250,h_150,c_fill,q_auto",
  );
  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl,
    categories: CATEGORIES,
  });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    if (req.file) await deleteImage(req.file.filename);
    req.flash("error", "Requested Listing Does Not Exist");
    return res.redirect("/listings");
  }

  const locationChanged = req.body.listing.location !== listing.location;
  Object.assign(listing, pickListingFields(req.body.listing));

  if (locationChanged) {
    const geometry = await geocode(listing.location);
    if (!geometry) {
      if (req.file) await deleteImage(req.file.filename);
      req.flash(
        "error",
        "Could not find that location. Try being more specific.",
      );
      return res.redirect(`/listings/${id}/edit`);
    }
    listing.geometry = geometry;
  }

  let oldFilename;
  if (req.file) {
    oldFilename = listing.image.filename;
    listing.image = { filename: req.file.filename, url: req.file.path };
  }

  try {
    await listing.save();
  } catch (err) {
    if (req.file) await deleteImage(req.file.filename);
    throw err;
  }

  // Only remove the old image once the new one is safely saved
  if (oldFilename) await deleteImage(oldFilename);

  req.flash("success", "Listing Updated Successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id); // model hook also deletes its reviews
  if (deletedListing) {
    await deleteImage(deletedListing.image && deletedListing.image.filename);
  }
  req.flash("success", "Deleted Successfully");
  res.redirect("/listings");
};
