const fs = require("fs");
const Product = require("../model/product");
const cloudinary = require("cloudinary").v2;
// Configure Cloudinary
cloudinary.config({
  cloud_name: "dmtfr247c",
  api_key: "916295955767192",
  api_secret: "Dh25wiYQXFM9On9y7VusV02H0dU", // Click 'View API Keys' above to copy your API secret
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
