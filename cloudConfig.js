const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tripnest_DEV",
    allowed_formats: ["jpeg", "png", "jpg", "webp"],
  },
});

const DEFAULT_FILENAME = "listingimage";

const deleteImage = async (filename) => {
  if (!filename || filename === DEFAULT_FILENAME) return;
  try {
    await cloudinary.uploader.destroy(filename);
  } catch (err) {
    console.error("Cloudinary cleanup failed:", err.message);
  }
};

module.exports = {
  cloudinary,
  storage,
  deleteImage,
};
