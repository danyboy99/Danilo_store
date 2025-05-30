const fs = require("fs");
const Product = require("../model/product");

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
};
