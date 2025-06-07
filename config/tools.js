const fs = require("fs");
const Product = require("../model/product");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
// Configure Cloudinary
let cloudinary_name = process.env.cloudinary_cloud_name;
let cloudinary_api_key = process.env.cloudinary_api_key;
let cloudinary_api_secret = process.env.cloudinary_api_secret;

cloudinary.config({
  cloud_name: cloudinary_name,
  api_key: cloudinary_api_key,
  api_secret: cloudinary_api_secret, // Click 'View API Keys' above to copy your API secret
});

const deleteImage = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete image:", err);
    } else {
      return "Image deleted successfully.";
    }
  });
};
const catigoryList = async () => {
  const product = await Product.find();
  const categories = [...new Set(product.map((product) => product.category))];
  return categories;
};

module.exports = {
  deleteImage,
  catigoryList,
  cloudinary,
};
